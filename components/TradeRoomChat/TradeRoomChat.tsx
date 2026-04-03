"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { MessageInput } from "./MessageInput"
import { MessageList } from "./MessageList"
import { NegotiationIdentityPanel } from "./NegotiationIdentityPanel"
import { OfferActionPanel } from "./OfferActionPanel"
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
  seller: { id: string; username: string; image: string | null }
  buyer: { id: string; username: string; image: string | null }
  counterpart: { id: string; username: string; image: string | null }
  listing: { id: string; name: string; baseName: string; rarity: string; price: unknown }
  offerData: unknown
  initialMessages: ChatMessage[]
}

export function TradeRoomChat({
  roomId,
  roomStatus,
  currentUserId,
  currentUsername,
  sessionToken,
  seller,
  buyer,
  counterpart,
  listing,
  offerData,
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
      transports: ["websocket", "polling"],
      tryAllTransports: true,
      timeout: 20_000,
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
  // The current user is the seller if their id matches seller.id
  const isSeller = currentUserId === seller?.id

  return (
    // 3-column negotiation altar: identity | chat | offer
    <div className="grid h-dvh grid-cols-1 lg:grid-cols-[260px_1fr_260px] bg-surface">

      {/* ── LEFT: Identity panel — who are the parties & what is traded ── */}
      <div className="hidden lg:flex flex-col border-r-0">
        <NegotiationIdentityPanel
          counterpart={counterpart}
          currentUsername={currentUsername}
          listing={listing}
          isSeller={isSeller}
        />
      </div>

      {/* ── CENTER: The negotiation feed ── */}
      <div className="flex flex-col h-full min-w-0 overflow-hidden bg-surface">
        {/* Stone lintel header */}
        <header className="relative flex shrink-0 items-center gap-4 bg-surface-container-low px-6 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-baseline gap-3">
              <span className="truncate font-headline text-sm font-bold tracking-editorial text-secondary text-glow-gold">
                {listing.name}
              </span>
              <span className="shrink-0 bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant/60">
                {listing.rarity}
              </span>
            </div>
            <p className="text-label-sm text-on-surface-variant/50">
              TRADE WITH{" "}
              <span className="text-secondary/70">@{counterpart.username}</span>
            </p>
          </div>
          <PresenceIndicator isOnline={counterpartOnline} username={counterpart.username} />
        </header>

        {/* Connection error — blood-red alert strip */}
        {connectionError && (
          <div className="shrink-0 bg-error-container px-4 py-2 text-center text-label-sm text-on-error-container">
            {connectionError === "AUTH_REQUIRED" || connectionError === "AUTH_INVALID"
              ? "Session expired — refresh to continue."
              : `Reconnecting\u2026 ${connectionError}`}
          </div>
        )}

        {/* Room sealed — gold archive notice */}
        {!isActive && (
          <div className="shrink-0 bg-secondary-container/20 px-4 py-2 text-center text-label-sm text-secondary/70">
            ⸻ This trade room is sealed. Records are read-only. ⸻
          </div>
        )}

        {/* Message feed */}
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

      {/* ── RIGHT: Offer action panel — terms & sigil buttons ── */}
      <div className="hidden lg:flex flex-col border-l-0">
        <OfferActionPanel
          roomStatus={roomStatus}
          listing={listing}
          offerData={offerData}
        />
      </div>
    </div>
  )
}
