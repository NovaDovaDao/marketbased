import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Server-side session helper for use in Server Components and Server Actions.
 * Reads the session cookie automatically via the nextCookies() plugin.
 */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}
