import type { Rune } from "@/types/rune"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import RuneCard from "./RuneCard"

const lowRune: Rune = {
  id: 1,
  name: "El",
  slug: "el",
  level: 11,
  tier: "low",
  image: "https://cdn.nookazon.com/diablo2resurrected/rune/el_rune.png",
}

const highRune: Rune = {
  id: 33,
  name: "Zod",
  slug: "zod",
  level: 69,
  tier: "high",
  image: "https://cdn.nookazon.com/diablo2resurrected/rune/zod_rune.png",
}

describe("RuneCard", () => {
  it("renders the rune name", () => {
    render(<RuneCard rune={lowRune} />)
    expect(screen.getByText("El")).toBeTruthy()
  })

  it("renders level requirement", () => {
    render(<RuneCard rune={lowRune} />)
    expect(screen.getByText("Required Level 11")).toBeTruthy()
  })

  it("renders the tier badge for low tier", () => {
    render(<RuneCard rune={lowRune} />)
    expect(screen.getByText("Common")).toBeTruthy()
  })

  it("renders the tier badge for high tier", () => {
    render(<RuneCard rune={highRune} />)
    expect(screen.getByText("Rare")).toBeTruthy()
  })

  it("renders formatted price when provided", () => {
    render(<RuneCard rune={lowRune} price={500} />)
    expect(screen.getByText(/5/)).toBeTruthy()
    expect(screen.getByText("Gold")).toBeTruthy()
  })

  it("renders unlisted state when no price given", () => {
    render(<RuneCard rune={lowRune} />)
    expect(screen.getByText(/Unlisted/i)).toBeTruthy()
  })

  it("has an accessible article label", () => {
    render(<RuneCard rune={lowRune} />)
    expect(screen.getByRole("article", { name: /El rune/i })).toBeTruthy()
  })

  it("has a list button with accessible label", () => {
    render(<RuneCard rune={highRune} />)
    expect(screen.getByRole("button", { name: /List Zod/i })).toBeTruthy()
  })
})
