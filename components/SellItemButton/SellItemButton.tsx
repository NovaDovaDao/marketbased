"use client"

import { CreateListingDialog } from "@/components/CreateListingDialog/CreateListingDialog"

export function SellItemButton() {
  return (
    <CreateListingDialog
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-2 border border-secondary/40 px-5 py-2.5 font-headline text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          Sell Item
        </button>
      }
    />
  )
}
