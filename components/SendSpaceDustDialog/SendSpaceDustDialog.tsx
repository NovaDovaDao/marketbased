"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"
import { useState } from "react"

// ── CVA ───────────────────────────────────────────────────────────────────

const overlay = cva(
  "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
)
const content = cva(
  "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-[#131313] border border-amber-900/30 p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
)
const inputCls =
  "w-full border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-amber-400 focus:outline-none"

// ── Types ─────────────────────────────────────────────────────────────────

export interface SendSpaceDustDialogProps {
  trigger: React.ReactNode
  currentBalance: number | null
}

type Status = "idle" | "loading" | "success" | "error"

// ── Component ─────────────────────────────────────────────────────────────

export function SendSpaceDustDialog({ trigger, currentBalance }: SendSpaceDustDialogProps) {
  const [open, setOpen] = useState(false)
  const [recipientUsername, setRecipientUsername] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function reset() {
    setRecipientUsername("")
    setAmount("")
    setNote("")
    setStatus("idle")
    setErrorMsg(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    setOpen(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    const parsedAmount = parseInt(amount, 10)

    if (!recipientUsername.trim()) {
      setErrorMsg("Please enter a recipient username.")
      setStatus("error")
      return
    }

    if (!Number.isInteger(parsedAmount) || parsedAmount < 1) {
      setErrorMsg("Amount must be a positive whole number.")
      setStatus("error")
      return
    }

    if (currentBalance !== null && parsedAmount > currentBalance) {
      setErrorMsg(`You only have ${currentBalance.toLocaleString()} Space Dust.`)
      setStatus("error")
      return
    }

    setStatus("loading")

    try {
      const res = await fetch("/api/space-dust/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipientUsername: recipientUsername.trim(),
          amount: parsedAmount,
          note: note.trim() || undefined,
        }),
      })

      const body = (await res.json()) as { error?: string; success?: boolean }

      if (!res.ok) {
        const msg =
          body.error === "insufficient_space_dust"
            ? "Insufficient Space Dust."
            : body.error === "User not found"
              ? `User "${recipientUsername}" not found.`
              : body.error === "Cannot send Space Dust to yourself"
                ? "You cannot send Space Dust to yourself."
                : (body.error ?? "Transfer failed. Please try again.")
        setErrorMsg(msg)
        setStatus("error")
        return
      }

      // Notify Header to refresh the balance pill
      window.dispatchEvent(new CustomEvent("space-dust-updated"))
      setStatus("success")
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={overlay()} />
        <Dialog.Content className={content()} aria-describedby="send-sd-desc">
          <Dialog.Title className="font-headline text-lg font-extrabold italic tracking-editorial text-amber-300">
            Send Space Dust
          </Dialog.Title>
          <Dialog.Description id="send-sd-desc" className="mt-1 text-xs text-on-surface-variant/50">
            Transfer Space Dust to any user by their username.
            {currentBalance !== null && (
              <> Your balance:{" "}
                <span className="text-amber-300 font-semibold">
                  ✨ {currentBalance.toLocaleString()} sd
                </span>
              </>
            )}
          </Dialog.Description>

          {status === "success" ? (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <span className="text-4xl" aria-hidden="true">✨</span>
              <p className="text-sm font-semibold text-amber-300">
                Sent {parseInt(amount, 10).toLocaleString()} Space Dust to{" "}
                <span className="text-on-surface">{recipientUsername}</span>!
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-2 border border-amber-400/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-300 transition-colors hover:bg-amber-400/10"
              >
                Send More
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-6 flex flex-col gap-5"
            >
              {/* Recipient */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="send-sd-recipient"
                  className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60"
                >
                  Recipient Username
                </label>
                <input
                  id="send-sd-recipient"
                  className={inputCls}
                  placeholder="e.g. d2trader99"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  disabled={status === "loading"}
                  required
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="send-sd-amount"
                  className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60"
                >
                  Amount (Space Dust)
                </label>
                <input
                  id="send-sd-amount"
                  type="number"
                  min={1}
                  step={1}
                  className={inputCls}
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={status === "loading"}
                  required
                />
              </div>

              {/* Note (optional) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="send-sd-note"
                  className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60"
                >
                  Note <span className="text-on-surface-variant/30 normal-case font-normal">(optional)</span>
                </label>
                <input
                  id="send-sd-note"
                  className={inputCls}
                  placeholder="e.g. Payment for Ber rune"
                  maxLength={200}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={status === "loading"}
                />
              </div>

              {/* Error */}
              {status === "error" && errorMsg && (
                <p role="alert" className="text-xs text-red-400">
                  {errorMsg}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="text-xs text-on-surface-variant/50 transition-colors hover:text-on-surface-variant"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/40 px-5 py-2.5 font-headline text-xs font-bold uppercase tracking-widest text-amber-300 transition-colors hover:bg-amber-400/20 disabled:opacity-40"
                >
                  {status === "loading" ? "Sending…" : "Send ✨"}
                </button>
              </div>
            </form>
          )}

          <Dialog.Close asChild>
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-on-surface-variant/40 transition-colors hover:text-on-surface-variant"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
