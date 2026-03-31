import type { UserProfile } from "@/types/user"
import Image from "next/image"

export interface UserProfileHeroProps {
  profile: Pick<UserProfile, "username" | "displayName" | "avatarUrl" | "bannerUrl" | "bio" | "reputation">
}

export default function UserProfileHero({ profile }: UserProfileHeroProps) {
  const { username, displayName, avatarUrl, bannerUrl, bio, reputation } = profile

  return (
    <section aria-label={`${displayName} profile header`}>
      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden bg-surface-container-low sm:h-52 md:h-64">
        {/* Atmospheric blood glow — top right */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2"
          style={{
            background:
              "radial-gradient(ellipse at 100% 0%, rgba(140,0,0,0.22) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        {/* Atmospheric gold whisper — bottom left */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/3"
          style={{
            background:
              "radial-gradient(ellipse at 0% 100%, rgba(247,189,72,0.07) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <Image
          src={bannerUrl}
          alt={`${displayName} banner`}
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          priority
          unoptimized
        />
        {/* Gradient fade to surface at bottom for smooth avatar overlap */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background: "linear-gradient(to bottom, transparent, #131313)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Identity row — overlaps banner bottom */}
      <div className="relative -mt-10 flex flex-col gap-4 px-5 sm:-mt-12 md:flex-row md:items-end md:justify-between md:px-8">
        {/* Left: avatar + name + bio */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-6">
          {/* Avatar socket */}
          <div
            className="relative h-20 w-20 shrink-0 overflow-hidden bg-surface-container-lowest sm:h-24 sm:w-24 md:h-28 md:w-28"
            style={{ boxShadow: "inset 0px 4px 16px rgba(0,0,0,0.9), 0 0 0 2px rgba(247,189,72,0.15)" }}
            aria-hidden="true"
          >
            <Image
              src={avatarUrl}
              alt={`${displayName} avatar`}
              fill
              sizes="112px"
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Name + bio */}
          <div className="flex flex-col gap-1 pb-1">
            <h1
              className="font-headline text-2xl font-extrabold italic leading-none tracking-editorial text-secondary sm:text-3xl md:text-4xl"
              style={{ textShadow: "0 0 40px rgba(247,189,72,0.25)" }}
            >
              {displayName}
            </h1>
            <p className="font-headline text-sm text-on-surface-variant/60 md:text-base">
              @{username}
            </p>
            <p className="mt-1 max-w-sm font-headline text-sm leading-relaxed text-on-surface-variant/80 md:text-base">
              {bio}
            </p>
          </div>
        </div>

        {/* Right: rep score + CTA */}
        <div className="flex flex-row items-center gap-4 md:flex-col md:items-end md:gap-3">
          {/* Reputation badge */}
          <div
            className="flex flex-col items-center bg-surface-container-high px-4 py-3"
            aria-label={`Reputation score ${reputation.score} out of 5 from ${reputation.totalReviews} reviews`}
          >
            <span className="font-headline text-2xl font-extrabold text-secondary leading-none">
              {reputation.score.toFixed(1)}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-widest text-on-surface-variant/50">
              Rep · {reputation.totalReviews} reviews
            </span>
          </div>

          {/* Primary CTA */}
          <a
            href="#listings"
            className="inline-flex items-center px-6 py-3 font-headline text-sm font-bold uppercase tracking-widest text-on-primary-fixed transition-opacity duration-300 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            style={{
              background: "linear-gradient(135deg, #8c0000 0%, #920603 100%)",
            }}
            aria-label={`View ${displayName}'s listings`}
          >
            Trade with me
          </a>
        </div>
      </div>
    </section>
  )
}
