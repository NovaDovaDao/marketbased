"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export interface BuyRuneButtonProps {
  runeId: number
  runeName: string
}

export default function BuyRuneButton({ runeId, runeName }: BuyRuneButtonProps) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  async function handleBuy() {
    if (status !== "idle") return
    setStatus("loading")

    try {
      const res = await fetch("/api/runes/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runeId }),
      })

      if (res.status === 401) {
        router.push("/login")
        return
      }

      if (res.status === 402) {
        router.push("/store")
        return
      }

      if (!res.ok) {
        setStatus("idle")
        return
      }

      setStatus("success")
      // Instantly refresh the Space Dust balance shown in the Header
      window.dispatchEvent(new CustomEvent("space-dust-updated"))
    } catch {
      setStatus("idle")
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={status === "loading" || status === "success"}
      aria-label={`Buy ${runeName} for 1,000 Space Dust`}
      className={[
        "min-h-9 w-full px-4 py-2",
        "text-label-sm font-bold uppercase tracking-widest",
        "transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        status === "success"
          ? "bg-secondary text-on-secondary"
          : "bg-surface-container-highest text-on-surface-variant hover:bg-secondary hover:text-on-secondary",
      ].join(" ")}
    >
      {status === "loading" && "Buying…"}
      {status === "success" && "Purchased ✓"}
      {status === "idle" && "Buy · 1,000 SD"}
    </button>
  )
}
