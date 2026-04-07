import LoginPage from "@/components/LoginPage/LoginPage"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to Market Base with Discord or email to start trading Diablo II items and runes.",
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LoginPage />
}
