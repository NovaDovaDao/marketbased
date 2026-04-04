import type { TradingListing } from "@/types/trading"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import TradingListingCard from "./TradingListingCard"

const baseListing: TradingListing = {
  id: "test-001",
  name: "Harlequin Crest",
  slug: "harlequin-crest",
  image: "https://cdn.nookazon.com/128x128/diablo2resurrected/helmet/shako_hat.png",
  category: "Uniques",
  itemType: "Helm",
  bodyLocation: "Head",
  craftType: null,
  gemType: null,
  tier: "Elite",
  weaponType: null,
  rarity: "Unique",
  sellerStanding: "Trusted",
  stats: ["+2 To All Skills", "50% Better Chance of Getting Magic Items"],
  skills: ["all-skills"],
  relicStatus: ["makeOffer"],
  craftingState: [],
  requiredLevel: 62,
  ladder: "Ladder",
  mode: "Softcore",
  platform: "PC",
  region: "Americas",
  version: "ETR",
  sellerId: "user-vault-keeper",
  priceUsdCents: 28400,
  priceForumGold: 1450,
  priceEth: 120000,
  listedAt: "2026-03-28T12:00:00Z",
}

describe("TradingListingCard", () => {
  it("renders the item name", () => {
    render(<TradingListingCard listing={baseListing} />)
    expect(screen.getByText("Harlequin Crest")).toBeDefined()
  })

  it("renders space dust price", () => {
    render(<TradingListingCard listing={baseListing} />)
    expect(screen.getByText("1,450 sd")).toBeDefined()
  })

  it("renders Elite Unique badge for unique items", () => {
    render(<TradingListingCard listing={baseListing} />)
    expect(screen.getByLabelText("Elite Unique")).toBeDefined()
  })

  it("renders Rune badge for rune category items", () => {
    const rune: TradingListing = {
      ...baseListing,
      name: "Zod Rune",
      category: "Runes",
      itemType: null,
      rarity: "Unique",
    }
    render(<TradingListingCard listing={rune} />)
    expect(screen.getByLabelText("Elite Rune")).toBeDefined()
  })

  it("renders Runeword badge for runeword items", () => {
    const runeword: TradingListing = {
      ...baseListing,
      name: "Enigma",
      category: "Runewords",
      rarity: "Unique",
    }
    render(<TradingListingCard listing={runeword} />)
    expect(screen.getByLabelText("Runeword")).toBeDefined()
  })

  it("renders Ethereal label when item is ethereal", () => {
    const ethereal: TradingListing = {
      ...baseListing,
      relicStatus: ["ethereal"],
    }
    render(<TradingListingCard listing={ethereal} />)
    expect(screen.getByText("Ethereal")).toBeDefined()
  })

  it("does not render ETH price when priceEth is null", () => {
    const noEth: TradingListing = { ...baseListing, priceEth: null }
    render(<TradingListingCard listing={noEth} />)
    expect(screen.queryByText(/ETH/)).toBeNull()
  })

  it("renders item stats list", () => {
    render(<TradingListingCard listing={baseListing} />)
    expect(screen.getByText("+2 To All Skills")).toBeDefined()
  })

  it("renders item type label", () => {
    render(<TradingListingCard listing={baseListing} />)
    expect(screen.getByText("Helm")).toBeDefined()
  })

  it("has correct aria-label on article", () => {
    render(<TradingListingCard listing={baseListing} />)
    expect(screen.getByRole("article", { name: "Harlequin Crest" })).toBeDefined()
  })
})
