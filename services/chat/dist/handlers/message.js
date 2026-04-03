import { checkRateLimit } from "../adapters/redis.js";
import { randomUUID } from "node:crypto";
import { pool } from "../db.js";
const MAX_CONTENT_LENGTH = 2000;
/**
 * Strip all HTML tags from message content to prevent XSS.
 */
function sanitize(content) {
    return content.replace(/<[^>]*>/g, "").trim();
}
/**
 * send-message handler.
 * Rate-limited at 60 messages/minute per user per trade room.
 * Persists to Postgres before broadcasting.
 */
export function registerMessageHandlers(socket, io) {
    const { userId } = socket.data;
    socket.on("send-message", async ({ tradeRoomId, content }) => {
        if (!tradeRoomId || !content) {
            socket.emit("error", { code: "INVALID_PAYLOAD", message: "tradeRoomId and content are required" });
            return;
        }
        const cleaned = sanitize(content);
        if (cleaned.length === 0) {
            socket.emit("error", { code: "EMPTY_CONTENT", message: "Message cannot be empty" });
            return;
        }
        if (cleaned.length > MAX_CONTENT_LENGTH) {
            socket.emit("error", { code: "TOO_LONG", message: `Message exceeds ${MAX_CONTENT_LENGTH} characters` });
            return;
        }
        // Check rate limit — inside try/catch so a Redis failure never blocks messages.
        let rateLimitAllowed = true;
        try {
            const { allowed } = await checkRateLimit(userId, tradeRoomId);
            rateLimitAllowed = allowed;
        }
        catch {
            // Redis unavailable — allow the message through
            rateLimitAllowed = true;
        }
        if (!rateLimitAllowed) {
            socket.emit("error", { code: "RATE_LIMITED", message: "You are sending messages too quickly" });
            return;
        }
        try {
            // Verify sender is a participant and room is active
            const roomResult = await pool.query(`SELECT "sellerId" AS seller_id, "buyerId" AS buyer_id, status
         FROM trade_room
         WHERE id = $1
         LIMIT 1`, [tradeRoomId]);
            const room = roomResult.rows[0];
            if (!room) {
                socket.emit("error", { code: "ROOM_NOT_FOUND", message: "Trade room not found" });
                return;
            }
            if (room.seller_id !== userId && room.buyer_id !== userId) {
                socket.emit("error", { code: "FORBIDDEN", message: "You are not a participant in this trade room" });
                return;
            }
            if (room.status !== "active") {
                socket.emit("error", { code: "ROOM_CLOSED", message: "This trade room is no longer active" });
                return;
            }
            const messageId = randomUUID();
            // Persist message
            const msgResult = await pool.query(`INSERT INTO message (id, "tradeRoomId", "senderId", content, type)
         VALUES ($1, $2, $3, $4, 'text')
         RETURNING id, "createdAt" AS created_at`, [messageId, tradeRoomId, userId, cleaned]);
            const row = msgResult.rows[0];
            if (!row)
                throw new Error("Insert returned no row");
            const msg = {
                id: row.id,
                tradeRoomId,
                senderId: userId,
                content: cleaned,
                type: "text",
                createdAt: row.created_at.toISOString(),
            };
            // Broadcast to ALL sockets in the room (including sender for confirmation)
            io.to(`trade-room:${tradeRoomId}`).emit("message", msg);
        }
        catch (err) {
            console.error("[message] send-message error", err);
            socket.emit("error", { code: "SERVER_ERROR", message: "Failed to send message" });
        }
    });
}
