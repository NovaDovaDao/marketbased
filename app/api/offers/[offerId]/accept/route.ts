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

  // Load the offer and its listing to verify the requester is the seller
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { listing: { select: { sellerId: true } } },
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

  // The trade room was already created when the buyer submitted the offer.
  const tradeRoom = await prisma.tradeRoom.findUnique({ where: { offerId } });
  if (!tradeRoom) {
    return Response.json({ error: "Trade room not found" }, { status: 404 });
  }

  // Accept the offer and add a system message to the existing room
  await prisma.$transaction([
    prisma.offer.update({
      where: { id: offerId },
      data: { status: "accepted" },
    }),
    prisma.message.create({
      data: {
        tradeRoomId: tradeRoom.id,
        senderId: session.user.id,
        content: "Seller has accepted the offer.",
        type: "system",
      },
    }),
  ]);

  return Response.json({ tradeRoomId: tradeRoom.id }, { status: 200 });
}
