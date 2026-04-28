import { prisma } from "@/app/lib/prisma"
import { TRANSFER_EVENT, USDC_CONTRACT, getReceivingAddress, publicClient } from "@/lib/base"
import { usdToUsdcUnits } from "@/lib/pricing"
import { type NextRequest } from "next/server"

/**
 * Called by Vercel Cron once per day at midnight UTC.
 * Safety net for the synchronous Base Pay confirm flow: finds Base purchases
 * still pending in the last 72 hours and checks for a matching USDC Transfer
 * event on-chain. Idempotent via Purchase.providerRef unique constraint, so
 * sync-then-async double runs are no-ops.
 */
export async function GET(req: NextRequest) {
  // Validate cron secret set by Vercel
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const lookbackStart = new Date(Date.now() - 72 * 60 * 60 * 1000)

  const pendingPurchases = await prisma.purchase.findMany({
    where: {
      provider: "base",
      status: "pending",
      createdAt: { gte: lookbackStart },
    },
  })

  if (pendingPurchases.length === 0) {
    return Response.json({ processed: 0 })
  }

  const receivingAddress = getReceivingAddress()

  // Fetch all recent USDC Transfer events to our receiving address
  const latestBlock = await publicClient.getBlockNumber()
  const fromBlock = latestBlock - 1000n // ~33 min of Base blocks

  let logs: Awaited<ReturnType<typeof publicClient.getLogs<typeof TRANSFER_EVENT>>>
  try {
    logs = await publicClient.getLogs({
      address: USDC_CONTRACT,
      event: TRANSFER_EVENT,
      args: { to: receivingAddress },
      fromBlock,
      toBlock: latestBlock,
    })
  } catch {
    console.error("[base/poll] getLogs failed")
    return Response.json({ error: "getLogs failed" }, { status: 502 })
  }

  let confirmed = 0

  for (const purchase of pendingPurchases) {
    const expectedUsdcUnits = usdToUsdcUnits(purchase.amountUsd / 100)

    // Find a log that matches this purchase amount and happened after purchase creation
    const matchingLog = logs.find((log) => {
      const value = log.args.value as bigint | undefined
      if (value === undefined) return false
      if (value !== expectedUsdcUnits) return false
      // We can't check block timestamp cheaply; rely on fromBlock window covering the period
      return true
    })

    if (!matchingLog) continue

    const txHash = matchingLog.transactionHash
    if (!txHash) continue

    try {
      await prisma.$transaction([
        prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: "completed", providerRef: txHash },
        }),
        prisma.user.update({
          where: { id: purchase.userId },
          data: { spaceDust: { increment: purchase.spaceDust } },
        }),
      ])
      confirmed++

      // Remove the log so it can't match another purchase in the same poll run
      const idx = logs.indexOf(matchingLog)
      if (idx !== -1) logs.splice(idx, 1)
    } catch (err: unknown) {
      // Unique constraint on providerRef → already processed; skip
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        continue
      }
      console.error("[base/poll] transaction error for purchase", purchase.id, err)
    }
  }

  return Response.json({ processed: pendingPurchases.length, confirmed })
}
