/**
 * D2R Item Catalog Seed
 *
 * Reads JSON files from items/d2r/ and upserts them into the database.
 * Also maps the 33 runes from items/runes.json → BaseItem (type: RUNE).
 *
 * Expected file shapes:
 *   items/d2r/base-items.json  → BaseItemSeedRow[]
 *   items/d2r/unique-items.json → UniqueItemSeedRow[]
 *   items/d2r/sets.json         → SetSeedRow[]
 *   items/d2r/runewords.json    → RunewordSeedRow[]
 *   items/d2r/affixes.json      → AffixSeedRow[]
 *   items/d2r/gems.json         → GemSeedRow[]
 *
 * Run: pnpm prisma db seed
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { PrismaClient } from "../generated/prisma/client"
import runesJson from "../items/runes.json"
import statDefsJson from "../items/stat-definitions.json"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─── helpers ────────────────────────────────────────────────────────────────

const D2R_DIR = join(__dirname, "../items/d2r")

function loadJson<T>(filename: string): T[] {
  const path = join(D2R_DIR, filename)
  if (!existsSync(path)) {
    console.warn(`⚠  ${filename} not found — skipping`)
    return []
  }
  return JSON.parse(readFileSync(path, "utf-8")) as T[]
}

// ─── type shapes (match what the user's JSON supplies) ───────────────────────

interface BaseItemSeedRow {
  name: string
  type: string // matches ItemType enum value
  baseType?: string
  ilvl?: number
  requiredLvl?: number
  minDamage?: number
  maxDamage?: number
  defense?: number
  durability?: number
  socketsMax?: number
  stackable?: boolean
}

interface UniqueItemSeedRow {
  name: string
  baseName: string // used to look up BaseItem.name
  level?: number
  stats: Record<string, unknown>
  lore?: string
}

interface SetSeedRow {
  name: string
  bonuses: Record<string, unknown>
  items: Array<{
    name: string
    baseName: string
    stats: Record<string, unknown>
  }>
}

interface RunewordSeedRow {
  name: string
  runes: string[]
  bases: string[]       // valid base type names (e.g. "armor", "weapon")
  attributes: string[]  // raw text lines (e.g. "+2 To All Skills")
  stats: Record<string, unknown>
  level?: number        // required character level
  ladder?: boolean      // ladder-only flag
  tier?: number         // power ranking 1-5
  patch?: number        // version introduced (2.4, 2.6, etc.)
}

interface StatDefSeedRow {
  key: string
  display: string
  category?: string
}

interface AffixSeedRow {
  name: string
  type: string // "prefix" | "suffix"
  tier?: number
  statKey: string
  minValue?: number
  maxValue?: number
  levelReq?: number
}

interface GemSeedRow {
  name: string
  gemType: string
  tier: string
  effect: Record<string, unknown>
}

// ─── seed Rune catalog + rune BaseItems ─────────────────────────────────────

async function seedRunes() {
  console.log("🔸 Seeding Rune catalog + BaseItems from items/runes.json…")
  for (let i = 0; i < runesJson.length; i++) {
    const rune = runesJson[i]!
    // Rune catalog model (for runeword recipe lookups)
    await prisma.rune.upsert({
      where: { name: rune.name },
      update: { tier: i + 1 },
      create: {
        id: `rune-cat-${rune.id}`,
        name: rune.name,
        tier: i + 1,
      },
    })
    // BaseItem entry (for ItemInstance-based rune listings)
    await prisma.baseItem.upsert({
      where: { id: `rune-${rune.id}` },
      update: {},
      create: {
        id: `rune-${rune.id}`,
        name: `${rune.name} Rune`,
        type: "RUNE",
        baseType: rune.tier,
        ilvl: rune.level,
        requiredLvl: rune.level,
        stackable: false,
      },
    })
  }
  console.log(`   ✓ ${runesJson.length} runes`)
}

// ─── seed StatDefinitions ─────────────────────────────────────────────────────

async function seedStatDefinitions() {
  const rows = statDefsJson as StatDefSeedRow[]
  console.log(`🔸 Seeding ${rows.length} stat definitions…`)
  for (const row of rows) {
    await prisma.statDefinition.upsert({
      where: { key: row.key },
      update: { display: row.display, category: row.category ?? null },
      create: {
        key: row.key,
        display: row.display,
        category: row.category ?? null,
      },
    })
  }
  console.log(`   ✓ ${rows.length} stat definitions`)
}

// ─── seed BaseItems ──────────────────────────────────────────────────────────

async function seedBaseItems() {
  const rows = loadJson<BaseItemSeedRow>("base-items.json")
  console.log(`🔸 Seeding ${rows.length} base items…`)
  for (const row of rows) {
    await prisma.baseItem.upsert({
      where: { id: `base-${row.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `base-${row.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: row.name,
        type: row.type as Parameters<typeof prisma.baseItem.create>[0]["data"]["type"],
        baseType: row.baseType ?? "",
        ilvl: row.ilvl,
        requiredLvl: row.requiredLvl,
        minDamage: row.minDamage,
        maxDamage: row.maxDamage,
        defense: row.defense,
        durability: row.durability,
        socketsMax: row.socketsMax,
        stackable: row.stackable ?? false,
      },
    })
  }
  if (rows.length) console.log(`   ✓ ${rows.length} base items`)
}

// ─── seed UniqueItems ────────────────────────────────────────────────────────

async function seedUniqueItems() {
  const rows = loadJson<UniqueItemSeedRow>("unique-items.json")
  console.log(`🔸 Seeding ${rows.length} unique items…`)

  for (const row of rows) {
    const baseItem = await prisma.baseItem.findFirst({
      where: { name: { contains: row.baseName, mode: "insensitive" } },
    })
    if (!baseItem) {
      console.warn(`   ⚠  No BaseItem found for unique "${row.name}" baseName="${row.baseName}" — skipping`)
      continue
    }
    await prisma.uniqueItem.upsert({
      where: { id: `unique-${row.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `unique-${row.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: row.name,
        baseItemId: baseItem.id,
        level: row.level,
        stats: row.stats as never,
        lore: row.lore,
      },
    })
  }
  if (rows.length) console.log(`   ✓ ${rows.length} unique items`)
}

// ─── seed Sets ───────────────────────────────────────────────────────────────

async function seedSets() {
  const rows = loadJson<SetSeedRow>("sets.json")
  console.log(`🔸 Seeding ${rows.length} sets…`)

  for (const row of rows) {
    const setId = `set-${row.name.toLowerCase().replace(/\s+/g, "-")}`
    await prisma.itemSet.upsert({
      where: { id: setId },
      update: {},
      create: {
        id: setId,
        name: row.name,
        bonuses: row.bonuses as never,
      },
    })

    for (const item of row.items) {
      const baseItem = await prisma.baseItem.findFirst({
        where: { name: { contains: item.baseName, mode: "insensitive" } },
      })
      if (!baseItem) {
        console.warn(`   ⚠  No BaseItem for set item "${item.name}" — skipping`)
        continue
      }
      const setItemId = `setitem-${item.name.toLowerCase().replace(/\s+/g, "-")}`
      await prisma.setItem.upsert({
        where: { id: setItemId },
        update: {},
        create: {
          id: setItemId,
          name: item.name,
          setId,
          baseItemId: baseItem.id,
          stats: item.stats as never,
        },
      })
    }
  }
  if (rows.length) console.log(`   ✓ ${rows.length} sets`)
}

// ─── seed Runewords ──────────────────────────────────────────────────────────

async function seedRunewords() {
  const rows = loadJson<RunewordSeedRow>("runewords.json")
  console.log(`🔸 Seeding ${rows.length} runewords…`)

  for (const row of rows) {
    const rwId = `rw-${row.name.toLowerCase().replace(/\s+/g, "-")}`
    await prisma.runeword.upsert({
      where: { name: row.name },
      update: {
        runes: row.runes,
        bases: row.bases ?? [],
        attributes: row.attributes ?? [],
        stats: row.stats as never,
        level: row.level,
        ladder: row.ladder,
        tier: row.tier,
        patch: row.patch,
      },
      create: {
        id: rwId,
        name: row.name,
        runes: row.runes,
        bases: row.bases ?? [],
        attributes: row.attributes ?? [],
        stats: row.stats as never,
        level: row.level,
        ladder: row.ladder,
        tier: row.tier,
        patch: row.patch,
      },
    })
  }
  if (rows.length) console.log(`   ✓ ${rows.length} runewords`)
}

// ─── seed Affixes ────────────────────────────────────────────────────────────

async function seedAffixes() {
  const rows = loadJson<AffixSeedRow>("affixes.json")
  console.log(`🔸 Seeding ${rows.length} affixes…`)
  for (const row of rows) {
    const affixId = `affix-${row.type}-${row.name.toLowerCase().replace(/\s+/g, "-")}`
    await prisma.affix.upsert({
      where: { id: affixId },
      update: {},
      create: {
        id: affixId,
        name: row.name,
        type: row.type,
        tier: row.tier,
        statKey: row.statKey,
        minValue: row.minValue,
        maxValue: row.maxValue,
        levelReq: row.levelReq,
      },
    })
  }
  if (rows.length) console.log(`   ✓ ${rows.length} affixes`)
}

// ─── seed Gems ───────────────────────────────────────────────────────────────

async function seedGems() {
  const rows = loadJson<GemSeedRow>("gems.json")
  console.log(`🔸 Seeding ${rows.length} gems…`)
  for (const row of rows) {
    const gemId = `gem-${row.gemType}-${row.tier}`
    await prisma.gem.upsert({
      where: { id: gemId },
      update: {},
      create: {
        id: gemId,
        name: row.name,
        gemType: row.gemType,
        tier: row.tier,
        effect: row.effect as never,
      },
    })
  }
  if (rows.length) console.log(`   ✓ ${rows.length} gems`)
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting D2R item catalog seed…\n")

  await seedStatDefinitions()
  await seedRunes()
  await seedBaseItems()
  await seedUniqueItems()
  await seedSets()
  await seedRunewords()
  await seedAffixes()
  await seedGems()

  console.log("\n✅ Seed complete")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
