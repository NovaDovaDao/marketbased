import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { env } from "@/env.mjs"
import runesData from "@/items/runes.json"
import { getReceivingAddress, isBaseTestnet } from "@/lib/base"
import { notifyAdminChannelPurchase } from "@/services/discord-notifications"
import { getPaymentStatus } from "@base-org/account"
import { type NextRequest } from "next/server"
import { z } from "zod"

const schema = z.object({
  paymentId: z.string().min(1),
  itemType: z.enum(["listing", "rune"]),
  itemId: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/, "Amount must be a USD string like \"25.00\""),
})

const runesMap = new Map(
  (runesData as Array<{ id: number; name: string }>).map((r) => [r.id, r.name]),
)

type PaymentStatusResponse = {
  status: "completed" | "pending" | "failed"
  sender?: string
  recipient?: string
  amount?: string
}

const SUCCESS_REDIRECT = (id: string) => `/trade-rooms/${id}`

function err(status: number, message: string): Response {
  return Response.json({ success: false, error: message }, { status })
}

function eqAddress(a: string | undefined, b: string | undefined): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase()
}

/** USDC has 6 decimals; we store amounts as integer cents (1 USD = 100 cents). */
function usdStringToCents(usd: string): number {
  const [whole, frac = ""] = usd.split(".")
  const padded = (frac + "00").slice(0, 2)
  return Number(whole) * 100 + Number(padded)
}

