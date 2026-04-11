import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ListingCard, { type ListingWithSeller } from "./ListingCard"

const baseSeller = {
  id: "seller-001",
  username: "VaultKeeper",
  image: null,
}

const baseListing: ListingWithSeller = {
  id: "listing-001",
  name: "Harlequin Crest",
  baseName: "Shako",
  rarity: "UNIQUE",
  spaceDustPrice: 1200,
  status: "active",
  createdAt: new Date("2026-03-28T12:00:00Z"),
  tradeCurrency: "SPACE_DUST",
  seller: baseSeller,
}

describe("ListingCard", () => {
  it("renders the item name", () => {
    render(<ListingCard listing={baseListing} />)
    expect(screen.getByText("Harlequin Crest")).toBeDefined()
  })

  it("renders the base name when different from name", () => {
    render(<ListingCard listing={baseListing} />)
    expect(screen.getByText("Shako")).toBeDefined()
  })

  it("renders seller username", () => {
    render(<ListingCard listing={baseListing} />)
    expect(screen.getByText("VaultKeeper")).toBeDefined()
  })

  it("renders the space dust price", () => {
    render(<ListingCard listing={baseListing} />)
    expect(screen.getByText("1,200 SD")).toBeDefined()
  })

  it("renders 'Offer' when spaceDustPrice is null", () => {
    render(<ListingCard listing={{ ...baseListing, spaceDustPrice: null }} />)
    expect(screen.getByText("Offer")).toBeDefined()
  })

  it("renders the UNIQUE rarity badge", () => {
    render(<ListingCard listing={baseListing} />)
    expect(screen.getByLabelText("Rarity: Unique")).toBeDefined()
  })

  it("renders SET rarity badge for set items", () => {
    render(<ListingCard listing={{ ...baseListing, rarity: "SET", name: "Trang-Oul's Head" }} />)
    expect(screen.getByLabelText("Rarity: Set")).toBeDefined()
  })

  it("renders RUNEWORD rarity badge", () => {
    render(<ListingCard listing={{ ...baseListing, rarity: "RUNEWORD", name: "Enigma" }} />)
    expect(screen.getByLabelText("Rarity: Runeword")).toBeDefined()
  })

  it("has accessible article role with aria-label", () => {
    render(<ListingCard listing={baseListing} />)
    expect(screen.getByRole("article", { name: /Harlequin Crest listing by VaultKeeper/i })).toBeDefined()
  })

  it("renders an action slot when provided", () => {
    render(
      <ListingCard
        listing={baseListing}
        action={<button>Make Offer</button>}
      />
    )
    expect(screen.getByRole("button", { name: "Make Offer" })).toBeDefined()
  })

  it("does not render base name when it matches name", () => {
    const listing = { ...baseListing, baseName: "Harlequin Crest" }
    const { container } = render(<ListingCard listing={listing} />)
    const paragraphs = container.querySelectorAll("p")
    const baseNames = Array.from(paragraphs).filter((p) => p.textContent === "Harlequin Crest")
    // Only the seller paragraph should appear, not a duplicate base name
    expect(baseNames).toHaveLength(0)
  })
})
