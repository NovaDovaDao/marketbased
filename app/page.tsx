import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Obsidian Vault — Ancient Market of Sanctuary",
  description: "A digital sanctum for peer-to-peer game item trading. Carved from the void, secured by the ledger.",
  twitter: { card: "summary_large_image" },
  openGraph: {
    url: "https://marketbased.vercel.app/",
  },
}

export default function Web() {
  return (
    <main
      className="relative flex h-screen flex-col overflow-hidden"
      aria-label="Obsidian Vault — landing"
    >
      {/* Ambient blood glow — top-right */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[55vh] w-[50vw]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 85% 10%, rgba(140,0,0,0.09) 0%, transparent 60%)",
        }}
      />
      {/* Ambient gold whisper — bottom-left */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[40vh] w-[40vw]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 10% 90%, rgba(247,189,72,0.04) 0%, transparent 60%)",
        }}
      />

      {/* ── Content: vertically centered, left-aligned per design system ── */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 md:px-8">
        {/* Eyebrow */}
        <p className="text-label-md mb-5 text-secondary">The Sovereign Protocol</p>

        {/* Headline */}
        <h1
          className="text-display-xl mb-6 font-headline font-extrabold italic text-secondary text-glow-gold"
          style={{ lineHeight: 0.92 }}
        >
          The Ancient<br />
          <span className="text-on-surface" style={{ fontStyle: "normal" }}>
            Market of
          </span>
          <br />
          Sanctuary
        </h1>

        {/* Sub-copy */}
        <p className="mb-10 max-w-lg font-body text-base italic text-on-surface-variant/60 leading-relaxed">
          A digital vault for P2P game item trading. No intermediaries. Every exchange etched in the ledger forever.
        </p>

        {/* Search */}
        <div className="mb-8 w-full max-w-lg">
          <label className="relative flex items-center" htmlFor="hero-search">
            <span
              className="absolute left-4 flex items-center text-on-surface-variant/40"
              aria-hidden="true"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              id="hero-search"
              type="search"
              placeholder="Search items, runes, currency…"
              className="
                w-full min-h-12 py-3 pl-11 pr-20
                bg-surface-container-lowest socket-shadow
                font-body text-sm text-on-surface-variant
                placeholder:text-on-surface-variant/35
                border-b border-secondary/20
                transition-colors focus:outline-none focus:border-secondary/55
                focus:bg-surface-bright
              "
              aria-label="Search game listings"
            />
            <button
              type="submit"
              className="
                absolute right-0 top-0 h-full px-5
                blood-gradient text-label-sm font-bold text-on-secondary
                uppercase tracking-widest transition-opacity hover:opacity-90
                min-w-11
              "
              aria-label="Search"
            >
              Search
            </button>
          </label>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="/runes"
            className="
              inline-flex min-h-12 min-w-11
              items-center justify-center border border-secondary/40 px-9 py-3.5
              text-label-md font-bold uppercase tracking-widest text-secondary
              transition-all hover:bg-secondary/5 hover:border-secondary/70
            "
          >
            Browse Runes
          </a>
        </div>
      </div>

      {/* Stats bar pinned at the bottom */}
      <div className="border-t border-outline-variant/15 bg-surface-container-lowest/60">
        <div className="mx-auto flex max-w-3xl items-center gap-10 px-5 py-4 md:px-8">
          {[
            { label: "Items Listed", value: "12,440" },
            { label: "Active Trades", value: "3,210" },
            { label: "Volume (24h)", value: "1,402 G" },
          ].map(({ label, value }) => (
            <div key={label} className="shrink-0">
              <p className="text-label-sm text-on-surface-variant/35">{label}</p>
              <p className="font-headline text-base font-semibold text-secondary">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

