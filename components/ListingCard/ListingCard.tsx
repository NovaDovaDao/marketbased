import { formatSpaceDust } from "@/lib/format-price"
import type { Listing } from "@/generated/prisma/client"
import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

// ── CVA variant definitions ────────────────────────────────────────────────

const listingCard = cva(
  [
    "group relative flex flex-col",
    "transition-colors duration-300",
  ],
  {
    variants: {
      rarity: {
        UNIQUE: [
          "bg-surface-container",
          "hover:bg-surface-container-high",
          "shadow-[0_0_24px_rgba(247,189,72,0.04)]",
          "hover:shadow-[0_0_32px_rgba(247,189,72,0.10)]",
        ],
        SET: [
          "bg-surface-container",
          "hover:bg-surface-container-high",
          "shadow-[0_0_24px_rgba(52,211,153,0.04)]",
          "hover:shadow-[0_0_32px_rgba(52,211,153,0.10)]",
        ],
        RUNEWORD: [
          "bg-surface-container-low",
          "hover:bg-surface-container",
          "shadow-[0_0_24px_rgba(139,92,246,0.04)]",
          "hover:shadow-[0_0_32px_rgba(139,92,246,0.10)]",
        ],
        RARE: [
          "bg-surface-container-low",
          "hover:bg-surface-container",
        ],
        MAGIC: [
          "bg-surface-container-lowest",
          "hover:bg-surface-container-low",
        ],
        NORMAL: [
          "bg-surface-container-lowest",
          "hover:bg-surface-container-low",
        ],
        CRAFTED: [
          "bg-surface-container-low",
          "hover:bg-surface-container",
        ],
      },
      size: {
        sm: "p-4 gap-3",
        md: "p-6 gap-4",
      },
    },
    defaultVariants: { rarity: "NORMAL", size: "md" },
  }
)

const rarityLabel = cva(
  ["inline-block px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"],
  {
    variants: {
      rarity: {
        UNIQUE:   "bg-amber-950 text-amber-400",
        SET:      "bg-emerald-950 text-emerald-400",
        RUNEWORD: "bg-violet-950 text-violet-400",
        RARE:     "bg-yellow-950 text-yellow-300",
        MAGIC:    "bg-sky-950 text-sky-400",
        NORMAL:   "bg-stone-900 text-stone-400",
        CRAFTED:  "bg-orange-950 text-orange-400",
      },
    },
    defaultVariants: { rarity: "NORMAL" },
  }
)

export type ListingCardVariants = VariantProps<typeof listingCard>

// ── Seller shape returned from the API include ────────────────────────────

export type ListingWithSeller = Pick<
  Listing,
  "id" | "name" | "baseName" | "rarity" | "spaceDustPrice" | "status" | "createdAt" | "tradeCurrency"
> & {
  seller: { id: string; username: string; image: string | null }
}

// ── Props ──────────────────────────────────────────────────────────────────

export interface ListingCardProps extends ListingCardVariants {
  listing: ListingWithSeller
  className?: string
  /** Render an action element (e.g. TradeDialog trigger) in the price row */
  action?: React.ReactNode
}

// ── Helpers ────────────────────────────────────────────────────────────────

type RarityVariant = NonNullable<ListingCardVariants["rarity"]>

const RARITY_DISPLAY: Record<string, string> = {
  UNIQUE:   "Unique",
  SET:      "Set",
  RUNEWORD: "Runeword",
  RARE:     "Rare",
  MAGIC:    "Magic",
  NORMAL:   "Normal",
  CRAFTED:  "Crafted",
}

function toRarityVariant(raw: string): RarityVariant {
  const upper = raw.toUpperCase()
  return (upper in RARITY_DISPLAY ? upper : "NORMAL") as RarityVariant
}

// ── Component (Server Component) ──────────────────────────────────────────

export default function ListingCard({
  listing,
  className,
  size,
  action,
}: ListingCardProps) {
  const { name, baseName, rarity, spaceDustPrice, seller } = listing
  const rarityVariant = toRarityVariant(rarity)
  const rarityText = RARITY_DISPLAY[rarityVariant] ?? rarity

  return (
    <article
      className={twMerge(listingCard({ rarity: rarityVariant, size }), className)}
      aria-label={`${name} listing by ${seller.username}`}
    >
      {/* ── Header: name + rarity badge ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3
            className={twMerge(
              "font-serif font-bold leading-tight truncate",
              size === "sm" ? "text-base" : "text-xl",
              rarityVariant === "UNIQUE" || rarityVariant === "RUNEWORD" || rarityVariant === "SET"
                ? "text-secondary"
                : "text-on-surface"
            )}
          >
            {name}
          </h3>
          {baseName && baseName !== name && (
            <p className="mt-0.5 text-xs text-on-surface-variant/50 truncate">{baseName}</p>
          )}
        </div>

        <span
          className={rarityLabel({ rarity: rarityVariant })}
          aria-label={`Rarity: ${rarityText}`}
        >
          {rarityText}
        </span>
      </div>

      {/* ── Seller ── */}
      <p className="text-xs text-on-surface-variant/50">
        Seller:{" "}
        <span className="text-on-surface-variant/80">{seller.username}</span>
      </p>

      {/* ── Price row ── */}
      <div className="mt-auto flex items-center justify-between border-t border-stone-800 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-500">
            Space Dust
          </p>
          <p className="font-serif font-bold text-secondary">
            {spaceDustPrice != null
              ? formatSpaceDust(spaceDustPrice)
              : "Offer"}
          </p>
        </div>

        {action && <div>{action}</div>}
      </div>
    </article>
  )
}
