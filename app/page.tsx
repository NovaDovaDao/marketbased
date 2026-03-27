import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Market Base — Ancient Market of Sanctuary",
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
      aria-label="Market Base — landing"
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
        {/* Headline */}
        <h1
          className="text-display-xl mb-6 font-headline font-extrabold italic text-secondary text-glow-gold"
          style={{ lineHeight: 0.92 }}
        >
          Market Base<br />
        </h1>

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
    </main>
  )
}

