interface OfferActionPanelProps {
  roomStatus: string
  listing: { name: string; price: unknown }
  offerData: unknown
}

function formatOfferData(offerData: unknown): { label: string; value: string }[] {
  if (!offerData || typeof offerData !== "object") return []

  const data = offerData as Record<string, unknown>

  // Crypto amount: { usdc: number } (stored in cents)
  if ("usdc" in data && typeof data["usdc"] === "number") {
    const dollars = (data["usdc"] / 100).toFixed(2)
    return [{ label: "USDC OFFER", value: `$${dollars}` }]
  }

  // Rune offer: { runes: [{ name, quantity }] }
  if ("runes" in data && Array.isArray(data["runes"])) {
    return (data["runes"] as { name?: unknown; quantity?: unknown }[]).map((r) => ({
      label: String(r.name ?? "RUNE"),
      value: `×${String(r.quantity ?? 1)}`,
    }))
  }

  // Generic key-value fallback
  return Object.entries(data).map(([k, v]) => ({
    label: k.toUpperCase(),
    value: String(v),
  }))
}

export function OfferActionPanel({ roomStatus, listing, offerData }: OfferActionPanelProps) {
  const isActive = roomStatus === "active"
  const offerLines = formatOfferData(offerData)

  return (
    <aside className="relative flex h-full flex-col bg-surface-container-low">
      {/* ── Disabled veil when room is sealed ── */}
      {!isActive && (
        <div className="absolute inset-0 z-10 bg-surface/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="px-4 py-3 bg-surface-container-highest text-center">
            <p className="text-label-sm text-secondary/50 tracking-label">⸻ SEALED ⸻</p>
            <p className="mt-1 font-headline text-xs text-on-surface-variant/40">
              This pact is closed
            </p>
          </div>
        </div>
      )}

      {/* ── Panel header ── */}
      <div className="px-5 pt-6 pb-4 bg-surface-container-lowest">
        <p className="text-label-sm text-secondary/60 tracking-label">
          TERMS OF
        </p>
        <h2 className="mt-0.5 font-headline text-sm font-bold tracking-editorial text-secondary text-glow-gold animate-torch-flicker">
          THE PACT
        </h2>
      </div>

      {/* ── Offer display ── */}
      <div className="px-4 pt-5">
        <p className="mb-2 text-label-sm text-on-surface-variant/40 tracking-label">
          ITEM
        </p>
        <p className="font-headline text-sm text-on-surface font-bold leading-tight">
          {listing.name}
        </p>

        {/* ── Offer breakdown ── */}
        {offerLines.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-label-sm text-on-surface-variant/40 tracking-label">
              IN EXCHANGE FOR
            </p>
            <div className="flex flex-col gap-1.5">
              {offerLines.map((line, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between bg-surface-container-lowest px-3 py-2 socket-shadow"
                >
                  <span className="text-label-sm text-on-surface-variant/60 tracking-label">
                    {line.label}
                  </span>
                  <span className="font-headline text-sm font-bold text-secondary text-glow-gold">
                    {line.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Tonal separator ── */}
      <div className="mx-4 mt-5 h-px bg-surface-container-highest/40" aria-hidden="true" />

      {/* ── Action sigils ── */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        <p className="text-label-sm text-on-surface-variant/40 tracking-label mb-1">
          YOUR MOVE
        </p>

        {/* Accept — blood gradient primary sigil */}
        <button
          type="button"
          disabled={!isActive}
          className="group relative w-full overflow-hidden bg-primary-container px-4 py-3 text-left transition-all duration-300 hover:bg-on-primary-container/20 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Seal the pact — accept offer"
        >
          <span
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(49,0,0,1) 0%, rgba(146,6,3,0.4) 100%)",
            }}
            aria-hidden="true"
          />
          <span className="relative flex items-center gap-2">
            <span className="text-base text-primary/80" aria-hidden="true">⟊</span>
            <span className="font-headline text-xs font-bold tracking-widest text-primary">
              SEAL THE PACT
            </span>
          </span>
        </button>

        {/* Counter — gilded ghost sigil */}
        <button
          type="button"
          disabled={!isActive}
          className="group w-full px-4 py-3 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(247,189,72,0.25)",
          }}
          aria-label="Counter the offer"
        >
          <span className="flex items-center gap-2 transition-colors duration-300 group-hover:text-secondary">
            <span className="text-base text-secondary/50 transition-colors duration-300 group-hover:text-secondary" aria-hidden="true">⟳</span>
            <span className="font-headline text-xs font-bold tracking-widest text-secondary/60 transition-colors duration-300 group-hover:text-secondary">
              COUNTER
            </span>
          </span>
        </button>

        {/* Decline — stone ghost sigil */}
        <button
          type="button"
          disabled={!isActive}
          className="group w-full px-4 py-2.5 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Refuse the offer"
        >
          <span className="flex items-center gap-2 transition-colors duration-300 group-hover:text-on-surface-variant">
            <span className="text-sm text-on-surface-variant/25 transition-colors duration-300 group-hover:text-on-surface-variant/60" aria-hidden="true">⨉</span>
            <span className="font-headline text-xs font-bold tracking-widest text-on-surface-variant/30 transition-colors duration-300 group-hover:text-on-surface-variant/60">
              REFUSE
            </span>
          </span>
        </button>
      </div>

      {/* ── Sealed status stamp (bottom anchor) ── */}
      <div className="px-4 pb-5 mt-auto">
        <div className="h-px bg-surface-container-highest/40 mb-3" aria-hidden="true" />
        {isActive ? (
          <p className="text-label-sm text-on-surface-variant/25 tracking-label text-center">
            ⸻ NEGOTIATION OPEN ⸻
          </p>
        ) : (
          <p className="text-label-sm text-secondary/30 tracking-label text-center">
            ⸻ ARCHIVED ⸻
          </p>
        )}
      </div>
    </aside>
  )
}
