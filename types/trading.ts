// ── Domain unions ────────────────────────────────────────────────────────────

export type Category =
  | "Uniques"
  | "Runes"
  | "Runewords"
  | "Sets"
  | "Base"
  | "Crafted"
  | "Charms"
  | "Gems"
  | "Misc"
  | "Services"

export type ItemType =
  | "Amulet"
  | "Ring"
  | "Helm"
  | "Amazon Bow"
  | "Axe"
  | "Belt"
  | "Body Armor"
  | "Boots"
  | "Bow"
  | "Charm"
  | "Crossbow"
  | "Dagger"
  | "Gloves"
  | "Jewel"
  | "Mace"
  | "Polearm"
  | "Shield"
  | "Spear"
  | "Staff"
  | "Sword"
  | "Wand"

export type BodyLocation =
  | "Arm"
  | "Feet"
  | "Finger"
  | "Hands"
  | "Head"
  | "Neck"
  | "Torso"
  | "Waist"

export type CraftType = "Blood" | "Caster" | "Hit Power" | "Safety"

export type GemType = "Chipped" | "Flawed" | "Normal" | "Flawless" | "Perfect"

export type ItemTier = "Elite" | "Exceptional" | "Normal"

export type WeaponType = "1 Handed" | "2 Handed"

export type RelicStatus = "free" | "makeOffer" | "ethereal" | "unidentified"

export type CraftingState = "hasHel" | "isBase" | "isUpgraded"

export type BaseRarity = "Normal" | "Magic" | "Rare" | "Unique" | "Set"

export type SellerStanding = "New" | "Regular" | "Trusted" | "Verified"

export type Ladder = "Ladder" | "NonLadder" | "Both"

export type GameMode = "Softcore" | "Hardcore" | "Both"

export type Platform = "PC" | "Console" | "Both"

export type Region = "Global" | "Americas" | "Europe" | "Asia"

export type Version = "ETR" | "OTR"

// ── Core listing entity ──────────────────────────────────────────────────────

export interface TradingListing {
  id: string
  name: string
  slug: string
  image: string

  // Classification
  category: Category
  itemType: ItemType | null
  bodyLocation: BodyLocation | null
  craftType: CraftType | null
  gemType: GemType | null
  tier: ItemTier
  weaponType: WeaponType | null
  rarity: BaseRarity
  sellerStanding: SellerStanding

  // Stats & skills shown on the card
  stats: string[]
  skills: string[]

  // Status toggles
  relicStatus: RelicStatus[]
  craftingState: CraftingState[]

  // Requirements
  requiredLevel: number

  // Game metadata
  ladder: Ladder
  mode: GameMode
  platform: Platform
  region: Region
  version: Version

  // Seller info
  sellerId: string

  // Pricing — always integer cents for USD; nullable for optional currencies
  priceUsdCents: number
  priceForumGold: number | null
  priceEth: number | null  // stored as micro-ETH (1 ETH = 1_000_000 units)

  listedAt: string
}

// ── Filter state (mirrors URL search param keys) ─────────────────────────────

export interface TradingFilterState {
  category?: string
  itemType?: string
  bodyLocation?: string
  craftType?: string
  gemType?: string
  tier?: string
  weaponType?: string
  rarity?: string
  sellerStanding?: string
  relicStatus?: string[]
  craftingState?: string[]
  levelMin?: string
  levelMax?: string
  ladder?: string
  mode?: string
  platform?: string
  region?: string
  version?: string
  stats?: string[]
  skills?: string[]
  page?: string
}

// ── Display helpers ──────────────────────────────────────────────────────────

/** Format USD cents to display string, e.g. 28400 → "$284.00" */
export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
}

/** Format micro-ETH to display string, e.g. 60000 → "0.06 ETH" */
export function formatEth(microEth: number): string {
  return `${(microEth / 1_000_000).toFixed(2)} ETH`
}

/** Format space dust with "sd" suffix */
export function formatForumGold(fg: number): string {
  return `${fg.toLocaleString("en-US")} sd`
}

// ── Static filter options (source of truth for UI) ───────────────────────────

