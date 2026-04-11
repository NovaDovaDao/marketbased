"use client"

import { GlowButton } from "@/components/GlowButton/GlowButton"
import { pricing, type PricingTier } from "@/lib/pricing"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import * as Tabs from "@radix-ui/react-tabs"
import { loadStripe } from "@stripe/stripe-js"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useRef, useState } from "react"

// ---------------------------------------------------------------------------
// Featured packages — 4 named tiers pulled from pricing
// ---------------------------------------------------------------------------

type Theme = "bronze" | "silver" | "gold" | "diamond"

type FeaturedPackage = {
  tier: PricingTier
  name: string
  theme: Theme
  best?: boolean
}

const BASE_RATE = (pricing[0]?.spaceDust ?? 290) / (pricing[0]?.usd ?? 10)

function bonusPercent(tier: PricingTier): number {
  return Math.round(((tier.spaceDust / tier.usd - BASE_RATE) / BASE_RATE) * 100)
}

// Pick 4 representative tiers: $10, $30, $50, $100
const FEATURED: FeaturedPackage[] = [
  { tier: pricing[0]!, name: "Bronze Pack", theme: "bronze" },
  { tier: pricing[2]!, name: "Silver Pack", theme: "silver" },
  { tier: pricing[4]!, name: "Gold Pack", theme: "gold" },
  { tier: pricing[9]!, name: "Diamond Pack", theme: "diamond", best: true },
]

// ---------------------------------------------------------------------------
// Theme tokens
// ---------------------------------------------------------------------------

const THEME_TOKENS: Record<
  Theme,
  { cardBg: string; orbTop: string; orbMid: string; orbGlow: string; accent: string; borderColor: string }
> = {
  bronze: {
    cardBg: "linear-gradient(160deg, #1e1408 0%, #120e06 60%, #0e0b05 100%)",
    orbTop: "#7ecfcf",
    orbMid: "#3a9898",
    orbGlow: "rgba(126,207,207,0.55)",
    accent: "#7ecfcf",
    borderColor: "rgba(126,207,207,0.22)",
  },
  silver: {
    cardBg: "linear-gradient(160deg, #131318 0%, #0d0d12 60%, #080810 100%)",
    orbTop: "#c4c8d4",
    orbMid: "#7a7f8e",
    orbGlow: "rgba(196,200,212,0.50)",
    accent: "#c4c8d4",
    borderColor: "rgba(196,200,212,0.18)",
  },
  gold: {
    cardBg: "linear-gradient(160deg, #1a0c06 0%, #110806 60%, #0c0605 100%)",
    orbTop: "#e24634",
    orbMid: "#8f1c0f",
    orbGlow: "rgba(226,70,52,0.60)",
    accent: "#f7bd48",
    borderColor: "rgba(247,189,72,0.28)",
  },
  diamond: {
    cardBg: "linear-gradient(160deg, #150d20 0%, #0d0813 60%, #08060f 100%)",
    orbTop: "#a855f7",
    orbMid: "#5b21b6",
    orbGlow: "rgba(168,85,247,0.60)",
    accent: "#d8b4fe",
    borderColor: "rgba(168,85,247,0.30)",
  },
}

// ---------------------------------------------------------------------------
// OrbIcon
// ---------------------------------------------------------------------------

