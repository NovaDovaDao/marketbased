import type { Listing } from "@/generated/prisma/client";

export interface MyProfileListingsProps {
  listings: Listing[]
}

type PriceJson = { eth?: string | number; usdc?: string | number;[key: string]: unknown }

function formatListingPrice(price: unknown): string {
  if (!price || typeof price !== "object" || Array.isArray(price)) return "—"
  const p = price as PriceJson
  if (p.usdc !== undefined) return `${p.usdc} USDC`
  if (p.eth !== undefined) return `${p.eth} ETH`
  const first = Object.entries(p)[0]
  if (first) return `${first[1]} ${first[0].toUpperCase()}`
  return "—"
}

const RARITY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "Rare", color: "#f7bd48", bg: "rgba(247,189,72,0.08)" },
  mid: { label: "Uncommon", color: "#e9bf9a", bg: "rgba(233,191,154,0.08)" },
  low: { label: "Common", color: "#9ca3af", bg: "rgba(156,163,175,0.06)" },
  Unique: { label: "Unique", color: "#ff9b48", bg: "rgba(255,155,72,0.10)" },
  Rare: { label: "Rare", color: "#6aa0ff", bg: "rgba(106,160,255,0.08)" },
  Magic: { label: "Magic", color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  Set: { label: "Set", color: "#4ade80", bg: "rgba(74,222,128,0.08)" },
  Normal: { label: "Normal", color: "#9ca3af", bg: "rgba(156,163,175,0.06)" },
}

function getRarityStyle(rarity: string) {
  return RARITY_STYLES[rarity] ?? { label: rarity, color: "#9ca3af", bg: "rgba(156,163,175,0.06)" }
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function MyProfileListings({ listings }: MyProfileListingsProps) {
  return (
    <section id="listings" aria-label="My active listings" className="flex flex-col gap-6">
      {/* Section heading */}
      <div className="flex items-baseline justify-between">
        <h2 className="font-headline text-xl font-extrabold uppercase italic tracking-widest text-secondary md:text-2xl">
          My Relics
        </h2>
        <span className="font-headline text-sm text-on-surface-variant/50">
          {listings.length} {listings.length === 1 ? "listing" : "listings"}
        </span>
      </div>

      {listings.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 bg-surface-container-lowest px-8 py-16 text-center"
          role="status"
          aria-label="No active listings"
        >
          <span
            className="select-none font-headline text-5xl font-extrabold italic text-secondary/10"
            aria-hidden="true"
          >
            ∅
          </span>
          <p className="font-headline text-sm text-on-surface-variant/40">
            No relics listed for trade.
          </p>
          <a
            href="/trading"
            className="mt-2 border border-secondary/30 px-4 py-2 font-headline text-xs uppercase tracking-widest text-secondary/70 transition-colors duration-200 hover:bg-secondary/10 hover:text-secondary"
          >
            Browse Listings
          </a>
        </div>
      ) : (
        <ul
          className="flex flex-col gap-2"
          aria-label="Active listings"
        >
          {listings.map((listing) => {
            const rarity = getRarityStyle(listing.rarity)
            return (
              <li
                key={listing.id}
                className="group flex items-center gap-4 bg-surface-container-low px-4 py-4 transition-colors duration-300 hover:bg-surface-container"
                aria-label={`${listing.name} — ${rarity.label}`}
              >
                {/* Rarity socket */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center bg-surface-container-lowest"
                  style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)", background: rarity.bg }}
                  aria-hidden="true"
                >
                  <span
                    className="font-headline text-lg font-extrabold italic leading-none"
                    style={{ color: rarity.color, textShadow: `0 0 12px ${rarity.color}44` }}
                  >
                    {listing.name.charAt(0)}
                  </span>
                </div>

                {/* Name + base */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="font-headline text-sm font-semibold leading-snug text-on-surface">
                    {listing.name}
                  </p>
                  <p className="truncate font-headline text-xs text-on-surface-variant/40">
                    {listing.baseName}{" "}
                    <span
                      className="ml-1 px-1.5 py-0.5 font-headline text-[10px] uppercase tracking-widest"
                      style={{ color: rarity.color, background: rarity.bg }}
                    >
                      {rarity.label}
                    </span>
                  </p>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  <p
                    className="font-headline text-sm font-bold text-secondary"
                    style={{ textShadow: "0 0 16px rgba(247,189,72,0.25)" }}
                  >
                    {formatListingPrice(listing.price)}
                  </p>
                  <p className="font-headline text-[10px] text-on-surface-variant/30">
                    {formatDate(listing.createdAt)}
                  </p>
                </div>

                {/* Status dot */}
                <div
                  className="h-2 w-2 shrink-0"
                  style={{ background: listing.status === "active" ? "#4ade80" : "#6b7280" }}
                  aria-label={`Status: ${listing.status}`}
                  title={listing.status}
                />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
