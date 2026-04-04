import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { getTier, usdToCents } from "@/lib/pricing"
import { type NextRequest } from "next/server"
import Stripe from "stripe"

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(key, { apiVersion: "2025-11-20.acacia" })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json()) as { usdAmount: unknown }
  const usdAmount = typeof body.usdAmount === "number" ? body.usdAmount : NaN

  const tier = getTier(usdAmount)
  if (!tier) {
    return Response.json({ error: "Invalid pricing tier" }, { status: 400 })
  }

  const stripe = getStripe()

  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      amountUsd: usdToCents(tier.usd),
      spaceDust: tier.spaceDust,
      provider: "stripe",
      status: "pending",
    },
  })

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tier.spaceDust.toLocaleString()} Space Dust`,
            description: `Top up your Space Dust balance`,
          },
          unit_amount: usdToCents(tier.usd),
        },
        quantity: 1,
      },
    ],
    metadata: {
      purchaseId: purchase.id,
      userId: session.user.id,
    },
    success_url: `${baseUrl}/store?success=1`,
    cancel_url: `${baseUrl}/store?cancelled=1`,
  })

  return Response.json({ sessionUrl: stripeSession.url })
}
