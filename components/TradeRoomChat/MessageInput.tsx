"use client"

import { useCallback, useRef, useState, type FormEvent, type KeyboardEvent } from "react"

const MAX_CHARS = 2000
const WARN_CHARS = 1800
const TYPING_START_DEBOUNCE_MS = 300
const TYPING_STOP_IDLE_MS = 1_000

interface MessageInputProps {
  onSend: (content: string) => void
  onTypingStart: () => void
  onTypingStop: () => void
  disabled?: boolean
}

export function MessageInput({ onSend, onTypingStart, onTypingStop, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState("")
  const typingStartTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const handleTyping = useCallback(() => {
    // Debounce: fire typing-start 300ms after first keystroke
    if (!isTypingRef.current) {
      if (typingStartTimer.current) clearTimeout(typingStartTimer.current)
      typingStartTimer.current = setTimeout(() => {
        isTypingRef.current = true
        onTypingStart()
      }, TYPING_START_DEBOUNCE_MS)
    }

    // Reset typing-stop timer on each keystroke (1s idle → stop)
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current)
    typingStopTimer.current = setTimeout(() => {
      isTypingRef.current = false
      onTypingStop()
    }, TYPING_STOP_IDLE_MS)
  }, [onTypingStart, onTypingStop])

  const submit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
    // Stop typing indicators on send
    if (typingStartTimer.current) clearTimeout(typingStartTimer.current)
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current)
    isTypingRef.current = false
    onTypingStop()
  }, [value, disabled, onSend, onTypingStop])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      submit()
    },
    [submit]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
    },
    [submit]
  )

  const remaining = MAX_CHARS - value.length
  const isOverLimit = remaining < 0
  const isWarning = remaining >= 0 && remaining < MAX_CHARS - WARN_CHARS
  const canSend = !disabled && !isOverLimit && value.trim().length > 0

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 bg-surface-container-low px-5 py-4"
    >
      {/* Character counter — shown above input when nearing limit */}
      {(isWarning || isOverLimit) && (
        <div className="mb-1 flex justify-end px-1">
          <span
            className={`text-label-sm tabular-nums ${isOverLimit ? "text-error" : "text-secondary/60"}`}
          >
            {remaining} remaining
          </span>
        </div>
      )}

      {/* Recessed inscription vessel */}
      <div className="flex items-end bg-surface-container-lowest socket-shadow transition-shadow duration-300 focus-within:ring-1 focus-within:ring-secondary/50">
        <textarea
          className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none caret-secondary font-newsreader leading-relaxed disabled:cursor-not-allowed disabled:opacity-40"
          placeholder={
            disabled
              ? "This trade room is sealed."
              : "Inscribe your message\u2026 (Enter to send, Shift+Enter for newline)"
          }
          value={value}
          rows={1}
          maxLength={MAX_CHARS + 1}
          disabled={disabled}
          onChange={(e) => {
            setValue(e.target.value)
            handleTyping()
          }}
          onKeyDown={handleKeyDown}
          style={{ maxHeight: "8rem", overflowY: "auto" }}
        />

        {/* Sigil send button — rune activation glyph */}
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send inscription"
          className="group relative shrink-0 self-stretch w-14 flex items-center justify-center bg-primary-container transition-all duration-300 hover:bg-on-primary-container/20 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {/* Hover glow layer */}
          <span
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(146,6,3,0.6) 0%, rgba(49,0,0,0.9) 100%)",
            }}
            aria-hidden="true"
          />
          {/* Rune sigil — angular directional glyph */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="relative h-5 w-5 transition-colors duration-300 group-hover:text-primary text-primary/60 group-disabled:text-primary/20"
            aria-hidden="true"
          >
            {/* Angular rune: upward-right angular arrow */}
            <path
              d="M4 20 L12 4 L20 20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
            <path
              d="M8 13 L12 4 L16 13"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </button>
      </div>
    </form>
  )
}
