"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"
import { useRouter } from "next/navigation"
import { useState } from "react"

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

const inputCls =
  "w-full border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-secondary focus:outline-none"

const btnPrimary =
  "inline-flex items-center justify-center bg-gradient-to-r from-primary-container to-on-primary-fixed-variant px-6 py-3 font-headline text-sm font-bold uppercase tracking-widest text-on-primary-fixed transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-40"

const btnGhost =
  "inline-flex items-center justify-center border border-stone-700 px-4 py-2 text-sm text-on-surface-variant transition-colors hover:border-stone-500 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"

// ── Types ─────────────────────────────────────────────────────────────────

export interface TradeDialogProps {
  listingId: string
  listingName: string
  /** Asking price in Space Dust, shown as guidance. */
  askingSpaceDust?: number | null
  trigger: React.ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────

export function TradeDialog({
  listingId,
  listingName,
  askingSpaceDust,
  trigger,
}: TradeDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [spaceDustAmount, setSpaceDustAmount] = useState(
    askingSpaceDust != null ? String(askingSpaceDust) : ""
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const amount = parseInt(spaceDustAmount, 10)
    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Enter a valid Space Dust amount.")
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          offerData: { type: "spaceDust", spaceDustAmount: amount },
        }),
      })

      const data: unknown = await res.json()

      if (!res.ok) {
        const msg =
          data != null &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as Record<string, unknown>).error === "string"
            ? (data as { error: string }).error
            : "Something went wrong."
        setError(msg)
        return
      }

      setOpen(false)
      const tradeRoomId =
        data != null &&
        typeof data === "object" &&
        "tradeRoomId" in data &&
        typeof (data as Record<string, unknown>).tradeRoomId === "string"
          ? (data as { tradeRoomId: string }).tradeRoomId
          : null

      if (tradeRoomId) {
        router.push(`/trade-rooms/${tradeRoomId}`)
      } else {
        router.refresh()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={overlay()} />
        <Dialog.Content className={content()} aria-describedby="trade-dialog-desc">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <Dialog.Title className="font-serif text-xl font-bold text-secondary">
                Make an Offer
              </Dialog.Title>
              <Dialog.Description
                id="trade-dialog-desc"
                className="mt-1 text-sm text-on-surface-variant/70"
              >
                {listingName}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="text-stone-500 transition-colors hover:text-on-surface focus-visible:outline-none"
              aria-label="Close dialog"
            >
              ✕
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="trade-sd-amount"
                className="text-xs uppercase tracking-widest text-stone-400"
              >
                Space Dust amount
              </label>
              {askingSpaceDust != null && (
                <p className="text-[11px] text-stone-500">
                  Asking:{" "}
                  <span className="font-bold text-secondary">
                    {askingSpaceDust.toLocaleString()} SD
                  </span>
                </p>
              )}
              <input
                id="trade-sd-amount"
                type="number"
                min={1}
                step={1}
                className={inputCls}
                placeholder="e.g. 1200"
                value={spaceDustAmount}
                onChange={(e) => setSpaceDustAmount(e.target.value)}
                required
                aria-describedby={error ? "trade-dialog-error" : undefined}
              />
            </div>

            {error && (
              <p
                id="trade-dialog-error"
                role="alert"
                className="text-sm text-error"
              >
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-stone-800 pt-4">
              <Dialog.Close className={btnGhost} type="button">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                className={btnPrimary}
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Send Offer"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
