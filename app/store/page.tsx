import { auth } from "@/app/utils/auth"
import { SpaceDustStore } from "@/components/SpaceDustStore/SpaceDustStore"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Buy Space Dust",
  description: "Top up your Space Dust balance with card, PayPal, or crypto.",
  robots: { index: false, follow: false },
}

export default async function StorePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-surface">
      <SpaceDustStore />
    </main>
  )
}
