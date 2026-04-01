import { prisma } from "@/app/lib/prisma"
import MyProfileListings from "@/components/UserProfile/MyProfileListings"
import UserProfileHero from "@/components/UserProfile/UserProfileHero"
import UserProfileStats from "@/components/UserProfile/UserProfileStats"
import type { Metadata } from "next"
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
    include: {
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
      />

      <div className="mt-8">
        <UserProfileStats
          stats={{
            totalTrades: txCount,
            successfulTrades: txCount,
            successRate: txCount > 0 ? 100 : 0,
            totalListings: activeCount,
            activeListings: activeCount,
          }}
          reputation={{ score: 0, totalReviews: 0 }}
          memberSince={user.createdAt.toISOString()}
        />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-14 px-5 py-12 md:px-8">
        <MyProfileListings listings={user.listings} />
      </div>
    </main>
  )
}

