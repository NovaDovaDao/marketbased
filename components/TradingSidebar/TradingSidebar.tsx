"use client"

import {
  D2_ITEM_RARITIES,
  D2_ITEM_TYPES,
  type D2ItemRarity,
  type D2ItemType,
} from "@/types/d2items"
import {
  ALL_BODY_LOCATIONS,
  ALL_CATEGORIES,
  ALL_CRAFT_TYPES,
  ALL_GEM_TYPES,
  ALL_ITEM_TIERS,
  ALL_ITEM_TYPES,
  ALL_WEAPON_TYPES,
  SKILL_GROUPS,
  STAT_OPTIONS,
  type TradingFilterState,
} from "@/types/trading"
import * as Accordion from "@radix-ui/react-accordion"
import * as Checkbox from "@radix-ui/react-checkbox"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"

// ── Props ──────────────────────────────────────────────────────────────────

export interface TradingSidebarProps {
  activeFilters: TradingFilterState
}

// ── Icon components ────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg
      className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

// ── Single-select filter item ──────────────────────────────────────────────

function FilterOption({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full px-3 py-1.5 text-left font-serif text-xs transition-all",
        isActive
          ? "border-l-2 border-amber-500 bg-amber-950/20 pl-2.5 text-amber-400"
          : "text-stone-500 hover:bg-stone-900/40 hover:text-stone-300",
      ].join(" ")}
      aria-pressed={isActive}
    >
      {label}
    </button>
  )
}

// ── Section header trigger ─────────────────────────────────────────────────

