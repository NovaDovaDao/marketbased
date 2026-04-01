import { pool } from "../db.js";
/**
 * join-room handler.
 * Validates the user is a participant (seller or buyer) before joining the Socket.IO room.
 */
export function registerRoomHandlers(socket, io) {
    const { userId } = socket.data;
    socket.on("join-room", async ({ tradeRoomId }) => {
        if (!tradeRoomId) {
            socket.emit("error", { code: "INVALID_PAYLOAD", message: "tradeRoomId is required" });
            return;
        }
        try {
            const result = await pool.query(`SELECT id, "sellerId" AS seller_id, "buyerId" AS buyer_id, status
         FROM trade_room
         WHERE id = $1
         LIMIT 1`, [tradeRoomId]);
            const room = result.rows[0];
            if (!room) {
                socket.emit("error", { code: "ROOM_NOT_FOUND", message: "Trade room not found" });
                return;
            }
            if (room.seller_id !== userId && room.buyer_id !== userId) {
                socket.emit("error", { code: "FORBIDDEN", message: "You are not a participant in this trade room" });
                return;
            }
            await socket.join(`trade-room:${tradeRoomId}`);
            // Notify others in the room that this user is online
            socket.to(`trade-room:${tradeRoomId}`).emit("presence", { userId, online: true });
            console.log(`[room] userId=${userId} joined trade-room:${tradeRoomId}`);
        }
        catch (err) {
            console.error("[room] join-room error", err);
            socket.emit("error", { code: "SERVER_ERROR", message: "Failed to join room" });
        }
    });
}
