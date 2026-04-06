"use client"

import { BuyWithSpaceDustButton } from "@/components/BuyWithSpaceDustButton/BuyWithSpaceDustButton"
import { MakeOfferDialog } from "@/components/MakeOfferDialog/MakeOfferDialog"

interface DbListingCardProps {
  id: string
  name: string
  rarity: string
  rarityColor: string
  sellerUsername: string
  spaceDustPrice: number | null
}

export function DbListingCard({
  id,
  name,
  rarity,
  rarityColor,
  sellerUsername,
  spaceDustPrice,
}: DbListingCardProps) {
  return (
    <div className="flex flex-col gap-3 border border-stone-800/60 bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
      {/* Rarity badge + name */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center text-lg font-extrabold italic"
          style={{
            background: `${rarityColor}14`,
            color: rarityColor,
            textShadow: `0 0 12px ${rarityColor}44`,
          }}
          aria-hidden="true"
        >
          {name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-headline text-sm font-semibold text-on-surface">{name}</p>
          <p
            className="font-headline text-[10px] uppercase tracking-widest"
            style={{ color: rarityColor }}
          >
            {rarity}
          </p>
        </div>
      </div>

      {/* Price + seller + actions */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p
            className="font-headline text-base font-bold text-secondary"
            style={{ textShadow: "0 0 16px rgba(247,189,72,0.2)" }}
          >
            {spaceDustPrice != null ? `✨ ${spaceDustPrice.toLocaleString()} SD` : "—"}
          </p>
          <p className="font-headline text-[10px] text-on-surface-variant/30">
            by {sellerUsername}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {spaceDustPrice !== null && (
            <BuyWithSpaceDustButton
              listingId={id}
              itemName={name}
              spaceDustPrice={spaceDustPrice}
            />
          )}
          <MakeOfferDialog
            listingId={id}
            listingName={name}
            askingSpaceDustPrice={spaceDustPrice}
            trigger={
              <button
                className="px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-85"
                style={{ background: "linear-gradient(135deg, #f7bd48 0%, #e0a830 100%)", color: "#0e0e0e" }}
              >
                Offer
              </button>
            }
          />
        </div>
      </div>
    </div>
  )
}
