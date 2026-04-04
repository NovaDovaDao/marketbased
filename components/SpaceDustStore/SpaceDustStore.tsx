"use client"

import { GlowButton } from "@/components/GlowButton/GlowButton"
import { pricing, type PricingTier } from "@/lib/pricing"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import * as Tabs from "@radix-ui/react-tabs"
import { loadStripe } from "@stripe/stripe-js"
import { cva } from "class-variance-authority"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

// ---------------------------------------------------------------------------
// Deterministic star field — gold & amber constellation, SSR-safe
// ---------------------------------------------------------------------------

const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: ((i * 137.508) % 100).toFixed(2),
  y: ((i * 97.619) % 100).toFixed(2),
  size: i % 11 === 0 ? 2.5 : i % 5 === 0 ? 1.5 : 1,
  delay: ((i * 0.41) % 8).toFixed(2),
  duration: (8 + (i % 10)).toFixed(1),
  opacity: 0.07 + (i % 5) * 0.055,
  color:
    i % 9 === 0
      ? "#f7bd48"
      : i % 6 === 0
        ? "#e24634"
        : i % 3 === 0
          ? "#bb880f"
          : "rgba(247,189,72,0.35)",
}))

// ---------------------------------------------------------------------------
// Best value + bonus calculations
// ---------------------------------------------------------------------------

const BASE_RATE = (pricing[0]?.spaceDust ?? 290) / (pricing[0]?.usd ?? 10)

const bestValueUsd = pricing.reduce<number>((best, t) => {
  const ratio = t.spaceDust / t.usd
  const bestRatio = (pricing.find((p) => p.usd === best)?.spaceDust ?? 0) / best
  return ratio > bestRatio ? t.usd : best
}, pricing[0]?.usd ?? 10)

function bonusPercent(tier: PricingTier): number {
  return Math.round(((tier.spaceDust / tier.usd - BASE_RATE) / BASE_RATE) * 100)
}

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const tierCard = cva(
  [
    "group relative cursor-pointer text-left overflow-hidden",
    "bg-surface-container",
    "transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  {
    variants: {
      selected: {
        true: "bg-surface-container-high",
        false: "hover:bg-surface-container-low",
      },
      highlighted: { true: "", false: "" },
    },
    defaultVariants: { selected: false, highlighted: false },
  },
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PurchaseStatus = "idle" | "loading" | "pending" | "confirmed" | "error"
type TabMethod = "stripe" | "paypal" | "base"

type BasePaymentState = {
  purchaseId: string
  receivingAddress: string
  usdcAmountFormatted: string
}

// ---------------------------------------------------------------------------
// Forge orbs — amber/gold nebula, matches design system palette
// ---------------------------------------------------------------------------

function ForgeOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gold forge — top-left quadrant */}
      <div
        className="animate-nebula-drift absolute -top-1/2 -left-1/4 h-[120vmax] w-[100vmax] opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(247,189,72,0.65) 0%, rgba(187,136,15,0.28) 35%, transparent 65%)",
        }}
      />
      {/* Blood ember — bottom-right */}
      <div
        className="absolute -bottom-1/3 -right-1/3 h-[90vmax] w-[90vmax] opacity-[0.06]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(226,70,52,0.4) 0%, rgba(146,6,3,0.18) 40%, transparent 68%)",
          animation: "nebula-drift 28s ease-in-out infinite reverse",
        }}
      />
      {/* Amber thread — upper right */}
      <div
        className="absolute -top-1/4 -right-1/4 h-[60vmax] w-[60vmax] opacity-[0.04]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(247,189,72,0.5) 0%, transparent 65%)",
          animation: "nebula-drift 34s ease-in-out infinite 6s",
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// StarField — gold constellation, CSS-animated
// ---------------------------------------------------------------------------

