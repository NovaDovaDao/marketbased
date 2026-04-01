"use client"

import { cva } from "class-variance-authority"
import { useCallback, useEffect, useRef } from "react"
import { ReportModal } from "./ReportModal"
import type { ChatMessage } from "./TradeRoomChat"

const messageBubble = cva(
  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words",
  {
    variants: {
      isMine: {
        true: "rounded-br-sm bg-indigo-600 text-white",
        false: "rounded-bl-sm bg-zinc-800 text-zinc-100",
      },
      isSystem: {
        true: "max-w-full rounded-lg bg-transparent px-0 py-1 text-center text-xs italic text-zinc-500",
        false: "",
      },
      isDeleted: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: { isMine: false, isSystem: false, isDeleted: false },
  }
)

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  readReceipts: Record<string, string>
  onVisible: (lastMessageId: string) => void
}

export function MessageList({ messages, currentUserId, readReceipts, onVisible }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastIncomingRef = useRef<string | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
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
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-3">
        {messages.map((message) => {
          if (message.type === "system") {
            return (
              <div key={message.id} className="flex justify-center">
                <span className={messageBubble({ isSystem: true })}>
                  {message.content}
                </span>
              </div>
            )
          }

          const isMine = message.senderId === currentUserId
          const wasRead = readReceipts[message.id]

          return (
            <div
              key={message.id}
              className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
            >
              {!isMine && (
                <span className="ml-1 text-[10px] text-zinc-500">
                  @{message.sender.username}
                </span>
              )}
              <div className="group flex items-end gap-1.5">
                {!isMine && (
                  <div className="mb-0.5">
                    <ReportModal messageId={message.id} />
                  </div>
                )}
                <div className={messageBubble({ isMine, isDeleted: message.isDeleted })}>
                  {message.content}
                </div>
              </div>
              <div className={`flex items-center gap-1 text-[10px] text-zinc-600 ${isMine ? "flex-row-reverse" : ""}`}>
                <time>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                {isMine && wasRead && (
                  <span className="text-indigo-400" title="Read">✓✓</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
