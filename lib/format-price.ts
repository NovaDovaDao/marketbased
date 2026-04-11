/**
 * Format a Space Dust amount for display.
 * Space Dust is an integer in-game currency (like forum gold).
 */
export function formatSpaceDust(amount: number): string {
  return amount.toLocaleString("en-US") + " SD"
}

/**
 * Format an integer cent value as a USD currency string.
 * E.g. 1099 → "$10.99"
 */
export function formatUsdCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  })
}
