"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { MessageInput } from "./MessageInput"
import { MessageList } from "./MessageList"
import { PresenceIndicator } from "./PresenceIndicator"
import { TypingIndicator } from "./TypingIndicator"

export interface ChatMessage {
  id: string
  tradeRoomId?: string
  senderId: string
  content: string
  type: "text" | "system"
  isDeleted: boolean
  readAt: Record<string, string> | null
  createdAt: string
  sender: { id: string; username: string; image: string | null }
}

interface TradeRoomChatProps {
  roomId: string
  roomStatus: string
  currentUserId: string
  currentUsername: string
  sessionToken: string
  counterpart: { id: string; username: string; image: string | null }
  listing: { id: string; name: string; baseName: string; rarity: string; price: unknown }
  initialMessages: ChatMessage[]
}

export function TradeRoomChat({
  roomId,
  roomStatus,
  currentUserId,
  currentUsername,
  sessionToken,
  counterpart,
  listing,
  initialMessages,
}: TradeRoomChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [counterpartOnline, setCounterpartOnline] = useState(false)
  const [counterpartTyping, setCounterpartTyping] = useState(false)
  const [readReceipts, setReadReceipts] = useState<Record<string, string>>({})
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)
  // Queue messages sent while disconnected
  const messageQueueRef = useRef<{ content: string }[]>([])
  // Presence heartbeat interval
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ?? "http://localhost:3001"

  const flushQueue = useCallback((socket: Socket) => {
    const queue = messageQueueRef.current
    messageQueueRef.current = []
    for (const item of queue) {
      socket.emit("send-message", { tradeRoomId: roomId, content: item.content })
    }
  }, [roomId])

  useEffect(() => {
    const socket = io(socketUrl, {
      withCredentials: true, // sends Better Auth session cookie
      auth: { token: sessionToken }, // fallback for cross-port environments where cookie isn't forwarded
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 30_000,
      randomizationFactor: 0.5,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      setConnectionError(null)
      socket.emit("join-room", { tradeRoomId: roomId })
      flushQueue(socket)

      // Heartbeat to keep presence alive (server TTL is 60s)
      pingIntervalRef.current = setInterval(() => {
        socket.emit("ping")
      }, 30_000)
    })

    socket.on("disconnect", (reason) => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      if (reason === "io server disconnect") {
        // Server force-disconnected — reconnect manually
        socket.connect()
      }
    })

    socket.on("connect_error", (err) => {
      console.error(`[socket] connect_error: ${err.message}`)
      setConnectionError(err.message)
    })

    socket.on("error", ({ code, message }: { code: string; message: string }) => {
      console.error(`[socket] server error code=${code} message=${message}`)
      // Surface rate-limit errors to the user; other errors are logged only
      if (code === "RATE_LIMITED") {
        setConnectionError("Slow down — you're sending messages too quickly.")
        setTimeout(() => setConnectionError(null), 3_000)
      }
    })

    socket.on("message", (msg: ChatMessage) => {
      setMessages((prev) => {
        // Deduplicate (optimistic messages sent locally already appear)
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    socket.on("typing", ({ userId, isTyping }) => {
      if (userId === counterpart.id) setCounterpartTyping(isTyping)
    })

    socket.on("read-receipt", ({ userId, lastMessageId, readAt }) => {
      if (userId !== currentUserId) {
        setReadReceipts((prev) => ({ ...prev, [lastMessageId]: readAt }))
      }
    })

    socket.on("presence", ({ userId, online }) => {
      if (userId === counterpart.id) setCounterpartOnline(online)
    })

    socket.on("message-deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, content: "[Message deleted]" } : m
        )
      )
    })

    socket.on("room-closed", () => {
      // Room status change will be reflected via page-level state
      window.location.reload()
    })

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, socketUrl])

  const sendMessage = useCallback((content: string) => {
    const socket = socketRef.current
    if (!socket) return

    if (socket.connected) {
      socket.emit("send-message", { tradeRoomId: roomId, content })
    } else {
      // Buffer until reconnected
      messageQueueRef.current.push({ content })
    }
  }, [roomId])

  const sendTypingStart = useCallback(() => {
    socketRef.current?.emit("typing-start", { tradeRoomId: roomId })
  }, [roomId])

  const sendTypingStop = useCallback(() => {
    socketRef.current?.emit("typing-stop", { tradeRoomId: roomId })
  }, [roomId])

  const markRead = useCallback((lastMessageId: string) => {
    socketRef.current?.emit("mark-read", { tradeRoomId: roomId, lastMessageId })
  }, [roomId])

  const isActive = roomStatus === "active"

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-zinc-100">
              {listing.name}
            </span>
            <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {listing.rarity}
            </span>
          </div>
          <span className="truncate text-xs text-zinc-500">
            Trading with{" "}
            <span className="text-zinc-300">@{counterpart.username}</span>
          </span>
        </div>
        <PresenceIndicator isOnline={counterpartOnline} username={counterpart.username} />
      </header>

      {/* Connection error banner */}
      {connectionError && (
        <div className="shrink-0 bg-red-900/50 px-4 py-2 text-center text-xs text-red-300">
          {connectionError === "AUTH_REQUIRED" || connectionError === "AUTH_INVALID"
            ? "Session expired. Please refresh the page."
            : `Connection error: ${connectionError}. Reconnecting…`}
        </div>
      )}

      {/* Room closed banner */}
      {!isActive && (
        <div className="shrink-0 bg-amber-900/50 px-4 py-2 text-center text-xs text-amber-300">
          This trade room is closed and read-only.
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        readReceipts={readReceipts}
        onVisible={markRead}
      />

      {/* Typing indicator */}
      <TypingIndicator isTyping={counterpartTyping} username={counterpart.username} />

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onTypingStart={sendTypingStart}
        onTypingStop={sendTypingStop}
        disabled={!isActive}
      />
    </div>
  )
}
