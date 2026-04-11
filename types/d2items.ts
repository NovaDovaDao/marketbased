/**
 * D2R item-system types + Zod validation schemas
 */

import { z } from "zod"

// ─── Enum mirrors (match Prisma schema) ──────────────────────────────────────

export const D2_ITEM_RARITIES = [
  "NORMAL",
  "MAGIC",
  "RARE",
  "SET",
  "UNIQUE",
  "RUNEWORD",
  "CRAFTED",
] as const
export type D2ItemRarity = (typeof D2_ITEM_RARITIES)[number]

export const D2_ITEM_TYPES = [
  "HELMET",
  "ARMOR",
  "SHIELD",
  "GLOVES",
  "BOOTS",
  "BELT",
  "WEAPON",
  "RING",
  "AMULET",
  "CHARM",
  "JEWEL",
  "RUNE",
  "GEM",
  "MISC",
] as const
export type D2ItemType = (typeof D2_ITEM_TYPES)[number]

export const D2_EQUIPMENT_SLOTS = [
  "HEAD",
  "BODY",
  "HANDS",
  "FEET",
  "WAIST",
  "WEAPON",
  "OFFHAND",
  "FINGER",
  "NECK",
  "INVENTORY",
] as const
export type D2EquipmentSlot = (typeof D2_EQUIPMENT_SLOTS)[number]

export const D2_TRADE_CURRENCIES = ["SPACE_DUST", "RUNE", "ITEM"] as const
export type D2TradeCurrency = (typeof D2_TRADE_CURRENCIES)[number]

export const D2_GAME_MODES = ["SOFTCORE", "HARDCORE"] as const
export type D2GameMode = (typeof D2_GAME_MODES)[number]

export const D2_LADDER_TYPES = ["LADDER", "NON_LADDER"] as const
export type D2LadderType = (typeof D2_LADDER_TYPES)[number]

// ─── API: POST /api/items ─────────────────────────────────────────────────────

export const CreateItemInstanceSchema = z.object({
  baseItemId: z.string().min(1),
  rarity: z.enum(D2_ITEM_RARITIES),
  name: z.string().optional(),
  ilvl: z.number().int().min(1).max(100).optional(),
  sockets: z.number().int().min(0).max(6).optional(),
  ethereal: z.boolean().optional().default(false),
  identified: z.boolean().optional().default(true),
  gameMode: z.enum(D2_GAME_MODES).optional().default("SOFTCORE"),
  ladder: z.enum(D2_LADDER_TYPES).optional().default("NON_LADDER"),
  stats: z.record(z.string(), z.unknown()),
  rawText: z.string().optional(),
  affixes: z
    .array(
      z.object({
        affixId: z.string().min(1),
        value: z.number().int().optional(),
      }),
    )
    .optional()
    .default([]),
})

export type CreateItemInstanceInput = z.infer<typeof CreateItemInstanceSchema>

// ─── API: GET /api/items response ────────────────────────────────────────────

export interface BaseItemData {
  id: string
  name: string
  type: D2ItemType
  baseType: string
  socketsMax: number | null
  requiredLvl: number | null
}

export interface ItemInstanceData {
  id: string
  name: string | null
  rarity: D2ItemRarity
  ilvl: number | null
  sockets: number | null
  ethereal: boolean
  identified: boolean
  gameMode: D2GameMode
  ladder: D2LadderType
  statKeys: string[]
  searchText: string | null
  score: number | null
  isPerfect: boolean | null
  stats: Record<string, unknown>
  baseItem: BaseItemData
}

export interface D2ListingResult {
  listingId: string
  itemInstanceId: string
  tradeCurrency: D2TradeCurrency | null
  spaceDustPrice: number | null
  status: string
  createdAt: string
  sellerUsername: string
  instance: ItemInstanceData
}

// ─── Filter params for GET /api/items and /trading page ──────────────────────

export interface D2ItemFilters {
  d2type?: D2ItemType
  d2rarity?: D2ItemRarity
  ethereal?: boolean
  ilvlMin?: number
  ilvlMax?: number
  socketsMin?: number
  socketsMax?: number
  statKey?: string
  statMin?: number
  statKeys?: string       // comma-separated canonical keys (hasSome filter)
  name?: string
  q?: string              // free-text query (parsed by query-parser)
  gameMode?: D2GameMode
  ladder?: D2LadderType
  isPerfect?: boolean
  page?: number
}

// ─── Parsed query type (from lib/query-parser.ts) ────────────────────────────

export interface ParsedStatFilter {
  key: string
  min: number
}

export interface ParsedItemQuery {
  name?: string
  statFilters: ParsedStatFilter[]
  ethereal?: boolean
  sockets?: number
  ilvlMin?: number
  ilvlMax?: number
  gameMode?: D2GameMode
  ladder?: D2LadderType
  rarity?: D2ItemRarity
}

// ─── API: GET /api/items/catalog response ────────────────────────────────────

export interface CatalogItem {
  id: string
  kind: "base" | "unique" | "set-item" | "runeword"
  name: string
  type: D2ItemType | null
  rarity: D2ItemRarity
  baseType: string
  stats: Record<string, unknown> | null
}

export interface CatalogPage {
  items: CatalogItem[]
  total: number
  page: number
  pageSize: number
}


export interface D2ListingResult {
  listingId: string
  itemInstanceId: string
  tradeCurrency: D2TradeCurrency | null
  spaceDustPrice: number | null
  status: string
  createdAt: string
  sellerUsername: string
  instance: ItemInstanceData
}

// ─── Filter params for GET /api/items and /trading page ──────────────────────

export interface D2ItemFilters {
  d2type?: D2ItemType
  d2rarity?: D2ItemRarity
  ethereal?: boolean
  ilvlMin?: number
  ilvlMax?: number
  socketsMin?: number
  socketsMax?: number
  statKey?: string
  statMin?: number
  name?: string
  page?: number
}

// ─── API: GET /api/items/catalog response ────────────────────────────────────

export interface CatalogItem {
  id: string
  kind: "base" | "unique" | "set-item" | "runeword"
  name: string
  type: D2ItemType | null
  rarity: D2ItemRarity
  baseType: string
  stats: Record<string, unknown> | null
}

export interface CatalogPage {
  items: CatalogItem[]
  total: number
  page: number
  pageSize: number
}
