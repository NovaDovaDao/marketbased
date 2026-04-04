import { prisma } from "@/app/lib/prisma"
import { type NextRequest } from "next/server"
import Stripe from "stripe"

// Stripe requires the raw body for signature verification — disable body parsing
export const runtime = "nodejs"

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(key, { apiVersion: "2025-11-20.acacia" })
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    return Response.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch {
    return Response.json({ error: "Webhook signature invalid" }, { status: 400 })
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true })
  }

  const stripeSession = event.data.object as Stripe.Checkout.Session
  const purchaseId = stripeSession.metadata?.purchaseId

  if (!purchaseId) {
    console.error("[stripe/webhook] missing purchaseId in metadata")
    return Response.json({ error: "Missing purchaseId" }, { status: 400 })
  }

  if (stripeSession.payment_status !== "paid") {
    return Response.json({ received: true })
  }

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } })
  if (!purchase) {
    console.error("[stripe/webhook] purchase not found:", purchaseId)
    return Response.json({ error: "Purchase not found" }, { status: 404 })
  }

  if (purchase.status === "completed") {
    // Already processed — idempotent
    return Response.json({ received: true })
  }

  try {
    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: "completed", providerRef: stripeSession.id },
      }),
      prisma.user.update({
        where: { id: purchase.userId },
        data: { spaceDust: { increment: purchase.spaceDust } },
      }),
    ])
  } catch (err: unknown) {
    // Unique constraint hit → already processed
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return Response.json({ received: true })
    }
    console.error("[stripe/webhook] transaction error:", err)
    return Response.json({ error: "Internal error" }, { status: 500 })
  }

  return Response.json({ received: true })
}
