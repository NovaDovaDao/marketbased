import { auth } from "@/app/utils/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Handle the base /api/auth route (the existing [...all] file only matches when
// at least one segment is present). Export the same handlers as the catch-all.
export const { GET, POST } = toNextJsHandler(auth);