function OrbIcon({ theme, size = 80 }: { theme: Theme; size?: number }) {
  const t = THEME_TOKENS[theme]
  const id = `orb-${theme}`
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden>
      <defs>
        <radialGradient id={`${id}-grad`} cx="38%" cy="30%" r="60%">
          <stop offset="0%" stopColor={t.orbTop} />
          <stop offset="55%" stopColor={t.orbMid} />
          <stop offset="100%" stopColor="#0a0608" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="30%" cy="22%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {/* Glow halo */}
      <circle cx="40" cy="40" r="36" fill={t.orbGlow} filter={`url(#${id}-blur)`} opacity="0.7" />
      {/* Main sphere */}
      <circle cx="40" cy="40" r="30" fill={`url(#${id}-grad)`} />
      {/* Shine highlight */}
      <circle cx="40" cy="40" r="30" fill={`url(#${id}-shine)`} />
      {/* Inner coin / emblem */}
      {theme === "bronze" && (
        <>
          <circle cx="40" cy="40" r="12" fill="none" stroke="rgba(126,207,207,0.55)" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="7" fill="rgba(126,207,207,0.18)" />
          <circle cx="40" cy="40" r="4" fill="rgba(126,207,207,0.35)" />
        </>
      )}
      {theme === "silver" && (
        <>
          <circle cx="40" cy="40" r="12" fill="none" stroke="rgba(196,200,212,0.50)" strokeWidth="1.5" />
          <path d="M40 29 L43 37 L52 37 L45 42 L47 51 L40 46 L33 51 L35 42 L28 37 L37 37 Z"
            fill="rgba(196,200,212,0.30)" />
        </>
      )}
      {theme === "gold" && (
        <>
          <circle cx="40" cy="40" r="12" fill="none" stroke="rgba(247,189,72,0.55)" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="7" fill="rgba(247,189,72,0.15)" />
          <text x="40" y="44" textAnchor="middle" fill="rgba(247,189,72,0.70)" fontSize="10" fontWeight="bold">★</text>
        </>
      )}
      {theme === "diamond" && (
        <>
          <circle cx="40" cy="40" r="12" fill="none" stroke="rgba(168,85,247,0.55)" strokeWidth="1.5" />
          <path d="M40 29 L47 37 L40 51 L33 37 Z" fill="rgba(168,85,247,0.25)" />
          <path d="M40 29 L47 37 L33 37 Z" fill="rgba(216,180,254,0.30)" />
        </>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// PackageCard
// ---------------------------------------------------------------------------

function PackageCard({
  pkg,
  onOrder,
}: {
  pkg: FeaturedPackage
  onOrder: () => void
}) {
  const t = THEME_TOKENS[pkg.theme]
  const bonus = bonusPercent(pkg.tier)

  return (
    <div
      className="relative flex flex-col items-center overflow-hidden"
      style={{
        background: t.cardBg,
        border: `1px solid ${t.borderColor}`,
        boxShadow: `0 4px 40px ${t.orbGlow.replace("0.6", "0.15")}, 0 0 0 1px rgba(255,255,255,0.04)`,
        borderRadius: "4px",
        minWidth: 0,
      }}
    >
      {/* Best Offer ribbon */}
      {pkg.best && (
        <div
          className="absolute right-0 top-0 flex items-center justify-center"
          style={{ zIndex: 10 }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
              padding: "3px 10px 3px 8px",
              fontSize: "9px",
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#fff",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%)",
            }}
          >
            BEST<br />OFFER
          </div>
        </div>
      )}

      {/* Bonus badge */}
      {bonus > 0 && (
        <div
          className="absolute top-3 left-3"
          style={{
            background: "rgba(247,189,72,0.15)",
            border: "1px solid rgba(247,189,72,0.40)",
            borderRadius: "3px",
            padding: "2px 7px",
            fontSize: "9px",
            fontWeight: 800,
            color: "#f7bd48",
            letterSpacing: "0.06em",
          }}
        >
          +{bonus}% BONUS
        </div>
      )}

      {/* Orb */}
      <div className="mt-8 mb-4">
        <OrbIcon theme={pkg.theme} size={80} />
      </div>

      {/* Pack name — script style using italic serif */}
      <div
        className="text-center px-4 mb-1"
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "20px",
          lineHeight: 1.1,
          color: t.accent,
          textShadow: `0 0 18px ${t.orbGlow}`,
          letterSpacing: "0.01em",
        }}
      >
        {pkg.name.split(" ")[0]}
        <br />
        <span style={{ fontSize: "17px", opacity: 0.85 }}>{pkg.name.split(" ")[1]}</span>
      </div>

      {/* Divider */}
      <div
        className="my-3 w-16 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`, opacity: 0.4 }}
      />

      {/* Space Dust amount */}
      <div
        className="text-center px-3 mb-1"
        style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em" }}
      >
        {pkg.tier.spaceDust.toLocaleString()}{" "}
        <span style={{ color: t.accent, fontWeight: 500 }}>SD</span>
      </div>

      {/* USD price */}
      <div
        className="text-center px-3 mb-6"
        style={{ fontSize: "11px", color: "rgba(196,199,199,0.45)" }}
      >
        ${pkg.tier.usd} USD
      </div>

      {/* Order Now button */}
      <button
        type="button"
        onClick={onOrder}
        className="mb-5 mx-4 w-[calc(100%-2rem)] py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${t.borderColor}`,
          color: t.accent,
          borderRadius: "3px",
          letterSpacing: "0.14em",
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = t.orbGlow.replace("0.6", "0.18").replace("0.55", "0.18").replace("0.50", "0.18")
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = t.accent
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = t.borderColor
        }}
      >
        Order Now
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConfirmBanner
// ---------------------------------------------------------------------------

