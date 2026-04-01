/**
 * Typing indicator handlers — ephemeral, never persisted.
 * Broadcast to counterpart only (not back to sender).
 */
export function registerTypingHandlers(socket, _io) {
    const { userId } = socket.data;
    socket.on("typing-start", ({ tradeRoomId }) => {
        if (!tradeRoomId)
            return;
        socket.to(`trade-room:${tradeRoomId}`).emit("typing", { userId, isTyping: true });
    });
    socket.on("typing-stop", ({ tradeRoomId }) => {
        if (!tradeRoomId)
            return;
        socket.to(`trade-room:${tradeRoomId}`).emit("typing", { userId, isTyping: false });
    });
}
