import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { capturePayPalOrder } from "@/lib/paypal"
import { type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json()) as { orderId: unknown; purchaseId: unknown }
  const { orderId, purchaseId } = body

  if (typeof orderId !== "string" || typeof purchaseId !== "string") {
    return Response.json({ error: "Missing orderId or purchaseId" }, { status: 400 })
  }

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } })
  if (!purchase || purchase.userId !== session.user.id) {
    return Response.json({ error: "Purchase not found" }, { status: 404 })
  }
  if (purchase.status === "completed") {
    return Response.json({ success: true })
  }

  const capture = await capturePayPalOrder(orderId)

  if (capture.status !== "COMPLETED") {
    return Response.json({ error: "PayPal capture not completed" }, { status: 400 })
  }

  try {
    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: "completed", providerRef: orderId },
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
      // Already credited — idempotent
      return Response.json({ success: true })
    }
    console.error("[paypal/capture] transaction error:", err)
    return Response.json({ error: "Internal error" }, { status: 500 })
  }

  return Response.json({ success: true })
}
