import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type NextRequest } from "next/server";

/**
 * GET /api/trade-rooms
 * Returns all trade rooms where the current user is seller or buyer.
 * Includes last message snippet and unread count.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const rooms = await prisma.tradeRoom.findMany({
    where: {
      OR: [{ sellerId: userId }, { buyerId: userId }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      seller: { select: { id: true, username: true, image: true } },
      buyer: { select: { id: true, username: true, image: true } },
      offer: {
        select: {
          id: true,
          offerData: true,
          listing: { select: { id: true, name: true, rarity: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        where: { isDeleted: false },
        select: { id: true, content: true, type: true, senderId: true, createdAt: true },
      },
    },
  });

  // Compute unread count per room (messages after last read by userId)
  const result = await Promise.all(
    rooms.map(async (room) => {
      // Prisma cannot filter JSON key non-existence with .count(), so fetch
      // only the readAt field and filter in application code.
      const msgs = await prisma.message.findMany({
        where: {
          tradeRoomId: room.id,
          isDeleted: false,
          senderId: { not: userId },
        },
        select: { readAt: true },
      });
      const unread = msgs.filter((m) => {
        const ra = m.readAt;
        if (ra === null || typeof ra !== "object" || Array.isArray(ra)) return true;
        return !(userId in (ra as Record<string, unknown>));
      }).length;

      return {
        id: room.id,
        status: room.status,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        seller: room.seller,
        buyer: room.buyer,
        offer: room.offer,
        lastMessage: room.messages[0] ?? null,
        unreadCount: unread,
      };
    })
  );

  return Response.json(result);
}
