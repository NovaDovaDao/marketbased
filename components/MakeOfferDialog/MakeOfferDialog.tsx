"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"
import { useRouter } from "next/navigation"
import { useState } from "react"

// ── CVA ───────────────────────────────────────────────────────────────────

const overlay = cva("fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0")
const content = cva("fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-[#131313] border border-amber-900/30 p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95")
const inputCls = "w-full border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-secondary focus:outline-none"
const btnPrimary = "inline-flex items-center justify-center px-6 py-3 font-headline text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-40"

// ── Types ─────────────────────────────────────────────────────────────────

export interface MakeOfferDialogProps {
  listingId: string
  listingName: string
  /** Optional: asking price in USD cents for display */
  askingUsdCents?: number
  trigger: React.ReactNode
}

type OfferType = "usdc" | "runes"

interface RuneRow { name: string; quantity: number }

// ── Component ─────────────────────────────────────────────────────────────

export function MakeOfferDialog({
  listingId,
  listingName,
  askingUsdCents,
  trigger,
}: MakeOfferDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [offerType, setOfferType] = useState<OfferType>("usdc")
  const [usdcDollars, setUsdcDollars] = useState("")
  const [runes, setRunes] = useState<RuneRow[]>([{ name: "", quantity: 1 }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addRune() {
    setRunes((prev) => [...prev, { name: "", quantity: 1 }])
  }

  function removeRune(i: number) {
    setRunes((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateRune(i: number, field: keyof RuneRow, value: string | number) {
    setRunes((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const offerData =
        offerType === "usdc"
          ? { type: "usdc" as const, usdcCents: Math.round(parseFloat(usdcDollars) * 100) }
          : { type: "runes" as const, runes }

      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingId, offerData }),
      })

      const body = await res.json() as { error?: string; tradeRoomId?: string }

      if (!res.ok) {
        setError(body.error ?? "Failed to submit offer.")
        return
      }

      setOpen(false)
      if (body.tradeRoomId) {
        router.push(`/trade-rooms/${body.tradeRoomId}`)
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
        <Dialog.Content className={content()}>
          <Dialog.Title className="font-headline text-lg font-extrabold italic tracking-editorial text-secondary">
            Make an Offer
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-on-surface-variant/50">
            Offer on <span className="text-on-surface/80">{listingName}</span>
            {askingUsdCents !== undefined && (
              <> · Asking <span className="text-secondary">${(askingUsdCents / 100).toFixed(2)}</span></>
            )}
          </Dialog.Description>

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-5">
            {/* Offer type toggle */}
            <div className="flex gap-2">
              {(["usdc", "runes"] as OfferType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOfferType(t)}
                  className={`px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest transition-colors ${offerType === t
                      ? "bg-secondary text-[#0e0e0e]"
                      : "border border-stone-700 text-on-surface-variant/50 hover:border-stone-500"
                    }`}
                >
                  {t === "usdc" ? "USDC" : "Runes"}
                </button>
              ))}
            </div>

            {offerType === "usdc" ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest text-on-surface-variant/50">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/40">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={usdcDollars}
                    onChange={(e) => setUsdcDollars(e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-on-surface-variant/50">
                  Rune Offer
                </label>
                {runes.map((rune, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Rune name (e.g. Ber)"
                      value={rune.name}
                      onChange={(e) => updateRune(i, "name", e.target.value)}
                      className={`${inputCls} flex-1`}
                    />
                    <input
                      type="number"
                      min="1"
                      required
                      value={rune.quantity}
                      onChange={(e) => updateRune(i, "quantity", parseInt(e.target.value, 10))}
                      className={`${inputCls} w-16`}
                    />
                    {runes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRune(i)}
                        className="px-2 text-stone-500 hover:text-red-400"
                        aria-label="Remove rune"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRune}
                  className="self-start text-xs text-on-surface-variant/40 hover:text-secondary transition-colors"
                >
                  + Add rune
                </button>
              </div>
            )}

            {error && <p className="text-xs text-red-400/80">{error}</p>}

            <div className="flex items-center justify-end gap-3 border-t border-stone-800 pt-4">
              <Dialog.Close className="text-xs text-on-surface-variant/40 hover:text-on-surface-variant/70 transition-colors uppercase tracking-widest">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting}
                className={btnPrimary}
                style={{ background: "linear-gradient(135deg, #8c0000 0%, #920603 100%)", color: "#fff8e7" }}
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
