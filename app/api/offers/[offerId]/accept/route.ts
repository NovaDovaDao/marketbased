import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { offerId } = await params;

  // Load the offer with all data needed for the SD transfer
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      listing: { select: { id: true, name: true, sellerId: true } },
    },
  });

  if (!offer) {
    return Response.json({ error: "Offer not found" }, { status: 404 });
  }

  if (offer.listing.sellerId !== session.user.id) {
    return Response.json({ error: "Only the seller can accept an offer" }, { status: 403 });
  }

  if (offer.status !== "pending") {
    return Response.json({ error: "Offer is no longer pending" }, { status: 409 });
  }

  // Parse and validate the Space Dust offer data
  const offerData = offer.offerData as Record<string, unknown>;
  if (offerData.type !== "spaceDust" || typeof offerData.spaceDustAmount !== "number") {
    return Response.json({ error: "Invalid offer type" }, { status: 400 });
  }
  const spaceDustAmount = offerData.spaceDustAmount;

  // Check buyer has sufficient balance
  const buyer = await prisma.user.findUnique({
    where: { id: offer.buyerId },
    select: { spaceDust: true },
  });
  if (!buyer || buyer.spaceDust < spaceDustAmount) {
    return Response.json({ error: "Buyer has insufficient Space Dust" }, { status: 402 });
  }

  // The trade room was already created when the buyer submitted the offer.
  const tradeRoom = await prisma.tradeRoom.findUnique({ where: { offerId } });
  if (!tradeRoom) {
    return Response.json({ error: "Trade room not found" }, { status: 404 });
  }

  const sellerId = offer.listing.sellerId;
  const itemName = offer.listing.name ?? "Item";

  // Atomically: transfer SD, record audit + purchase, accept offer, mark listing sold
  await prisma.$transaction([
    // Debit buyer
    prisma.user.update({
      where: { id: offer.buyerId },
      data: { spaceDust: { decrement: spaceDustAmount } },
    }),
    // Credit seller
    prisma.user.update({
      where: { id: sellerId },
      data: { spaceDust: { increment: spaceDustAmount } },
    }),
    // Audit log
    prisma.spaceDustTransfer.create({
      data: {
        senderId: offer.buyerId,
        recipientId: sellerId,
        amount: spaceDustAmount,
        note: `Payment for listing: ${itemName}`,
      },
    }),
    // Item purchase record
    prisma.itemPurchase.create({
      data: {
        buyerId: offer.buyerId,
        sellerId,
        listingId: offer.listingId,
        itemName,
        spaceDustAmount,
        tradeRoomId: tradeRoom.id,
      },
    }),
    // Mark offer accepted
    prisma.offer.update({
      where: { id: offerId },
      data: { status: "accepted" },
    }),
    // Mark listing sold to prevent double-sell
    prisma.listing.update({
      where: { id: offer.listingId },
      data: { status: "sold" },
    }),
    // System message in trade room
    prisma.message.create({
      data: {
        tradeRoomId: tradeRoom.id,
        senderId: session.user.id,
        content: `Seller accepted the offer. ✨ ${spaceDustAmount.toLocaleString()} SD transferred.`,
        type: "system",
      },
    }),
  ]);

  return Response.json({ tradeRoomId: tradeRoom.id }, { status: 200 });
}
