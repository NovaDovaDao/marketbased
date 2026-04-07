import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { PurchaseHistory } from "@/components/PurchaseHistory/PurchaseHistory"
import { type Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Purchase History",
  description: "View your item purchases and Space Dust top-up history.",
  robots: { index: false, follow: false },
}

export default async function PurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

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

  // Serialize dates for client component
  const serializedItemPurchases = itemPurchases.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }))
  const serializedTopUps = topUps.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-surface pt-16">
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        {/* Page heading */}
        <div className="mb-10 border-b border-stone-800 pb-8">
          <p className="mb-1 font-headline text-[10px] uppercase tracking-widest text-on-surface-variant/40">
            Account
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tighter text-secondary md:text-5xl">
            Purchase History
          </h1>
          <p className="mt-2 font-serif text-sm italic text-stone-500">
            Items bought with Space Dust and your top-up receipts
          </p>
        </div>

        <PurchaseHistory
          itemPurchases={serializedItemPurchases}
          topUps={serializedTopUps}
        />
      </div>
    </main>
  )
}
