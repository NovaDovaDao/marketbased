"use client";

import { createAuthClient } from "better-auth/react";
import { siweClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [siweClient(), emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session;