function SectionTrigger({
  icon,
  label,
  isActive,
}: {
  icon: React.ReactNode
  label: string
  isActive?: boolean
}) {
  return (
    <Accordion.Trigger
      className={[
        "group flex w-full cursor-pointer items-center justify-between px-4 py-3",
        "font-serif text-sm transition-all",
        isActive
          ? "border-l-4 border-amber-600 bg-stone-900/50 text-amber-400"
          : "text-stone-500 hover:bg-stone-900/40 hover:text-amber-300",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className={isActive ? "font-bold" : ""}>{label}</span>
      </div>
      <ChevronIcon />
    </Accordion.Trigger>
  )
}

// ── Inline SVG icons for each section ─────────────────────────────────────

const Icons = {
  stats: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="8" width="3" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="5.5" y="5" width="3" height="8" stroke="currentColor" strokeWidth="1.2" />
      <rect x="10" y="2" width="3" height="11" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  category: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  body: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="3" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 13V9a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  ),
  craft: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1l1.5 4h4l-3.25 2.4 1.25 3.9L7 9.1l-3.5 2.2 1.25-3.9L1.5 5H5.5z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  gem: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2L2 6l5 6 5-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="bevel" />
      <path d="M2 6h10" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  itemtype: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 11L7 2l4 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
      <path d="M4.5 8h5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  skills: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  ),
  tier: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1l1 3h3l-2.5 2 1 3L7 7.5 4.5 9l1-3L3 4h3z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  weapon: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 12L9 5M9 5l2-3 2 2-3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
      <path d="M4 10l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  ),
  d2type: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1l5 3v5l-5 4-5-4V4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="bevel" />
    </svg>
  ),
  d2rarity: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2l1.2 3.6h3.8l-3 2.2 1.1 3.6L7 9.5l-3.1 1.9 1.1-3.6-3-2.2h3.8z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  instance: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 7h5M7 4.5v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  ),
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TradingSidebar({ activeFilters }: TradingSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statsQuery, setStatsQuery] = useState("")

  const setParam = useCallback(
    (key: string, value: string, current?: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === current) {
        // Clicking active → deselect
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete("page")
      router.replace(`/trading?${params.toString()}`)
    },
    [router, searchParams]
  )

  const toggleArrayParam = useCallback(
    (key: string, value: string, current: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(key)
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      next.forEach((v) => params.append(key, v))
      params.delete("page")
      router.replace(`/trading?${params.toString()}`)
    },
    [router, searchParams]
  )

  const setRangeParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete("page")
      router.replace(`/trading?${params.toString()}`)
    },
    [router, searchParams]
  )

  const resetSidebar = useCallback(() => {
    const sidebarKeys = [
      "category", "itemType", "bodyLocation", "craftType",
      "gemType", "tier", "weaponType", "stats", "skills",
      "d2type", "d2rarity", "ethereal", "ilvlMin", "ilvlMax",
      "socketsMin", "socketsMax", "statKey", "statMin", "isPerfect",
    ]
    const params = new URLSearchParams(searchParams.toString())
    sidebarKeys.forEach((k) => params.delete(k))
    params.delete("page")
    router.replace(`/trading?${params.toString()}`)
  }, [router, searchParams])

  const activeStats: string[] = activeFilters.stats ?? []
  const activeSkills: string[] = activeFilters.skills ?? []

  // D2-specific filter state read from URL directly
  const searchParamsSnapshot = useSearchParams()
  const d2type = searchParamsSnapshot.get("d2type") ?? ""
  const d2rarity = searchParamsSnapshot.get("d2rarity") ?? ""
  const ethereal = searchParamsSnapshot.get("ethereal") === "true"
  const ilvlMin = searchParamsSnapshot.get("ilvlMin") ?? ""
  const ilvlMax = searchParamsSnapshot.get("ilvlMax") ?? ""
  const socketsMin = searchParamsSnapshot.get("socketsMin") ?? ""
  const socketsMax = searchParamsSnapshot.get("socketsMax") ?? ""
  const statKey = searchParamsSnapshot.get("statKey") ?? ""
  const statMin = searchParamsSnapshot.get("statMin") ?? ""
  const isPerfect = searchParamsSnapshot.get("isPerfect") === "true"

  const hasD2Active = !!(d2type || d2rarity || ethereal || ilvlMin || ilvlMax || socketsMin || socketsMax || statKey || isPerfect)

  const D2_TYPE_LABELS: Record<D2ItemType, string> = {
    HELMET: "Helmet", ARMOR: "Armor", SHIELD: "Shield", GLOVES: "Gloves",
    BOOTS: "Boots", BELT: "Belt", WEAPON: "Weapon", RING: "Ring",
    AMULET: "Amulet", CHARM: "Charm", JEWEL: "Jewel", RUNE: "Rune",
    GEM: "Gem", MISC: "Misc",
  }

  const D2_RARITY_LABELS: Record<D2ItemRarity, string> = {
    NORMAL: "Normal", MAGIC: "Magic", RARE: "Rare", SET: "Set",
    UNIQUE: "Unique", RUNEWORD: "Runeword", CRAFTED: "Crafted",
  }

  const filteredStats = statsQuery.trim()
    ? STAT_OPTIONS.filter((s) =>
      s.label.toLowerCase().includes(statsQuery.toLowerCase())
    )
    : STAT_OPTIONS

  // Build default open sections based on active filters
  const defaultOpen: string[] = []
  if (activeFilters.category) defaultOpen.push("categories")
  if (activeFilters.bodyLocation) defaultOpen.push("body-location")
  if (activeFilters.tier) defaultOpen.push("tier")
  if (activeFilters.itemType) defaultOpen.push("item-type")
  if (activeStats.length > 0) defaultOpen.push("stats")
  if (hasD2Active) defaultOpen.push("d2-instance")

  return (
    <aside
      className="fixed top-16 left-0 z-40 hidden h-[calc(100vh-64px)] w-72 flex-col overflow-y-auto border-r border-stone-800 bg-stone-950 shadow-[4px_0_24px_rgba(0,0,0,0.8)] lg:flex"
      aria-label="Listing filters"
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-stone-900 bg-stone-950 p-6">
        <h2 className="font-serif text-xl font-bold tracking-tighter text-amber-500 uppercase">
          The Great Filter
        </h2>
        <p className="font-serif text-xs text-stone-500 italic">Refine the Spoils</p>
      </div>

      {/* Accordion filter sections */}
      <Accordion.Root
        type="multiple"
        defaultValue={defaultOpen.length > 0 ? defaultOpen : ["categories"]}
        className="flex flex-col font-serif text-sm"
      >
        {/* ── Stats ── */}
        <Accordion.Item value="stats">
          <SectionTrigger
            icon={Icons.stats}
            label="Stats"
            isActive={activeStats.length > 0}
          />
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-none">
            <div className="space-y-3 bg-black/40 p-4">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stats..."
                  value={statsQuery}
                  onChange={(e) => setStatsQuery(e.target.value)}
                  className="w-full border border-stone-800 bg-stone-950/80 py-1.5 pl-8 pr-3 font-serif text-xs text-stone-300 placeholder-stone-600 outline-none focus:border-amber-500"
                  aria-label="Search stats"
                />
                <svg
                  className="absolute top-2 left-2 h-3.5 w-3.5 text-stone-600"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                </svg>
              </div>
              {/* Scrollable list */}
              <ScrollArea.Root className="h-40 overflow-hidden">
                <ScrollArea.Viewport className="h-full w-full">
                  <div className="space-y-1 pr-1">
                    {filteredStats.map((stat) => (
                      <div key={stat.id} className="flex items-start gap-2.5">
                        <Checkbox.Root
                          id={`stat-${stat.id}`}
                          checked={activeStats.includes(stat.id)}
                          onCheckedChange={() =>
                            toggleArrayParam("stats", stat.id, activeStats)
                          }
                          className="relative mt-0.5 h-4 w-4 shrink-0 cursor-pointer border border-stone-700 bg-stone-900 transition-colors hover:border-amber-600 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-950"
                        >
                          <Checkbox.Indicator className="absolute inset-0 flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1 4l2 2 4-4" stroke="#f7bd48" strokeWidth="1.2" strokeLinecap="square" />
                            </svg>
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label
                          htmlFor={`stat-${stat.id}`}
                          className="cursor-pointer font-serif text-xs leading-snug text-stone-400 hover:text-stone-200"
                        >
                          {stat.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  orientation="vertical"
                  className="flex w-1.5 touch-none select-none bg-stone-900 p-0.5"
                >
                  <ScrollArea.Thumb className="relative flex-1 bg-stone-700" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── Categories ── */}
        <Accordion.Item value="categories">
          <SectionTrigger
            icon={Icons.category}
            label="Categories"
            isActive={!!activeFilters.category}
          />
          <Accordion.Content className="overflow-hidden">
            <div className="space-y-0.5 bg-black/20 py-2 pl-10 pr-4 text-xs">
              {ALL_CATEGORIES.map((cat) => (
                <FilterOption
                  key={cat}
                  label={cat}
                  isActive={activeFilters.category === cat}
                  onClick={() => setParam("category", cat, activeFilters.category)}
                />
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── Body Location ── */}
        <Accordion.Item value="body-location">
          <SectionTrigger
            icon={Icons.body}
            label="Body Location"
            isActive={!!activeFilters.bodyLocation}
          />
          <Accordion.Content className="overflow-hidden">
            <div className="space-y-0.5 bg-black/20 py-2 pl-10 pr-4 text-xs">
              {ALL_BODY_LOCATIONS.map((loc) => (
                <FilterOption
                  key={loc}
                  label={loc}
                  isActive={activeFilters.bodyLocation === loc}
                  onClick={() => setParam("bodyLocation", loc, activeFilters.bodyLocation)}
                />
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── Craft Type ── */}
        <Accordion.Item value="craft-type">
          <SectionTrigger
            icon={Icons.craft}
            label="Craft Type"
            isActive={!!activeFilters.craftType}
          />
          <Accordion.Content className="overflow-hidden">
            <div className="space-y-0.5 bg-black/20 py-2 pl-10 pr-4 text-xs">
              {ALL_CRAFT_TYPES.map((ct) => (
                <FilterOption
                  key={ct}
                  label={ct}
                  isActive={activeFilters.craftType === ct}
                  onClick={() => setParam("craftType", ct, activeFilters.craftType)}
                />
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── Gem Type ── */}
        <Accordion.Item value="gem-type">
          <SectionTrigger
            icon={Icons.gem}
            label="Gem Type"
            isActive={!!activeFilters.gemType}
          />
          <Accordion.Content className="overflow-hidden">
            <div className="space-y-0.5 bg-black/20 py-2 pl-10 pr-4 text-xs">
              {ALL_GEM_TYPES.map((gem) => (
                <FilterOption
                  key={gem}
                  label={gem}
                  isActive={activeFilters.gemType === gem}
                  onClick={() => setParam("gemType", gem, activeFilters.gemType)}
                />
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── Item Type ── */}
        <Accordion.Item value="item-type">
          <SectionTrigger
            icon={Icons.itemtype}
            label="Item Type"
            isActive={!!activeFilters.itemType}
          />
          <Accordion.Content className="overflow-hidden">
            <ScrollArea.Root className="max-h-60 overflow-hidden">
              <ScrollArea.Viewport className="h-full w-full">
                <div className="space-y-0.5 bg-black/20 py-2 pl-10 pr-6 text-xs">
                  {ALL_ITEM_TYPES.map((type) => (
                    <FilterOption
                      key={type}
                      label={type}
                      isActive={activeFilters.itemType === type}
                      onClick={() => setParam("itemType", type, activeFilters.itemType)}
                    />
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                orientation="vertical"
                className="flex w-1.5 touch-none select-none bg-stone-900 p-0.5"
              >
                <ScrollArea.Thumb className="relative flex-1 bg-stone-700" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── Skills ── */}
        <Accordion.Item value="skills">
          <SectionTrigger
            icon={Icons.skills}
            label="Skills"
            isActive={activeSkills.length > 0}
          />
          <Accordion.Content className="overflow-hidden">
            <ScrollArea.Root className="max-h-60 overflow-hidden">
              <ScrollArea.Viewport className="h-full w-full">
                <div className="space-y-3 bg-black/20 py-3 pl-10 pr-6 text-xs">
                  {SKILL_GROUPS.map((group) => (
                    <div key={group.class}>
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-stone-600 uppercase">
                        {group.class}
                      </p>
                      <div className="space-y-0.5">
                        {group.skills.map((skill) => (
                          <div key={skill.id} className="flex items-center gap-2.5">
                            <Checkbox.Root
                              id={`skill-${skill.id}`}
                              checked={activeSkills.includes(skill.id)}
                              onCheckedChange={() =>
                                toggleArrayParam("skills", skill.id, activeSkills)
                              }
                              className="relative h-4 w-4 shrink-0 cursor-pointer border border-stone-700 bg-stone-900 transition-colors hover:border-amber-600 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-950"
                            >
                              <Checkbox.Indicator className="absolute inset-0 flex items-center justify-center">
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                  <path d="M1 4l2 2 4-4" stroke="#f7bd48" strokeWidth="1.2" strokeLinecap="square" />
                                </svg>
                              </Checkbox.Indicator>
                            </Checkbox.Root>
                            <label
                              htmlFor={`skill-${skill.id}`}
                              className="cursor-pointer font-serif text-xs text-stone-400 hover:text-stone-200"
                            >
                              {skill.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                orientation="vertical"
                className="flex w-1.5 touch-none select-none bg-stone-900 p-0.5"
              >
                <ScrollArea.Thumb className="relative flex-1 bg-stone-700" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── Tier ── */}
        <Accordion.Item value="tier">
          <SectionTrigger
            icon={Icons.tier}
            label="Tier"
            isActive={!!activeFilters.tier}
          />
          <Accordion.Content className="overflow-hidden">
            <div className="space-y-0.5 bg-black/20 py-2 pl-10 pr-4 text-xs">
              {ALL_ITEM_TIERS.map((tier) => (
                <FilterOption
                  key={tier}
                  label={tier}
                  isActive={activeFilters.tier === tier}
                  onClick={() => setParam("tier", tier, activeFilters.tier)}
                />
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── Weapon Type ── */}
        <Accordion.Item value="weapon-type">
          <SectionTrigger
            icon={Icons.weapon}
            label="Weapon Type"
            isActive={!!activeFilters.weaponType}
          />
          <Accordion.Content className="overflow-hidden">
            <div className="space-y-0.5 bg-black/20 py-2 pl-10 pr-4 text-xs">
              {ALL_WEAPON_TYPES.map((wt) => (
                <FilterOption
                  key={wt}
                  label={wt}
                  isActive={activeFilters.weaponType === wt}
                  onClick={() => setParam("weaponType", wt, activeFilters.weaponType)}
                />
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* ── D2 Instance Filters ── */}
        <Accordion.Item value="d2-instance">
          <SectionTrigger
            icon={Icons.instance}
            label="Item Instance"
            isActive={hasD2Active}
          />
          <Accordion.Content className="overflow-hidden">
            <div className="space-y-5 bg-black/30 p-4">

              {/* D2 Item Type */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">Item Type</p>
                <ScrollArea.Root className="max-h-40 overflow-hidden">
                  <ScrollArea.Viewport className="h-full w-full">
                    <div className="space-y-0.5 pr-1">
                      {D2_ITEM_TYPES.map((t) => (
                        <FilterOption
                          key={t}
                          label={D2_TYPE_LABELS[t]}
                          isActive={d2type === t}
                          onClick={() => setRangeParam("d2type", d2type === t ? "" : t)}
                        />
                      ))}
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation="vertical" className="flex w-1.5 touch-none select-none bg-stone-900 p-0.5">
                    <ScrollArea.Thumb className="relative flex-1 bg-stone-700" />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </div>

              {/* D2 Rarity */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">Rarity</p>
                <div className="space-y-0.5">
                  {D2_ITEM_RARITIES.map((r) => (
                    <FilterOption
                      key={r}
                      label={D2_RARITY_LABELS[r]}
                      isActive={d2rarity === r}
                      onClick={() => setRangeParam("d2rarity", d2rarity === r ? "" : r)}
                    />
                  ))}
                </div>
              </div>

              {/* Item Level range */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">Item Level (ilvl)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    placeholder="Min"
                    defaultValue={ilvlMin}
                    key={`ilvlMin-${ilvlMin}`}
                    onBlur={(e) => setRangeParam("ilvlMin", e.target.value)}
                    className="w-full border border-stone-800 bg-stone-950/80 px-2 py-1.5 font-serif text-xs text-stone-200 placeholder-stone-700 outline-none focus:border-amber-500"
                    aria-label="Min item level"
                  />
                  <input
                    type="number"
                    min={1}
                    max={99}
                    placeholder="Max"
                    defaultValue={ilvlMax}
                    key={`ilvlMax-${ilvlMax}`}
                    onBlur={(e) => setRangeParam("ilvlMax", e.target.value)}
                    className="w-full border border-stone-800 bg-stone-950/80 px-2 py-1.5 font-serif text-xs text-stone-200 placeholder-stone-700 outline-none focus:border-amber-500"
                    aria-label="Max item level"
                  />
                </div>
              </div>

              {/* Sockets range */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">Sockets</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={6}
                    placeholder="Min"
                    defaultValue={socketsMin}
                    key={`socketsMin-${socketsMin}`}
                    onBlur={(e) => setRangeParam("socketsMin", e.target.value)}
                    className="w-full border border-stone-800 bg-stone-950/80 px-2 py-1.5 font-serif text-xs text-stone-200 placeholder-stone-700 outline-none focus:border-amber-500"
                    aria-label="Min sockets"
                  />
                  <input
                    type="number"
                    min={0}
                    max={6}
                    placeholder="Max"
                    defaultValue={socketsMax}
                    key={`socketsMax-${socketsMax}`}
                    onBlur={(e) => setRangeParam("socketsMax", e.target.value)}
                    className="w-full border border-stone-800 bg-stone-950/80 px-2 py-1.5 font-serif text-xs text-stone-200 placeholder-stone-700 outline-none focus:border-amber-500"
                    aria-label="Max sockets"
                  />
                </div>
              </div>

              {/* Stat key + min */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">Stat Filter</p>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder='e.g. "all_resist"'
                    defaultValue={statKey}
                    key={`statKey-${statKey}`}
                    onBlur={(e) => setRangeParam("statKey", e.target.value)}
                    className="w-full border border-stone-800 bg-stone-950/80 px-2 py-1.5 font-serif text-xs text-stone-200 placeholder-stone-700 outline-none focus:border-amber-500"
                    aria-label="Stat key"
                  />
                  <input
                    type="number"
                    placeholder="Min value"
                    defaultValue={statMin}
                    key={`statMin-${statMin}`}
                    onBlur={(e) => setRangeParam("statMin", e.target.value)}
                    className="w-full border border-stone-800 bg-stone-950/80 px-2 py-1.5 font-serif text-xs text-stone-200 placeholder-stone-700 outline-none focus:border-amber-500"
                    aria-label="Min stat value"
                  />
                </div>
              </div>

              {/* Ethereal */}
              <div className="flex items-center gap-2.5">
                <Checkbox.Root
                  id="sidebar-ethereal"
                  checked={ethereal}
                  onCheckedChange={(checked) => setRangeParam("ethereal", checked ? "true" : "")}
                  className="relative h-4 w-4 shrink-0 cursor-pointer border border-stone-700 bg-stone-900 transition-colors hover:border-amber-600 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-950"
                >
                  <Checkbox.Indicator className="absolute inset-0 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2 2 4-4" stroke="#f7bd48" strokeWidth="1.2" strokeLinecap="square" />
                    </svg>
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="sidebar-ethereal" className="cursor-pointer font-serif text-xs text-stone-400 hover:text-stone-200">
                  Ethereal only
                </label>
              </div>

              {/* Perfect roll */}
              <div className="flex items-center gap-2.5">
                <Checkbox.Root
                  id="sidebar-perfect"
                  checked={isPerfect}
                  onCheckedChange={(checked) => setRangeParam("isPerfect", checked ? "true" : "")}
                  className="relative h-4 w-4 shrink-0 cursor-pointer border border-stone-700 bg-stone-900 transition-colors hover:border-amber-600 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-950"
                >
                  <Checkbox.Indicator className="absolute inset-0 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2 2 4-4" stroke="#f7bd48" strokeWidth="1.2" strokeLinecap="square" />
                    </svg>
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="sidebar-perfect" className="cursor-pointer font-serif text-xs text-stone-400 hover:text-stone-200">
                  Perfect rolls only
                </label>
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      {/* Sticky reset footer */}
      <div className="sticky bottom-0 mt-auto border-t border-stone-900 bg-stone-950/80 p-6 backdrop-blur-sm">
        <button
          type="button"
          onClick={resetSidebar}
          className="w-full border border-stone-800 py-3 font-serif text-sm tracking-widest text-stone-400 uppercase transition-all hover:bg-stone-900 hover:text-stone-200"
        >
          Reset Filters
        </button>
      </div>
    </aside>
  )
}
