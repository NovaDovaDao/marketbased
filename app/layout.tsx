import Footer from "@/components/Footer/Footer"
import Header from "@/components/Header/Header"
import { NotificationListener } from "@/components/NotificationListener/NotificationListener"
import "@/styles/tailwind.css"
import { Newsreader } from "next/font/google"

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  preload: true,
})

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
