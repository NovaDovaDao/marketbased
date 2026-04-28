import { env } from "@/env.mjs"

type CurrencyType = "SD" | "ETH" | "USDC"

async function postToChannel(channelId: string, content: string): Promise<void> {
  const token = env.DISCORD_BOT_TOKEN
  if (!token) return
  try {
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })
  } catch {
    // Non-critical; do not block the request.
  }
}

export interface AdminPurchaseNotification {
  buyerName: string
  itemName: string
  price: number | string
  currency: CurrencyType
  sellerName?: string | null
  newBuyerBalance?: number
}

export async function notifyAdminChannelPurchase(
  ev: AdminPurchaseNotification,
): Promise<void> {
  const channelId = env.DISCORD_NOTIFICATION_CHANNEL_ID
  if (!channelId) return

  const priceStr =
    typeof ev.price === "number" ? ev.price.toLocaleString() : ev.price
  const seller = ev.sellerName ? ` from **${ev.sellerName}**` : ""
  const balance =
    ev.newBuyerBalance !== undefined
      ? ` — new balance: ${ev.newBuyerBalance.toLocaleString()} SD`
      : ""

  await postToChannel(
    channelId,
    `🛒 **${ev.buyerName}** just bought **${ev.itemName}** for ${priceStr} ${ev.currency}${seller}${balance}`,
  )
}

/**
 * Stub for seller DM notifications. Wiring real Discord DMs requires either
 * a `discordId`/`discordDmChannelId` field on User or a username lookup —
 * deferred per the parent user story's "Further Considerations".
 */
export async function notifySellerDmPurchase(_args: {
  sellerUserId: string
  buyerName: string
  itemName: string
  price: number | string
  currency: CurrencyType
  tradeRoomLink?: string
}): Promise<void> {
  // Intentional no-op until seller Discord IDs are tracked.
  return
}
