"use client"

import { pay } from "@base-org/account"
import * as Dialog from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Display rate for SD ↔ USD equivalents in the dialog. Mirrors the base
// pricing tier (10 USD = 290 SD ⇒ 29 SD/USD) — a price hint only, not
// authoritative; the server validates actual amounts.
const SD_PER_USD = 29

// ── CVA ───────────────────────────────────────────────────────────────────

const overlay = cva([
  "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
])

const content = cva([
  "fixed left-1/2 top-1/2 z-50 w-full max-w-md",
  "-translate-x-1/2 -translate-y-1/2",
  "bg-[#131313] border border-amber-900/30 p-6 shadow-2xl",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
])

const tabBtn = cva(
  "flex-1 border-b-2 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      active: {
        true: "border-secondary text-secondary",
        false: "border-transparent text-on-surface-variant/60 hover:text-on-surface",
      },
    },
    defaultVariants: { active: false },
  },
)

const inputCls =
  "w-full border border-stone-700 bg-stone-900 px-3 py-2 font-mono text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-secondary focus:outline-none"

const btnPrimary =
  "inline-flex items-center justify-center bg-gradient-to-r from-primary-container to-on-primary-fixed-variant px-6 py-3 font-headline text-sm font-bold uppercase tracking-widest text-on-primary-fixed transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-40"

const btnGhost =
  "inline-flex items-center justify-center border border-stone-700 px-4 py-2 text-sm text-on-surface-variant transition-colors hover:border-stone-500 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"

// ── Types ─────────────────────────────────────────────────────────────────

type CheckoutItem =
  | { kind: "rune"; runeId: number; itemName: string; priceSpaceDust: number }
  | {
    kind: "listing"
    listingId: string
    itemName: string
    priceSpaceDust: number
    sellerName?: string
  }

export interface CheckoutConfirmationDialogProps {
  item: CheckoutItem
  trigger: React.ReactNode
  /** Test seam: pass `null` to skip the balance fetch and show a fixed value. */
  initialBalance?: number | null
  /** Test seam: when true, do not auto-redirect on success. */
  disableRedirect?: boolean
}

type PaymentMethod = "spaceDust" | "crypto"
type Phase = "idle" | "submitting" | "success" | "error"

// ── Component ─────────────────────────────────────────────────────────────

