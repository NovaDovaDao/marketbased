import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createRedisAdapter } from "./adapters/redis.js";
import { registerMessageHandlers } from "./handlers/message.js";
import { registerReadReceiptHandlers } from "./handlers/readReceipt.js";
import { registerRoomHandlers } from "./handlers/room.js";
import { registerTypingHandlers } from "./handlers/typing.js";
import { authMiddleware } from "./middleware/auth.js";
import { handlePresenceConnect, handlePresenceDisconnect } from "./presence.js";
const PORT = parseInt(process.env.PORT ?? "3001", 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";
const CHAT_SERVICE_SECRET = process.env.CHAT_SERVICE_SECRET ?? "";
const app = express();
app.use(express.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ALLOWED_ORIGIN,
        credentials: true,
        methods: ["GET", "POST"],
    },
    pingTimeout: 20_000,
    pingInterval: 25_000,
    connectionStateRecovery: {
        // Buffer messages for up to 2 minutes during reconnect
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: false,
    },
});
// Auth middleware — validates Better Auth session cookie before establishing WS
io.use(authMiddleware);
// Redis adapter for horizontal scaling — optional, skipped when no credentials
const adapter = await createRedisAdapter();
if (adapter) {
    io.adapter(adapter);
    console.log("[chat] Redis Streams adapter attached");
}
else {
    console.log("[chat] Running in single-instance mode (no Redis configured)");
}
io.on("connection", (rawSocket) => {
    const socket = rawSocket;
    const { userId } = socket.data;
    console.log(`[chat] connected  userId=${userId} socketId=${socket.id}`);
    // Join a personal room so we can target this user from the API
    void socket.join(`user:${userId}`);
    handlePresenceConnect(socket, io);
    registerRoomHandlers(socket, io);
    registerMessageHandlers(socket, io);
    registerTypingHandlers(socket, io);
    registerReadReceiptHandlers(socket, io);
    socket.on("disconnect", (reason) => {
        console.log(`[chat] disconnected userId=${userId} reason=${reason}`);
        handlePresenceDisconnect(socket, io);
    });
});
// Internal endpoint — Next.js calls this to push a real-time notification to a seller
app.post("/internal/notify-new-room", (req, res) => {
    const authHeader = req.headers.authorization ?? "";
    if (!CHAT_SERVICE_SECRET || authHeader !== `Bearer ${CHAT_SERVICE_SECRET}`) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const { sellerId, tradeRoomId, listingName, buyerUsername } = req.body;
    if (!sellerId || !tradeRoomId) {
        res.status(400).json({ error: "sellerId and tradeRoomId are required" });
        return;
    }
    io.to(`user:${sellerId}`).emit("new-trade-room", {
        tradeRoomId,
        listingName: listingName ?? "an item",
        buyerUsername: buyerUsername ?? "Someone",
    });
    res.json({ ok: true });
});
httpServer.listen(PORT, () => {
    console.log(`[chat] Socket.IO server listening on port ${PORT}`);
});
