import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { SpaceDustStore } from "./SpaceDustStore"

describe("SpaceDustStore", () => {
  it("renders all pricing tiers", () => {
    render(<SpaceDustStore />)
    // First tier
    expect(screen.getByText("$10")).toBeInTheDocument()
    // Last tier
    expect(screen.getByText("$300")).toBeInTheDocument()
  })

  it("shows space dust amount for each tier", () => {
    render(<SpaceDustStore />)
    expect(screen.getByText("290 sd")).toBeInTheDocument()
    expect(screen.getByText("9,750 sd")).toBeInTheDocument()
  })

  it("marks best value tier", () => {
    render(<SpaceDustStore />)
    expect(screen.getByText("BEST VALUE")).toBeInTheDocument()
  })

  it("shows three payment tabs", () => {
    render(<SpaceDustStore />)
    expect(screen.getByText("💳 Card")).toBeInTheDocument()
    expect(screen.getByText("🅿️ PayPal")).toBeInTheDocument()
    expect(screen.getByText("⚡ Crypto")).toBeInTheDocument()
  })

  it("pay button is disabled when no tier selected", () => {
    render(<SpaceDustStore />)
    const payButton = screen.getByRole("button", { name: /select a tier first/i })
    expect(payButton).toBeDisabled()
  })

  it("pay button shows amount when tier is selected", async () => {
    const user = userEvent.setup()
    render(<SpaceDustStore />)

    await user.click(screen.getByText("$10"))

    expect(screen.getByRole("button", { name: /pay \$10 with card/i })).toBeEnabled()
  })

  it("switches to Base (Crypto) tab", async () => {
    const user = userEvent.setup()
    render(<SpaceDustStore />)

    await user.click(screen.getByText("⚡ Crypto"))

    expect(
      screen.getByText(/cheapest fees/i),
    ).toBeInTheDocument()
  })
})
