import RuneCard from "@/components/RuneCard/RuneCard"
import type { Rune } from "@/types/rune"
import type { UserListing } from "@/types/user"

export interface UserProfileListingsProps {
  listings: UserListing[]
  runes: Rune[]
}

export default function UserProfileListings({ listings, runes }: UserProfileListingsProps) {
  const runeMap = new Map<number, Rune>(runes.map((r) => [r.id, r]))

  return (
    <section id="listings" aria-label="Active listings" className="flex flex-col gap-6">
      {/* Section heading */}
      <div className="flex items-baseline justify-between">
        <h2 className="font-headline text-xl font-extrabold uppercase italic tracking-widest text-secondary md:text-2xl">
          Relics for Trade
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
            className="font-headline text-5xl font-extrabold italic text-secondary/10 select-none"
            aria-hidden="true"
          >
            ∅
          </span>
          <p className="font-headline text-sm text-on-surface-variant/40">
            No relics listed for trade.
          </p>
        </div>
      ) : (
        <ul
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
          aria-label="Rune listings grid"
        >
          {listings.map((listing) => {
            const rune = runeMap.get(listing.runeId)
            if (!rune) return null
            return (
              <li key={listing.runeId}>
                <RuneCard rune={rune} />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
