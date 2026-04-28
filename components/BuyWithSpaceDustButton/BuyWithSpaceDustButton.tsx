"use client"

import { CheckoutConfirmationDialog } from "@/components/CheckoutConfirmationDialog/CheckoutConfirmationDialog"
import { useEffect, useState } from "react"

export interface BuyWithSpaceDustButtonProps {
  listingId: string
  itemName: string
  spaceDustPrice: number
  sellerName?: string
}

export function BuyWithSpaceDustButton({
  listingId,
  itemName,
  spaceDustPrice,
  sellerName,
}: BuyWithSpaceDustButtonProps) {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/me/balance")
      .then((r) => (r.ok ? (r.json() as Promise<{ spaceDust: number }>) : null))
      .then((data) => {
        if (data) setBalance(data.spaceDust)
      })
      .catch(() => undefined)
  }, [])

  const hasEnough = balance !== null && balance >= spaceDustPrice

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
        title={`You need ${(spaceDustPrice - balance).toLocaleString()} more Space Dust`}
        className="flex items-center gap-1.5 border border-amber-400/30 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest text-amber-400/70 transition-colors hover:border-amber-400/60 hover:text-amber-400"
      >
        Need ✨ {spaceDustPrice.toLocaleString()} sd
      </a>
    )
  }

  return (
    <CheckoutConfirmationDialog
      item={{
        kind: "listing",
        listingId,
        itemName,
        priceSpaceDust: spaceDustPrice,
        sellerName,
      }}
      trigger={
        <button
          type="button"
          aria-label={`Buy ${itemName} for ${spaceDustPrice.toLocaleString()} Space Dust`}
          className="flex items-center gap-1.5 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-85"
          style={{ background: "linear-gradient(135deg, #f7bd48 0%, #e0a830 100%)", color: "#0e0e0e" }}
        >
          ✨ {spaceDustPrice.toLocaleString()} sd
        </button>
      }
    />
  )
}
