"use client"

import runesRaw from "@/items/runes.json"
import listingsRaw from "@/items/trading-listings.json"
import * as Dialog from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

// ── Catalog ───────────────────────────────────────────────────────────────

interface CatalogItem {
  id: string
  name: string
  slug: string
  rarity: string
  category: string
  image: string
}

const CATALOG: CatalogItem[] = [
  ...runesRaw.map((r) => ({
    id: `rune-${r.id}`,
    name: r.name,
    slug: r.slug,
    rarity: "Rune",
    category: "Runes",
    image: r.image,
  })),
  ...(listingsRaw as Array<{ id: string; name: string; slug: string; rarity: string; category: string; image: string }>).map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    rarity: l.rarity,
    category: l.category,
    image: l.image,
  })),
]

const RARITY_COLOR: Record<string, string> = {
  Unique: "#ff9b48",
  Set: "#4ade80",
  Rare: "#6aa0ff",
  Magic: "#a78bfa",
  Rune: "#f7bd48",
  Runeword: "#f7bd48",
  Normal: "#9ca3af",
}

// ── CVA ───────────────────────────────────────────────────────────────────

const overlay = cva(
  "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
)
const content = cva(
  "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-[#131313] border border-amber-900/30 p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
)
const inputCls =
  "w-full border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-secondary focus:outline-none"
const labelCls = "text-xs uppercase tracking-widest text-on-surface-variant/50"
const btnPrimary =
  "inline-flex items-center justify-center px-6 py-3 font-headline text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-40"

// ── Types ─────────────────────────────────────────────────────────────────

export interface CreateListingDialogProps {
  trigger: React.ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────

export function CreateListingDialog({ trigger }: CreateListingDialogProps) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)
  const [name, setName] = useState("")
  const [rarity, setRarity] = useState("Unique")
  const [gameMode, setGameMode] = useState<"SOFTCORE" | "HARDCORE">("SOFTCORE")
  const [ladder, setLadder] = useState<"LADDER" | "NON_LADDER">("NON_LADDER")
  const [spaceDustPrice, setSpaceDustPrice] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const catalogResults =
    searchQuery.trim().length >= 2
      ? CATALOG.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
      : []

  function selectCatalogItem(item: CatalogItem) {
    setSelectedItem(item)
    setName(item.name)
    setRarity(item.rarity)
    setSearchQuery(item.name)
    setShowDropdown(false)
  }

  function clearSelection() {
    setSelectedItem(null)
    setSearchQuery("")
    setName("")
    setRarity("Unique")
  }

  function resetForm() {
    setSearchQuery("")
    setShowDropdown(false)
    setSelectedItem(null)
    setName("")
    setRarity("Unique")
    setGameMode("SOFTCORE")
    setLadder("NON_LADDER")
    setSpaceDustPrice("")
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch("/api/listings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contentId: selectedItem?.slug ?? name.toLowerCase().replace(/\s+/g, "-"),
          name: selectedItem ? selectedItem.name : name,
          baseName: selectedItem ? selectedItem.name : name,
          rarity: selectedItem ? selectedItem.rarity : rarity,
          gameMode,
          ladder,
          price: {},
          spaceDustPrice: parseInt(spaceDustPrice, 10),
        }),
      })

      const body = (await res.json()) as { error?: string }

      if (!res.ok) {
        setError(body.error ?? "Failed to create listing.")
        return
      }

      setOpen(false)
      resetForm()
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = (selectedItem !== null || name.trim().length > 0) && spaceDustPrice.trim().length > 0 && parseInt(spaceDustPrice, 10) > 0

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={overlay()} />
        <Dialog.Content className={content()}>
          <Dialog.Title className="font-headline text-lg font-extrabold italic tracking-editorial text-secondary">
            List a Relic
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-on-surface-variant/50">
            Search the item catalog or enter a custom name, then set your asking price.
          </Dialog.Description>

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-5">

            {/* ── Item catalog search ── */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Item</label>

              {selectedItem ? (
                /* Selected item chip */
                <div className="flex items-center gap-3 border border-secondary/40 bg-surface-container-lowest px-3 py-2.5">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    width={32}
                    height={32}
                    className="shrink-0 object-contain opacity-90"
                    unoptimized
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-headline text-sm font-semibold text-on-surface">
                      {selectedItem.name}
                    </p>
                    <p
                      className="font-headline text-[10px] uppercase tracking-widest"
                      style={{ color: RARITY_COLOR[selectedItem.rarity] ?? "#9ca3af" }}
                    >
                      {selectedItem.rarity} · {selectedItem.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelection}
                    aria-label="Clear item selection"
                    className="shrink-0 text-on-surface-variant/40 transition-colors hover:text-on-surface-variant"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Search input + dropdown */
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/30">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Search runes, uniques, sets…"
                    autoComplete="off"
                    className={`${inputCls} pl-9`}
                  />
                  {showDropdown && catalogResults.length > 0 && (
                    <div
                      role="listbox"
                      aria-label="Item catalog results"
                      className="absolute left-0 right-0 top-full z-50 mt-px max-h-60 overflow-y-auto border border-stone-700 bg-[#0d0d0d] shadow-2xl"
                    >
                      {catalogResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onMouseDown={() => selectCatalogItem(item)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-container"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={28}
                            height={28}
                            className="shrink-0 object-contain opacity-80"
                            unoptimized
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-headline text-sm text-on-surface">{item.name}</p>
                            <p
                              className="font-headline text-[10px] uppercase tracking-widest"
                              style={{ color: RARITY_COLOR[item.rarity] ?? "#9ca3af" }}
                            >
                              {item.rarity} · {item.category}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/30">
                {selectedItem ? "Item selected from catalog" : "Type to search, or fill in a custom item below"}
              </p>
            </div>

            {/* ── Custom item fields (shown when not from catalog) ── */}
            {!selectedItem && (
              <>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Item name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harlequin Crest"
                    maxLength={100}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Rarity</label>
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Unique">Unique</option>
                    <option value="Set">Set</option>
                    <option value="Rare">Rare</option>
                    <option value="Magic">Magic</option>
                    <option value="Normal">Normal</option>
                    <option value="Rune">Rune</option>
                    <option value="Runeword">Runeword</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <label className={labelCls}>Mode</label>
                    <select
                      value={gameMode}
                      onChange={(e) => setGameMode(e.target.value as "SOFTCORE" | "HARDCORE")}
                      className={inputCls}
                    >
                      <option value="SOFTCORE">Softcore</option>
                      <option value="HARDCORE">Hardcore</option>
                    </select>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className={labelCls}>Ladder</label>
                    <select
                      value={ladder}
                      onChange={(e) => setLadder(e.target.value as "LADDER" | "NON_LADDER")}
                      className={inputCls}
                    >
                      <option value="NON_LADDER">Non-Ladder</option>
                      <option value="LADDER">Ladder</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-400/80">{error}</p>}

            {/* ── Space Dust price ── */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Space Dust price</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/40">✨</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={spaceDustPrice}
                  onChange={(e) => setSpaceDustPrice(e.target.value)}
                  placeholder="e.g. 2500"
                  className={`${inputCls} pl-8`}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant/30">
                Set the Space Dust amount buyers can purchase this item for.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-stone-800 pt-4">
              <Dialog.Close className="text-xs uppercase tracking-widest text-on-surface-variant/40 transition-colors hover:text-on-surface-variant/70">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className={btnPrimary}
                style={{ background: "linear-gradient(135deg, #f7bd48 0%, #e0a830 100%)", color: "#0e0e0e" }}
              >
                {submitting ? "Listing…" : "List Item"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
