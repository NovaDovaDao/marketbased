import type { Rune } from "@/types/rune"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import RuneCard from "./RuneCard"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

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

  it("renders SD price", () => {
    render(<RuneCard rune={lowRune} />)
    expect(screen.getByText("1,000")).toBeTruthy()
    expect(screen.getByText("SD")).toBeTruthy()
  })

  it("renders a buy button", () => {
    render(<RuneCard rune={lowRune} />)
    expect(screen.getByRole("button", { name: /Buy El for 1,000 Space Dust/i })).toBeTruthy()
  })

  it("renders buy button for high tier rune", () => {
    render(<RuneCard rune={highRune} />)
    expect(screen.getByRole("button", { name: /Buy Zod for 1,000 Space Dust/i })).toBeTruthy()
  })
})
