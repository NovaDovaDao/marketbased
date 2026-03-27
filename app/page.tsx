import { Button } from "@/components/Button/Button"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Next.js Enterprise Boilerplate",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://next-enterprise.vercel.app/",
    images: [
      {
        width: 1200,
        height: 630,
        url: "https://raw.githubusercontent.com/Blazity/next-enterprise/main/.github/assets/project-logo.png",
      },
    ],
  },
}

export default function Web() {
  return (
    <main className="min-h-screen bg-surface text-on-surface-variant font-newsreader">
      <header className="mx-auto max-w-3xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">Marketbased</div>
          <nav className="space-x-4">
            <a className="text-sm text-on-surface-variant/80" href="#">Browse</a>
            <a className="text-sm text-on-surface-variant/80" href="#">Sell</a>
            <a className="text-sm text-on-surface-variant/80" href="#">Trade</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 w-full max-w-2xl text-3xl leading-tight font-semibold tracking-[-0.02em] sm:text-4xl md:text-5xl">
          Buy, sell, and trade rare games from collectors worldwide
        </h1>
        <p className="mb-6 max-w-xl text-base text-on-surface-variant/85 md:text-lg">
          A secure peer-to-peer marketplace with curated listings, condition grading, and atomic two-party trades.
        </p>
        <div className="flex gap-3">
          <Button href="/listings" className="mr-3">Browse Listings</Button>
          <Button href="/create" intent="secondary">Create Listing</Button>
        </div>
      </section>
    </main>
  )
}
