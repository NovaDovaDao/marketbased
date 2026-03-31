import UserProfile from "@/components/UserProfile/UserProfile"
import runesData from "@/items/runes.json"
import profileData from "@/items/user-profile.json"
import type { Rune } from "@/types/rune"
import type { UserProfile as UserProfileType } from "@/types/user"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = profileData as UserProfileType
  if (profile.username !== username) return {}

  return {
    title: `${profile.displayName} — Marketbased`,
    description: profile.bio,
    openGraph: {
      title: `${profile.displayName} — Marketbased`,
      description: profile.bio,
      images: [{ url: profile.bannerUrl }],
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const profile = profileData as UserProfileType

  if (profile.username !== username) {
    notFound()
  }

  const runes = runesData as Rune[]

  return <UserProfile profile={profile} runes={runes} />
}
