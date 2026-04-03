"use client"

import { useEffect, useRef, useState } from "react"

interface TypingIndicatorProps {
  isTyping: boolean
  username: string
}

export function TypingIndicator({ isTyping, username }: TypingIndicatorProps) {
  const [visible, setVisible] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isTyping) {
      setVisible(true)
      // Auto-hide after 3s without an update (handles lost typing-stop events)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => setVisible(false), 3_000)
    } else {
      setVisible(false)
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [isTyping])

  if (!visible) return null

  return (
    <div className="shrink-0 flex items-center gap-3 px-6 pb-2">
      <span className="text-label-sm text-on-surface-variant/40 tracking-label">
        @{username} scribing…
      </span>
      <span className="flex items-center gap-1" aria-hidden="true">
        <InkBead delay="0ms" />
        <InkBead delay="220ms" />
        <InkBead delay="440ms" />
      </span>
    </div>
  )
}

function InkBead({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-0.5 w-4 bg-secondary/60 animate-ink-bead"
      style={{ animationDelay: delay }}
    />
  )
}
