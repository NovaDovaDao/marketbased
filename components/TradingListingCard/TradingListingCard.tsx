import {
  formatEth,
  formatForumGold,
  formatUsd,
  type TradingListing,
} from "@/types/trading"
import { cva, type VariantProps } from "class-variance-authority"
import Image from "next/image"
import { twMerge } from "tailwind-merge"

// ── CVA variant definitions ────────────────────────────────────────────────

const listingCard = cva(
  [
    "group relative flex flex-col lg:flex-row",
    "border transition-colors duration-300",
    "cursor-pointer",
  ],
  {
    variants: {
      tier: {
        Elite: [
          "bg-surface-container",
          "border-amber-900/40",
          "hover:bg-surface-container-high",
          "hover:border-amber-700/60",
          "shadow-[0_0_24px_rgba(247,189,72,0.04)]",
          "hover:shadow-[0_0_32px_rgba(247,189,72,0.1)]",
        ],
        Exceptional: [
          "bg-surface-container-low",
          "border-stone-800",
          "hover:bg-surface-container",
          "hover:border-stone-700",
        ],
        Normal: [
          "bg-surface-container-lowest",
          "border-stone-900",
          "hover:bg-surface-container-low",
          "hover:border-stone-800",
        ],
      },
    },
    defaultVariants: { tier: "Normal" },
  }
)

const rarityBadge = cva(
  [
    "absolute -top-2 -right-2",
    "px-2 py-1",
    "text-[10px] font-bold tracking-widest uppercase",
    "border",
  ],
  {
    variants: {
      category: {
        Uniques: "bg-amber-950 text-amber-400 border-amber-800/60",
        Set: "bg-emerald-950 text-emerald-400 border-emerald-800/60",
        Runewords: "bg-sky-950 text-sky-400 border-sky-800/60",
        Runes: "bg-violet-950 text-violet-400 border-violet-800/60",
        default: "bg-stone-900 text-stone-400 border-stone-700",
      },
    },
    defaultVariants: { category: "default" },
  }
)

export type ListingCardVariants = VariantProps<typeof listingCard>

// ── Props ──────────────────────────────────────────────────────────────────

export interface TradingListingCardProps extends ListingCardVariants {
  listing: TradingListing
  className?: string
}

// ── Badge label helper ─────────────────────────────────────────────────────

function getBadgeLabel(listing: TradingListing): string {
  const { tier, category, rarity } = listing
  if (category === "Runewords") return "Runeword"
  if (category === "Runes") return `${tier} Rune`
  if (rarity === "Set") return "Set Item"
  if (rarity === "Unique") return `${tier} Unique`
  return tier
}

function getBadgeCategory(
  listing: TradingListing
): "Uniques" | "Set" | "Runewords" | "Runes" | "default" {
  if (listing.category === "Runewords") return "Runewords"
  if (listing.category === "Runes") return "Runes"
  if (listing.rarity === "Set") return "Set"
  if (listing.rarity === "Unique") return "Uniques"
  return "default"
}

// ── Component (Server Component) ──────────────────────────────────────────

export default function TradingListingCard({
  listing,
  className,
}: TradingListingCardProps) {
  const {
    name,
    itemType,
    stats,
    skills,
    tier,
    image,
    priceUsdCents,
    priceForumGold,
    priceEth,
    relicStatus,
  } = listing

  const badgeLabel = getBadgeLabel(listing)
  const badgeCat = getBadgeCategory(listing)
  const isEthereal = relicStatus.includes("ethereal")

  return (
    <article
      className={twMerge(listingCard({ tier }), className)}
      aria-label={`${name}${isEthereal ? " (Ethereal)" : ""}`}
    >
      {/* ── Rarity badge ── */}
      <span className={rarityBadge({ category: badgeCat })} aria-label={badgeLabel}>
        {badgeLabel}
      </span>

      {/* ── Image box ── */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-container-lowest socket-shadow lg:w-44">
        {/* Monogram watermark */}
        <span
          className="absolute inset-0 flex items-center justify-center font-serif text-[5rem] font-extrabold italic leading-none text-secondary/[0.04] select-none"
          aria-hidden="true"
        >
          {name[0]}
        </span>
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 176px"
          className={twMerge(
            "object-contain p-6 transition-transform duration-300 group-hover:scale-105",
            isEthereal && "opacity-60"
          )}
          unoptimized
        />
        {isEthereal && (
          <span
            className="absolute inset-x-0 bottom-2 text-center text-[10px] tracking-widest text-sky-400 uppercase"
            aria-label="Ethereal item"
          >
            Ethereal
          </span>
        )}
      </div>

      {/* ── Details block ── */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Name + type */}
        <div>
          <h3 className="font-serif text-xl font-bold leading-tight text-secondary">
            {name}
          </h3>
          {itemType && (
            <p className="text-label-sm mt-1 text-on-surface-variant/50">{itemType}</p>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <ul
            className="space-y-1 border border-amber-900/10 bg-black/20 p-3"
            aria-label="Item stats"
          >
            {stats.map((stat, i) => (
              <li
                key={i}
                className={twMerge(
                  "font-serif text-xs leading-snug",
                  i === 0
                    ? "font-bold text-secondary"
                    : "text-on-surface-variant/70"
                )}
              >
                {stat}
              </li>
            ))}
          </ul>
        )}

        {/* Skills (if any) */}
        {skills.length > 0 && (
          <p className="text-label-sm text-amber-500/70">
            Skills: {skills.join(", ")}
          </p>
        )}

        {/* Price row */}
        <div className="mt-auto border-t border-stone-800 pt-4">
          <div className="flex flex-wrap items-end gap-6">
            {priceForumGold !== null && (
              <div>
                <p className="text-label-sm text-stone-500">Forum Gold</p>
                <p className="font-serif text-base font-bold text-secondary">
                  {formatForumGold(priceForumGold)}
                </p>
              </div>
            )}
            {priceEth !== null && (
              <div>
                <p className="text-label-sm text-stone-500">ETH</p>
                <p className="font-serif text-base font-bold text-stone-300">
                  {formatEth(priceEth)}
                </p>
              </div>
            )}
            <div>
              <p className="text-label-sm text-stone-500">USD</p>
              <p className="font-serif text-base font-bold text-stone-200">
                {formatUsd(priceUsdCents)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
