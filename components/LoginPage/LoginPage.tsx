"use client"

import { useState } from "react"
import { authClient } from "@/app/utils/auth-client"

type Step = "idle" | "email-otp"
type Status = { type: "error" | "info"; message: string } | null

export default function LoginPage() {
  const [step, setStep] = useState<Step>("idle")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>(null)

  function setError(message: string) {
    setStatus({ type: "error", message })
  }
  function setInfo(message: string) {
    setStatus({ type: "info", message })
  }

  // ── Discord ──────────────────────────────────────────────────
  async function handleDiscord() {
    setLoading("discord")
    setStatus(null)
    await authClient.signIn.social({ provider: "discord", callbackURL: "/" })
  }

  // ── Email OTP ─────────────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading("email")
    setStatus(null)

    const result = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    })

    setLoading(null)

    if (result.error) {
      setError(result.error.message ?? "Failed to send code.")
    } else {
      setInfo("Check your inbox — a sign-in code is on its way.")
      setStep("email-otp")
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!otp) return
    setLoading("otp")
    setStatus(null)

    const result = await authClient.signIn.emailOtp({
      email,
      otp,
    })

    setLoading(null)

    if (result.error) {
      setError(result.error.message ?? "Invalid code.")
    } else {
      window.location.href = "/"
    }
  }

  const isLoading = loading !== null

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 pt-20 pb-12">
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(140,0,0,0.07) 0%, transparent 55%)",
        }}
      />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-label-sm uppercase tracking-[0.2em] text-secondary/60">
            Market Base
          </p>
          <h1 className="mt-2 font-headline text-3xl font-bold text-on-surface">
            Sign in
          </h1>
          <p className="mt-1.5 text-body-sm text-on-surface-variant/50">
            New here? An account is created automatically.
          </p>
        </div>

        {/* Status message */}
        {status && (
          <div
            className={[
              "mb-6 rounded border px-4 py-3 text-sm",
              status.type === "error"
                ? "border-red-900/50 bg-red-950/30 text-red-400"
                : "border-secondary/30 bg-secondary/5 text-secondary/80",
            ].join(" ")}
          >
            {status.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* ── Discord ── */}
          <button
            onClick={handleDiscord}
            disabled={isLoading}
            className="flex w-full items-center gap-3 rounded border border-outline-variant/30 bg-surface-container-high px-5 py-3.5 text-sm font-medium text-on-surface transition-colors hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DiscordIcon />
            <span className="flex-1 text-left">Continue with Discord</span>
            {loading === "discord" && <Spinner />}
          </button>

          {/* ── Divider ── */}
          <div className="relative my-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/20" />
            <span className="text-label-sm text-on-surface-variant/30">or</span>
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>

          {/* ── Email OTP ── */}
          {step === "idle" ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded border border-outline-variant/30 bg-surface-container-high px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-secondary/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="flex w-full items-center justify-center gap-2 rounded border border-outline-variant/30 bg-surface-container-high px-5 py-3.5 text-sm font-medium text-on-surface transition-colors hover:border-secondary/50 hover:bg-secondary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "email" ? (
                  <Spinner />
                ) : (
                  <>
                    <EmailIcon />
                    Send sign-in code
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
              <p className="text-label-sm text-on-surface-variant/60">
                Sent to <span className="text-secondary/80">{email}</span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                autoFocus
                className="w-full rounded border border-outline-variant/30 bg-surface-container-high px-4 py-3 text-center text-lg font-mono tracking-[0.4em] text-on-surface placeholder:text-on-surface-variant/20 focus:border-secondary/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded border border-secondary/40 px-5 py-3.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "otp" ? <Spinner /> : "Verify & sign in"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("idle"); setOtp(""); setStatus(null) }}
                className="text-label-sm text-on-surface-variant/40 hover:text-on-surface-variant/70 transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

// ── Icons ────────────────────────────────────────────────────────

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#5865F2]">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant/50">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current opacity-60"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
