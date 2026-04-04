"use client"

import * as Tabs from "@radix-ui/react-tabs"

// ── Types ─────────────────────────────────────────────────────────────────

interface SellerInfo {
  id: string
  username: string | null
  name: string
}

interface ListingInfo {
  id: string
  name: string
  rarity: string
}

interface ItemPurchase {
  id: string
  itemName: string
  spaceDustAmount: number
  tradeRoomId: string | null
  runeId: number | null
  listingId: string | null
  listing: ListingInfo | null
  seller: SellerInfo | null
  createdAt: string
}

interface TopUp {
  id: string
  amountUsd: number
  spaceDust: number
  provider: string
  status: string
  createdAt: string
}

export interface PurchaseHistoryProps {
  itemPurchases: ItemPurchase[]
  topUps: TopUp[]
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

const PROVIDER_LABEL: Record<string, string> = {
  stripe: "Card (Stripe)",
  paypal: "PayPal",
  base: "USDC (Base)",
}

const STATUS_COLOR: Record<string, string> = {
  completed: "text-emerald-400",
  pending: "text-amber-400",
  failed: "text-red-400",
}

// ── Sub-components ────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-55 flex-col items-center justify-center gap-3 border border-stone-800 bg-stone-900/30 text-center">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle cx="18" cy="18" r="16" stroke="rgba(247,189,72,0.12)" strokeWidth="1.2" />
        <path d="M12 24l6-12 6 12M14 21h8" stroke="rgba(247,189,72,0.25)" strokeWidth="1.2" strokeLinecap="square" />
      </svg>
      <p className="font-headline text-xs uppercase tracking-widest text-on-surface-variant/30">{label}</p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────

export function PurchaseHistory({ itemPurchases, topUps }: PurchaseHistoryProps) {
  return (
    <Tabs.Root defaultValue="items" className="w-full">
      {/* Tab list */}
      <Tabs.List
        className="flex border-b border-stone-800"
        aria-label="Purchase history tabs"
      >
        <Tabs.Trigger
          value="items"
          className="relative px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant/50 transition-colors hover:text-on-surface-variant data-[state=active]:text-secondary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-secondary after:opacity-0 data-[state=active]:after:opacity-100"
        >
          Item Purchases
          {itemPurchases.length > 0 && (
            <span className="ml-2 rounded-full bg-secondary/20 px-1.5 py-0.5 text-[10px] text-secondary">
              {itemPurchases.length}
            </span>
          )}
        </Tabs.Trigger>
        <Tabs.Trigger
          value="topups"
          className="relative px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant/50 transition-colors hover:text-on-surface-variant data-[state=active]:text-secondary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-secondary after:opacity-0 data-[state=active]:after:opacity-100"
        >
          Space Dust Top-Ups
          {topUps.length > 0 && (
            <span className="ml-2 rounded-full bg-secondary/20 px-1.5 py-0.5 text-[10px] text-secondary">
              {topUps.length}
            </span>
          )}
        </Tabs.Trigger>
      </Tabs.List>

      {/* Item purchases tab */}
      <Tabs.Content value="items" className="mt-6 focus-visible:outline-none">
        {itemPurchases.length === 0 ? (
          <EmptyState label="No items purchased yet" />
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {itemPurchases.map((purchase) => (
              <li
                key={purchase.id}
                className="flex flex-col gap-2 border border-stone-800/60 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Item info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-amber-400/20 bg-amber-400/5 font-headline text-sm font-extrabold italic text-secondary">
                    {purchase.itemName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-headline text-sm font-semibold text-on-surface">
                      {purchase.itemName}
                    </p>
                    {purchase.seller ? (
                      <p className="font-headline text-[10px] text-on-surface-variant/40">
                        from @{purchase.seller.username ?? purchase.seller.name}
                      </p>
                    ) : (
                      <p className="font-headline text-[10px] text-on-surface-variant/40">
                        Rune Vault
                      </p>
                    )}
                  </div>
                </div>

                {/* Price + date + action */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-headline text-sm font-bold text-secondary">
                      ✨ {purchase.spaceDustAmount.toLocaleString()} sd
                    </p>
                    <p className="font-headline text-[10px] text-on-surface-variant/30">
                      {formatDate(purchase.createdAt)}
                    </p>
                  </div>

                  {purchase.tradeRoomId && (
                    <a
                      href={`/trade-rooms/${purchase.tradeRoomId}`}
                      className="shrink-0 border border-secondary/30 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10"
                    >
                      Chat
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tabs.Content>

      {/* Top-ups tab */}
      <Tabs.Content value="topups" className="mt-6 focus-visible:outline-none">
        {topUps.length === 0 ? (
          <EmptyState label="No Space Dust purchases yet" />
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {topUps.map((topUp) => (
              <li
                key={topUp.id}
                className="flex flex-col gap-2 border border-stone-800/60 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-headline text-sm font-semibold text-on-surface">
                    {topUp.spaceDust.toLocaleString()} Space Dust
                  </p>
                  <p className="font-headline text-[10px] text-on-surface-variant/40">
                    {PROVIDER_LABEL[topUp.provider] ?? topUp.provider}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-headline text-sm font-semibold text-on-surface">
                      {formatUsd(topUp.amountUsd)}
                    </p>
                    <p
                      className={`font-headline text-[10px] capitalize ${STATUS_COLOR[topUp.status] ?? "text-on-surface-variant/30"}`}
                    >
                      {topUp.status}
                    </p>
                  </div>

                  <p className="shrink-0 font-headline text-[10px] text-on-surface-variant/30">
                    {formatDate(topUp.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tabs.Content>
    </Tabs.Root>
  )
}
