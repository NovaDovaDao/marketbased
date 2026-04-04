"use client"

import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

// ---------------------------------------------------------------------------
// CVA definition
// ---------------------------------------------------------------------------

const glowButton = cva(
  [
    "relative inline-flex items-center justify-center gap-2",
    "font-semibold tracking-wider uppercase text-white",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050510]",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none",
    "active:scale-95",
    // Subtle top-shine overlay via gradient
    "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/15 before:to-transparent before:opacity-0",
    "hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        stripe: [
          "bg-gradient-to-br from-violet-700 via-purple-600 to-purple-800",
          "hover:-translate-y-px",
          "hover:shadow-[0_0_22px_rgba(124,58,237,0.65),0_6px_20px_rgba(124,58,237,0.35)]",
          "shadow-[0_2px_8px_rgba(124,58,237,0.25)]",
          "focus-visible:ring-violet-500",
          "border border-purple-500/40",
        ].join(" "),
        paypal: [
          "bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800",
          "hover:-translate-y-px",
          "hover:shadow-[0_0_22px_rgba(59,130,246,0.65),0_6px_20px_rgba(59,130,246,0.35)]",
          "shadow-[0_2px_8px_rgba(59,130,246,0.25)]",
          "focus-visible:ring-blue-500",
          "border border-blue-500/40",
        ].join(" "),
        base: [
          "bg-gradient-to-br from-cyan-700 via-cyan-600 to-teal-700",
          "hover:-translate-y-px",
          "hover:shadow-[0_0_22px_rgba(34,211,238,0.65),0_6px_20px_rgba(34,211,238,0.35)]",
          "shadow-[0_2px_8px_rgba(34,211,238,0.25)]",
          "focus-visible:ring-cyan-500",
          "border border-cyan-500/40",
        ].join(" "),
      },
      size: {
        md: "px-5 py-2.5 text-xs",
        lg: "w-full px-6 py-3.5 text-sm",
      },
    },
    defaultVariants: { variant: "stripe", size: "lg" },
  },
)

export type GlowButtonVariants = VariantProps<typeof glowButton>

export interface GlowButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  GlowButtonVariants { }

export function GlowButton({
  variant,
  size,
  className,
  children,
  ...props
}: GlowButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(glowButton({ variant, size }), className)}
    >
      {children}
    </button>
  )
}
