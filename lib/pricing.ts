export type PricingTier = {
  usd: number
  spaceDust: number
}

/** Single source of truth for Space Dust pricing.
 *  usd is the price in whole US dollars.
 *  spaceDust is the amount credited to the user.
 *  Server-side validation MUST use this array — never trust client amounts.
 */
export const pricing: readonly PricingTier[] = [
  { usd: 10, spaceDust: 290 },
  { usd: 20, spaceDust: 630 },
  { usd: 30, spaceDust: 920 },
  { usd: 40, spaceDust: 1260 },
  { usd: 50, spaceDust: 1550 },
  { usd: 60, spaceDust: 1890 },
  { usd: 70, spaceDust: 2180 },
  { usd: 80, spaceDust: 2520 },
  { usd: 90, spaceDust: 2810 },
  { usd: 100, spaceDust: 3250 },
  { usd: 120, spaceDust: 3880 },
  { usd: 140, spaceDust: 4510 },
  { usd: 160, spaceDust: 5140 },
  { usd: 180, spaceDust: 5770 },
  { usd: 200, spaceDust: 6500 },
  { usd: 250, spaceDust: 8050 },
  { usd: 300, spaceDust: 9750 },
] as const

/**
 * Look up a tier by USD amount. Returns undefined if not a valid tier.
 * Always call this server-side to validate client-submitted amounts.
 */
export function getTier(usd: number): PricingTier | undefined {
  return pricing.find((t) => t.usd === usd)
}

/** Convert USD dollars to cents (integer, safe for Stripe/DB). */
export function usdToCents(usd: number): number {
  return usd * 100
}

/** Convert USD dollars to USDC micro-units (6 decimals). */
export function usdToUsdcUnits(usd: number): bigint {
  return BigInt(usd) * 1_000_000n
}
