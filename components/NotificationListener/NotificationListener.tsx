"use client"

import { authClient } from "@/app/utils/auth-client"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface NewTradeRoomPayload {
  tradeRoomId: string
  listingName: string
  buyerUsername: string
}

interface Notification {
  id: string
  payload: NewTradeRoomPayload
}

/**
 * Mounted once in the root layout. Maintains a persistent Socket.IO connection
 * (separate from TradeRoomChat) to receive user-level events like new offer notifications.
 * Only connects when the user is authenticated.
 */
export function NotificationListener() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const socketRef = useRef<Socket | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!session?.user) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ?? "http://localhost:3001"
    const socket = io(socketUrl, {
      withCredentials: true,
      auth: { token: session.session?.token }, // fallback for cross-port cookie forwarding
      transports: ["websocket", "polling"],
      tryAllTransports: true,
      timeout: 20_000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2_000,
      reconnectionDelayMax: 30_000,
    })
    socketRef.current = socket

    socket.on("new-trade-room", (payload: NewTradeRoomPayload) => {
      const id = `${Date.now()}-${payload.tradeRoomId}`
      setNotifications((prev) => [...prev, { id, payload }])
      // Signal header to refresh its unread badge immediately
      window.dispatchEvent(new CustomEvent("trade-room-unread-updated"))
      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 8_000)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [session?.user?.id]) // reconnect only if the logged-in user changes

  if (notifications.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-100 flex flex-col gap-2"
    >
      {notifications.map(({ id, payload }) => (
        <div
          key={id}
          className="flex items-start gap-3 rounded border border-amber-600/40 bg-[#1a1209] px-4 py-3 shadow-xl"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              New Offer
            </p>
            <p className="mt-0.5 truncate text-sm text-stone-300">
              <span className="font-semibold text-white">{payload.buyerUsername}</span>
              {" wants to buy "}
              <span className="italic">{payload.listingName}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => {
                router.push(`/trade-rooms/${payload.tradeRoomId}`)
                setNotifications((prev) => prev.filter((n) => n.id !== id))
              }}
              className="text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
            >
              View
            </button>
            <button
              onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== id))}
              aria-label="Dismiss"
              className="text-stone-500 hover:text-stone-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
