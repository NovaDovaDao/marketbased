import type { Rune } from "@/types/rune"
import type { UserProfile as UserProfileType } from "@/types/user"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import UserProfile from "./UserProfile"

// ── Fixtures ──────────────────────────────────────────────────────────────────

const sampleRunes: Rune[] = [
  { id: 1, name: "El", slug: "el", level: 11, tier: "low", image: "https://cdn.nookazon.com/diablo2resurrected/rune/el_rune.png" },
  { id: 33, name: "Zod", slug: "zod", level: 69, tier: "high", image: "https://cdn.nookazon.com/diablo2resurrected/rune/zod_rune.png" },
]

const baseProfile: UserProfileType = {
  id: "usr_test_01",
  username: "testscribe",
  displayName: "Test Scribe",
  avatarUrl: "/avatars/test.webp",
  bannerUrl: "/banners/test.webp",
  bio: "A trader of ancient runes.",
  memberSince: "2024-01-01",
  lastActive: "2026-03-30",
  reputation: { score: 4.5, totalReviews: 100 },
  stats: {
    totalTrades: 200,
    successfulTrades: 195,
    spaceDust: 4750,
    totalListings: 10,
    activeListings: 2,
  },
  activeListings: [
    { runeId: 33, priceCents: 250000, condition: "new", listedAt: "2026-03-28T14:22:00Z" },
    { runeId: 1, priceCents: 500, condition: "good", listedAt: "2026-03-27T09:00:00Z" },
  ],
  tradeHistory: [
    { id: "t1", type: "sold", runeId: 33, withUser: "BuyerX", priceCents: 240000, state: "completed", completedAt: "2026-03-20T15:00:00Z" },
    { id: "t2", type: "bought", runeId: 1, withUser: "SellerY", priceCents: 500, state: "cancelled", completedAt: "2026-03-10T10:00:00Z" },
  ],
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("UserProfile", () => {
  it("renders the display name", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByRole("heading", { name: /Test Scribe/i })).toBeTruthy()
  })

  it("renders the username handle", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByText(/@testscribe/i)).toBeTruthy()
  })

  it("renders the bio", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByText(/A trader of ancient runes/i)).toBeTruthy()
  })

  it("renders reputation score", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByText("4.5")).toBeTruthy()
  })

  it("renders total trades stat", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByText("200")).toBeTruthy()
  })

  it("renders space dust stat", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByText("4,750")).toBeTruthy()
  })

  it("renders listings for each runeId that exists in runes", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByText("Zod")).toBeTruthy()
    expect(screen.getByText("El")).toBeTruthy()
  })

  it("shows no-listings empty state when activeListings is empty", () => {
    const emptyProfile = { ...baseProfile, activeListings: [] }
    render(<UserProfile profile={emptyProfile} runes={sampleRunes} />)
    expect(screen.getByRole("status", { name: /No active listings/i })).toBeTruthy()
  })

  it("renders trade history rune names", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    // "Sold Zod" text appears in the activity feed
    expect(screen.getAllByText(/Zod/i).length).toBeGreaterThan(0)
  })

  it("renders trade status badges", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByText(/Complete/i)).toBeTruthy()
    expect(screen.getByText(/Cancelled/i)).toBeTruthy()
  })

  it("renders member since in the stats strip", () => {
    render(<UserProfile profile={baseProfile} runes={sampleRunes} />)
    expect(screen.getByText(/Jan 2024/i)).toBeTruthy()
  })
})
