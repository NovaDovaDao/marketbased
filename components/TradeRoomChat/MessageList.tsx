"use client"

import { cva } from "class-variance-authority"
import { useCallback, useEffect, useRef } from "react"
import { ReportModal } from "./ReportModal"
import type { ChatMessage } from "./TradeRoomChat"

// ─── Bubble ───────────────────────────────────────────────────────────────────
// FIX: break-words (valid Tailwind) replaces the invalid wrap-break-word.
// FIX: min-w-[100px] prevents ultra-narrow single-word bubbles.
const messageBubble = cva(
  "relative min-w-25 max-w-[72%] px-4 py-3 text-[0.875rem] leading-[1.65] wrap-break-word font-newsreader animate-stone-settle",
  {
    variants: {
      isMine: {
        true: "bg-primary-container text-on-primary-container",
        false: "bg-surface-container-high text-on-surface",
      },
      isDeleted: {
        true: "opacity-40 italic",
        false: "",
      },
    },
    defaultVariants: { isMine: false, isDeleted: false },
  }
)

// Box-shadow values kept out of CVA so Tailwind doesn't purge them
const SHADOW_MINE =
  "0 0 20px 4px rgba(247,189,72,0.40), 0 4px 12px rgba(0,0,0,0.7), inset 0 1px 6px rgba(0,0,0,0.6)"
const SHADOW_THEIRS =
  "0 0 10px 1px rgba(247,189,72,0.10), 0 2px 8px rgba(0,0,0,0.55), inset 0 1px 6px rgba(0,0,0,0.6)"

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  readReceipts: Record<string, string>
  onVisible: (lastMessageId: string) => void
}

export function MessageList({ messages, currentUserId, readReceipts, onVisible }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastIncomingRef = useRef<string | null>(null)

  // Auto-scroll to bottom within the chat container (not the whole page)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages])

  // Mark read when a new incoming message appears in view
  const markReadCallback = useCallback(
    (messageId: string) => {
      if (lastIncomingRef.current === messageId) return
      lastIncomingRef.current = messageId
      onVisible(messageId)
    },
    [onVisible]
  )

  // Fire mark-read when the latest incoming message renders
  useEffect(() => {
    const lastIncoming = [...messages].reverse().find((m) => m.senderId !== currentUserId)
    if (lastIncoming) markReadCallback(lastIncoming.id)
  }, [messages, currentUserId, markReadCallback])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-surface px-4 py-8 md:px-8">
      <div className="flex w-full flex-col gap-5">
        {messages.map((message) => {
          if (message.type === "system") {
            return (
              <div key={message.id} className="flex w-full items-center gap-4 py-1">
                {/* Left rule */}
                <span className="h-px flex-1 bg-secondary/10" aria-hidden="true" />
                <span className="shrink-0 text-center text-xs italic text-secondary/35 font-newsreader">
                  {message.content}
                </span>
                {/* Right rule */}
                <span className="h-px flex-1 bg-secondary/10" aria-hidden="true" />
              </div>
            )
          }

          const isMine = message.senderId === currentUserId
          const wasRead = readReceipts[message.id]

          return (
            <div
              key={message.id}
              // FIX: w-full ensures this row spans the chat column.
              // items-end / items-start aligns children visually — but the row
              // itself must fill the width so max-w-[72%] resolves correctly.
              className={`flex w-full flex-col gap-1.5 ${isMine ? "items-end" : "items-start"}`}
            >
              {/* Identity label ─ sender name above bubble */}
              {isMine ? (
                <span
                  className="px-1 text-label-sm tracking-[0.18em]"
                  style={{ color: "rgba(255,180,168,0.50)" }}
                >
                  YOU
                </span>
              ) : (
                <span
                  className="px-1 text-label-sm tracking-[0.18em] text-glow-gold"
                  style={{ color: "rgba(247,189,72,0.70)" }}
                >
                  @{message.sender.username}
                </span>
              )}

              {/* ── Bubble row ──────────────────────────────────────────────
                  FIX: w-full here is the critical fix. The parent has
                  items-end/items-start which collapses children to content
                  width. w-full overrides that, giving the bubble row the full
                  chat column width so max-w-[72%] on the bubble resolves to
                  72% of the chat — not 72% of a collapsed ~30px container.
              ─────────────────────────────────────────────────────────── */}
              <div
                className={`group flex w-full items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Report action — revealed on hover, only for theirs */}
                {!isMine && (
                  <div className="mb-0.5 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <ReportModal messageId={message.id} />
                  </div>
                )}

                {/* The bubble itself */}
                <div
                  className={messageBubble({ isMine, isDeleted: message.isDeleted })}
                  style={{ boxShadow: isMine ? SHADOW_MINE : SHADOW_THEIRS }}
                >
                  {/* Thin top accent line */}
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{
                      background: isMine
                        ? "linear-gradient(90deg, transparent 0%, rgba(226,70,52,0.5) 50%, transparent 100%)"
                        : "linear-gradient(90deg, transparent 0%, rgba(247,189,72,0.15) 50%, transparent 100%)",
                    }}
                    aria-hidden="true"
                  />
                  {message.content}
                </div>
              </div>

              {/* Timestamp + read receipt — tucked below the bubble */}
              <div
                className={`flex items-center gap-2 px-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
              >
                <time
                  className="tabular-nums text-on-surface-variant/25"
                  style={{ fontSize: "0.6rem", letterSpacing: "0.08em" }}
                  dateTime={message.createdAt}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                {isMine && wasRead && (
                  <span
                    className="text-secondary/55 text-glow-gold"
                    style={{ fontSize: "0.55rem" }}
                    title="Seen"
                    aria-label="Seen"
                  >
                    ✦
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
