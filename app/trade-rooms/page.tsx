import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import runes from "@/items/runes.json"
import tradingListings from "@/items/trading-listings.json"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

// Build a contentId → image URL lookup from both static catalogs.
// Runes are stored with contentId = "rune-{id}" (see CreateListingDialog).
// Trading listings use their own id directly (e.g. "listing-001").
const itemImageMap = new Map<string, string>([
  ...tradingListings.map((item) => [item.id, item.image] as [string, string]),
  ...(runes as Array<{ id: number; image: string }>).map(
    (r) => [`rune-${r.id}`, r.image] as [string, string]
  ),
])

export const metadata = { title: "Trade Rooms — Marketbased" }

function isLive(status: string) {
  return status === "open" || status === "active"
}

function statusLabel(status: string) {
  if (status === "open" || status === "active") return "Live"
  if (status === "closed") return "Sealed"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default async function TradeRoomsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const userId = session.user.id

  const rooms = await prisma.tradeRoom.findMany({
    where: { OR: [{ sellerId: userId }, { buyerId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      seller: { select: { id: true, username: true, image: true } },
      buyer: { select: { id: true, username: true, image: true } },
      offer: {
        select: {
          id: true,
          listing: { select: { id: true, name: true, contentId: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        where: { isDeleted: false },
        select: { content: true, senderId: true, type: true, createdAt: true },
      },
    },
  })

  const liveCount = rooms.filter((r) => isLive(r.status)).length

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-14 md:px-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="mb-12">
        {/* Ruled separator: gold bleeds left, fades right */}
        <div className="mb-7 flex items-center gap-5">
          <span
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, rgba(247,189,72,0.55) 0%, rgba(247,189,72,0) 100%)",
            }}
            aria-hidden="true"
          />
          <span className="text-label-sm text-secondary/40">NEGOTIATION ARCHIVE</span>
          <span
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, rgba(247,189,72,0) 0%, rgba(247,189,72,0.55) 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        {/* Display headline */}
        <h1 className="mb-3 font-headline text-display-md font-extrabold italic tracking-editorial text-secondary text-glow-gold leading-none">
          Trade Rooms
        </h1>

        {/* Subtitle count */}
        <p className="text-label-md text-on-surface-variant/35">
          {rooms.length === 0
            ? "No negotiations open"
            : `${rooms.length} negotiation${rooms.length !== 1 ? "s" : ""}\u2002·\u2002${liveCount} live`}
        </p>
      </header>

      {/* ── Room list ────────────────────────────────────────────────────── */}
      {rooms.length === 0 ? (
        <EmptyState />
      ) : (
        <ul
          className="flex flex-col"
          style={{ gap: "1px", background: "rgba(255,255,255,0.04)" }}
        >
          {rooms.map((room, i) => {
            const other = room.sellerId === userId ? room.buyer : room.seller
            const lastMsg = room.messages[0]
            const preview =
              lastMsg?.type === "system"
                ? lastMsg.content
                : lastMsg?.senderId === userId
                  ? `You: ${lastMsg.content}`
                  : (lastMsg?.content ?? "No messages yet")
            const live = isLive(room.status)
            const itemImage = room.offer?.listing?.contentId
              ? itemImageMap.get(room.offer.listing.contentId)
              : undefined

            return (
              <li
                key={room.id}
                className="animate-stone-settle"
                style={
                  { animationDelay: `${i * 50}ms` } as React.CSSProperties
                }
              >
                <Link
                  href={`/trade-rooms/${room.id}`}
                  className="group relative flex items-center gap-5 bg-surface-container py-5 px-6 transition-colors duration-200 hover:bg-surface-container-high"
                  style={{
                    // Left accent bar: gold for live, stone for sealed
                    borderLeft: live
                      ? "2px solid rgba(247,189,72,0.70)"
                      : "2px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* ── Item image (falls back to counterpart avatar) ── */}
                  <div
                    className="relative h-12 w-12 shrink-0 overflow-hidden bg-surface-container-lowest"
                    style={{
                      boxShadow: live
                        ? "0 0 0 1px rgba(247,189,72,0.35), 0 0 14px 2px rgba(247,189,72,0.12)"
                        : "0 0 0 1px rgba(255,255,255,0.06)",
                    }}
                  >
                    {itemImage ? (
                      <Image
                        src={itemImage}
                        alt={room.offer?.listing?.name ?? "Item"}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <Image
                        src={other.image ?? "/avatars/default.webp"}
                        alt={other.username}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>

                  {/* ── Content ── */}
                  <div className="min-w-0 flex-1">
                    {/* Item name — small-cap gold label */}
                    {room.offer?.listing && (
                      <p className="mb-1 truncate text-label-sm text-secondary/55 text-glow-gold">
                        {room.offer.listing.name}
                      </p>
                    )}

                    {/* Counterpart username */}
                    <p className="font-headline text-sm font-bold text-on-surface transition-colors duration-200 group-hover:text-secondary">
                      @{other.username}
                    </p>

                    {/* Message preview */}
                    <p className="mt-1 truncate font-newsreader text-xs italic text-on-surface-variant/40">
                      {preview}
                    </p>
                  </div>

                  {/* ── Right metadata ── */}
                  <div className="ml-2 flex shrink-0 flex-col items-end gap-2.5">
                    {/* Status pill */}
                    <span
                      className="text-label-sm px-2 py-0.5"
                      style={{
                        color: live
                          ? "rgba(247,189,72,0.85)"
                          : "rgba(255,255,255,0.22)",
                        background: live
                          ? "rgba(247,189,72,0.07)"
                          : "rgba(255,255,255,0.03)",
                        outline: live
                          ? "1px solid rgba(247,189,72,0.20)"
                          : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {statusLabel(room.status)}
                    </span>

                    {/* Last activity date */}
                    <time
                      className="tabular-nums text-on-surface-variant/22"
                      style={{ fontSize: "0.58rem", letterSpacing: "0.09em" }}
                      dateTime={room.updatedAt.toISOString()}
                    >
                      {room.updatedAt.toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>

                  {/* Hover: right-edge gold thread */}
                  <span
                    className="pointer-events-none absolute inset-y-0 right-0 w-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ background: "rgba(247,189,72,0.22)" }}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="mt-24 flex flex-col items-center gap-8">
      {/* Decorative crossed-rune glyph */}
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="opacity-15"
      >
        {/* Vertical staff */}
        <rect x="27" y="4" width="2" height="48" fill="rgba(247,189,72,1)" />
        {/* Horizontal bar */}
        <rect x="4" y="27" width="48" height="2" fill="rgba(247,189,72,1)" />
        {/* Corner brackets */}
        <rect x="10" y="10" width="2" height="12" fill="rgba(247,189,72,0.55)" />
        <rect x="10" y="10" width="12" height="2" fill="rgba(247,189,72,0.55)" />
        <rect x="44" y="10" width="2" height="12" fill="rgba(247,189,72,0.55)" />
        <rect x="34" y="10" width="12" height="2" fill="rgba(247,189,72,0.55)" />
        <rect x="10" y="34" width="2" height="12" fill="rgba(247,189,72,0.55)" />
        <rect x="10" y="44" width="12" height="2" fill="rgba(247,189,72,0.55)" />
        <rect x="44" y="34" width="2" height="12" fill="rgba(247,189,72,0.55)" />
        <rect x="34" y="44" width="12" height="2" fill="rgba(247,189,72,0.55)" />
      </svg>

      <div className="text-center">
        <p className="font-headline text-sm italic text-on-surface-variant/30">
          The vault is sealed.
        </p>
        <p className="mt-2 text-label-sm text-on-surface-variant/18">
          Accept an offer to open a negotiation room.
        </p>
      </div>
    </div>
  )
}
