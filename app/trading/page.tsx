import { prisma } from "@/app/lib/prisma"
import { DbListingCard } from "@/app/trading/DbListingCard"
import CoreParameters from "@/components/CoreParameters/CoreParameters"
import { SellItemButton } from "@/components/SellItemButton/SellItemButton"
import TradingListingCard from "@/components/TradingListingCard/TradingListingCard"
import TradingSidebar from "@/components/TradingSidebar/TradingSidebar"
import listingsData from "@/items/trading-listings.json"
import {
  type TradingFilterState,
  type TradingListing,
} from "@/types/trading"
import { type Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Trading — Market Base",
  description:
    "Buy, sell, and trade Diablo II items. Filter by category, tier, rarity, stats, and more.",
}

const ITEMS_PER_PAGE = 12
const allListings = listingsData as TradingListing[]

// ── DB listing price formatter ────────────────────────────────────────────

type PriceJson = { usdc?: number; eth?: string | number;[key: string]: unknown }

function formatDbPrice(price: unknown): { display: string; usdCents?: number } {
  if (!price || typeof price !== "object" || Array.isArray(price)) return { display: "—" }
  const p = price as PriceJson
  if (typeof p.usdc === "number") {
    return { display: `$${(p.usdc / 100).toFixed(2)}`, usdCents: p.usdc }
  }
  if (p.eth !== undefined) return { display: `${p.eth} ETH` }
  const first = Object.entries(p)[0]
  return first ? { display: `${first[1]} ${first[0].toUpperCase()}` } : { display: "—" }
}

const RARITY_COLOR: Record<string, string> = {
  Unique: "#ff9b48",
  Set: "#4ade80",
  Rare: "#6aa0ff",
  Magic: "#a78bfa",
  Rune: "#f7bd48",
  Runeword: "#f7bd48",
  Normal: "#9ca3af",
}

// ── Server-side filter logic ───────────────────────────────────────────────

function applyFilters(
  listings: TradingListing[],
  f: TradingFilterState
): TradingListing[] {
  return listings.filter((listing) => {
    if (f.category && listing.category !== f.category) return false
    if (f.itemType && listing.itemType !== f.itemType) return false
    if (f.bodyLocation && listing.bodyLocation !== f.bodyLocation) return false
    if (f.craftType && listing.craftType !== f.craftType) return false
    if (f.gemType && listing.gemType !== f.gemType) return false
    if (f.tier && listing.tier !== f.tier) return false
    if (f.weaponType && listing.weaponType !== f.weaponType) return false
    if (f.rarity && listing.rarity !== f.rarity) return false
    if (f.sellerStanding && listing.sellerStanding !== f.sellerStanding) return false
    if (f.ladder && f.ladder !== "all" && listing.ladder !== f.ladder) return false
    if (f.mode && f.mode !== "all" && listing.mode !== f.mode) return false
    if (f.platform && f.platform !== "all" && listing.platform !== f.platform) return false
    if (f.region && f.region !== "all" && listing.region !== f.region) return false
    if (f.version && f.version !== "all" && listing.version !== f.version) return false

    // Level range
    if (f.levelMin) {
      const min = parseInt(f.levelMin, 10)
      if (!isNaN(min) && listing.requiredLevel < min) return false
    }
    if (f.levelMax) {
      const max = parseInt(f.levelMax, 10)
      if (!isNaN(max) && listing.requiredLevel > max) return false
    }

    // Relic status: any of the selected must match
    const activeRelicStatus = f.relicStatus ?? []
    if (
      activeRelicStatus.length > 0 &&
      !activeRelicStatus.some((s) => listing.relicStatus.includes(s))
    ) {
      return false
    }

    // Crafting state: any of the selected must match
    const activeCraftingState = f.craftingState ?? []
    if (
      activeCraftingState.length > 0 &&
      !activeCraftingState.some((s) => listing.craftingState.includes(s))
    ) {
      return false
    }

    // Stats: all selected must appear in listing stats
    const activeStats = f.stats ?? []
    if (
      activeStats.length > 0 &&
      !activeStats.every((id) => listing.skills.includes(id) || listing.stats.some(() => true))
    ) {
      // Simplified: check skills list (stat IDs are mapped there)
      if (!activeStats.every((id) => listing.skills.includes(id))) return false
    }

    // Skills: any of the selected must be in listing skills
    const activeSkills = f.skills ?? []
    if (
      activeSkills.length > 0 &&
      !activeSkills.some((id) => listing.skills.includes(id))
    ) {
      return false
    }

    return true
  })
}

// ── Build filter state from raw searchParams ──────────────────────────────

function buildFilterState(
  params: Record<string, string | string[] | undefined>
): TradingFilterState {
  const str = (key: string): string | undefined => {
    const v = params[key]
    return typeof v === "string" ? v : undefined
  }
  const arr = (key: string): string[] => {
    const v = params[key]
    if (Array.isArray(v)) return v
    if (typeof v === "string") return [v]
    return []
  }

  return {
    category: str("category"),
    itemType: str("itemType"),
    bodyLocation: str("bodyLocation"),
    craftType: str("craftType"),
    gemType: str("gemType"),
    tier: str("tier"),
    weaponType: str("weaponType"),
    rarity: str("rarity"),
    sellerStanding: str("sellerStanding"),
    relicStatus: arr("relicStatus"),
    craftingState: arr("craftingState"),
    levelMin: str("levelMin"),
    levelMax: str("levelMax"),
    ladder: str("ladder"),
    mode: str("mode"),
    platform: str("platform"),
    region: str("region"),
    version: str("version"),
    stats: arr("stats"),
    skills: arr("skills"),
    page: str("page"),
  }
}

