import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CheckoutConfirmationDialog } from "./CheckoutConfirmationDialog"

const pushMock = vi.fn()
const payMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}))

vi.mock("@base-org/account", () => ({
  pay: (...args: unknown[]) => payMock(...args),
}))

const listingItem = {
  kind: "listing" as const,
  listingId: "lst-1",
  itemName: "Harlequin Crest",
  priceSpaceDust: 1450,
  sellerName: "FrostMage",
}

const runeItem = {
  kind: "rune" as const,
  runeId: 23,
  itemName: "Ohm Rune",
  priceSpaceDust: 1000,
}

const trigger = <button>Buy</button>

const fetchMock = vi.fn()

beforeEach(() => {
  pushMock.mockReset()
  fetchMock.mockReset()
  payMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  vi.stubEnv("NEXT_PUBLIC_MERCHANT_ADDRESS", "0x1234567890123456789012345678901234567890")
  vi.stubEnv("NEXT_PUBLIC_BASE_TESTNET", "true")
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function open() {
  await userEvent.click(screen.getByRole("button", { name: "Buy" }))
}

describe("CheckoutConfirmationDialog", () => {
  it("opens with item summary", async () => {
    render(
      <CheckoutConfirmationDialog
        item={listingItem}
        trigger={trigger}
        initialBalance={5000}
        disableRedirect
      />,
    )
    await open()
    expect(screen.getByRole("dialog")).toBeDefined()
    expect(screen.getByText(/Harlequin Crest/)).toBeDefined()
    expect(screen.getByText(/from FrostMage/)).toBeDefined()
    expect(screen.getByText(/1,450 SD/)).toBeDefined()
  })

  it("shows insufficient-balance warning and disables Pay Now", async () => {
    render(
      <CheckoutConfirmationDialog
        item={listingItem}
        trigger={trigger}
        initialBalance={100}
        disableRedirect
      />,
    )
    await open()
    expect(screen.getByText(/Not enough Space Dust/)).toBeDefined()
    expect(screen.getByRole("button", { name: /Pay Now/ })).toHaveProperty("disabled", true)
  })

  it("calls listing purchase endpoint and shows success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ tradeRoomId: "room-42" }),
    })
    render(
      <CheckoutConfirmationDialog
        item={listingItem}
        trigger={trigger}
        initialBalance={5000}
        disableRedirect
      />,
    )
    await open()
    await userEvent.click(screen.getByRole("button", { name: /Pay Now/ }))
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/listings/lst-1/purchase",
      expect.objectContaining({ method: "POST" }),
    )
    expect(await screen.findByTestId("checkout-success")).toBeDefined()
  })

  it("calls rune purchase endpoint with runeId", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, newBalance: 4000 }),
    })
    render(
      <CheckoutConfirmationDialog
        item={runeItem}
        trigger={trigger}
        initialBalance={5000}
        disableRedirect
      />,
    )
    await open()
    await userEvent.click(screen.getByRole("button", { name: /Pay Now/ }))
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/runes/purchase",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ runeId: 23 }),
      }),
    )
  })

  it("disables crypto tab for runes", async () => {
    render(
      <CheckoutConfirmationDialog
        item={runeItem}
        trigger={trigger}
        initialBalance={5000}
        disableRedirect
      />,
    )
    await open()
    const cryptoTab = screen.getByRole("tab", { name: /USDC \/ Base/i })
    expect(cryptoTab).toHaveProperty("disabled", true)
  })

  it("runs Base Pay then confirms via /api/checkout/confirm-usdc", async () => {
    payMock.mockResolvedValueOnce({ id: "pay_abc123" })
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, tradeRoomId: "room-99", redirectUrl: "/trade-rooms/room-99" }),
    })
    render(
      <CheckoutConfirmationDialog
        item={listingItem}
        trigger={trigger}
        initialBalance={0}
        disableRedirect
      />,
    )
    await open()
    await userEvent.click(screen.getByRole("tab", { name: /USDC \/ Base/i }))
    await userEvent.click(screen.getByRole("button", { name: /Pay with Base/i }))

    await waitFor(() =>
      expect(payMock).toHaveBeenCalledWith({
        amount: "50.00", // 1450 / 29 = 50.00
        to: "0x1234567890123456789012345678901234567890",
        testnet: true,
      }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/checkout/confirm-usdc",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          paymentId: "pay_abc123",
          itemId: "lst-1",
          itemType: "listing",
          amount: "50.00",
        }),
      }),
    )
    expect(await screen.findByTestId("checkout-success")).toBeDefined()
  })

  it("surfaces a backend verification failure on the crypto tab", async () => {
    payMock.mockResolvedValueOnce({ id: "pay_xyz" })
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ success: false, error: "Payment already processed" }),
    })
    render(
      <CheckoutConfirmationDialog
        item={listingItem}
        trigger={trigger}
        initialBalance={0}
        disableRedirect
      />,
    )
    await open()
    await userEvent.click(screen.getByRole("tab", { name: /USDC \/ Base/i }))
    await userEvent.click(screen.getByRole("button", { name: /Pay with Base/i }))

    expect(await screen.findByTestId("checkout-error")).toHaveProperty(
      "textContent",
      "Payment already processed",
    )
  })

  it("treats a cancelled wallet popup as a friendly error", async () => {
    payMock.mockRejectedValueOnce(new Error("User cancelled the request"))
    render(
      <CheckoutConfirmationDialog
        item={listingItem}
        trigger={trigger}
        initialBalance={0}
        disableRedirect
      />,
    )
    await open()
    await userEvent.click(screen.getByRole("tab", { name: /USDC \/ Base/i }))
    await userEvent.click(screen.getByRole("button", { name: /Pay with Base/i }))

    expect(await screen.findByTestId("checkout-error")).toHaveProperty(
      "textContent",
      "Payment cancelled.",
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("surfaces server errors", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: "Listing is no longer active" }),
    })
    render(
      <CheckoutConfirmationDialog
        item={listingItem}
        trigger={trigger}
        initialBalance={5000}
        disableRedirect
      />,
    )
    await open()
    await userEvent.click(screen.getByRole("button", { name: /Pay Now/ }))
    expect(await screen.findByTestId("checkout-error")).toHaveProperty(
      "textContent",
      "Listing is no longer active",
    )
  })
})
