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
    <div className="shrink-0 flex items-center gap-1.5 px-4 pb-1 text-xs text-zinc-500">
      <span>@{username} is typing</span>
      <span className="flex gap-0.5" aria-hidden="true">
        <Dot delay="0ms" />
        <Dot delay="160ms" />
        <Dot delay="320ms" />
      </span>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1 w-1 animate-bounce rounded-full bg-zinc-500"
      style={{ animationDelay: delay, animationDuration: "900ms" }}
    />
  )
}
