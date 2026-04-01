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
          className="rounded p-1 text-zinc-600 opacity-0 transition-opacity hover:text-zinc-400 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
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
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <Dialog.Title className="mb-1 text-base font-semibold text-zinc-100">
            Report Message
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-sm text-zinc-400">
            Our moderation team will review this report.
          </Dialog.Description>

          {done ? (
            <div className="space-y-4">
              <p className="text-sm text-emerald-400">Report submitted. Thank you.</p>
              <Dialog.Close asChild>
                <button className="w-full rounded-lg bg-zinc-800 py-2 text-sm text-zinc-200 hover:bg-zinc-700">
                  Close
                </button>
              </Dialog.Close>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300" htmlFor="report-reason">
                  Reason
                </label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-zinc-700 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-red-700 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
