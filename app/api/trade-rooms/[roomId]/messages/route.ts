import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type NextRequest } from "next/server";

type RouteContext = { params: Promise<{ roomId: string }> };

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * GET /api/trade-rooms/[roomId]/messages?cursor=<messageId>&limit=<n>
 * Paginated message history, newest first.
 * cursor: the id of the last message received (fetch older messages before it)
 */
export async function GET(req: NextRequest, { params }: RouteContext): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;
  const userId = session.user.id;

  // Verify participation
  const room = await prisma.tradeRoom.findUnique({
    where: { id: roomId },
    select: { sellerId: true, buyerId: true },
  });

  if (!room) {
    return Response.json({ error: "Trade room not found" }, { status: 404 });
  }

  if (room.sellerId !== userId && room.buyerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const rawLimit = parseInt(url.searchParams.get("limit") ?? `${DEFAULT_LIMIT}`, 10);
  const limit = Math.min(isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit, MAX_LIMIT);

  const messages = await prisma.message.findMany({
    where: {
      tradeRoomId: roomId,
      ...(cursor ? { createdAt: { lt: (await prisma.message.findUnique({ where: { id: cursor }, select: { createdAt: true } }))?.createdAt } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // fetch one extra to determine if more pages exist
    select: {
      id: true,
      senderId: true,
      content: true,
      type: true,
      isDeleted: true,
      readAt: true,
      createdAt: true,
      sender: { select: { id: true, username: true, image: true } },
    },
  });

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null;

  // Redact deleted message content
  const sanitized = page.map((m) => ({
    ...m,
    content: m.isDeleted ? "[Message deleted]" : m.content,
  }));

  return Response.json({ messages: sanitized, nextCursor, hasMore });
}
