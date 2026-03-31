import type { PriceCents } from "@/types/rune"

// ── Primitives ───────────────────────────────────────────────────────────────

export type ItemCondition = "new" | "like-new" | "good" | "acceptable"
export type TradeType = "bought" | "sold" | "traded"
export type TradeState = "completed" | "cancelled"

// ── Reputation ───────────────────────────────────────────────────────────────

export interface UserReputation {
  /** 0–5 score derived from peer reviews */
  score: number
  totalReviews: number
}

// ── Stat totals ──────────────────────────────────────────────────────────────

export interface UserStats {
  totalTrades: number
  successfulTrades: number
  /** Integer percentage 0–100 */
  successRate: number
  totalListings: number
  activeListings: number
}

// ── Active listing (join with Rune by runeId) ────────────────────────────────

export interface UserListing {
  runeId: number
  /** Integer cents — never float */
  priceCents: PriceCents
  condition: ItemCondition
  listedAt: string
}

// ── Trade history entry ──────────────────────────────────────────────────────

export interface TradeHistoryEntry {
  id: string
  type: TradeType
  runeId: number
  withUser: string
  /** Integer cents */
  priceCents: PriceCents
  state: TradeState
  completedAt: string
}

// ── Full user profile ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  bannerUrl: string
  bio: string
  memberSince: string
  lastActive: string
  reputation: UserReputation
  stats: UserStats
  activeListings: UserListing[]
  tradeHistory: TradeHistoryEntry[]
}
