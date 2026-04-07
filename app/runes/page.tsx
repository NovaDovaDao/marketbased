import RuneCard from "@/components/RuneCard/RuneCard"
import runesData from "@/items/runes.json"
import { type Rune, type RuneTier, ALL_TIERS, TIER_LABELS } from "@/types/rune"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Rune Market — Buy & Sell Diablo II Runes",
  description:
    "Browse all 33 Diablo II runes — El through Zod — sorted by tier. Buy runes with Space Dust or list your own for sale on Market Base.",
  alternates: {
    canonical: "https://marketbased.vercel.app/runes",
  },
  openGraph: {
    title: "Rune Market — Buy & Sell Diablo II Runes",
    description:
      "Browse all 33 Diablo II runes — El through Zod — sorted by tier. Buy runes with Space Dust or list your own for sale on Market Base.",
    url: "https://marketbased.vercel.app/runes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rune Market — Buy & Sell Diablo II Runes",
    description:
      "Browse all 33 Diablo II runes — El through Zod — sorted by tier. Buy runes with Space Dust or list your own for sale on Market Base.",
  },
}

const runes = runesData as Rune[]

// Tier filter labels shown in the category strip
const filters: Array<{ label: string; value: string }> = [
  { label: "All Runes", value: "" },
  ...ALL_TIERS.map((t) => ({ label: TIER_LABELS[t], value: t })),
]

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
      <section className="relative overflow-hidden pt-24 pb-4">
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
            </div>
            <div className="mb-2 h-px flex-1 hidden lg:block bg-secondary/15" aria-hidden="true" />
            <p className="mb-2 hidden shrink-0 text-label-sm text-on-surface-variant/40 lg:block">
              {visibleRunes.length} rune{visibleRunes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          RUNE GRID
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-surface-container-lowest py-6" aria-label="Rune listings">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
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
      <section className="bg-surface py-20" aria-label="Get Space Dust">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-label-sm mb-3 text-secondary">The Great Ledger</p>
              <h2 className="text-headline-lg font-headline font-extrabold italic text-on-surface">
                Need More Space Dust?
              </h2>
              <p className="mt-3 max-w-lg font-body text-sm italic text-on-surface-variant/55 leading-relaxed">
                Every rune costs 1,000 SD. Top up your balance in the store and come back to claim yours.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/store"
                className="
                  blood-gradient inline-flex min-h-13 min-w-11
                  items-center justify-center px-10 py-4
                  text-label-md font-bold uppercase tracking-widest text-on-secondary
                  shadow-blood transition-all hover:opacity-90 active:scale-[0.98]
                "
              >
                Visit Store
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
