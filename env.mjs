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
    BETTER_AUTH_API_KEY: z.string().min(1).optional(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    MERCHANT_ADDRESS: z.string().regex(ethAddressRegex, "Must be a valid Ethereum address").optional(),
    RESEND_API_KEY: z.string().min(1),
    UPSTASH_REDIS_URL: z.string().url().optional(),
    UPSTASH_REDIS_TOKEN: z.string().min(1).optional(),
    CHAT_SERVICE_URL: z.string().url().optional(),
    CHAT_SERVICE_SECRET: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_MERCHANT_ADDRESS: z
      .string()
      .regex(ethAddressRegex, "Must be a valid Ethereum address")
      .optional(),
    NEXT_PUBLIC_SOCKET_SERVER_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_API_KEY: process.env.BETTER_AUTH_API_KEY,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    MERCHANT_ADDRESS: process.env.MERCHANT_ADDRESS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
    UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
    CHAT_SERVICE_URL: process.env.CHAT_SERVICE_URL,
    CHAT_SERVICE_SECRET: process.env.CHAT_SERVICE_SECRET,
    NEXT_PUBLIC_MERCHANT_ADDRESS: process.env.NEXT_PUBLIC_MERCHANT_ADDRESS,
    NEXT_PUBLIC_SOCKET_SERVER_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
  },
})
