import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getSessionMock = vi.fn()
const getPaymentStatusMock = vi.fn()
const txCreateMock = vi.fn()
const findUniqueMock = vi.fn()
const findFirstWalletMock = vi.fn()
const findUniqueListingMock = vi.fn()
const dollarTxMock = vi.fn()
const notifyAdminMock = vi.fn()

vi.mock("@/app/utils/auth", () => ({
  auth: { api: { getSession: (...args: unknown[]) => getSessionMock(...args) } },
}))

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    transaction: { findUnique: (...a: unknown[]) => findUniqueMock(...a) },
    walletAddress: { findFirst: (...a: unknown[]) => findFirstWalletMock(...a) },
    listing: { findUnique: (...a: unknown[]) => findUniqueListingMock(...a) },
    $transaction: (...a: unknown[]) => dollarTxMock(...a),
  },
}))

vi.mock("@base-org/account", () => ({
  getPaymentStatus: (...a: unknown[]) => getPaymentStatusMock(...a),
}))

vi.mock("@/services/discord-notifications", () => ({
  notifyAdminChannelPurchase: (...a: unknown[]) => notifyAdminMock(...a),
}))

vi.mock("@/lib/base", () => ({
  getReceivingAddress: () => "0xMERCHANT",
  isBaseTestnet: () => true,
}))

// env.mjs is unused at runtime here but the route imports it; stub minimally.
vi.mock("@/env.mjs", () => ({ env: { CHAT_SERVICE_URL: undefined, CHAT_SERVICE_SECRET: undefined } }))

// Imported AFTER the mocks above so the mocks resolve.
const importRoute = async () => (await import("./route")).POST

function makeReq(body: unknown): Request {
  return new Request("http://test/api/checkout/confirm-usdc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validBody = {
  paymentId: "pay_123",
  itemType: "listing" as const,
  itemId: "lst-1",
  amount: "25.00",
}

beforeEach(() => {
  vi.clearAllMocks()
  txCreateMock.mockReset()
  getSessionMock.mockResolvedValue({ user: { id: "user-1", name: "Buyer", email: "b@x.io" } })
  findUniqueMock.mockResolvedValue(null)
  findFirstWalletMock.mockResolvedValue({ id: "wallet-1" })
  findUniqueListingMock.mockResolvedValue({
    id: "lst-1",
    name: "Harlequin Crest",
    sellerId: "seller-1",
    status: "active",
    seller: { name: "Seller", email: "s@x.io" },
  })
  dollarTxMock.mockImplementation(async (cb: (tx: unknown) => Promise<string>) => {
    const tx = {
      listing: { update: vi.fn() },
      tradeRoom: { create: vi.fn().mockResolvedValue({ id: "room-1" }) },
      itemPurchase: { create: vi.fn() },
      transaction: { create: txCreateMock },
    }
    return cb(tx)
  })
  getPaymentStatusMock.mockResolvedValue({
    status: "completed",
    sender: "0xBuyerWallet",
    recipient: "0xMERCHANT",
    amount: "25.00",
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("POST /api/checkout/confirm-usdc", () => {
  it("returns 401 without a session", async () => {
    getSessionMock.mockResolvedValueOnce(null)
    const POST = await importRoute()
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(401)
  })

  it("returns 400 on invalid body", async () => {
    const POST = await importRoute()
    const res = await POST(makeReq({ paymentId: "" }) as never)
    expect(res.status).toBe(400)
  })

  it("returns 409 when paymentId already recorded", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "tx-existing" })
    const POST = await importRoute()
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(409)
  })

  it("returns 502 when getPaymentStatus throws", async () => {
    getPaymentStatusMock.mockRejectedValueOnce(new Error("network"))
    const POST = await importRoute()
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(502)
  })

  it("returns 400 if recipient does not match merchant", async () => {
    getPaymentStatusMock.mockResolvedValueOnce({
      status: "completed",
      sender: "0xBuyer",
      recipient: "0xATTACKER",
      amount: "25.00",
    })
    const POST = await importRoute()
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toMatch(/recipient/i)
  })

  it("returns 400 if sender wallet not linked to user", async () => {
    findFirstWalletMock.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "other" })
    const POST = await importRoute()
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toMatch(/sender does not match/i)
  })

  it("returns 400 if amount mismatched beyond tolerance", async () => {
    getPaymentStatusMock.mockResolvedValueOnce({
      status: "completed",
      sender: "0xBuyer",
      recipient: "0xMERCHANT",
      amount: "20.00",
    })
    const POST = await importRoute()
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toMatch(/amount/i)
  })

  it("succeeds and returns redirectUrl on a clean payment", async () => {
    const POST = await importRoute()
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { success: boolean; tradeRoomId: string; redirectUrl: string }
    expect(body.success).toBe(true)
    expect(body.tradeRoomId).toBe("room-1")
    expect(body.redirectUrl).toBe("/trade-rooms/room-1")
    expect(txCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          txHash: "pay_123",
          amount: { usdc: 2500 },
          status: "CONFIRMED",
          listingId: "lst-1",
        }),
      }),
    )
    expect(notifyAdminMock).toHaveBeenCalled()
  })

  it("returns 409 if the unique constraint fires inside the transaction", async () => {
    dollarTxMock.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: "P2002" }))
    const POST = await importRoute()
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(409)
  })
})
