import { createAdapter } from "@socket.io/redis-streams-adapter";
import { Redis } from "@upstash/redis";
import { Redis as IORedis } from "ioredis";
const hasRedisConfig = Boolean(process.env.UPSTASH_REDIS_URL) &&
    Boolean(process.env.UPSTASH_REDIS_TOKEN);
/**
 * @upstash/redis (HTTP) — used for presence and rate-limit helpers.
 * Returns null when no Redis credentials are configured.
 */
export const redis = hasRedisConfig
    ? new Redis({
        url: process.env.UPSTASH_REDIS_URL,
        token: process.env.UPSTASH_REDIS_TOKEN,
    })
    : null;
/**
 * ioredis (TCP/TLS) client for the Socket.IO Redis Streams adapter.
 * @socket.io/redis-streams-adapter requires a client with `.duplicate()`,
 * which @upstash/redis (HTTP transport) does not provide.
 * Upstash exposes a standard Redis endpoint on port 6380 with TLS.
 */
function createIoRedisClient() {
    if (!hasRedisConfig)
        return null;
    const restUrl = process.env.UPSTASH_REDIS_URL;
    const token = process.env.UPSTASH_REDIS_TOKEN;
    // Derive TCP host from REST URL: https://host → host
    const host = restUrl.replace(/^https?:\/\//, "");
    const port = parseInt(process.env.UPSTASH_REDIS_PORT ?? "6379", 10);
    const client = new IORedis({
        host,
        port,
        password: token,
        tls: {},
        lazyConnect: true,
        connectTimeout: 3_000,
        maxRetriesPerRequest: 0,
    });
    // Prevent unhandled-error-event crashes during connection failures
    client.on("error", (err) => {
        console.warn("[chat] ioredis error:", err.message);
    });
    return client;
}
export async function createRedisAdapter() {
    const ioRedis = createIoRedisClient();
    if (!ioRedis)
        return null;
    try {
        await ioRedis.connect();
        return createAdapter(ioRedis);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[chat] Redis unavailable (${message}); running in single-instance mode`);
        ioRedis.disconnect();
        return null;
    }
}
// Presence helpers
export const PRESENCE_TTL_SECONDS = 60;
export async function setPresence(userId) {
    if (!redis)
        return;
    await redis.set(`presence:${userId}`, "1", { ex: PRESENCE_TTL_SECONDS });
}
export async function refreshPresence(userId) {
    if (!redis)
        return;
    await redis.expire(`presence:${userId}`, PRESENCE_TTL_SECONDS);
}
export async function clearPresence(userId) {
    if (!redis)
        return;
    await redis.del(`presence:${userId}`);
}
export async function isOnline(userId) {
    if (!redis)
        return false;
    const val = await redis.get(`presence:${userId}`);
    return val !== null;
}
// Rate limiting: sliding window, returns remaining count
// Falls back to "always allowed" when Redis is not configured.
export async function checkRateLimit(userId, tradeRoomId, limit = 60, windowSeconds = 60) {
    if (!redis)
        return { allowed: true, remaining: limit };
    const key = `rl:${userId}:${tradeRoomId}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    // Remove entries outside the window, add current timestamp
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zadd(key, { score: now, member: `${now}` });
    await redis.expire(key, windowSeconds);
    const current = typeof count === "number" ? count : 0;
    // zadd returns the number of NEW elements added; we need the total
    const total = await redis.zcard(key);
    if (total > limit) {
        return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: limit - total };
}
