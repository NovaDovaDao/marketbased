import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { createPayPalOrder } from "@/lib/paypal"
import { getTier, usdToCents } from "@/lib/pricing"
import { type NextRequest } from "next/server"

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

  const order = await createPayPalOrder(tier.usd)

  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      amountUsd: usdToCents(tier.usd),
      spaceDust: tier.spaceDust,
      provider: "paypal",
      providerRef: order.id,
      status: "pending",
    },
  })

  return Response.json({ orderId: order.id, purchaseId: purchase.id })
}
