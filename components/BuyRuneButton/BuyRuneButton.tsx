"use client"

import { CheckoutConfirmationDialog } from "@/components/CheckoutConfirmationDialog/CheckoutConfirmationDialog"

const RUNE_PRICE_SD = 1000

export interface BuyRuneButtonProps {
  runeId: number
  runeName: string
}

export default function BuyRuneButton({ runeId, runeName }: BuyRuneButtonProps) {
  return (
    <CheckoutConfirmationDialog
      item={{
        kind: "rune",
        runeId,
        itemName: `${runeName} Rune`,
        priceSpaceDust: RUNE_PRICE_SD,
      }}
      trigger={
        <button
          type="button"
          aria-label={`Buy ${runeName} for 1,000 Space Dust`}
          className={[
            "min-h-9 w-full px-4 py-2",
            "text-label-sm font-bold uppercase tracking-widest",
            "transition-colors",
            "bg-surface-container-highest text-on-surface-variant",
            "hover:bg-secondary hover:text-on-secondary",
          ].join(" ")}
        >
          Buy · 1,000 SD
        </button>
      }
    />
  )
}