// ── Page component ────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TradingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = buildFilterState(params)

  const filtered = applyFilters(allListings, filters)
  const currentPage = Math.max(1, parseInt(filters.page ?? "1", 10))
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const pageListings = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  // Fetch real DB listings
  const dbListings = await prisma.listing.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { seller: { select: { id: true, username: true } } },
  })

  // Build a URL that replaces the page param
  function pageUrl(p: number): string {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (key === "page") return
      if (Array.isArray(value)) {
        value.forEach((v) => sp.append(key, v))
      } else if (value !== undefined) {
        sp.set(key, value)
      }
    })
    if (p > 1) sp.set("page", String(p))
    const qs = sp.toString()
    return `/trading${qs ? `?${qs}` : ""}`
  }

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    if (k === "page") return false
    return Array.isArray(v) ? v.length > 0 : v !== undefined
  })

  return (
    <>
      {/* Fixed sidebar — outside main flow */}
      <TradingSidebar activeFilters={filters} />

      {/* Main content — offset for sidebar + fixed header */}
      <main className="min-h-screen pt-16 lg:ml-72">
        <div className="p-6 lg:p-8">

          {/* ── Core Parameters Panel ── */}
          <CoreParameters activeFilters={filters} />

          {/* ── Results header ── */}
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tighter text-secondary lg:text-5xl">
                Sanctuary Relics Found
              </h1>
              <p className="mt-2 font-serif text-sm italic text-stone-500">
                {filtered.length === 0
                  ? "No artifacts unearthed"
                  : `${filtered.length} Artifact${filtered.length !== 1 ? "s" : ""} unearthed in the current cycle`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sell Item */}
              <SellItemButton />

              {/* Sort stub */}
              <div className="flex items-center gap-2 border border-stone-900 bg-surface-container-low px-4 py-2">
                <span className="font-serif text-xs tracking-widest text-stone-600 uppercase">Sort By</span>
                <span className="font-serif text-xs text-secondary">Highest Rarity</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" className="text-stone-600" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── DB Live Listings ── */}
          {dbListings.length > 0 && (
            <section aria-label="Live listings" className="mb-14">
              <div className="mb-5 flex items-center gap-3">
                <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-secondary/70">
                  Live Listings
                </h2>
                <span className="h-px flex-1 bg-stone-800" aria-hidden="true" />
                <span className="font-headline text-xs text-on-surface-variant/30">{dbListings.length} active</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {dbListings.map((listing) => {
                  const { display, usdCents } = formatDbPrice(listing.price)
                  const color = RARITY_COLOR[listing.rarity] ?? "#9ca3af"
                  return (
                    <DbListingCard
                      key={listing.id}
                      id={listing.id}
                      name={listing.name}
                      rarity={listing.rarity}
                      rarityColor={color}
                      priceDisplay={display}
                      priceUsdCents={usdCents}
                      sellerUsername={listing.seller.username ?? ""}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Catalog Listing grid ── */}
          {pageListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-10 xl:grid-cols-2 2xl:grid-cols-3">
              {pageListings.map((listing) => (
                <TradingListingCard
                  key={listing.id}
                  listing={listing}
                  tier={listing.tier}
                />
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 border border-stone-900 bg-surface-container-low py-20 text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="24" cy="24" r="22" stroke="rgba(247,189,72,0.15)" strokeWidth="1.5" />
                <path
                  d="M16 32l8-16 8 16M19 28h10"
                  stroke="rgba(247,189,72,0.3)"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
              <div>
                <p className="font-serif text-xl font-bold text-stone-400">
                  No relics match your current filters
                </p>
                <p className="mt-1 font-serif text-xs italic text-stone-600">
                  The vault is empty for these parameters
                </p>
              </div>
              {hasActiveFilters && (
                <Link
                  href="/trading"
                  className="border border-stone-800 px-6 py-3 font-serif text-xs tracking-widest text-stone-400 uppercase transition-all hover:bg-stone-900 hover:text-stone-200"
                >
                  Clear All Filters
                </Link>
              )}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <nav
              className="mt-16 flex items-center justify-center gap-6 font-serif"
              aria-label="Pagination"
            >
              {safePage > 1 ? (
                <Link
                  href={pageUrl(safePage - 1)}
                  className="flex items-center gap-2 text-xs tracking-widest text-stone-500 uppercase transition-colors hover:text-secondary"
                  aria-label="Previous page"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                  </svg>
                  Previous Page
                </Link>
              ) : (
                <span className="flex items-center gap-2 text-xs tracking-widest text-stone-700 uppercase" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                  </svg>
                  Previous Page
                </span>
              )}

              <div className="flex items-center gap-4" aria-label="Page numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageUrl(p)}
                    className={
                      p === safePage
                        ? "border-b border-secondary px-2 text-secondary"
                        : "px-2 text-stone-600 hover:text-stone-300"
                    }
                    aria-label={`Page ${p}`}
                    aria-current={p === safePage ? "page" : undefined}
                  >
                    {p}
                  </Link>
                ))}
              </div>

              {safePage < totalPages ? (
                <Link
                  href={pageUrl(safePage + 1)}
                  className="flex items-center gap-2 text-xs tracking-widest text-stone-500 uppercase transition-colors hover:text-secondary"
                  aria-label="Next page"
                >
                  Next Page
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                  </svg>
                </Link>
              ) : (
                <span className="flex items-center gap-2 text-xs tracking-widest text-stone-700 uppercase" aria-hidden="true">
                  Next Page
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                  </svg>
                </span>
              )}
            </nav>
          )}
        </div>
      </main>
    </>
  )
}
