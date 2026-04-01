import { clearPresence, refreshPresence, setPresence } from "./adapters/redis.js";
/**
 * Presence management.
 * On connect: write presence key with 60s TTL.
 * Ping event from client refreshes TTL (client should ping every 30s).
 * On disconnect: remove key and broadcast offline status to all rooms the socket was in.
 */
export function handlePresenceConnect(socket, _io) {
    const { userId } = socket.data;
    setPresence(userId).catch((err) => {
        console.error("[presence] setPresence error", err);
    });
    // Client pings every 30s to refresh the TTL
    socket.on("ping", () => {
        refreshPresence(userId).catch((err) => {
            console.error("[presence] refreshPresence error", err);
        });
    });
}
export function handlePresenceDisconnect(socket, io) {
    const { userId } = socket.data;
    clearPresence(userId).catch((err) => {
        console.error("[presence] clearPresence error", err);
    });
    // Notify all rooms this socket was in
    for (const roomName of socket.rooms) {
        if (roomName.startsWith("trade-room:")) {
            io.to(roomName).emit("presence", { userId, online: false });
        }
    }
}
