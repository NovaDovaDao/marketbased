"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// ── Types ─────────────────────────────────────────────────────────────────

interface OfferBuyer {
  id: string
  username: string
  image: string | null
}

interface OfferListing {
  id: string
  name: string
  rarity: string
  price: unknown
}

interface Offer {
  id: string
  status: string
  offerData: unknown
  createdAt: string
  buyer: OfferBuyer
  listing: OfferListing
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatOfferData(offerData: unknown): string {
  if (!offerData || typeof offerData !== "object") return "—"
  const d = offerData as Record<string, unknown>
  if (d.type === "usdc" && typeof d.usdcCents === "number") {
    return `$${(d.usdcCents / 100).toFixed(2)} USDC`
  }
  if (d.type === "runes" && Array.isArray(d.runes)) {
    const runes = d.runes as Array<{ name: string; quantity: number }>
    if (runes.length === 0) return "No runes"
    if (runes.length === 1) return `${runes[0]!.quantity}× ${runes[0]!.name}`
    return `${runes.map((r) => `${r.quantity}× ${r.name}`).join(", ")}`
  }
  return JSON.stringify(offerData)
}

// ── Component ─────────────────────────────────────────────────────────────

export function ListingOffersManager() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [actionStates, setActionStates] = useState<Record<string, "accept" | "decline" | null>>({})

  useEffect(() => {
    void fetchOffers()
  }, [])

  async function fetchOffers() {
    try {
      const res = await fetch("/api/offers", { credentials: "include" })
      if (res.ok) {
        const data = await res.json() as Offer[]
        setOffers(data.filter((o) => o.status === "pending"))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(offerId: string) {
    setActionStates((s) => ({ ...s, [offerId]: "accept" }))
    try {
      const res = await fetch(`/api/offers/${offerId}/accept`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json() as { tradeRoomId: string }
        router.push(`/trade-rooms/${data.tradeRoomId}`)
      }
    } finally {
      setActionStates((s) => ({ ...s, [offerId]: null }))
    }
  }

  async function handleDecline(offerId: string) {
    setActionStates((s) => ({ ...s, [offerId]: "decline" }))
    try {
      const res = await fetch(`/api/offers/${offerId}/decline`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setOffers((o) => o.filter((offer) => offer.id !== offerId))
      }
    } finally {
      setActionStates((s) => ({ ...s, [offerId]: null }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 font-headline text-xs text-on-surface-variant/30">
        <span className="h-1 w-1 animate-bounce rounded-full bg-secondary/40 [animation-delay:0ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-secondary/40 [animation-delay:150ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-secondary/40 [animation-delay:300ms]" />
        <span className="uppercase tracking-widest">Loading offers…</span>
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <p className="py-4 font-headline text-xs text-on-surface-variant/30 uppercase tracking-widest">
        No pending offers.
      </p>
    )
  }

  return (
    <section aria-label="Incoming offers" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-headline text-xl font-extrabold uppercase italic tracking-widest text-secondary md:text-2xl">
          Incoming Offers
        </h2>
        <span className="font-headline text-sm text-on-surface-variant/50">
          {offers.length} pending
        </span>
      </div>

      <ul className="flex flex-col gap-2" aria-label="Pending offers list">
        {offers.map((offer) => {
          const busy = actionStates[offer.id]
          return (
            <li
              key={offer.id}
              className="flex flex-wrap items-center gap-4 bg-surface-container-low px-4 py-4"
            >
              {/* Buyer avatar */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center bg-surface-container text-on-surface-variant/40"
                aria-hidden="true"
              >
                {offer.buyer.image ? (
                  // eslint-disable-next-line @next/next-eslint/no-img-element
                  <img
                    src={offer.buyer.image}
                    alt={offer.buyer.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-headline text-sm font-bold">{offer.buyer.username.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-headline text-sm font-semibold text-on-surface">
                  <span className="text-secondary">{offer.buyer.username}</span>
                  <span className="text-on-surface-variant/40"> offered on </span>
                  <span>{offer.listing.name}</span>
                </p>
                <p className="font-headline text-xs text-on-surface-variant/50">
                  {formatOfferData(offer.offerData)}
                </p>
              </div>

              {/* Accept / Decline */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => void handleDecline(offer.id)}
                  disabled={!!busy}
                  aria-label={`Decline offer from ${offer.buyer.username}`}
                  className="border border-stone-700 px-4 py-2 font-headline text-xs uppercase tracking-widest text-on-surface-variant/40 transition-colors hover:border-red-800/60 hover:text-red-400/70 disabled:opacity-40"
                >
                  {busy === "decline" ? "…" : "Decline"}
                </button>
                <button
                  onClick={() => void handleAccept(offer.id)}
                  disabled={!!busy}
                  aria-label={`Accept offer from ${offer.buyer.username}`}
                  className="px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-85 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #f7bd48 0%, #e0a830 100%)", color: "#0e0e0e" }}
                >
                  {busy === "accept" ? "…" : "Accept"}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