export async function POST(req: NextRequest): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return err(401, "Unauthorized")

  const body: unknown = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(400, "Invalid request")

  const { paymentId, itemId, amount } = parsed.data
  const buyerId = session.user.id
  const testnet = isBaseTestnet()

  // 1. Replay protection — Transaction.txHash is unique; reusing the same
  //    paymentId on a second submission will hit the constraint, but checking
  //    up front lets us return a clean 409.
  const existing = await prisma.transaction.findUnique({
    where: { txHash: paymentId },
    select: { id: true },
  })
  if (existing) return err(409, "Payment already processed")

  // 2. Verify payment with Base.
  let payment: PaymentStatusResponse
  try {
    payment = (await getPaymentStatus({ id: paymentId, testnet })) as PaymentStatusResponse
  } catch {
    return err(502, "Payment verification unavailable; try again in 1 minute")
  }

  if (payment.status !== "completed") {
    return err(400, `Payment is ${payment.status}. Please retry once it confirms.`)
  }

  // 3. Recipient must match our merchant address.
  let merchantAddress: `0x${string}`
  try {
    merchantAddress = getReceivingAddress()
  } catch {
    return err(500, "Merchant address not configured")
  }
  if (!eqAddress(payment.recipient, merchantAddress)) {
    return err(400, "Payment recipient does not match merchant")
  }

  // 4. Sender must match a wallet linked to the authenticated user. This stops
  //    one user from claiming someone else's payment.
  if (!payment.sender) return err(400, "Payment sender missing")
  const linked = await prisma.walletAddress.findFirst({
    where: { userId: buyerId, address: payment.sender.toLowerCase() },
    select: { id: true },
  })
  if (!linked) {
    const anyAddr = await prisma.walletAddress.findFirst({
      where: { address: payment.sender.toLowerCase() },
      select: { id: true },
    })
    return err(
      400,
      anyAddr
        ? "Payment sender does not match your account"
        : "Link your wallet before paying so we can verify the sender",
    )
  }

  // 5. Amount must match the order. Compare in cents with ±1 cent tolerance.
  const expectedCents = usdStringToCents(amount)
  const reportedCents = payment.amount ? usdStringToCents(payment.amount) : NaN
  if (!Number.isFinite(reportedCents) || Math.abs(expectedCents - reportedCents) > 1) {
    return err(400, "Payment amount does not match order")
  }

  const { itemType } = parsed.data

  // ── Rune purchase via USDC ────────────────────────────────────────────────
  if (itemType === "rune") {
    const runeId = parseInt(itemId, 10)
    if (isNaN(runeId)) return err(400, "Invalid rune ID")
    const runeName = runesMap.get(runeId)
    if (!runeName) return err(404, "Rune not found")

    try {
      await prisma.$transaction(async (tx) => {
        await tx.itemPurchase.create({
          data: {
            buyerId,
            runeId,
            itemName: `${runeName} Rune`,
            spaceDustAmount: 0,
          },
        })

        await tx.transaction.create({
          data: {
            txHash: paymentId,
            buyerId,
            amount: { usdc: expectedCents, runeId },
            status: "CONFIRMED",
          },
        })
      })
    } catch (e: unknown) {
      if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
        return err(409, "Payment already processed")
      }
      console.error("[confirm-usdc] rune transaction failed", e)
      return err(500, "Could not record purchase")
    }

    const buyerName = session.user.name ?? session.user.email ?? "Unknown user"
    void notifyAdminChannelPurchase({
      buyerName,
      itemName: `${runeName} Rune`,
      price: amount,
      currency: "USDC",
      sellerName: null,
    })

    return Response.json({ success: true })
  }

  // ── Listing purchase via USDC ─────────────────────────────────────────────
  // 6. Load the listing and validate state.
  const listing = await prisma.listing.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      name: true,
      sellerId: true,
      status: true,
      seller: { select: { name: true, email: true } },
    },
  })
  if (!listing) return err(404, "Listing not found")
  if (listing.status !== "active") return err(409, "Listing is no longer active")
  if (listing.sellerId === buyerId) return err(400, "Cannot purchase your own listing")

  // 7. Atomic write — listing → trade room → item purchase → transaction.
  let tradeRoomId: string
  try {
    tradeRoomId = await prisma.$transaction(async (tx) => {
      await tx.listing.update({
        where: { id: listing.id },
        data: { status: "sold" },
      })

      const room = await tx.tradeRoom.create({
        data: {
          sellerId: listing.sellerId,
          buyerId,
          messages: {
            create: [
              {
                senderId: listing.sellerId,
                content: `${listing.name} has been purchased for $${amount} USDC.`,
                type: "system",
              },
              {
                senderId: buyerId,
                content: `I just bought ${listing.name} with USDC — what game/pass and server should I join?`,
                type: "text",
              },
            ],
          },
        },
        select: { id: true },
      })

      await tx.itemPurchase.create({
        data: {
          buyerId,
          sellerId: listing.sellerId,
          listingId: listing.id,
          itemName: listing.name,
          spaceDustAmount: 0,
          tradeRoomId: room.id,
        },
      })

      await tx.transaction.create({
        data: {
          txHash: paymentId,
          listingId: listing.id,
          buyerId,
          amount: { usdc: expectedCents },
          status: "CONFIRMED",
        },
      })

      return room.id
    })
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return err(409, "Payment already processed")
    }
    console.error("[confirm-usdc] transaction failed", e)
    return err(500, "Could not record purchase")
  }

  // 8. Fire-and-forget side effects — these must not block the response.
  if (env.CHAT_SERVICE_URL && env.CHAT_SERVICE_SECRET) {
    void fetch(`${env.CHAT_SERVICE_URL}/internal/notify-new-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.CHAT_SERVICE_SECRET}`,
      },
      body: JSON.stringify({
        sellerId: listing.sellerId,
        buyerId,
        roomId: tradeRoomId,
        listingName: listing.name,
      }),
    }).catch(() => undefined)
  }

  const buyerName = session.user.name ?? session.user.email ?? "Unknown user"
  const sellerName = listing.seller?.name ?? listing.seller?.email ?? null
  void notifyAdminChannelPurchase({
    buyerName,
    itemName: listing.name,
    price: amount,
    currency: "USDC",
    sellerName,
  })

  return Response.json({
    success: true,
    tradeRoomId,
    redirectUrl: SUCCESS_REDIRECT(tradeRoomId),
  })
}
