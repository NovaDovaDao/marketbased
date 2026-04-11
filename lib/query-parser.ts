/**
 * D2R item query parser.
 *
 * Converts a natural-language search string like
 * "shako +2skills 50mf eth 6sox ilvl86 hc ladder"
 * into a structured ParsedItemQuery for use in Prisma where clauses.
 */

import type { ItemRarity } from "@/generated/prisma/client"
import { normalizeStatKey } from "./stat-normalization"

// ─── Types ────────────────────────────────────────────────────────────────────

export type GameMode = "SOFTCORE" | "HARDCORE"
export type LadderType = "LADDER" | "NON_LADDER"

export interface StatFilter {
  key: string // canonical stat key
  min: number
}

export interface ParsedItemQuery {
  name?: string
  statFilters: StatFilter[]
  ethereal?: boolean
  sockets?: number
  ilvlMin?: number
  ilvlMax?: number
  gameMode?: GameMode
  ladder?: LadderType
  rarity?: ItemRarity
}

// ─── Token patterns ───────────────────────────────────────────────────────────

// Matches "+2skills", "+2 skills", "+2allskills"
const STAT_PLUS_RE = /^\+(\d+)\s*([a-z_]+)$/i
// Matches "50mf", "100life", "75res", "20fcr"
const STAT_NUM_RE = /^(\d+)([a-z_]+)$/i
// Matches "ilvl86", "ilvl:86"
const ILVL_RE = /^ilvl:?(\d+)(?:-(\d+))?$/i
// Matches "6sox", "4s"
const SOX_RE = /^(\d)[sx]o?x?$/i
// Matches "eth" as standalone flag (not "ethereal" prefix on a stat)
const ETH_FLAG_RE = /^eth(?:ereal)?$/i

// ─── Short-form stat aliases → handled by normalizeStatKey ───────────────────
// Short forms like "mf", "fcr", "fhr" are already in the ALIASES map in stat-normalization.ts

// ─── Item rarity tokens ───────────────────────────────────────────────────────
const RARITY_MAP: Record<string, ItemRarity> = {
  normal: "NORMAL",
  magic: "MAGIC",
  rare: "RARE",
  set: "SET",
  unique: "UNIQUE",
  runeword: "RUNEWORD",
  rw: "RUNEWORD",
  crafted: "CRAFTED",
}

// ─── Game mode tokens ─────────────────────────────────────────────────────────
const GAMEMODE_MAP: Record<string, GameMode> = {
  hc: "HARDCORE",
  hardcore: "HARDCORE",
  sc: "SOFTCORE",
  softcore: "SOFTCORE",
}

// ─── Ladder tokens ────────────────────────────────────────────────────────────
const LADDER_MAP: Record<string, LadderType> = {
  lad: "LADDER",
  ladder: "LADDER",
  nl: "NON_LADDER",
  nonladder: "NON_LADDER",
  "non-ladder": "NON_LADDER",
  "non_ladder": "NON_LADDER",
}

// ─── Main parser ─────────────────────────────────────────────────────────────

/**
 * Parses a freeform D2R search string into structured filter criteria.
 *
 * @example
 * parseItemQuery("shako +2skills 50mf ethereal 6sox ilvl86 hc ladder")
 * // →
 * {
 *   name: "shako",
 *   statFilters: [{ key: "all_skills", min: 2 }, { key: "magic_find", min: 50 }],
 *   ethereal: true,
 *   sockets: 6,
 *   ilvlMin: 86,
 *   gameMode: "HARDCORE",
 *   ladder: "LADDER",
 * }
 */
export function parseItemQuery(raw: string): ParsedItemQuery {
  const result: ParsedItemQuery = { statFilters: [] }
  const nameTokens: string[] = []

  // Split on whitespace while preserving quoted strings
  const tokens = raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  for (const token of tokens) {
    const lower = token.toLowerCase()

    // ── ethereal flag ──
    if (ETH_FLAG_RE.test(lower)) {
      result.ethereal = true
      continue
    }

    // ── game mode ──
    if (lower in GAMEMODE_MAP) {
      result.gameMode = GAMEMODE_MAP[lower]
      continue
    }

    // ── ladder ──
    if (lower in LADDER_MAP) {
      result.ladder = LADDER_MAP[lower]
      continue
    }

    // ── rarity ──
    if (lower in RARITY_MAP) {
      result.rarity = RARITY_MAP[lower]
      continue
    }

    // ── ilvl (e.g. "ilvl86" or "ilvl80-90") ──
    const ilvlMatch = ILVL_RE.exec(lower)
    if (ilvlMatch) {
      result.ilvlMin = parseInt(ilvlMatch[1]!, 10)
      if (ilvlMatch[2]) result.ilvlMax = parseInt(ilvlMatch[2], 10)
      continue
    }

    // ── sockets (e.g. "6sox", "4s") ──
    const soxMatch = SOX_RE.exec(lower)
    if (soxMatch) {
      result.sockets = parseInt(soxMatch[1]!, 10)
      continue
    }

    // ── "+N stat" (e.g. "+2skills", "+20fcr") ──
    const plusMatch = STAT_PLUS_RE.exec(lower)
    if (plusMatch) {
      const min = parseInt(plusMatch[1]!, 10)
      const statRaw = plusMatch[2]!
      const key = normalizeStatKey(statRaw)
      if (key) {
        result.statFilters.push({ key, min })
        continue
      }
    }

    // ── "N stat" (e.g. "50mf", "75res", "20fcr") ──
    const numMatch = STAT_NUM_RE.exec(lower)
    if (numMatch) {
      const min = parseInt(numMatch[1]!, 10)
      const statRaw = numMatch[2]!
      const key = normalizeStatKey(statRaw)
      if (key) {
        result.statFilters.push({ key, min })
        continue
      }
    }

    // ── bare canonical stat key (e.g. "fcr", "mf", "life") ──
    const maybeKey = normalizeStatKey(lower)
    if (maybeKey && maybeKey !== lower) {
      // Only treat as a key hint, not a filter, since there's no value
      // Fall through to name tokens so "life" can match "Vampire Life Spires" etc.
    }

    // ── default: part of item name ──
    nameTokens.push(token)
  }

  if (nameTokens.length > 0) {
    result.name = nameTokens.join(" ")
  }

  return result
}
