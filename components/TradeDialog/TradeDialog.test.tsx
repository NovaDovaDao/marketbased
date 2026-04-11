import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TradeDialog } from "./TradeDialog"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const defaultProps = {
  listingId: "listing-001",
  listingName: "Harlequin Crest",
  askingSpaceDust: 1200,
  trigger: <button>Make Offer</button>,
}

describe("TradeDialog", () => {
  it("renders the trigger", () => {
    render(<TradeDialog {...defaultProps} />)
    expect(screen.getByRole("button", { name: "Make Offer" })).toBeDefined()
  })

  it("opens the dialog when trigger is clicked", async () => {
    render(<TradeDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole("button", { name: "Make Offer" }))
    expect(screen.getByRole("dialog")).toBeDefined()
    expect(screen.getByText("Make an Offer")).toBeDefined()
  })

  it("shows the listing name in the dialog description", async () => {
    render(<TradeDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole("button", { name: "Make Offer" }))
    expect(screen.getByText("Harlequin Crest")).toBeDefined()
  })

  it("shows the asking price when provided", async () => {
    render(<TradeDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole("button", { name: "Make Offer" }))
    expect(screen.getByText(/1,200 SD/)).toBeDefined()
  })

  it("does not show asking price section when null", async () => {
    render(<TradeDialog {...defaultProps} askingSpaceDust={null} />)
    await userEvent.click(screen.getByRole("button", { name: "Make Offer" }))
    expect(screen.queryByText(/Asking:/)).toBeNull()
  })

  it("closes the dialog when Cancel is clicked", async () => {
    render(<TradeDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole("button", { name: "Make Offer" }))
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("has accessible close button", async () => {
    render(<TradeDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole("button", { name: "Make Offer" }))
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeDefined()
  })

  it("renders the SD amount input", async () => {
    render(<TradeDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole("button", { name: "Make Offer" }))
    expect(screen.getByLabelText(/Space Dust amount/i)).toBeDefined()
  })
})
