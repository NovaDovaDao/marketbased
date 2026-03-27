import RuneCard from "@/components/RuneCard/RuneCard"
import runesData from "@/items/runes.json"
import { type Rune, type RuneTier, ALL_TIERS, TIER_LABELS } from "@/types/rune"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Rune Market — Obsidian Vault",
  description: "Buy, sell, and trade Diablo II runes. All 33 runes from El to Zod, organized by tier.",
}

const runes = runesData as Rune[]

// Tier filter labels shown in the category strip
const filters: Array<{ label: string; value: string }> = [
  { label: "All Runes", value: "" },
  ...ALL_TIERS.map((t) => ({ label: TIER_LABELS[t], value: t })),
]

// Descriptive copy per tier
const tierLore: Record<RuneTier, string> = {
  low: "Basic resonance stones. Plentiful in the lower realms. Perfect for new runeword formulae.",
  mid: "Intermediate power glyphs. Found in the deeper dungeons of Act III and beyond.",
  high: "Supreme runes of immense power. Zod, Jah, Ber — the currency of legend.",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RunesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawTier = params["tier"]
  const activeTier = (typeof rawTier === "string" && ALL_TIERS.includes(rawTier as RuneTier)
    ? rawTier
    : "") as RuneTier | ""

  const visibleRunes = (activeTier
    ? runes.filter((r) => r.tier === activeTier)
    : runes
  ).slice().sort((a, b) => b.id - a.id)

  return (
    <main className="min-h-screen">
      {/* ═══════════════════════════════════════════════════════
          PAGE HERO
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-12">
        {/* Ambient gold glow — right side desktop */}
        <div
          className="pointer-events-none absolute right-0 top-0 hidden h-[50vh] w-[35vw] lg:block"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 85% 15%, rgba(247,189,72,0.05) 0%, transparent 65%)",
          }}
        />

        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {/* Eyebrow */}
          <p className="text-label-md mb-5 text-secondary">The Rune Vault</p>

          {/* Headline */}
          <div className="mb-8 flex items-end gap-8">
            <div>
              <h1
                className="text-display-md font-headline font-extrabold italic text-secondary text-glow-gold"
              >
                Rune Market
              </h1>
              <p className="mt-4 max-w-xl font-body text-base italic text-on-surface-variant/60 leading-relaxed">
                {activeTier
                  ? tierLore[activeTier]
                  : "All 33 runes of Sanctuary — from \u00C9l to Zod. List yours, acquire what you seek, forge the perfect runeword."}
              </p>
            </div>
            <div className="mb-2 h-px flex-1 hidden lg:block bg-secondary/15" aria-hidden="true" />
            <p className="mb-2 hidden shrink-0 text-label-sm text-on-surface-variant/40 lg:block">
              {visibleRunes.length} rune{visibleRunes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TIER FILTER STRIP
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-surface-container-lowest" aria-label="Filter runes by tier">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none" role="tablist">
            {filters.map(({ label, value }) => {
              const isActive = activeTier === value
              return (
                <a
                  key={value || "all"}
                  href={value ? `?tier=${value}` : "/runes"}
                  role="tab"
                  aria-selected={isActive}
                  className={[
                    "shrink-0 min-h-10 px-5 py-2",
                    "text-label-sm uppercase tracking-widest transition-colors",
                    isActive
                      ? "bg-surface-container-highest text-secondary"
                      : "bg-transparent text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface-variant",
                  ].join(" ")}
                >
                  {label}
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          RUNE GRID
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-surface-container-lowest py-16" aria-label="Rune listings">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {/* Section label */}
          <div className="mb-10 flex items-end gap-6">
            <div>
              <p className="text-label-sm mb-2 text-secondary">
                {activeTier ? TIER_LABELS[activeTier] : "All Tiers"}
              </p>
              <h2 className="text-headline-md font-headline font-extrabold italic text-on-surface">
                {activeTier ? `${TIER_LABELS[activeTier]} Runes` : "Complete Rune Index"}
              </h2>
            </div>
            <div className="mb-1 h-px flex-1 bg-secondary/10" aria-hidden="true" />
          </div>

          {/* Grid — mobile 2-col, md 3-col, lg 4-col, xl 5-col */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visibleRunes.map((rune) => (
              <RuneCard key={rune.id} rune={rune} />
            ))}
          </div>

          {visibleRunes.length === 0 && (
            <div className="py-24 text-center">
              <p className="font-headline text-2xl italic text-on-surface-variant/30">
                No runes found in this tier.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SELL BANNER — CTA at bottom
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-surface py-20" aria-label="List your runes">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-label-sm mb-3 text-secondary">The Great Ledger</p>
              <h2 className="text-headline-lg font-headline font-extrabold italic text-on-surface">
                List Your Runes
              </h2>
              <p className="mt-3 max-w-lg font-body text-sm italic text-on-surface-variant/55 leading-relaxed">
                Every trade sealed in stone. Connect your account, choose your runes, set your price — and let the market find you.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#"
                className="
                  blood-gradient inline-flex min-h-13 min-w-11
                  items-center justify-center px-10 py-4
                  text-label-md font-bold uppercase tracking-widest text-on-secondary
                  shadow-blood transition-all hover:opacity-90 active:scale-[0.98]
                "
              >
                Start Listing
              </a>
              <a
                href="#"
                className="
                  inline-flex min-h-13 min-w-11
                  items-center justify-center border border-secondary/40 px-10 py-4
                  text-label-md font-bold uppercase tracking-widest text-secondary
                  transition-all hover:bg-secondary/5 hover:border-secondary/70
                "
              >
                View Guide
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