export function CheckoutConfirmationDialog({
  item,
  trigger,
  initialBalance,
  disableRedirect,
}: CheckoutConfirmationDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>("spaceDust")
  const [balance, setBalance] = useState<number | null>(initialBalance ?? null)
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)

  // Set when Base Pay returns a payment.id, before backend verification finishes.
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null)

  const usdEquivalent = (item.priceSpaceDust / SD_PER_USD).toFixed(2)
  const merchantAddress =
    process.env.NEXT_PUBLIC_MERCHANT_ADDRESS ?? process.env.NEXT_PUBLIC_RECEIVING_ADDRESS ?? ""
  const isTestnet = process.env.NEXT_PUBLIC_BASE_TESTNET === "true"

  // Reset state on close so re-opening is clean.
  useEffect(() => {
    if (!open) {
      setPhase("idle")
      setError(null)
      setPendingPaymentId(null)
      setMethod("spaceDust")
    }
  }, [open])

  // Fetch the current Space Dust balance when the dialog opens.
  useEffect(() => {
    if (!open || initialBalance !== undefined) return
    let cancelled = false
    fetch("/api/me/balance")
      .then((r) => (r.ok ? (r.json() as Promise<{ spaceDust: number }>) : null))
      .then((data) => {
        if (!cancelled && data) setBalance(data.spaceDust)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [open, initialBalance])

  const hasEnoughSd = balance !== null && balance >= item.priceSpaceDust
  const cryptoAvailable = true

  async function handleSpaceDust() {
    setPhase("submitting")
    setError(null)
    try {
      const url =
        item.kind === "rune"
          ? "/api/runes/purchase"
          : `/api/listings/${item.listingId}/purchase`
      const init: RequestInit = {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
      if (item.kind === "rune") {
        init.body = JSON.stringify({ runeId: item.runeId })
      }
      const res = await fetch(url, init)

      if (res.status === 401) {
        router.push("/login")
        return
      }
      if (res.status === 402) {
        setError("Not enough Space Dust. Top up at the store.")
        setPhase("error")
        return
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? "Purchase failed.")
        setPhase("error")
        return
      }

      const body = (await res.json().catch(() => ({}))) as { tradeRoomId?: string }
      window.dispatchEvent(new CustomEvent("space-dust-updated"))
      setPhase("success")

      if (disableRedirect) return
      // Listings get a TradeRoom; runes do not — fall back to /chat there.
      const target = body.tradeRoomId ? `/trade-rooms/${body.tradeRoomId}` : "/chat"
      setTimeout(() => router.push(target), 600)
    } catch {
      setError("Network error. Please try again.")
      setPhase("error")
    }
  }

  async function handleBasePay() {
    if (!merchantAddress) {
      setError("Merchant address is not configured. Contact support.")
      setPhase("error")
      return
    }

    setPhase("submitting")
    setError(null)

    // Step 1: invoke Base Pay. Open the wallet UI and wait for approval.
    let paymentId: string
    try {
      const result = await pay({
        amount: usdEquivalent,
        to: merchantAddress,
        testnet: isTestnet,
      })
      paymentId = result.id
      setPendingPaymentId(paymentId)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ""
      setError(message.includes("cancel") ? "Payment cancelled." : "Could not start Base Pay. Try again.")
      setPhase("error")
      return
    }

    // Step 2: hand the paymentId to the backend, which is the only thing that
    // actually fulfils the order. We never trust the client's word for it.
    try {
      const res = await fetch("/api/checkout/confirm-usdc", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          itemId: item.kind === "rune" ? String(item.runeId) : item.listingId,
          itemType: item.kind === "rune" ? "rune" : "listing",
          amount: usdEquivalent,
        }),
      })

      if (res.status === 401) {
        router.push("/login")
        return
      }

      const body = (await res.json().catch(() => ({}))) as {
        success?: boolean
        tradeRoomId?: string
        redirectUrl?: string
        error?: string
      }

      if (!res.ok || !body.success) {
        setError(body.error ?? "Payment failed. Try again in 1 minute or contact support.")
        setPhase("error")
        return
      }

      setPhase("success")
      if (disableRedirect) return
      const target = body.redirectUrl ?? (body.tradeRoomId ? `/trade-rooms/${body.tradeRoomId}` : "/chat")
      setTimeout(() => router.push(target), 600)
    } catch {
      setError("Network error. Please try again.")
      setPhase("error")
    }
  }

  const submitting = phase === "submitting"
  const succeeded = phase === "success"

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={overlay()} />
        <Dialog.Content className={content()} aria-describedby="checkout-dialog-desc">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <Dialog.Title className="font-serif text-xl font-bold text-secondary">
                Confirm Purchase
              </Dialog.Title>
              <Dialog.Description
                id="checkout-dialog-desc"
                className="mt-1 text-sm text-on-surface-variant/70"
              >
                {item.itemName}
                {item.kind === "listing" && item.sellerName ? ` — from ${item.sellerName}` : ""}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="text-stone-500 transition-colors hover:text-on-surface focus-visible:outline-none"
              aria-label="Close dialog"
            >
              ✕
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b border-stone-800" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={method === "spaceDust"}
              className={tabBtn({ active: method === "spaceDust" })}
              onClick={() => setMethod("spaceDust")}
              disabled={submitting}
            >
              Space Dust
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === "crypto"}
              className={tabBtn({ active: method === "crypto" })}
              onClick={() => cryptoAvailable && setMethod("crypto")}
              disabled={submitting || !cryptoAvailable}
              title={cryptoAvailable ? undefined : "Crypto checkout is available for marketplace listings only."}
            >
              USDC / Base
            </button>
          </div>

          {/* Item summary */}
          <dl className="mb-4 grid grid-cols-2 gap-2 border border-stone-800 bg-stone-900/40 p-3 text-xs">
            <dt className="text-on-surface-variant/60">Price (SD)</dt>
            <dd className="text-right font-bold text-secondary">
              ✨ {item.priceSpaceDust.toLocaleString()} SD
            </dd>
            <dt className="text-on-surface-variant/60">Approx. USD</dt>
            <dd className="text-right text-on-surface">${usdEquivalent}</dd>
          </dl>

          {/* Method body */}
          {method === "spaceDust" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant/60">Your balance</span>
                <span className="font-mono text-on-surface" data-testid="sd-balance">
                  {balance === null ? "—" : `${balance.toLocaleString()} SD`}
                </span>
              </div>
              {balance !== null && !hasEnoughSd && (
                <p className="text-xs text-amber-400" role="alert">
                  Not enough Space Dust. Need{" "}
                  {(item.priceSpaceDust - balance).toLocaleString()} more.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              <dl className="grid grid-cols-2 gap-2 border border-stone-800 bg-stone-900/40 p-3">
                <dt className="text-on-surface-variant/60">Pay (USDC)</dt>
                <dd className="text-right font-bold text-secondary">${usdEquivalent}</dd>
                <dt className="text-on-surface-variant/60">Network</dt>
                <dd className="text-right text-on-surface">
                  {isTestnet ? "Base Sepolia (test)" : "Base mainnet"}
                </dd>
              </dl>
              <p className="text-on-surface-variant/70">
                Payment will be processed via Base Account. Your USDC will be sent directly to our
                receiving address and your purchase will unlock as soon as Base confirms.
              </p>
              <div>
                <label className="mb-1 block text-on-surface-variant/60">Merchant address</label>
                <div className="break-all border border-stone-800 bg-stone-900/60 p-2 font-mono">
                  {merchantAddress || "Not configured"}
                </div>
              </div>
              {pendingPaymentId && (
                <p className="font-mono text-on-surface-variant/60" data-testid="checkout-payment-id">
                  Payment ID: {pendingPaymentId}
                </p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-error" data-testid="checkout-error">
              {error}
            </p>
          )}

          {succeeded && (
            <p className="mt-4 text-sm text-emerald-400" data-testid="checkout-success">
              ✅ Purchase confirmed! Redirecting to chat…
            </p>
          )}

          <div className="mt-5 flex justify-end gap-3 border-t border-stone-800 pt-4">
            <Dialog.Close className={btnGhost} type="button" disabled={submitting}>
              Cancel
            </Dialog.Close>
            <button
              type="button"
              className={btnPrimary}
              disabled={
                submitting ||
                succeeded ||
                (method === "crypto" && !merchantAddress)
              }
              onClick={() => {
                if (method === "spaceDust") {
                  if (balance !== null && !hasEnoughSd) {
                    router.push("/store")
                    setOpen(false)
                    return
                  }
                  void handleSpaceDust()
                } else {
                  void handleBasePay()
                }
              }}
            >
              {submitting
                ? pendingPaymentId
                  ? "Verifying payment…"
                  : "Opening Base Pay…"
                : succeeded
                  ? "Done ✓"
                  : method === "spaceDust" && balance !== null && !hasEnoughSd
                    ? "Get Space Dust →"
                    : method === "crypto"
                      ? "Pay with Base"
                      : "Pay Now"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
