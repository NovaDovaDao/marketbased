import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { env } from "@/env.mjs"
import { type NextRequest } from "next/server"

/**
 * POST /api/listings/[listingId]/purchase
 * Immediately purchases a listing with Space Dust.
 * - Deducts SD from buyer, credits seller atomically.
 * - Marks listing as sold.
 * - Creates a TradeRoom + auto-message so buyer and seller can coordinate.
 * Returns { tradeRoomId } on success.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { listingId } = await params
  const buyerId = session.user.id

  // Load listing with seller info
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      name: true,
      sellerId: true,
      status: true,
      spaceDustPrice: true,
    },
  })

  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 })
  if (listing.status !== "active")
    return Response.json({ error: "Listing is no longer active" }, { status: 409 })
  if (!listing.spaceDustPrice)
    return Response.json({ error: "This listing does not accept Space Dust" }, { status: 422 })
  if (listing.sellerId === buyerId)
    return Response.json({ error: "Cannot purchase your own listing" }, { status: 400 })

  const price = listing.spaceDustPrice
  const itemName = listing.name

  let tradeRoomId: string

  try {
    tradeRoomId = await prisma.$transaction(async (tx) => {
      // Check buyer balance
      const buyer = await tx.user.findUniqueOrThrow({
        where: { id: buyerId },
        select: { spaceDust: true },
      })

      if (buyer.spaceDust < price) {
        throw new Error("insufficient_space_dust")
      }

      // Transfer Space Dust: deduct from buyer, credit seller
      await tx.user.update({
        where: { id: buyerId },
        data: { spaceDust: { decrement: price } },
      })
      await tx.user.update({
        where: { id: listing.sellerId },
        data: { spaceDust: { increment: price } },
      })

      // Mark listing as sold
      await tx.listing.update({
        where: { id: listingId },
        data: { status: "sold" },
      })

      // Create the TradeRoom (no offer — direct purchase)
      const room = await tx.tradeRoom.create({
        data: {
          sellerId: listing.sellerId,
          buyerId,
          messages: {
            create: [
              {
                senderId: listing.sellerId,
                content: `${itemName} has been purchased for ${price.toLocaleString()} Space Dust.`,
                type: "system",
              },
              {
                senderId: buyerId,
                content: `I just bought ${itemName} for ${price.toLocaleString()} space dust what game/pass and server should I join?`,
                type: "text",
              },
            ],
          },
        },
      })

      // Record the item purchase
      await tx.itemPurchase.create({
        data: {
          buyerId,
          sellerId: listing.sellerId,
          listingId,
          itemName,
          spaceDustAmount: price,
          tradeRoomId: room.id,
        },
      })

      return room.id
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    if (msg === "insufficient_space_dust") {
      return Response.json({ error: "insufficient_space_dust" }, { status: 402 })
    }
    throw err
  }

  // Non-blocking: notify seller via Socket.IO chat service
  if (env.CHAT_SERVICE_URL && env.CHAT_SERVICE_SECRET) {
    void fetch(`${env.CHAT_SERVICE_URL}/internal/notify-new-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.CHAT_SERVICE_SECRET}`,
      },
      body: JSON.stringify({
        sellerId: listing.sellerId,
        buyerId,
        roomId: tradeRoomId,
        listingName: itemName,
      }),
    }).catch(() => undefined)
  }

  return Response.json({ tradeRoomId })
}
