import { type Metadata } from "next"
import LoginPage from "@/components/LoginPage/LoginPage"

export const metadata: Metadata = {
  title: "Sign in — Market Base",
}

export default function Page() {
  return <LoginPage />
}
