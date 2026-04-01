import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type NextRequest } from "next/server";

type RouteContext = { params: Promise<{ roomId: string }> };

/**
 * GET /api/trade-rooms/[roomId]
 * Participant-only. Returns room metadata, participants, and the linked offer/listing.
 */
export async function GET(req: NextRequest, { params }: RouteContext): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;
  const userId = session.user.id;

  const room = await prisma.tradeRoom.findUnique({
    where: { id: roomId },
    include: {
      seller: { select: { id: true, username: true, image: true } },
      buyer: { select: { id: true, username: true, image: true } },
      offer: {
        include: {
          listing: {
            select: {
              id: true,
              name: true,
              baseName: true,
              rarity: true,
              price: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!room) {
    return Response.json({ error: "Trade room not found" }, { status: 404 });
  }

  if (room.sellerId !== userId && room.buyerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(room);
}
