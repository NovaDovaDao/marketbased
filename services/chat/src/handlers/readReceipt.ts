import { pool } from "../db.js";
import type { ServerInstance, ServerSocket } from "../types.js";

/**
 * mark-read handler.
 * Updates the readAt JSON on the latest message the user has read,
 * then broadcasts a read-receipt to the room.
 */
export function registerReadReceiptHandlers(socket: ServerSocket, io: ServerInstance): void {
  const { userId } = socket.data;

  socket.on("mark-read", async ({ tradeRoomId, lastMessageId }) => {
    if (!tradeRoomId || !lastMessageId) return;

    try {
      const now = new Date().toISOString();

      // Merge the userId:timestamp into the existing readAt JSON
      await pool.query(
        `UPDATE message
         SET "readAt" = COALESCE("readAt", '{}') || jsonb_build_object($1::text, $2::text)
         WHERE id = $3`,
        [userId, now, lastMessageId]
      );

      io.to(`trade-room:${tradeRoomId}`).emit("read-receipt", {
        userId,
        lastMessageId,
        readAt: now,
      });
    } catch (err) {
      console.error("[readReceipt] mark-read error", err);
    }
  });
}
