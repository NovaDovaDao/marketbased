import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { getReceivingAddress } from "@/lib/base"
import { getTier, usdToUsdcUnits } from "@/lib/pricing"
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

  const receivingAddress = getReceivingAddress()
  const usdcAmount = usdToUsdcUnits(tier.usd)

  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      amountUsd: tier.usd * 100,
      spaceDust: tier.spaceDust,
      provider: "base",
      status: "pending",
    },
  })

  return Response.json({
    purchaseId: purchase.id,
    receivingAddress,
    usdcAmount: usdcAmount.toString(),
    usdcAmountFormatted: `${tier.usd}.000000`,
  })
}
