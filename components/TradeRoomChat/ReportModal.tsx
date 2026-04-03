"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { useState, type FormEvent } from "react"

const REASONS = [
  "Spam",
  "Harassment or abusive language",
  "Scam attempt",
  "Inappropriate content",
  "Other",
] as const

interface ReportModalProps {
  messageId: string
}

export function ReportModal({ messageId }: ReportModalProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string>(REASONS[0])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/trade-rooms/unknown/messages/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      if (res.status === 409) {
        setError("You have already reported this message.")
      } else if (!res.ok) {
        setError("Failed to submit report. Please try again.")
      } else {
        setDone(true)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="p-1 text-on-surface-variant/30 opacity-0 transition-all duration-300 hover:text-primary/60 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/40"
          aria-label="Report message"
          title="Report this message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M3 2.75A.75.75 0 0 1 3.75 2h8.5a.75.75 0 0 1 .6 1.2L10.5 6.5l2.35 3.3A.75.75 0 0 1 12.25 11H4.5v2.25a.75.75 0 0 1-1.5 0v-10.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-surface-container-highest p-6 shadow-blood-lg">
          <Dialog.Title className="mb-1 font-headline text-base font-bold tracking-editorial text-secondary">
            Report Message
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-sm text-on-surface-variant/70">
            Our moderation council will review this report.
          </Dialog.Description>

          {done ? (
            <div className="space-y-4">
              <p className="text-sm italic text-secondary/80">The report has been inscribed. The council will judge.</p>
              <Dialog.Close asChild>
                <button className="w-full bg-surface-container-high py-2.5 text-label-sm font-bold tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container-highest">
                  CLOSE
                </button>
              </Dialog.Close>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant/60" htmlFor="report-reason">
                  VIOLATION
                </label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface ghost-border focus:outline-none focus:ring-1 focus:ring-secondary/40 caret-secondary"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r} className="bg-surface-container-lowest">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs italic text-error/80">{error}</p>}

              <div className="flex gap-2 pt-1">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 bg-surface-container-high py-2.5 text-label-sm font-bold tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                  >
                    CANCEL
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-error-container py-2.5 text-label-sm font-bold tracking-widest text-on-error-container transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {submitting ? "SUBMITTING…" : "REPORT"}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
