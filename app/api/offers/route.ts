import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { env } from "@/env.mjs";
import { type NextRequest } from "next/server";
import { z } from "zod";

const offerSchema = z.object({
  listingId: z.string().min(1),
  offerData: z.object({
    type: z.enum(["spaceDust"]),
    spaceDustAmount: z.number().int().positive(),
  }),
});

/**
 * POST /api/offers
 * Buyer creates an offer on a listing and immediately opens a trade room.
 * Returns { ...offer, tradeRoomId } so the client can redirect to the chat.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { listingId, offerData } = parsed.data;
  const buyerId = session.user.id;
  const buyerUsername = session.user.name ?? session.user.email ?? "Someone";

  // Load listing — must exist and be active
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, name: true, sellerId: true, status: true },
  });
  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });
  if (listing.status !== "active")
    return Response.json({ error: "Listing is no longer active" }, { status: 409 });
  if (listing.sellerId === buyerId)
    return Response.json({ error: "Cannot offer on your own listing" }, { status: 400 });

  // Prevent duplicate pending offers from the same buyer
  const existing = await prisma.offer.findFirst({
    where: { listingId, buyerId, status: "pending" },
  });
  if (existing) {
    return Response.json({ error: "You already have a pending offer on this listing" }, { status: 409 });
  }

  // Atomically create the offer and its trade room with an opening message
  const { offer, tradeRoom } = await prisma.$transaction(async (tx) => {
    const newOffer = await tx.offer.create({
      data: { listingId, buyerId, offerData },
    });

    const listingName = listing.name ?? "this item";
    const newRoom = await tx.tradeRoom.create({
      data: {
        offerId: newOffer.id,
        sellerId: listing.sellerId,
        buyerId,
        messages: {
          create: [
            {
              senderId: buyerId,
              content: `Hi! I would like to buy ${listingName}.`,
              type: "text",
            },
            {
              senderId: buyerId,
              content: "Offer submitted. Chat here to discuss details.",
              type: "system",
            },
          ],
        },
      },
    });

    return { offer: newOffer, tradeRoom: newRoom };
  });

  // Non-blocking: notify seller via chat service if configured
  if (env.CHAT_SERVICE_URL && env.CHAT_SERVICE_SECRET) {
    const listingName = listing.name ?? "this item";
    fetch(`${env.CHAT_SERVICE_URL}/internal/notify-new-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.CHAT_SERVICE_SECRET}`,
      },
      body: JSON.stringify({
        sellerId: listing.sellerId,
        tradeRoomId: tradeRoom.id,
        listingName,
        buyerUsername,
      }),
    }).catch(() => {
      // Notification failure is non-fatal
    });
  }

  return Response.json({ ...offer, tradeRoomId: tradeRoom.id }, { status: 201 });
}

/**
 * GET /api/offers
 * Returns all pending offers on the current user's listings (seller view).
 */
export async function GET(req: NextRequest): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const offers = await prisma.offer.findMany({
    where: {
      listing: { sellerId: session.user.id },
    },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, username: true, image: true } },
      listing: { select: { id: true, name: true, rarity: true, price: true } },
    },
  });

  return Response.json(offers);
}
