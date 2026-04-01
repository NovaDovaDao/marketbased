import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const ethAddressRegex = /^0x[0-9a-fA-F]{40}$/

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    MERCHANT_ADDRESS: z.string().regex(ethAddressRegex, "Must be a valid Ethereum address").optional(),
    RESEND_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_MERCHANT_ADDRESS: z
      .string()
      .regex(ethAddressRegex, "Must be a valid Ethereum address")
      .optional(),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    MERCHANT_ADDRESS: process.env.MERCHANT_ADDRESS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_MERCHANT_ADDRESS: process.env.NEXT_PUBLIC_MERCHANT_ADDRESS,
  },
})
