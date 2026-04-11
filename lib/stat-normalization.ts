/**
 * D2R stat normalization utilities.
 *
 * Provides canonical stat key resolution, searchText generation,
 * weighted score computation, and perfect-roll detection.
 */

import type { ItemRarity } from "@/generated/prisma/client"

// ─── Alias map: raw input → canonical key ────────────────────────────────────

const ALIASES: Record<string, string> = {
  // Faster Cast Rate
  fcr: "faster_cast_rate",
  "faster cast rate": "faster_cast_rate",
  "faster casting rate": "faster_cast_rate",
  // Faster Hit Recovery
  fhr: "faster_hit_recovery",
  "faster hit recovery": "faster_hit_recovery",
  // Faster Run/Walk
  frw: "faster_run_walk",
  "faster run walk": "faster_run_walk",
  "faster run/walk": "faster_run_walk",
  // Increased Attack Speed
  ias: "increased_attack_speed",
  "increased attack speed": "increased_attack_speed",
  // Faster Block Rate
  fbr: "faster_block_rate",
  "faster block rate": "faster_block_rate",
  // Magic Find
  mf: "magic_find",
  "magic find": "magic_find",
  // Gold Find
  gf: "gold_find",
  "gold find": "gold_find",
  // All Skills
  skills: "all_skills",
  "+skills": "all_skills",
  "all skills": "all_skills",
  "+to all skill levels": "all_skills",
  // Class skills
  "amazon skills": "amazon_skills",
  "sorceress skills": "sorceress_skills",
  "necromancer skills": "necromancer_skills",
  "paladin skills": "paladin_skills",
  "barbarian skills": "barbarian_skills",
  "druid skills": "druid_skills",
  "assassin skills": "assassin_skills",
  // Resistances
  res: "all_resistances",
  allres: "all_resistances",
  "all res": "all_resistances",
  "all resistances": "all_resistances",
  fr: "fire_resist",
  "fire resist": "fire_resist",
  cr: "cold_resist",
  "cold resist": "cold_resist",
  lr: "lightning_resist",
  "lightning resist": "lightning_resist",
  pr: "poison_resist",
  "poison resist": "poison_resist",
  // Core stats
  str: "strength",
  dex: "dexterity",
  vit: "vitality",
  ene: "energy",
  "all attributes": "all_attributes",
  // Life / Mana
  hp: "life",
  // Damage
  ed: "enhanced_damage",
  "enhanced damage": "enhanced_damage",
  ds: "deadly_strike",
  "deadly strike": "deadly_strike",
  cb: "crushing_blow",
  "crushing blow": "crushing_blow",
  ow: "open_wounds",
  "open wounds": "open_wounds",
  // Life/Mana steal
  ll: "life_steal",
  "life leech": "life_steal",
  "life steal": "life_steal",
  ml: "mana_steal",
  "mana leech": "mana_steal",
  "mana steal": "mana_steal",
  // Misc
  sock: "sockets",
  sox: "sockets",
  "cannot be frozen": "cannot_be_frozen",
  cbf: "cannot_be_frozen",
}

// ─── Stat weights for score computation ──────────────────────────────────────

const STAT_WEIGHTS: Record<string, number> = {
  faster_cast_rate: 2.5,
  faster_hit_recovery: 1.8,
  faster_run_walk: 1.2,
  increased_attack_speed: 2.0,
  magic_find: 2.0,
  all_skills: 5.0,
  all_resistances: 3.0,
  fire_resist: 1.2,
  cold_resist: 1.2,
  lightning_resist: 1.2,
  poison_resist: 1.0,
  enhanced_damage: 1.5,
  deadly_strike: 1.8,
  crushing_blow: 2.0,
  life: 0.05,
  mana: 0.03,
  strength: 0.4,
  dexterity: 0.4,
  life_steal: 2.5,
  mana_steal: 1.5,
  cannot_be_frozen: 4.0,
  faster_block_rate: 1.0,
  gold_find: 0.8,
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Maps raw stat aliases to a canonical snake_case key.
 * Returns null when the input is unrecognised.
 */
export function normalizeStatKey(raw: string): string | null {
  const lower = raw.toLowerCase().trim()
  if (ALIASES[lower]) return ALIASES[lower]
  // Already canonical (snake_case with letters/underscores only)
  if (/^[a-z][a-z0-9_]+$/.test(lower)) return lower
  return null
}

/**
 * Extracts sorted canonical stat keys present in a stats record.
 */
export function extractStatKeys(stats: Record<string, unknown>): string[] {
  return Object.keys(stats)
    .map((k) => normalizeStatKey(k) ?? k)
    .sort()
}

/**
 * Builds a flat searchText string for GIN indexing:
 * "{name} {baseName} {stat1} {val1} {stat2} {val2}..."
 */
export function computeSearchText(
  name: string | null | undefined,
  baseName: string,
  stats: Record<string, unknown>,
): string {
  const parts: string[] = [baseName]
  if (name) parts.unshift(name)

  for (const [key, val] of Object.entries(stats)) {
    const canonical = normalizeStatKey(key) ?? key
    // Replace underscores for readability in the search string
    const label = canonical.replace(/_/g, " ")
    parts.push(`${label} ${String(val)}`)
  }

  return parts.join(" ").toLowerCase()
}

/**
 * Computes a sortable float score using per-stat weights.
 * Higher = more valuable item.
 */
export function computeScore(
  stats: Record<string, unknown>,
  rarity: ItemRarity,
): number {
  const rarityMultiplier: Record<ItemRarity, number> = {
    NORMAL: 0.5,
    MAGIC: 0.8,
    RARE: 1.2,
    SET: 1.3,
    UNIQUE: 1.5,
    RUNEWORD: 1.4,
    CRAFTED: 1.1,
  }

  let score = 0
  for (const [key, val] of Object.entries(stats)) {
    const canonical = normalizeStatKey(key) ?? key
    const weight = STAT_WEIGHTS[canonical] ?? 0.1
    const numeric = typeof val === "number" ? val : 0
    score += weight * numeric
  }

  return score * (rarityMultiplier[rarity] ?? 1)
}

/**
 * Returns true when all affix values are at their maximum (perfect rolls).
 * Returns null when no affixes are provided.
 */
export function isPerfectRoll(
  affixes: Array<{ value: number | null; affix: { maxValue: number | null } }>,
): boolean | null {
  if (affixes.length === 0) return null
  return affixes.every(
    (a) =>
      a.affix.maxValue === null ||
      a.value === null ||
      a.value >= a.affix.maxValue,
  )
}
