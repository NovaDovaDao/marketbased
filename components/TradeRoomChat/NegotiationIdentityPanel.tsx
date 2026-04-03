interface Participant {
  id: string
  username: string
  image: string | null
}

interface ListingInfo {
  id: string
  name: string
  baseName: string
  rarity: string
  price: unknown
}

interface NegotiationIdentityPanelProps {
  counterpart: Participant
  currentUsername: string
  listing: ListingInfo
  isSeller: boolean
}

export function NegotiationIdentityPanel({
  counterpart,
  currentUsername,
  listing,
  isSeller,
}: NegotiationIdentityPanelProps) {
  const rarityColor =
    listing.rarity === "Unique"
      ? "text-secondary text-glow-gold"
      : listing.rarity === "Set"
        ? "text-[#00c800]"
        : listing.rarity === "Rare"
          ? "text-[#ffff00]/80"
          : listing.rarity === "Magic"
            ? "text-[#8888ff]/80"
            : "text-on-surface-variant/60"

  return (
    <aside className="flex h-full flex-col bg-surface-container-low">
      {/* ── Panel header — asymmetric, gold label ── */}
      <div className="px-5 pt-6 pb-4 bg-surface-container-lowest">
        <p className="text-label-sm text-secondary/60 tracking-label">
          NEGOTIATION
        </p>
        <h2 className="mt-0.5 font-headline text-sm font-bold tracking-editorial text-secondary text-glow-gold animate-torch-flicker">
          ALTAR
        </h2>
      </div>

      {/* ── Item Socket — 1:1 aspect ratio relic display ── */}
      <div className="px-4 pt-5">
        <p className="mb-2 text-label-sm text-on-surface-variant/40 tracking-label">
          THE RELIC
        </p>
        <div className="relative aspect-square w-full bg-surface-container-lowest socket-shadow-lg flex flex-col items-center justify-center p-4">
          {/* Decorative corner accents — carved stone feel */}
          <span aria-hidden="true" className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-secondary/25" />
          <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-secondary/25" />
          <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-secondary/25" />
          <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-secondary/25" />

          {/* Rarity glyph — abstract rune symbol */}
          <div className="mb-3 flex h-10 w-10 items-center justify-center bg-surface-container-high">
            <span aria-hidden="true" className="text-xl text-secondary/50">⬡</span>
          </div>

          <p className={`text-center font-headline text-xs font-bold leading-tight ${rarityColor}`}>
            {listing.name}
          </p>
          <p className="mt-1.5 text-center text-label-sm text-on-surface-variant/40 tracking-label">
            {listing.baseName}
          </p>

          {/* Rarity label — tonal shift, no border */}
          <div className="mt-3 bg-surface-container px-2 py-0.5">
            <span className={`text-label-sm tracking-label ${rarityColor}`}>
              {listing.rarity.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tonal separator — felt, not seen ── */}
      <div className="mx-4 mt-5 h-px bg-surface-container-highest/40" aria-hidden="true" />

      {/* ── Counterpart identity ── */}
      <div className="px-4 pt-4 flex-1">
        <p className="mb-3 text-label-sm text-on-surface-variant/40 tracking-label">
          {isSeller ? "BUYER" : "SELLER"}
        </p>
        <div className="flex items-center gap-3">
          {/* Letterform avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-container-high">
            <span className="font-headline text-sm font-bold text-secondary/70">
              {counterpart.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-secondary text-glow-gold font-headline">
              @{counterpart.username}
            </p>
            <p className="text-label-sm text-on-surface-variant/40 tracking-label">
              {isSeller ? "BUYER" : "SELLER"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Current user identity (bottom anchor) ── */}
      <div className="px-4 pb-5 bg-surface-container-lowest mt-auto">
        <div className="mx-0 mb-3 h-px bg-surface-container-highest/40" aria-hidden="true" />
        <p className="mb-2 text-label-sm text-on-surface-variant/30 tracking-label">
          YOU
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary-container/60">
            <span className="font-headline text-xs font-bold text-primary/70">
              {currentUsername.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="truncate text-xs font-bold text-on-surface/60 font-headline">
            @{currentUsername}
          </p>
        </div>
      </div>
    </aside>
  )
}
