"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export interface BuyWithSpaceDustButtonProps {
  listingId: string
  itemName: string
  spaceDustPrice: number
}

type ButtonState = "idle" | "loading" | "success"

export function BuyWithSpaceDustButton({
  listingId,
  itemName,
  spaceDustPrice,
}: BuyWithSpaceDustButtonProps) {
  const router = useRouter()
  const [balance, setBalance] = useState<number | null>(null)
  const [state, setState] = useState<ButtonState>("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/me/balance")
      .then((r) => r.ok ? r.json() as Promise<{ spaceDust: number }> : null)
      .then((data) => { if (data) setBalance(data.spaceDust) })
      .catch(() => undefined)
  }, [])

  const hasEnough = balance !== null && balance >= spaceDustPrice

  async function handleBuy() {
    if (state === "loading" || state === "success") return
    setState("loading")
    setError(null)

    try {
      const res = await fetch(`/api/listings/${listingId}/purchase`, {
        method: "POST",
        credentials: "include",
      })

      if (res.status === 402) {
        // Insufficient space dust
        router.push("/store")
        return
      }

      if (!res.ok) {
        const body = await res.json() as { error?: string }
        setError(body.error ?? "Purchase failed.")
        setState("idle")
        return
      }

      const body = await res.json() as { tradeRoomId: string }
      setState("success")

      // Notify header to refresh balance
      window.dispatchEvent(new CustomEvent("space-dust-updated"))

      // Small delay so the success state is visible, then navigate to chat
      setTimeout(() => {
        router.push(`/trade-rooms/${body.tradeRoomId}`)
      }, 600)
    } catch {
      setError("Network error. Please try again.")
      setState("idle")
    }
  }

  // Unknown balance — still loading
  if (balance === null) {
    return (
      <button
        disabled
        aria-label={`Buy ${itemName} for ${spaceDustPrice.toLocaleString()} Space Dust`}
        className="flex items-center gap-1.5 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest opacity-40"
        style={{ background: "linear-gradient(135deg, #f7bd48 0%, #e0a830 100%)", color: "#0e0e0e" }}
      >
        ✨ {spaceDustPrice.toLocaleString()} sd
      </button>
    )
  }

  if (!hasEnough) {
    return (
      <a
        href="/store"
        title={`You need ${(spaceDustPrice - (balance ?? 0)).toLocaleString()} more Space Dust`}
        className="flex items-center gap-1.5 border border-amber-400/30 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest text-amber-400/70 transition-colors hover:border-amber-400/60 hover:text-amber-400"
      >
        Need ✨ {spaceDustPrice.toLocaleString()} sd
      </a>
    )
  }

  if (state === "success") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest text-emerald-400">
        ✓ Purchased
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => void handleBuy()}
        disabled={state === "loading"}
        aria-label={`Buy ${itemName} for ${spaceDustPrice.toLocaleString()} Space Dust`}
        className="flex items-center gap-1.5 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-85 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #f7bd48 0%, #e0a830 100%)", color: "#0e0e0e" }}
      >
        {state === "loading" ? (
          "Buying…"
        ) : (
          <>✨ {spaceDustPrice.toLocaleString()} sd</>
        )}
      </button>
      {error && (
        <p className="text-[10px] text-red-400/80" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
