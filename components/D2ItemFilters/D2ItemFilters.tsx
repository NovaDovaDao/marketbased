"use client"

import type { D2GameMode, D2ItemRarity, D2ItemType, D2LadderType } from "@/types/d2items"
import { D2_GAME_MODES, D2_ITEM_RARITIES, D2_ITEM_TYPES, D2_LADDER_TYPES } from "@/types/d2items"
import * as Select from "@radix-ui/react-select"
import { cva } from "class-variance-authority"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

// ─── CVA variants ────────────────────────────────────────────────────────────

const selectTrigger = cva(
  [
    "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border",
    "border-white/10 bg-surface-container px-3 py-2 text-sm text-secondary",
    "shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400/60",
    "disabled:opacity-50",
  ].join(" "),
)

const selectContent = cva(
  [
    "z-50 min-w-[8rem] overflow-hidden rounded-md border border-white/10",
    "bg-surface-container text-secondary shadow-lg",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  ].join(" "),
)

const inputCls = [
  "h-9 w-full rounded-md border border-white/10 bg-surface-container",
  "px-3 py-1 text-sm text-secondary placeholder:text-secondary/40",
  "focus:outline-none focus:ring-1 focus:ring-amber-400/60",
].join(" ")

const labelCls = "block text-xs font-medium text-secondary/60 mb-1"

const RARITY_LABELS: Record<D2ItemRarity, string> = {
  NORMAL: "Normal",
  MAGIC: "Magic",
  RARE: "Rare",
  SET: "Set",
  UNIQUE: "Unique",
  RUNEWORD: "Runeword",
  CRAFTED: "Crafted",
}

const TYPE_LABELS: Record<D2ItemType, string> = {
  HELMET: "Helmet",
  ARMOR: "Armor",
  SHIELD: "Shield",
  GLOVES: "Gloves",
  BOOTS: "Boots",
  BELT: "Belt",
  WEAPON: "Weapon",
  RING: "Ring",
  AMULET: "Amulet",
  CHARM: "Charm",
  JEWEL: "Jewel",
  RUNE: "Rune",
  GEM: "Gem",
  MISC: "Misc",
}

// ─── Props ────────────────────────────────────────────────────────────────────

const GAME_MODE_LABELS: Record<D2GameMode, string> = {
  SOFTCORE: "Softcore",
  HARDCORE: "Hardcore",
}

const LADDER_TYPE_LABELS: Record<D2LadderType, string> = {
  LADDER: "Ladder",
  NON_LADDER: "Non-Ladder",
}

export interface D2ItemFiltersProps {
  currentValues?: {
    d2type?: string
    d2rarity?: string
    ethereal?: string
    ilvlMin?: string
    ilvlMax?: string
    socketsMin?: string
    socketsMax?: string
    statKey?: string
    statMin?: string
    gameMode?: string
    ladder?: string
    q?: string
    isPerfect?: string
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function D2ItemFilters({ currentValues = {} }: D2ItemFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page") // reset pagination on filter change
      startTransition(() => {
        router.push(`?${params.toString()}`)
      })
    },
    [router, searchParams],
  )