function StarField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((star, i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            background: star.color,
            boxShadow:
              star.size > 1.4 ? `0 0 ${star.size * 3}px ${star.color}` : "none",
            animation: `star-drift ${star.duration}s linear ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PricingCard — stone-tablet aesthetic, gold on select
// ---------------------------------------------------------------------------

function PricingCard({
  tier,
  selected,
  onSelect,
}: {
  tier: PricingTier
  selected: boolean
  onSelect: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const highlighted = tier.usd === bestValueUsd
  const bonus = bonusPercent(tier)

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty("--tilt-x", `${(-y * 5).toFixed(1)}deg`)
    el.style.setProperty("--tilt-y", `${(x * 5).toFixed(1)}deg`)
  }

  function handleMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty("--tilt-x", "0deg")
    el.style.setProperty("--tilt-y", "0deg")
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={tierCard({ selected, highlighted })}
      style={{
        transform:
          "perspective(800px) rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg))",
        willChange: "transform",
        outline: selected
          ? "1px solid rgba(247,189,72,0.55)"
          : highlighted
            ? "1px solid rgba(247,189,72,0.20)"
            : "1px solid rgba(255,255,255,0.04)",
        boxShadow: selected
          ? "0 0 20px rgba(247,189,72,0.10), inset 0 0 14px rgba(247,189,72,0.04)"
          : "none",
      }}
    >
      {/* Top gold shimmer line — active or highlighted */}
      <span
        className="absolute inset-x-0 top-0 h-px transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(247,189,72,0.75), transparent)",
          opacity: selected ? 1 : highlighted ? 0.45 : 0,
        }}
        aria-hidden
      />

      {/* Best Value ribbon */}
      {highlighted && (
        <span
          className="animate-glow-pulse absolute -top-px left-0 right-0 flex justify-center"
          aria-label="Best value tier"
        >
          <span
            className="px-2.5 py-px text-[8px] font-black uppercase tracking-[0.18em]"
            style={{
              background: "linear-gradient(135deg, #f7bd48 0%, #bb880f 100%)",
              color: "#1a1000",
            }}
          >
            Best Value
          </span>
        </span>
      )}

      {/* Bonus % badge on standard tiers */}
      {bonus > 0 && !highlighted && (
        <span
          className="absolute right-2 top-2 text-[9px] font-bold tracking-tight"
          style={{ color: "rgba(247,189,72,0.60)" }}
        >
          +{bonus}%
        </span>
      )}

      {/* Card body */}
      <div
        className={twMerge(
          "flex flex-col gap-1 p-3.5",
          highlighted ? "mt-2.5" : "mt-0.5",
        )}
      >
        {/* USD price */}
        <div
          className="font-headline text-base font-extrabold italic leading-none tracking-editorial"
          style={{ color: selected ? "#f7bd48" : "var(--on-surface)" }}
        >
          ${tier.usd}
        </div>

        {/* Space Dust amount */}
        <div
          className="text-[11px]"
          style={{
            color: selected
              ? "rgba(247,189,72,0.72)"
              : "rgba(196,199,199,0.48)",
          }}
        >
          {tier.spaceDust.toLocaleString()}{" "}
          <span className="opacity-55">sd</span>
        </div>

        {/* Rate */}
        <div
          className="mt-0.5 font-mono text-[9px]"
          style={{ color: "rgba(255,255,255,0.18)" }}
        >
          {(tier.spaceDust / tier.usd).toFixed(0)}
          <span style={{ color: "rgba(247,189,72,0.28)" }}>/$ </span>
        </div>
      </div>

      {/* Selected: bottom gold energy thread */}
      {selected && (
        <div
          className="animate-energy-flow absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(247,189,72,0.85), transparent)",
          }}
        />
      )}

      {/* Hover corner brackets */}
      <span
        className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ borderColor: "rgba(247,189,72,0.40)" }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ borderColor: "rgba(247,189,72,0.40)" }}
        aria-hidden
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// PricingGrid
// ---------------------------------------------------------------------------

function PricingGrid({
  selected,
  onSelect,
}: {
  selected: PricingTier | null
  onSelect: (tier: PricingTier) => void
}) {
  return (
    <div
      className="grid grid-cols-3 sm:grid-cols-4"
      style={{ gap: "1px", background: "rgba(255,255,255,0.04)" }}
    >
      {pricing.map((tier) => (
        <PricingCard
          key={tier.usd}
          tier={tier}
          selected={selected?.usd === tier.usd}
          onSelect={() => onSelect(tier)}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConfirmBanner
// ---------------------------------------------------------------------------


function ConfirmBanner({ spaceDust }: { spaceDust: number }) {
  return (
    <div
      className="animate-success-burst relative overflow-hidden px-8 py-16 text-center"
      style={{
        background: "var(--surface-container)",
        outline: "1px solid rgba(247,189,72,0.22)",
        boxShadow:
          "0 0 60px rgba(247,189,72,0.07), inset 0 0 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Corner brackets */}
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

      {/* Radial glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(247,189,72,0.07) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Rune glyph */}
        <svg
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
          aria-hidden
          className="animate-torch-flicker opacity-75"
        >
          <rect x="21" y="2" width="2" height="40" fill="rgba(247,189,72,0.9)" />
          <rect x="2" y="21" width="40" height="2" fill="rgba(247,189,72,0.9)" />
          <rect x="8" y="8" width="2" height="9" fill="rgba(247,189,72,0.45)" />
          <rect x="8" y="8" width="9" height="2" fill="rgba(247,189,72,0.45)" />
          <rect x="34" y="8" width="2" height="9" fill="rgba(247,189,72,0.45)" />
          <rect x="27" y="8" width="9" height="2" fill="rgba(247,189,72,0.45)" />
          <rect x="8" y="27" width="2" height="9" fill="rgba(247,189,72,0.45)" />
          <rect x="8" y="34" width="9" height="2" fill="rgba(247,189,72,0.45)" />
          <rect x="34" y="27" width="2" height="9" fill="rgba(247,189,72,0.45)" />
          <rect x="27" y="34" width="9" height="2" fill="rgba(247,189,72,0.45)" />
        </svg>

        <div>
          <p
            className="font-headline text-2xl font-extrabold italic text-glow-gold leading-none tracking-editorial"
            style={{ color: "#f7bd48" }}
          >
            Granted
          </p>
          <p
            className="mt-2 font-newsreader italic text-sm"
            style={{ color: "rgba(196,199,199,0.50)" }}
          >
            The dust has been inscribed to your vault
          </p>
        </div>

        {/* Amount panel */}
        <div
          className="px-6 py-4"
          style={{
            background: "var(--surface-container-high)",
            outline: "1px solid rgba(247,189,72,0.15)",
          }}
        >
          <span
            className="font-headline text-4xl font-black italic text-glow-gold leading-none tracking-editorial"
            style={{ color: "#f7bd48" }}
          >
            +{spaceDust.toLocaleString()}
          </span>
          <span
            className="ml-2 text-label-md"
            style={{ color: "rgba(247,189,72,0.50)" }}
          >
            Space Dust
          </span>
        </div>

        {/* Ruled separator */}
        <span
          className="h-px w-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(247,189,72,0.35), transparent)",
          }}
          aria-hidden
        />

        <p className="text-label-sm" style={{ color: "rgba(196,199,199,0.22)" }}>
          Transaction sealed
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StripeTab
// ---------------------------------------------------------------------------

function StripeTab({ tier }: { tier: PricingTier | null }) {
  const [status, setStatus] = useState<PurchaseStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    if (!tier) return
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
    <div className="flex flex-col gap-5">
      <p
        className="font-newsreader italic text-xs leading-relaxed"
        style={{ color: "rgba(196,199,199,0.45)" }}
      >
        Secure card payment via Stripe. You will be redirected to complete the transaction.
      </p>
      {error && (
        <p
          className="px-3 py-2 text-xs"
          style={{
            color: "var(--error)",
            background: "rgba(146,0,10,0.20)",
            outline: "1px solid rgba(255,180,168,0.18)",
          }}
        >
          {error}
        </p>
      )}
      <GlowButton
        variant="stripe"
        disabled={!tier || status === "loading"}
        onClick={() => void handlePay()}
      >
        {status === "loading"
          ? "Redirecting…"
          : tier
            ? `Pay $${tier.usd} with Card`
            : "Select a tier first"}
      </GlowButton>
      <div
        className="flex items-center justify-center gap-4 text-label-sm"
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
  tier: PricingTier | null
  onConfirmed: (spaceDust: number) => void
}) {
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""

  return (
    <div className="flex flex-col gap-5">
      <p
        className="font-newsreader italic text-xs leading-relaxed"
        style={{ color: "rgba(196,199,199,0.45)" }}
      >
        Pay with your PayPal account or credit/debit card.
      </p>
      {error && (
        <p
          className="px-3 py-2 text-xs"
          style={{
            color: "var(--error)",
            background: "rgba(146,0,10,0.20)",
            outline: "1px solid rgba(255,180,168,0.18)",
          }}
        >
          {error}
        </p>
      )}
      {!tier ? (
        <GlowButton variant="paypal" disabled>
          Select a tier first
        </GlowButton>
      ) : (
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
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// BaseTab
// ---------------------------------------------------------------------------

function BaseTab({
  tier,
  onConfirmed,
}: {
  tier: PricingTier | null
  onConfirmed: (spaceDust: number) => void
}) {
  const [step, setStep] = useState<"setup" | "waiting">("setup")
  const [baseState, setBaseState] = useState<BasePaymentState | null>(null)
  const [status, setStatus] = useState<PurchaseStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleCreate = async () => {
    if (!tier) return
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
    if (step !== "waiting" || !baseState || !tier) return

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/payments/base/status?purchaseId=${baseState.purchaseId}`,
        )
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

  if (!tier) {
    return (
      <GlowButton variant="base" disabled>
        Select a tier first
      </GlowButton>
    )
  }

  if (step === "setup") {
    return (
      <div className="flex flex-col gap-5">
        <div
          className="px-4 py-3 text-xs leading-relaxed"
          style={{
            background: "rgba(247,189,72,0.04)",
            outline: "1px solid rgba(247,189,72,0.12)",
            color: "rgba(247,189,72,0.75)",
          }}
        >
          <span className="font-bold">Cheapest fees</span>
          {" — send USDC on Base mainnet. No middlemen, no conversion costs."}
        </div>
        <div
          className="grid grid-cols-2"
          style={{ gap: "1px", background: "rgba(255,255,255,0.04)" }}
        >
          <div className="bg-surface-container p-3">
            <div className="mb-1 text-label-sm" style={{ color: "rgba(196,199,199,0.35)" }}>
              Amount
            </div>
            <div className="font-mono text-sm font-bold" style={{ color: "var(--on-surface)" }}>
              {tier.usd}.000000{" "}
              <span style={{ color: "#f7bd48" }}>USDC</span>
            </div>
          </div>
          <div className="bg-surface-container p-3">
            <div className="mb-1 text-label-sm" style={{ color: "rgba(196,199,199,0.35)" }}>
              Network
            </div>
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
              outline: "1px solid rgba(255,180,168,0.18)",
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

  // step === "waiting"
  return (
    <div className="flex flex-col gap-5">
      <div
        className="px-4 py-3 text-xs leading-relaxed"
        style={{
          background: "rgba(247,189,72,0.03)",
          outline: "1px solid rgba(247,189,72,0.10)",
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
          <div
            className="p-3"
            style={{
              background: "#fff",
              outline: "1px solid rgba(247,189,72,0.30)",
            }}
          >
            <QRCodeSVG value={baseState.receivingAddress} size={148} />
          </div>
        )}
        <div
          className="w-full break-all px-3 py-2 text-center font-mono text-xs"
          style={{
            background: "var(--surface-container-lowest)",
            outline: "1px solid rgba(255,255,255,0.07)",
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
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "rgba(196,199,199,0.35)" }}
      >
        <span
          className="animate-ember-pulse inline-block h-1.5 w-1.5"
          style={{ background: "#f7bd48" }}
        />
        <span>Awaiting on-chain confirmation…</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TABS = [
  { value: "stripe", label: "Card" },
  { value: "paypal", label: "PayPal" },
  { value: "base", label: "Crypto" },
] as const

export function SpaceDustStore() {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [confirmed, setConfirmed] = useState<{ spaceDust: number } | null>(null)
  const [activeTab, setActiveTab] = useState<TabMethod>("stripe")

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      {/* Cosmic forge backdrop */}
      <ForgeOrbs />
      <StarField />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-14 md:px-8">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <header className="mb-12">
          {/* Ruled separator: gold bleeds across */}
          <div className="mb-8 flex items-center gap-5">
            <span
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, rgba(247,189,72,0.55) 0%, rgba(247,189,72,0) 100%)",
              }}
              aria-hidden
            />
            <span className="text-label-sm" style={{ color: "rgba(247,189,72,0.38)" }}>
              Celestial Exchange
            </span>
            <span
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(270deg, rgba(247,189,72,0.55) 0%, rgba(247,189,72,0) 100%)",
              }}
              aria-hidden
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1
                className="font-headline text-display-md font-extrabold italic tracking-editorial text-glow-gold leading-none"
                style={{ color: "#f7bd48" }}
              >
                Space Dust
              </h1>
              <p
                className="mt-3 font-newsreader italic text-sm leading-relaxed"
                style={{ color: "rgba(196,199,199,0.42)" }}
              >
                Fuel your marketplace dominance. Instant delivery, three ways to pay.
              </p>
            </div>

            {/* Selected-tier floating badge (desktop) */}
            {selectedTier && (
              <div
                className="animate-stone-settle shrink-0 px-5 py-3"
                style={{
                  background: "var(--surface-container)",
                  outline: "1px solid rgba(247,189,72,0.22)",
                  boxShadow: "0 0 20px rgba(247,189,72,0.07)",
                }}
              >
                <p className="text-label-sm" style={{ color: "rgba(247,189,72,0.48)" }}>
                  Selected
                </p>
                <p
                  className="font-headline text-2xl font-extrabold italic text-glow-gold leading-none tracking-editorial"
                  style={{ color: "#f7bd48" }}
                >
                  {selectedTier.spaceDust.toLocaleString()} sd
                </p>
                <p className="font-mono text-xs" style={{ color: "rgba(196,199,199,0.32)" }}>
                  ${selectedTier.usd}
                </p>
              </div>
            )}
          </div>
        </header>

        {confirmed ? (
          <ConfirmBanner spaceDust={confirmed.spaceDust} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

            {/* ── Left: Tier grid ──────────────────────────────────── */}
            <section className="lg:col-span-3">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-label-md" style={{ color: "rgba(196,199,199,0.32)" }}>
                  Select Amount
                </h2>
                <span
                  className="h-px flex-1"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  aria-hidden
                />
              </div>
              <PricingGrid selected={selectedTier} onSelect={setSelectedTier} />
            </section>

            {/* ── Right: Payment panel ─────────────────────────────── */}
            <section className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-label-md" style={{ color: "rgba(196,199,199,0.32)" }}>
                  Payment
                </h2>
                <span
                  className="h-px flex-1"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  aria-hidden
                />
              </div>

              <Tabs.Root
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as TabMethod)}
              >
                {/* Tab bar */}
                <Tabs.List
                  className="flex"
                  style={{ background: "var(--surface-container-low)" }}
                >
                  {TABS.map(({ value, label }) => (
                    <Tabs.Trigger
                      key={value}
                      value={value}
                      className="relative flex-1 py-3 text-label-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary/60"
                      style={{
                        color:
                          activeTab === value
                            ? "#f7bd48"
                            : "rgba(196,199,199,0.32)",
                        background:
                          activeTab === value
                            ? "var(--surface-container)"
                            : "transparent",
                      }}
                    >
                      {label}
                      {/* Gold top indicator on active */}
                      {activeTab === value && (
                        <span
                          className="absolute inset-x-0 top-0 h-px"
                          style={{ background: "rgba(247,189,72,0.70)" }}
                          aria-hidden
                        />
                      )}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {/* Panel */}
                <div
                  className="relative p-5"
                  style={{
                    background: "var(--surface-container)",
                    outline: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Corner bracket accents */}
                  <span
                    className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t"
                    style={{ borderColor: "rgba(247,189,72,0.25)" }}
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r"
                    style={{ borderColor: "rgba(247,189,72,0.25)" }}
                    aria-hidden
                  />

                  <Tabs.Content value="stripe">
                    <StripeTab tier={selectedTier} />
                  </Tabs.Content>
                  <Tabs.Content value="paypal">
                    <PayPalTab
                      tier={selectedTier}
                      onConfirmed={(sd) => setConfirmed({ spaceDust: sd })}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="base">
                    <BaseTab
                      tier={selectedTier}
                      onConfirmed={(sd) => setConfirmed({ spaceDust: sd })}
                    />
                  </Tabs.Content>
                </div>
              </Tabs.Root>

              {/* Trust bar */}
              <div
                className="mt-3 flex items-center justify-center gap-4 py-2 text-label-sm"
                style={{ color: "rgba(196,199,199,0.18)" }}
              >
                <span>Non-custodial</span>
                <span
                  className="h-2.5 w-px"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <span>Instant credit</span>
                <span
                  className="h-2.5 w-px"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <span>Secure</span>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
