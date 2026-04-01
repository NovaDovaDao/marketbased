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

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-zinc-800 bg-zinc-900 px-4 py-3"
    >
      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <textarea
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={disabled ? "This trade room is closed." : "type a message… (Enter to send, Shift+Enter for newline)"}
            value={value}
            rows={1}
            maxLength={MAX_CHARS + 1} // let them type over to see the counter turn red
            disabled={disabled}
            onChange={(e) => {
              setValue(e.target.value)
              handleTyping()
            }}
            onKeyDown={handleKeyDown}
            style={{ maxHeight: "8rem", overflowY: "auto" }}
          />
          {/* Character counter — only shown when approaching/at limit */}
          {(isWarning || isOverLimit) && (
            <span
              className={`absolute right-2 bottom-2 text-[10px] tabular-nums ${isOverLimit ? "text-red-400" : "text-amber-400"}`}
            >
              {remaining}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || isOverLimit || value.trim().length === 0}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </form>
  )
}