  const clear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    for (const key of [
      "d2type", "d2rarity", "ethereal", "ilvlMin", "ilvlMax",
      "socketsMin", "socketsMax", "statKey", "statMin",
      "gameMode", "ladder", "q", "isPerfect",
    ]) {
      params.delete(key)
    }
    params.delete("page")
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }, [router, searchParams])

  const hasActive =
    currentValues.d2type ||
    currentValues.d2rarity ||
    currentValues.ethereal ||
    currentValues.ilvlMin ||
    currentValues.ilvlMax ||
    currentValues.socketsMin ||
    currentValues.socketsMax ||
    currentValues.statKey ||
    currentValues.gameMode ||
    currentValues.ladder ||
    currentValues.q ||
    currentValues.isPerfect

  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface-container-low p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-secondary">D2R Item Filters</h2>
        {hasActive && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Item Type */}
      <div>
        <p className={labelCls}>Item Type</p>
        <Select.Root
          value={currentValues.d2type ?? ""}
          onValueChange={(v) => update("d2type", v === "_all" ? "" : v)}
        >
          <Select.Trigger className={selectTrigger()} aria-label="Item type">
            <Select.Value placeholder="All types" />
            <Select.Icon className="text-secondary/50">▾</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={selectContent()} position="popper" sideOffset={4}>
              <Select.Viewport className="p-1">
                <Select.Item value="_all" className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-white/5 data-[highlighted]:bg-white/5">
                  <Select.ItemText>All types</Select.ItemText>
                </Select.Item>
                {D2_ITEM_TYPES.map((t) => (
                  <Select.Item
                    key={t}
                    value={t}
                    className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-white/5 data-[highlighted]:bg-white/5"
                  >
                    <Select.ItemText>{TYPE_LABELS[t]}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Rarity */}
      <div>
        <p className={labelCls}>Rarity</p>
        <Select.Root
          value={currentValues.d2rarity ?? ""}
          onValueChange={(v) => update("d2rarity", v === "_all" ? "" : v)}
        >
          <Select.Trigger className={selectTrigger()} aria-label="Rarity">
            <Select.Value placeholder="All rarities" />
            <Select.Icon className="text-secondary/50">▾</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={selectContent()} position="popper" sideOffset={4}>
              <Select.Viewport className="p-1">
                <Select.Item value="_all" className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-white/5 data-[highlighted]:bg-white/5">
                  <Select.ItemText>All rarities</Select.ItemText>
                </Select.Item>
                {D2_ITEM_RARITIES.map((r) => (
                  <Select.Item
                    key={r}
                    value={r}
                    className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-white/5 data-[highlighted]:bg-white/5"
                  >
                    <Select.ItemText>{RARITY_LABELS[r]}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Ethereal */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-white/20 accent-amber-400"
          checked={currentValues.ethereal === "true"}
          onChange={(e) => update("ethereal", e.target.checked ? "true" : "")}
          aria-label="Ethereal only"
        />
        <span className="text-sm text-secondary">Ethereal only</span>
      </label>

      {/* ilvl range */}
      <div>
        <p className={labelCls}>Item Level (ilvl)</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={99}
            placeholder="Min"
            className={inputCls}
            defaultValue={currentValues.ilvlMin ?? ""}
            onBlur={(e) => update("ilvlMin", e.target.value)}
            aria-label="Min item level"
          />
          <input
            type="number"
            min={1}
            max={99}
            placeholder="Max"
            className={inputCls}
            defaultValue={currentValues.ilvlMax ?? ""}
            onBlur={(e) => update("ilvlMax", e.target.value)}
            aria-label="Max item level"
          />
        </div>
      </div>

      {/* Sockets range */}
      <div>
        <p className={labelCls}>Sockets</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={6}
            placeholder="Min"
            className={inputCls}
            defaultValue={currentValues.socketsMin ?? ""}
            onBlur={(e) => update("socketsMin", e.target.value)}
            aria-label="Min sockets"
          />
          <input
            type="number"
            min={0}
            max={6}
            placeholder="Max"
            className={inputCls}
            defaultValue={currentValues.socketsMax ?? ""}
            onBlur={(e) => update("socketsMax", e.target.value)}
            aria-label="Max sockets"
          />
        </div>
      </div>

      {/* Game Mode */}
      <div>
        <p className={labelCls}>Game Mode</p>
        <Select.Root
          value={currentValues.gameMode ?? ""}
          onValueChange={(v) => update("gameMode", v === "_all" ? "" : v)}
        >
          <Select.Trigger className={selectTrigger()} aria-label="Game mode">
            <Select.Value placeholder="Softcore &amp; Hardcore" />
            <Select.Icon className="text-secondary/50">▾</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={selectContent()} position="popper" sideOffset={4}>
              <Select.Viewport className="p-1">
                <Select.Item value="_all" className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-white/5 data-[highlighted]:bg-white/5">
                  <Select.ItemText>All modes</Select.ItemText>
                </Select.Item>
                {D2_GAME_MODES.map((m) => (
                  <Select.Item
                    key={m}
                    value={m}
                    className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-white/5 data-[highlighted]:bg-white/5"
                  >
                    <Select.ItemText>{GAME_MODE_LABELS[m]}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Ladder */}
      <div>
        <p className={labelCls}>Ladder</p>
        <Select.Root
          value={currentValues.ladder ?? ""}
          onValueChange={(v) => update("ladder", v === "_all" ? "" : v)}
        >
          <Select.Trigger className={selectTrigger()} aria-label="Ladder type">
            <Select.Value placeholder="Ladder &amp; Non-Ladder" />
            <Select.Icon className="text-secondary/50">▾</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={selectContent()} position="popper" sideOffset={4}>
              <Select.Viewport className="p-1">
                <Select.Item value="_all" className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-white/5 data-[highlighted]:bg-white/5">
                  <Select.ItemText>All</Select.ItemText>
                </Select.Item>
                {D2_LADDER_TYPES.map((l) => (
                  <Select.Item
                    key={l}
                    value={l}
                    className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-white/5 data-[highlighted]:bg-white/5"
                  >
                    <Select.ItemText>{LADDER_TYPE_LABELS[l]}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Free-text query */}
      <div>
        <p className={labelCls}>Search</p>
        <input
          type="search"
          placeholder='e.g. "shako +2skills eth hc"'
          className={inputCls}
          defaultValue={currentValues.q ?? ""}
          onBlur={(e) => update("q", e.target.value.trim())}
          aria-label="Free-text item search"
        />
      </div>

      {/* Stat filter */}
      <div>
        <p className={labelCls}>Stat Filter</p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder='Stat key (e.g. "all_resist")'
            className={inputCls}
            defaultValue={currentValues.statKey ?? ""}
            onBlur={(e) => update("statKey", e.target.value)}
            aria-label="Stat key filter"
          />
          <input
            type="number"
            placeholder="Min value"
            className={inputCls}
            defaultValue={currentValues.statMin ?? ""}
            onBlur={(e) => update("statMin", e.target.value)}
            aria-label="Min stat value"
          />
        </div>
      </div>

      {/* Perfect roll */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-white/20 accent-amber-400"
          checked={currentValues.isPerfect === "true"}
          onChange={(e) => update("isPerfect", e.target.checked ? "true" : "")}
          aria-label="Perfect rolls only"
        />
        <span className="text-sm text-secondary">Perfect rolls only</span>
      </label>
    </aside>
  )
}

export default D2ItemFilters
