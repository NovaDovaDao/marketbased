import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { env } from "@/env.mjs"
import runesData from "@/items/runes.json"
import { type NextRequest } from "next/server"
import { z } from "zod"

const RUNE_PRICE_SD = 1000

const schema = z.object({
  runeId: z.number().int().min(1),
})

const runesMap = new Map(
  (runesData as Array<{ id: number; name: string }>).map((r) => [r.id, r.name]),
)

async function notifyDiscord(message: string) {
  const token = env.DISCORD_BOT_TOKEN
  const channelId = env.DISCORD_NOTIFICATION_CHANNEL_ID
  if (!token || !channelId) return
  try {
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    })
  } catch {
    // non-critical — silently swallow
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: unknown = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  const { runeId } = parsed.data
  const runeName = runesMap.get(runeId)

  if (!runeName) {
    return Response.json({ error: "Rune not found" }, { status: 404 })
  }

  const userId = session.user.id

  let newBalance: number

  try {
    newBalance = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { spaceDust: true },
      })

      if (user.spaceDust < RUNE_PRICE_SD) {
        throw new Error("insufficient_space_dust")
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: { spaceDust: { decrement: RUNE_PRICE_SD } },
        select: { spaceDust: true },
      })

      await tx.transaction.create({
        data: {
          txHash: crypto.randomUUID(),
          buyerId: userId,
          amount: { spaceDust: RUNE_PRICE_SD, runeId },
          status: "CONFIRMED",
        },
      })

      // Record in ItemPurchase for purchase history
      await tx.itemPurchase.create({
        data: {
          buyerId: userId,
          runeId,
          itemName: runeName,
          spaceDustAmount: RUNE_PRICE_SD,
        },
      })

      return updated.spaceDust
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message === "insufficient_space_dust") {
      return Response.json({ error: "insufficient_space_dust" }, { status: 402 })
    }
    throw err
  }

  // Fire-and-forget Discord notification
  const displayName = session.user.name ?? session.user.email ?? "Unknown user"
  void notifyDiscord(
    `🛒 **${displayName}** just bought **${runeName} Rune** for 1,000 SD — new balance: ${newBalance.toLocaleString()} SD`,
  )

  return Response.json({ success: true, newBalance })
}
