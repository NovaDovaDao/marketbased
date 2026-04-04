import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { type NextRequest } from "next/server"

/**
 * GET /api/me/purchases
 * Returns the authenticated user's full purchase history:
 * - itemPurchases: items bought with Space Dust (runes + listings)
 * - topUps: Space Dust top-up history (Stripe, PayPal, Base)
 */
export async function GET(req: NextRequest): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  const [itemPurchases, topUps] = await Promise.all([
    prisma.itemPurchase.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, name: true, rarity: true } },
        seller: { select: { id: true, username: true, name: true } },
      },
    }),
    prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return Response.json({ itemPurchases, topUps })
}
