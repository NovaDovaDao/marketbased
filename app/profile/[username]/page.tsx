import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { ListingOffersManager } from "@/components/ListingOffersManager/ListingOffersManager"
import MyProfileListings from "@/components/UserProfile/MyProfileListings"
import UserProfileHero from "@/components/UserProfile/UserProfileHero"
import UserProfileStats from "@/components/UserProfile/UserProfileStats"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} — Marketbased`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      createdAt: true,
      spaceDust: true,
      listings: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  })

  if (!user) notFound()

  const activeCount = user.listings.length
  const txCount = user._count.transactions

  // Find an existing trade room between the session user and this profile user
  const session = await auth.api.getSession({ headers: await headers() })
  let sharedRoomId: string | null = null
  if (session && session.user.id !== user.id) {
    const room = await prisma.tradeRoom.findFirst({
      where: {
        OR: [
          { sellerId: session.user.id, buyerId: user.id },
          { sellerId: user.id, buyerId: session.user.id },
        ],
      },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    })
    sharedRoomId = room?.id ?? null
  }

  return (
    <main className="min-h-screen bg-surface" aria-label={`${user.name} profile`}>
      <UserProfileHero
        profile={{
          username: user.username,
          displayName: user.name,
          avatarUrl: user.image ?? "/avatars/default.webp",
          bannerUrl: "/banners/sanctuary-banner.webp",
          bio: "Trading from the depths of Sanctuary.",
          reputation: { score: 0, totalReviews: 0 },
        }}
        tradeRoomId={sharedRoomId}
      />

      <div className="mt-8">
        <UserProfileStats
          stats={{
            totalTrades: txCount,
            successfulTrades: txCount,
            spaceDust: user.spaceDust,
            totalListings: activeCount,
            activeListings: activeCount,
          }}
          reputation={{ score: 0, totalReviews: 0 }}
          memberSince={user.createdAt.toISOString()}
        />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-14 px-5 py-12 md:px-8">
        <MyProfileListings listings={user.listings} />
        {session?.user.id === user.id && <ListingOffersManager />}
      </div>
    </main>
  )
}