function ConfirmBanner({ spaceDust }: { spaceDust: number }) {
  return (
    <div
      className="relative overflow-hidden px-8 py-16 text-center"
      style={{
        background: "var(--surface-container)",
        border: "1px solid rgba(247,189,72,0.22)",
        boxShadow: "0 0 60px rgba(247,189,72,0.07), inset 0 0 40px rgba(0,0,0,0.4)",
        borderRadius: "4px",
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2"
        style={{ borderColor: "rgba(247,189,72,0.55)" }}
      />
      <span
        aria-hidden
        className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2"
        style={{ borderColor: "rgba(247,189,72,0.55)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(247,189,72,0.07) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div>
          <p
            className="font-headline text-2xl font-extrabold italic leading-none"
            style={{ color: "#f7bd48" }}
          >
            Granted
          </p>
          <p
            className="mt-2 text-sm italic"
            style={{ color: "rgba(196,199,199,0.50)" }}
          >
            The dust has been inscribed to your vault
          </p>
        </div>
        <div
          className="px-6 py-4"
          style={{
            background: "var(--surface-container-high)",
            border: "1px solid rgba(247,189,72,0.15)",
          }}
        >
          <span
            className="text-4xl font-black italic leading-none"
            style={{ color: "#f7bd48" }}
          >
            +{spaceDust.toLocaleString()}
          </span>
          <span className="ml-2 text-sm" style={{ color: "rgba(247,189,72,0.50)" }}>
            Space Dust
          </span>
        </div>
        <p className="text-xs" style={{ color: "rgba(196,199,199,0.22)" }}>
          Transaction sealed
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StripeTab
// ---------------------------------------------------------------------------

type PurchaseStatus = "idle" | "loading" | "pending" | "confirmed" | "error"
type TabMethod = "stripe" | "paypal" | "base"

function StripeTab({ tier }: { tier: PricingTier }) {
  const [status, setStatus] = useState<PurchaseStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    setStatus("loading")
    setError(null)
    try {
      const res = await fetch("/api/payments/stripe/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usdAmount: tier.usd }),
      })
      const data = (await res.json()) as { sessionUrl?: string; error?: string }
      if (!res.ok || !data.sessionUrl) {
        throw new Error(data.error ?? "Failed to create session")
      }
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "")
      if (!stripe) throw new Error("Stripe failed to load")
      window.location.href = data.sessionUrl
    } catch (err: unknown) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs italic" style={{ color: "rgba(196,199,199,0.45)" }}>
        Secure card payment via Stripe. You will be redirected to complete the transaction.
      </p>
      {error && (
        <p
          className="px-3 py-2 text-xs"
          style={{
            color: "var(--error)",
            background: "rgba(146,0,10,0.20)",
            border: "1px solid rgba(255,180,168,0.18)",
          }}
        >
          {error}
        </p>
      )}
      <GlowButton
        variant="stripe"
        disabled={status === "loading"}
        onClick={() => void handlePay()}
      >
        {status === "loading" ? "Redirecting…" : `Pay $${tier.usd} with Card`}
      </GlowButton>
      <div
        className="flex items-center justify-center gap-4 text-xs"
        style={{ color: "rgba(196,199,199,0.20)" }}
      >
        <span>256-bit SSL</span>
        <span className="h-2.5 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <span>Stripe Secure</span>
        <span className="h-2.5 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <span>Instant delivery</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PayPalTab
// ---------------------------------------------------------------------------

function PayPalTab({
  tier,
  onConfirmed,
}: {
  tier: PricingTier
  onConfirmed: (spaceDust: number) => void
}) {
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs italic" style={{ color: "rgba(196,199,199,0.45)" }}>
        Pay with your PayPal account or credit/debit card.
      </p>
      {error && (
        <p
          className="px-3 py-2 text-xs"
          style={{
            color: "var(--error)",
            background: "rgba(146,0,10,0.20)",
            border: "1px solid rgba(255,180,168,0.18)",
          }}
        >
          {error}
        </p>
      )}
      <PayPalScriptProvider options={{ clientId, currency: "USD" }}>
        <PayPalButtons
          style={{ layout: "vertical", label: "pay" }}
          createOrder={async () => {
            const res = await fetch("/api/payments/paypal/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ usdAmount: tier.usd }),
            })
            const data = (await res.json()) as {
              orderId: string
              purchaseId: string
              error?: string
            }
            if (!res.ok) throw new Error(data.error ?? "Order creation failed")
            setPurchaseId(data.purchaseId)
            return data.orderId
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/payments/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID, purchaseId }),
            })
            const json = (await res.json()) as { success?: boolean; error?: string }
            if (!res.ok || !json.success) {
              setError(json.error ?? "Capture failed")
              return
            }
            onConfirmed(tier.spaceDust)
          }}
          onError={(err) => {
            console.error("[PayPal] error:", err)
            setError("PayPal encountered an error. Please try again.")
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BaseTab
// ---------------------------------------------------------------------------

type BasePaymentState = {
  purchaseId: string
  receivingAddress: string
  usdcAmountFormatted: string
}

function BaseTab({
  tier,
  onConfirmed,
}: {
  tier: PricingTier
  onConfirmed: (spaceDust: number) => void
}) {
  const [step, setStep] = useState<"setup" | "waiting">("setup")
  const [baseState, setBaseState] = useState<BasePaymentState | null>(null)
  const [status, setStatus] = useState<PurchaseStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleCreate = async () => {
    setStatus("loading")
    setError(null)
    try {
      const res = await fetch("/api/payments/base/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usdAmount: tier.usd }),
      })
      const data = (await res.json()) as BasePaymentState & { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to create payment")
      setBaseState(data)
      setStep("waiting")
      setStatus("pending")
    } catch (err: unknown) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  useEffect(() => {
    if (step !== "waiting" || !baseState) return
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/base/status?purchaseId=${baseState.purchaseId}`)
        if (!res.ok) return
        const data = (await res.json()) as { status: string }
        if (data.status === "completed") {
          if (pollRef.current) clearInterval(pollRef.current)
          onConfirmed(tier.spaceDust)
        }
      } catch {
        // ignore transient errors
      }
    }
    void checkStatus()
    pollRef.current = setInterval(() => void checkStatus(), 15_000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [step, baseState, tier, onConfirmed])

  if (step === "setup") {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="px-4 py-3 text-xs leading-relaxed"
          style={{
            background: "rgba(247,189,72,0.04)",
            border: "1px solid rgba(247,189,72,0.12)",
            color: "rgba(247,189,72,0.75)",
          }}
        >
          <span className="font-bold">Cheapest fees</span>
          {" — send USDC on Base mainnet. No middlemen, no conversion costs."}
        </div>
        <div className="grid grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="bg-surface-container p-3">
            <div className="mb-1 text-xs" style={{ color: "rgba(196,199,199,0.35)" }}>Amount</div>
            <div className="font-mono text-sm font-bold" style={{ color: "var(--on-surface)" }}>
              {tier.usd}.000000 <span style={{ color: "#f7bd48" }}>USDC</span>
            </div>
          </div>
          <div className="bg-surface-container p-3">
            <div className="mb-1 text-xs" style={{ color: "rgba(196,199,199,0.35)" }}>Network</div>
            <div className="text-sm font-bold" style={{ color: "var(--on-surface)" }}>
              Base <span style={{ color: "#f7bd48" }}>Mainnet</span>
            </div>
          </div>
        </div>
        {error && (
          <p
            className="px-3 py-2 text-xs"
            style={{
              color: "var(--error)",
              background: "rgba(146,0,10,0.20)",
              border: "1px solid rgba(255,180,168,0.18)",
            }}
          >
            {error}
          </p>
        )}
        <GlowButton
          variant="base"
          disabled={status === "loading"}
          onClick={() => void handleCreate()}
        >
          {status === "loading" ? "Generating address…" : "Generate Payment Address"}
        </GlowButton>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="px-4 py-3 text-xs leading-relaxed"
        style={{
          background: "rgba(247,189,72,0.03)",
          border: "1px solid rgba(247,189,72,0.10)",
          color: "rgba(196,199,199,0.65)",
        }}
      >
        Send exactly{" "}
        <span className="font-mono font-bold" style={{ color: "var(--on-surface)" }}>
          {tier.usd}.000000 USDC
        </span>{" "}
        on Base mainnet. Space Dust will be credited automatically upon confirmation.
      </div>
      <div className="flex flex-col items-center gap-3">
        {baseState && (
          <div className="p-3" style={{ background: "#fff", border: "1px solid rgba(247,189,72,0.30)" }}>
            <QRCodeSVG value={baseState.receivingAddress} size={148} />
          </div>
        )}
        <div
          className="w-full break-all px-3 py-2 text-center font-mono text-xs"
          style={{
            background: "var(--surface-container-lowest)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(196,199,199,0.75)",
          }}
        >
          {baseState?.receivingAddress}
        </div>
        <button
          type="button"
          onClick={() =>
            baseState && void navigator.clipboard.writeText(baseState.receivingAddress)
          }
          className="text-xs transition-colors duration-200"
          style={{ color: "rgba(247,189,72,0.65)" }}
        >
          Copy address
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(196,199,199,0.35)" }}>
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "#f7bd48", animation: "pulse 2s ease-in-out infinite" }}
        />
        <span>Awaiting on-chain confirmation…</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PaymentPanel — shown after selecting a package
// ---------------------------------------------------------------------------

const TABS = [
  { value: "stripe", label: "Card" },
  { value: "paypal", label: "PayPal" },
  { value: "base", label: "Crypto" },
] as const

function PaymentPanel({
  pkg,
  onConfirmed,
  onClose,
}: {
  pkg: FeaturedPackage
  onConfirmed: (spaceDust: number) => void
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<TabMethod>("stripe")
  const t = THEME_TOKENS[pkg.theme]

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "var(--surface-container)",
        border: `1px solid ${t.borderColor}`,
        borderRadius: "4px",
        boxShadow: `0 8px 60px ${t.orbGlow.replace("0.6", "0.08").replace("0.55", "0.08").replace("0.50", "0.08")}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <OrbIcon theme={pkg.theme} size={32} />
          <div>
            <div className="text-sm font-bold" style={{ color: t.accent }}>
              {pkg.name}
            </div>
            <div className="text-xs" style={{ color: "rgba(196,199,199,0.40)" }}>
              {pkg.tier.spaceDust.toLocaleString()} SD · ${pkg.tier.usd}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs transition-opacity duration-200 hover:opacity-100"
          style={{ color: "rgba(196,199,199,0.30)" }}
          aria-label="Change package"
        >
          ✕ Change
        </button>
      </div>

      {/* Tab bar */}
      <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as TabMethod)}>
        <Tabs.List className="flex" style={{ background: "var(--surface-container-low)" }}>
          {TABS.map(({ value, label }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="relative flex-1 py-3 text-xs transition-colors duration-200 focus-visible:outline-none"
              style={{
                color: activeTab === value ? t.accent : "rgba(196,199,199,0.32)",
                background: activeTab === value ? "var(--surface-container)" : "transparent",
                fontWeight: activeTab === value ? 700 : 400,
              }}
            >
              {label}
              {activeTab === value && (
                <span
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: t.accent, opacity: 0.7 }}
                  aria-hidden
                />
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="p-5">
          <Tabs.Content value="stripe">
            <StripeTab tier={pkg.tier} />
          </Tabs.Content>
          <Tabs.Content value="paypal">
            <PayPalTab tier={pkg.tier} onConfirmed={onConfirmed} />
          </Tabs.Content>
          <Tabs.Content value="base">
            <BaseTab tier={pkg.tier} onConfirmed={onConfirmed} />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SpaceDustStore() {
  const [selectedPkg, setSelectedPkg] = useState<FeaturedPackage | null>(null)
  const [confirmed, setConfirmed] = useState<{ spaceDust: number } | null>(null)
  const paymentRef = useRef<HTMLDivElement>(null)

  function handleOrder(pkg: FeaturedPackage) {
    setSelectedPkg(pkg)
    // Scroll to payment panel after a tick
    setTimeout(() => {
      paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, 50)
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      {/* Subtle radial backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(247,189,72,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(168,85,247,0.04) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-14 md:px-8">

        {/* Page heading */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: "rgba(247,189,72,0.40)" }}>
            Space Dust
          </p>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: "rgba(255,255,255,0.90)" }}
          >
            Packages
          </h1>
          <div
            className="mx-auto mt-4 h-px w-24"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(247,189,72,0.45), transparent)",
            }}
            aria-hidden
          />
        </div>

        {confirmed ? (
          <ConfirmBanner spaceDust={confirmed.spaceDust} />
        ) : (
          <div className="flex flex-col gap-8">

            {/* Package cards row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {FEATURED.map((pkg) => (
                <PackageCard
                  key={pkg.tier.usd}
                  pkg={pkg}
                  onOrder={() => handleOrder(pkg)}
                />
              ))}
            </div>

            {/* Payment panel — slides in when a package is selected */}
            {selectedPkg && (
              <div ref={paymentRef}>
                <PaymentPanel
                  pkg={selectedPkg}
                  onConfirmed={(sd) => setConfirmed({ spaceDust: sd })}
                  onClose={() => setSelectedPkg(null)}
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
