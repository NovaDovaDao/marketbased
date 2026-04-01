import { parse as parseCookies } from "cookie";
import { pool } from "../db.js";
/**
 * Validates the Better Auth session cookie from the WebSocket handshake.
 * Better Auth stores the session token in a cookie named "better-auth.session_token".
 * We query the session table directly — no JWT verification needed.
 */
export async function authMiddleware(socket, next) {
    const rawCookies = socket.handshake.headers.cookie ?? "";
    const cookies = parseCookies(rawCookies);
    const signedCookieToken = cookies["better-auth.session_token"];
    // Better Auth signs the session cookie as "{rawToken}.{hmacSignature}".
    // Strip the trailing signature to recover the raw DB token.
    const cookieToken = signedCookieToken
        ? signedCookieToken.slice(0, signedCookieToken.lastIndexOf("."))
        : undefined;
    // Prefer the explicit handshake auth token (raw session.session.token passed
    // from the Server Component) — it's always the raw DB value. Fall back to
    // the unsigned cookie token for connections that don't pass auth explicitly.
    const authToken = typeof socket.handshake.auth?.token === "string" && socket.handshake.auth.token.length > 0
        ? socket.handshake.auth.token
        : undefined;
    const token = authToken ?? cookieToken;
    if (!token) {
        console.warn(`[auth-middleware] no session token — socketId=${socket.id} origin=${socket.handshake.headers.origin ?? "?"} cookies="${rawCookies.slice(0, 120)}"`);
        return next(new Error("AUTH_REQUIRED"));
    }
    try {
        const result = await pool.query(`SELECT "userId" AS user_id
       FROM session
       WHERE token = $1
         AND "expiresAt" > NOW()
       LIMIT 1`, [token]);
        if (result.rows.length === 0) {
            console.warn(`[auth-middleware] session not found or expired — socketId=${socket.id}`);
            return next(new Error("AUTH_INVALID"));
        }
        const row = result.rows[0];
        if (!row) {
            console.warn(`[auth-middleware] row unexpectedly null — socketId=${socket.id}`);
            return next(new Error("AUTH_INVALID"));
        }
        socket.data.userId = row.user_id;
        next();
    }
    catch (err) {
        console.error("[auth-middleware] DB error", err);
        next(new Error("AUTH_ERROR"));
    }
}
