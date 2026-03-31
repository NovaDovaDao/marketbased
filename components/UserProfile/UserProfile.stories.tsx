import type { Rune } from "@/types/rune"
import type { UserProfile as UserProfileType } from "@/types/user"
import type { Meta, StoryObj } from "@storybook/react"
import UserProfile from "./UserProfile"

// ── Sample runes ─────────────────────────────────────────────────────────────

const sampleRunes: Rune[] = [
  { id: 25, name: "Gul", slug: "gul", level: 53, tier: "high", image: "https://cdn.nookazon.com/diablo2resurrected/rune/gul_rune.png" },
  { id: 29, name: "Cham", slug: "cham", level: 67, tier: "high", image: "https://cdn.nookazon.com/diablo2resurrected/rune/cham_rune.png" },
  { id: 31, name: "Lo", slug: "lo", level: 59, tier: "high", image: "https://cdn.nookazon.com/diablo2resurrected/rune/lo_rune.png" },
  { id: 32, name: "Sur", slug: "sur", level: 61, tier: "high", image: "https://cdn.nookazon.com/diablo2resurrected/rune/sur_rune.png" },
  { id: 33, name: "Zod", slug: "zod", level: 69, tier: "high", image: "https://cdn.nookazon.com/diablo2resurrected/rune/zod_rune.png" },
]

// ── Full fixture ──────────────────────────────────────────────────────────────

const fullProfile: UserProfileType = {
  id: "usr_voidscribe_01",
  username: "voidscribe",
  displayName: "The Void Scribe",
  avatarUrl: "/avatars/void-scribe.webp",
  bannerUrl: "/banners/sanctuary-banner.webp",
  bio: "Ancient collector of high-runes and rare runewords. Trading from the depths of Harrogath since the fall of the Prime Evils.",
  memberSince: "2023-04-12",
  lastActive: "2026-03-30",
  reputation: { score: 4.9, totalReviews: 312 },
  stats: {
    totalTrades: 847,
    successfulTrades: 831,
    successRate: 98,
    totalListings: 24,
    activeListings: 3,
  },
  activeListings: [
    { runeId: 33, priceCents: 250000, condition: "new", listedAt: "2026-03-28T14:22:00Z" },
    { runeId: 32, priceCents: 185000, condition: "like-new", listedAt: "2026-03-27T09:11:00Z" },
    { runeId: 31, priceCents: 120000, condition: "new", listedAt: "2026-03-26T18:45:00Z" },
  ],
  tradeHistory: [
    { id: "t1", type: "sold", runeId: 33, withUser: "RuneHunter99", priceCents: 240000, state: "completed", completedAt: "2026-03-20T15:42:00Z" },
    { id: "t2", type: "traded", runeId: 25, withUser: "AncientKing", priceCents: 150000, state: "completed", completedAt: "2026-03-18T10:17:00Z" },
    { id: "t3", type: "bought", runeId: 31, withUser: "SanctuaryMerchant", priceCents: 118000, state: "cancelled", completedAt: "2026-03-15T09:05:00Z" },
  ],
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof UserProfile> = {
  title: "Marketplace/UserProfile",
  component: UserProfile,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#131313" }] },
  },
}

export default meta
type Story = StoryObj<typeof UserProfile>

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    profile: fullProfile,
    runes: sampleRunes,
  },
}

export const NoListings: Story = {
  args: {
    profile: { ...fullProfile, activeListings: [], stats: { ...fullProfile.stats, activeListings: 0 } },
    runes: sampleRunes,
  },
}

export const NewUser: Story = {
  args: {
    profile: {
      ...fullProfile,
      username: "noobscribe",
      displayName: "Novice of the Void",
      bio: "Just arrived in the Sanctuary. Looking to trade my first runes.",
      memberSince: "2026-03-01",
      reputation: { score: 0, totalReviews: 0 },
      stats: { totalTrades: 0, successfulTrades: 0, successRate: 0, totalListings: 0, activeListings: 0 },
      activeListings: [],
      tradeHistory: [],
    },
    runes: sampleRunes,
  },
}
