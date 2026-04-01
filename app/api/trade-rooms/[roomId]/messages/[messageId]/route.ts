import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type NextRequest } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ roomId: string; messageId: string }> };

/**
 * DELETE /api/trade-rooms/[roomId]/messages/[messageId]
 * Soft-deletes a message. Only the sender can delete their own messages.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = await params;
  const userId = session.user.id;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true, type: true },
  });

  if (!message) {
    return Response.json({ error: "Message not found" }, { status: 404 });
  }

  if (message.senderId !== userId) {
    return Response.json({ error: "You can only delete your own messages" }, { status: 403 });
  }

  if (message.type === "system") {
    return Response.json({ error: "System messages cannot be deleted" }, { status: 400 });
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true },
  });

  return Response.json({ ok: true });
}

const reportSchema = z.object({
  reason: z.string().min(1).max(500),
});

/**
 * POST /api/trade-rooms/[roomId]/messages/[messageId]/report
 * Creates a moderation report for a message.
 */
export async function POST(req: NextRequest, { params }: RouteContext): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId, messageId } = await params;
  const userId = session.user.id;

  // Verify room participation
  const room = await prisma.tradeRoom.findUnique({
    where: { id: roomId },
    select: { sellerId: true, buyerId: true },
  });

  if (!room || (room.sellerId !== userId && room.buyerId !== userId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as unknown;
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await prisma.messageReport.create({
      data: {
        messageId,
        reporterId: userId,
        reason: parsed.data.reason,
      },
    });
  } catch {
    // Unique constraint violation — already reported
    return Response.json({ error: "You have already reported this message" }, { status: 409 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
