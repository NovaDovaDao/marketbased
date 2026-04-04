import { prisma } from "@/app/lib/prisma"
import { verifyPayPalWebhook } from "@/lib/paypal"
import { type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const headers: Record<string, string> = {}
  for (const [key, value] of req.headers.entries()) {
    headers[key.toLowerCase()] = value
  }

  let isValid: boolean
  try {
    isValid = await verifyPayPalWebhook(headers, rawBody)
  } catch (err) {
    console.error("[paypal/webhook] signature verification error:", err)
    return Response.json({ error: "Verification failed" }, { status: 500 })
  }

  if (!isValid) {
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const event = JSON.parse(rawBody) as {
    event_type: string
    resource: { id: string; status: string }
  }

  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return Response.json({ received: true })
  }

  // resource.id for PAYMENT.CAPTURE.COMPLETED is the order ID
  const orderId = event.resource.id

  const purchase = await prisma.purchase.findFirst({
    where: { provider: "paypal", providerRef: orderId },
  })

  if (!purchase) {
    console.warn("[paypal/webhook] no purchase found for orderId:", orderId)
    return Response.json({ received: true })
  }

  if (purchase.status === "completed") {
    return Response.json({ received: true })
  }

  try {
    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "completed" },
      }),
      prisma.user.update({
        where: { id: purchase.userId },
        data: { spaceDust: { increment: purchase.spaceDust } },
      }),
    ])
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return Response.json({ received: true })
    }
    console.error("[paypal/webhook] transaction error:", err)
    return Response.json({ error: "Internal error" }, { status: 500 })
  }

  return Response.json({ received: true })
}