export const ALL_CATEGORIES: Category[] = [
  "Uniques", "Runes", "Runewords", "Sets", "Base",
  "Crafted", "Charms", "Gems", "Misc", "Services",
]

export const ALL_ITEM_TYPES: ItemType[] = [
  "Amazon Bow", "Amulet", "Axe", "Belt", "Body Armor", "Boots",
  "Bow", "Charm", "Crossbow", "Dagger", "Gloves", "Helm",
  "Jewel", "Mace", "Polearm", "Ring", "Shield", "Spear",
  "Staff", "Sword", "Wand",
]

export const ALL_BODY_LOCATIONS: BodyLocation[] = [
  "Arm", "Feet", "Finger", "Hands", "Head", "Neck", "Torso", "Waist",
]

export const ALL_CRAFT_TYPES: CraftType[] = ["Blood", "Caster", "Hit Power", "Safety"]

export const ALL_GEM_TYPES: GemType[] = ["Chipped", "Flawed", "Normal", "Flawless", "Perfect"]

export const ALL_ITEM_TIERS: ItemTier[] = ["Elite", "Exceptional", "Normal"]

export const ALL_WEAPON_TYPES: WeaponType[] = ["1 Handed", "2 Handed"]

export const RELIC_STATUS_LABELS: Record<RelicStatus, string> = {
  free: "Sacrificial Offering (Free)",
  makeOffer: "Accepting Tithes (Make Offer)",
  ethereal: "Ethereal Protection",
  unidentified: "Unidentified Artifact",
}

export const CRAFTING_STATE_LABELS: Record<CraftingState, string> = {
  hasHel: "Includes Hel Rune",
  isBase: "Unmade Vessel (Base)",
  isUpgraded: "Transmuted (Upgraded)",
}

export interface SkillGroup {
  class: string
  skills: { id: string; label: string }[]
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    class: "Amazon",
    skills: [
      { id: "bow-crossbow", label: "Bow & Crossbow Skills" },
      { id: "javelin-spear", label: "Javelin & Spear Skills" },
      { id: "passive-magic", label: "Passive & Magic Skills" },
    ],
  },
  {
    class: "Assassin",
    skills: [
      { id: "martial-arts", label: "Martial Arts" },
      { id: "shadow-disciplines", label: "Shadow Disciplines" },
      { id: "traps", label: "Traps" },
    ],
  },
  {
    class: "Barbarian",
    skills: [
      { id: "combat-masteries", label: "Combat Masteries" },
      { id: "combat-skills", label: "Combat Skills" },
      { id: "warcries", label: "Warcries" },
    ],
  },
  {
    class: "Sorceress",
    skills: [
      { id: "cold-spells", label: "Cold Spells" },
      { id: "fire-spells", label: "Fire Spells" },
      { id: "lightning-spells", label: "Lightning Spells" },
    ],
  },
  {
    class: "Necromancer",
    skills: [
      { id: "curses", label: "Curses" },
      { id: "poison-bone", label: "Poison & Bone Spells" },
      { id: "summoning", label: "Summoning Spells" },
    ],
  },
  {
    class: "Paladin",
    skills: [
      { id: "combat", label: "Combat Skills" },
      { id: "defensive-auras", label: "Defensive Auras" },
      { id: "offensive-auras", label: "Offensive Auras" },
    ],
  },
  {
    class: "Druid",
    skills: [
      { id: "elemental", label: "Elemental" },
      { id: "shapeshifting", label: "Shapeshifting" },
      { id: "summoning-druid", label: "Summoning" },
    ],
  },
]

export const STAT_OPTIONS = [
  { id: "all-skills", label: "+To All Skills" },
  { id: "all-resistances", label: "All Resistances" },
  { id: "enhanced-defense", label: "Enhanced Defense" },
  { id: "faster-cast-rate", label: "Faster Cast Rate" },
  { id: "life-per-level", label: "Life Per Character Level" },
  { id: "mana-per-level", label: "Mana Per Character Level" },
  { id: "faster-run-walk", label: "Faster Run/Walk" },
  { id: "magic-find", label: "Better Chance of Getting Magic Items" },
]
