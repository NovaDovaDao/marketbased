import Footer from "@/components/Footer/Footer"
import Header from "@/components/Header/Header"
import { NotificationListener } from "@/components/NotificationListener/NotificationListener"
import "@/styles/tailwind.css"
import { type Metadata, type Viewport } from "next"
import { Newsreader } from "next/font/google"

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  preload: true,
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://marketbased.vercel.app"),
  title: {
    template: "%s | Market Base",
    default: "Market Base — Ancient Market of Sanctuary",
  },
  description:
    "A peer-to-peer marketplace for Diablo II items, runes, and runewords. Buy, sell, and trade with other players securely.",
  keywords: ["Diablo II", "D2R", "runes", "items", "trading", "marketplace", "buy", "sell", "trade"],
  authors: [{ name: "Market Base" }],
  creator: "Market Base",
  openGraph: {
    siteName: "Market Base",
    locale: "en_US",
    type: "website",
    title: "Market Base — Ancient Market of Sanctuary",
    description:
      "A peer-to-peer marketplace for Diablo II items, runes, and runewords. Buy, sell, and trade with other players securely.",
    url: "https://marketbased.vercel.app",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Market Base — Diablo II Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@marketbased",
    title: "Market Base — Ancient Market of Sanctuary",
    description:
      "A peer-to-peer marketplace for Diablo II items, runes, and runewords. Buy, sell, and trade with other players securely.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={newsreader.variable}>
      <body className="min-h-screen bg-surface text-on-surface-variant antialiased">
        <Header />
        {children}
        <Footer />
        <NotificationListener />
      </body>
    </html>
  )
}
