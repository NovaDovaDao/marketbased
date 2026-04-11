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
    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    // PayPal
    PAYPAL_CLIENT_ID: z.string().min(1).optional(),
    PAYPAL_CLIENT_SECRET: z.string().min(1).optional(),
    PAYPAL_WEBHOOK_ID: z.string().min(1).optional(),
    PAYPAL_BASE_URL: z.string().url().optional(),
    // Base chain
    BASE_RPC_URL: z.string().url().optional(),
    RECEIVING_ADDRESS: z.string().regex(ethAddressRegex, "Must be a valid Ethereum address").optional(),
    // Vercel Cron
    CRON_SECRET: z.string().min(16).optional(),
    // Discord Bot notifications
    DISCORD_BOT_TOKEN: z.string().min(1).optional(),
    DISCORD_NOTIFICATION_CHANNEL_ID: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),
    NEXT_PUBLIC_MERCHANT_ADDRESS: z
      .string()
      .regex(ethAddressRegex, "Must be a valid Ethereum address")
      .optional(),
    NEXT_PUBLIC_SOCKET_SERVER_URL: z.string().url().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_RECEIVING_ADDRESS: z
      .string()
      .regex(ethAddressRegex, "Must be a valid Ethereum address")
      .optional(),
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().min(1).optional(),
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
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
    PAYPAL_BASE_URL: process.env.PAYPAL_BASE_URL,
    BASE_RPC_URL: process.env.BASE_RPC_URL,
    RECEIVING_ADDRESS: process.env.RECEIVING_ADDRESS,
    CRON_SECRET: process.env.CRON_SECRET,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_NOTIFICATION_CHANNEL_ID: process.env.DISCORD_NOTIFICATION_CHANNEL_ID,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_MERCHANT_ADDRESS: process.env.NEXT_PUBLIC_MERCHANT_ADDRESS,
    NEXT_PUBLIC_SOCKET_SERVER_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_RECEIVING_ADDRESS: process.env.NEXT_PUBLIC_RECEIVING_ADDRESS,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  },
})
