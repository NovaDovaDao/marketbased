export type RuneTier = "low" | "mid" | "high"

export interface Rune {
  id: number
  name: string
  slug: string
  level: number
  tier: RuneTier
  image: string
}

/** Integer cents — never use floats for price computation */
export type PriceCents = number

export function formatPrice(cents: PriceCents): string {
  return (cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })
}

export const TIER_LABELS: Record<RuneTier, string> = {
  low: "Common",
  mid: "Uncommon",
  high: "Rare",
}

/** Display tiers as filter labels in UI */
export const ALL_TIERS: RuneTier[] = ["low", "mid", "high"]
