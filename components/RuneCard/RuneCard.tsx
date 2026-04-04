import BuyRuneButton from "@/components/BuyRuneButton/BuyRuneButton"
import { TIER_LABELS, type Rune } from "@/types/rune"
import { cva, type VariantProps } from "class-variance-authority"
import Image from "next/image"
import { twMerge } from "tailwind-merge"

// ── CVA variant definitions ─────────────────────────────────────────────────

const runeCard = cva(
  [
    "group relative flex flex-col",
    "transition-colors duration-300",
    "cursor-pointer",
    // No border-radius per design system
  ],
  {
    variants: {
      tier: {
        low: [
          "bg-surface-container-low",
          "hover:bg-surface-container",
        ],
        mid: [
          "bg-surface-container",
          "hover:bg-surface-container-high",
        ],
        high: [
          "bg-surface",
          "shadow-blood",
          "hover:bg-surface-container-low",
        ],
      },
    },
    defaultVariants: { tier: "low" },
  }
)

const tierBadge = cva(
  [
    "inline-flex items-center",
    "text-label-sm font-bold uppercase tracking-widest",
    "px-3 py-1",
  ],
  {
    variants: {
      tier: {
        low: "text-on-surface-variant/60 bg-surface-container-high",
        mid: "text-primary/80 bg-primary-container/30",
        high: "text-secondary bg-secondary-container/20",
      },
    },
    defaultVariants: { tier: "low" },
  }
)

export type RuneCardVariants = VariantProps<typeof runeCard>

// ── Props ────────────────────────────────────────────────────────────────────

export interface RuneCardProps extends RuneCardVariants {
  rune: Rune
  className?: string
}

// ── Component (Server Component — no "use client" needed) ────────────────────

export default function RuneCard({ rune, className }: RuneCardProps) {
  const { name, level, tier, image } = rune

  return (
    <article
      className={twMerge(runeCard({ tier }), className)}
      aria-label={`${name} rune — ${TIER_LABELS[tier]}`}
    >
      {/* Image socket */}
      <div className="relative aspect-square w-full bg-surface-container-lowest socket-shadow overflow-hidden">
        {/* Monogram watermark */}
        <span
          className="absolute inset-0 flex items-center justify-center font-headline text-[5rem] font-extrabold italic leading-none text-secondary/[0.04] select-none"
          aria-hidden="true"
        >
          {name[0]}
        </span>
        <Image
          src={image}
          alt={`${name} rune`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        {/* Tier badge — top-right corner */}
        <span
          className={tierBadge({ tier })}
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          {TIER_LABELS[tier]}
        </span>
      </div>

      {/* Info block */}
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-headline text-lg font-semibold leading-tight text-on-surface">
          {name}
        </h3>
        <p className="text-label-sm text-on-surface-variant/50">
          Required Level {level}
        </p>

        {/* Price row */}
        <div className="mt-3 flex flex-col gap-2 border-t border-outline-variant/10 pt-3">
          <p className="font-headline text-base font-semibold text-secondary">
            1,000{" "}
            <span className="text-xs text-on-surface-variant/40">SD</span>
          </p>
          <BuyRuneButton runeId={rune.id} runeName={name} />
        </div>
      </div>
    </article>
  )
}
