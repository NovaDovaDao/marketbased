import type { Rune } from "@/types/rune"
import type { UserProfile as UserProfileType } from "@/types/user"
import UserProfileActivity from "./UserProfileActivity"
import UserProfileHero from "./UserProfileHero"
import UserProfileListings from "./UserProfileListings"
import UserProfileStats from "./UserProfileStats"

export interface UserProfileProps {
  profile: UserProfileType
  runes: Rune[]
}

export default function UserProfile({ profile, runes }: UserProfileProps) {
  return (
    <main
      className="min-h-screen bg-surface"
      aria-label={`${profile.displayName} profile`}
    >
      {/* Hero — full bleed, no horizontal padding */}
      <UserProfileHero
        profile={{
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          bannerUrl: profile.bannerUrl,
          bio: profile.bio,
          reputation: profile.reputation,
        }}
      />

      {/* Stats strip — full bleed */}
      <div className="mt-8">
        <UserProfileStats
          stats={profile.stats}
          reputation={profile.reputation}
          memberSince={profile.memberSince}
        />
      </div>

      {/* Content sections — contained */}
      <div className="mx-auto flex max-w-5xl flex-col gap-14 px-5 py-12 md:px-8">
        <UserProfileListings listings={profile.activeListings} runes={runes} />
        <UserProfileActivity history={profile.tradeHistory} runes={runes} />
      </div>
    </main>
  )
}
