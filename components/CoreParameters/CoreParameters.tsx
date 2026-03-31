"use client"

import {
  CRAFTING_STATE_LABELS,
  RELIC_STATUS_LABELS,
  type CraftingState,
  type RelicStatus,
  type TradingFilterState,
} from "@/types/trading"
import * as Checkbox from "@radix-ui/react-checkbox"
import * as Select from "@radix-ui/react-select"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

// ── Props ──────────────────────────────────────────────────────────────────

export interface CoreParametersProps {
  activeFilters: TradingFilterState
}

// ── Styled Select sub-components ──────────────────────────────────────────

function PremiumSelect({
  value,
  onValueChange,
  placeholder,
  options,
  ariaLabel,
}: {
  value?: string
  onValueChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  ariaLabel: string
}) {
  return (
    <Select.Root value={value ?? ""} onValueChange={onValueChange}>
      <Select.Trigger
        className="flex w-full cursor-pointer items-center justify-between border border-stone-800 bg-stone-950/50 px-3 py-2 font-serif text-xs text-stone-400 outline-none transition-all hover:bg-stone-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
        aria-label={ariaLabel}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-100 overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center px-3 py-2 font-serif text-xs text-stone-400 outline-none transition-colors hover:bg-stone-900 hover:text-amber-400 data-[state=checked]:text-amber-500"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

// ── Label cap helper ──────────────────────────────────────────────────────

function LabelCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">
      {children}
    </span>
  )
}

// ── Sigil Checkbox ────────────────────────────────────────────────────────

function SigilCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none border border-amber-900/50 bg-stone-950 transition-all duration-300 hover:border-amber-500/50 focus:outline-none data-[state=checked]:border-amber-500 data-[state=checked]:shadow-[0_0_10px_rgba(247,189,72,0.2)]"
        style={{
          background: checked
            ? "radial-gradient(circle, rgba(247,189,72,0.3) 0%, transparent 70%)"
            : undefined,
        }}
      >
        <Checkbox.Indicator className="absolute inset-0 flex items-center justify-center font-serif text-xs text-amber-400">
          ✧
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label htmlFor={id} className="cursor-pointer font-serif text-xs leading-snug text-stone-400 hover:text-stone-200">
        {label}
      </label>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CoreParameters({ activeFilters }: CoreParametersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "" || value === "all") {
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

  const resetAll = useCallback(() => {
    const coreKeys = [
      "relicStatus", "craftingState", "levelMin", "levelMax",
      "rarity", "sellerStanding", "ladder", "mode", "platform",
      "region", "version",
    ]
    const params = new URLSearchParams(searchParams.toString())
    coreKeys.forEach((k) => params.delete(k))
    params.delete("page")
    router.replace(`/trading?${params.toString()}`)
  }, [router, searchParams])

  const activeRelicStatus: string[] = activeFilters.relicStatus ?? []
  const activeCraftingState: string[] = activeFilters.craftingState ?? []

  return (
    <section
      className="relative mb-12 overflow-hidden border border-amber-900/15 shadow-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(30,30,30,0.6) 0%, rgba(15,15,15,0.8) 100%)",
        backdropFilter: "blur(12px)",
      }}
      aria-label="Core filter parameters"
    >
      {/* Cross-hatch overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100' stroke='rgba(255,255,255,0.02)' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-amber-900/20 bg-white/2 px-8 py-4">
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 4h14M4 8h8M7 12h2" stroke="rgba(247,189,72,0.6)" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          <span className="font-serif text-xs font-bold tracking-[0.2em] text-amber-500/80 uppercase">
            The Great Filter: Core Parameters
          </span>
        </div>
        <span className="font-serif text-[9px] tracking-widest text-stone-600 uppercase italic">
          Cycle 4.1.{new Date().getDate()}
        </span>
      </div>

      <div className="p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-12">

          {/* ── Column 1: Relic Status + Crafting State ── */}
          <div className="space-y-8 xl:col-span-4">
            {/* Relic Status */}
            <fieldset>
              <LabelCap>Relic Status</LabelCap>
              <div className="space-y-3">
                {(Object.keys(RELIC_STATUS_LABELS) as RelicStatus[]).map((key) => (
                  <SigilCheckbox
                    key={key}
                    id={`relic-${key}`}
                    label={RELIC_STATUS_LABELS[key]}
                    checked={activeRelicStatus.includes(key)}
                    onCheckedChange={() =>
                      toggleArrayParam("relicStatus", key, activeRelicStatus)
                    }
                  />
                ))}
              </div>
            </fieldset>

            {/* Crafting State */}
            <fieldset>
              <LabelCap>Crafting State</LabelCap>
              <div className="space-y-3">
                {(Object.keys(CRAFTING_STATE_LABELS) as CraftingState[]).map((key) => (
                  <SigilCheckbox
                    key={key}
                    id={`craft-${key}`}
                    label={CRAFTING_STATE_LABELS[key]}
                    checked={activeCraftingState.includes(key)}
                    onCheckedChange={() =>
                      toggleArrayParam("craftingState", key, activeCraftingState)
                    }
                  />
                ))}
              </div>
            </fieldset>
          </div>

          {/* ── Column 2: Soul Requirements + Rarity + Standing ── */}
          <div className="space-y-8 xl:col-span-4">
            {/* Required Level range */}
            <fieldset>
              <LabelCap>Soul Requirements — Required Level</LabelCap>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="Min"
                  value={activeFilters.levelMin ?? ""}
                  onChange={(e) => updateParam("levelMin", e.target.value)}
                  className="w-20 border border-stone-800 bg-stone-950/80 px-3 py-2 font-serif text-xs text-stone-200 placeholder-stone-700 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                  aria-label="Minimum required level"
                />
                <span className="text-stone-600">—</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="Max"
                  value={activeFilters.levelMax ?? ""}
                  onChange={(e) => updateParam("levelMax", e.target.value)}
                  className="w-20 border border-stone-800 bg-stone-950/80 px-3 py-2 font-serif text-xs text-stone-200 placeholder-stone-700 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                  aria-label="Maximum required level"
                />
              </div>
            </fieldset>

            {/* Base Item Rarity */}
            <div>
              <LabelCap>Base Item Rarity</LabelCap>
              <PremiumSelect
                ariaLabel="Base item rarity"
                value={activeFilters.rarity}
                onValueChange={(v) => updateParam("rarity", v)}
                placeholder="Any Rarity"
                options={[
                  { value: "all", label: "Any Rarity" },
                  { value: "Normal", label: "Normal" },
                  { value: "Magic", label: "Magic" },
                  { value: "Rare", label: "Rare" },
                  { value: "Unique", label: "Unique" },
                  { value: "Set", label: "Set" },
                ]}
              />
            </div>

            {/* User Standing */}
            <div>
              <LabelCap>User Standing</LabelCap>
              <PremiumSelect
                ariaLabel="Seller standing"
                value={activeFilters.sellerStanding}
                onValueChange={(v) => updateParam("sellerStanding", v)}
                placeholder="Any Rating"
                options={[
                  { value: "all", label: "Any Rating" },
                  { value: "New", label: "New" },
                  { value: "Regular", label: "Regular" },
                  { value: "Trusted", label: "Trusted" },
                  { value: "Verified", label: "Verified" },
                ]}
              />
            </div>
          </div>

          {/* ── Column 3: Game Metadata dropdowns ── */}
          <div className="space-y-5 xl:col-span-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <LabelCap>Ladder</LabelCap>
                <PremiumSelect
                  ariaLabel="Ladder"
                  value={activeFilters.ladder}
                  onValueChange={(v) => updateParam("ladder", v)}
                  placeholder="All"
                  options={[
                    { value: "all", label: "All" },
                    { value: "Ladder", label: "Ladder" },
                    { value: "NonLadder", label: "Non-Ladder" },
                    { value: "Both", label: "Both" },
                  ]}
                />
              </div>
              <div>
                <LabelCap>Mode</LabelCap>
                <PremiumSelect
                  ariaLabel="Game mode"
                  value={activeFilters.mode}
                  onValueChange={(v) => updateParam("mode", v)}
                  placeholder="All"
                  options={[
                    { value: "all", label: "All" },
                    { value: "Softcore", label: "Softcore" },
                    { value: "Hardcore", label: "Hardcore" },
                    { value: "Both", label: "Both" },
                  ]}
                />
              </div>
              <div>
                <LabelCap>Platform</LabelCap>
                <PremiumSelect
                  ariaLabel="Platform"
                  value={activeFilters.platform}
                  onValueChange={(v) => updateParam("platform", v)}
                  placeholder="All"
                  options={[
                    { value: "all", label: "All" },
                    { value: "PC", label: "PC" },
                    { value: "Console", label: "Console" },
                    { value: "Both", label: "Both" },
                  ]}
                />
              </div>
              <div>
                <LabelCap>Version</LabelCap>
                <PremiumSelect
                  ariaLabel="Version"
                  value={activeFilters.version}
                  onValueChange={(v) => updateParam("version", v)}
                  placeholder="ETR"
                  options={[
                    { value: "all", label: "All" },
                    { value: "ETR", label: "ETR" },
                    { value: "OTR", label: "OTR" },
                  ]}
                />
              </div>
            </div>

            <div>
              <LabelCap>Region</LabelCap>
              <PremiumSelect
                ariaLabel="Region"
                value={activeFilters.region}
                onValueChange={(v) => updateParam("region", v)}
                placeholder="Global"
                options={[
                  { value: "all", label: "Global" },
                  { value: "Americas", label: "Americas" },
                  { value: "Europe", label: "Europe" },
                  { value: "Asia", label: "Asia" },
                ]}
              />
            </div>

            {/* Reset All */}
            <div className="pt-2">
              <button
                onClick={resetAll}
                className="w-full border border-stone-800 py-3 font-serif text-sm tracking-widest text-stone-400 uppercase transition-all hover:border-amber-900/50 hover:bg-stone-900 hover:text-stone-200"
                type="button"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
