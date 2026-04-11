# D2R Item Catalog — How It Works

End-to-end guide: from JSON files → database → API → UI.

---

## Overview

The item system lets every Diablo II Resurrected item be **listed, searched, and traded** on MarketBase. It is built in four layers:

1. **Static catalogs** — JSON files that describe every item type, stat, and runeword
2. **Database models** — Prisma schema with full-text search indexing and stat normalization
3. **Utility libraries** — stat normalization, query parsing
4. **API + UI** — REST endpoints and React components with SC/HC + Ladder filters

---

## 1. Static Data Files (`items/`)

| File | Shape | Purpose |
|---|---|---|
| `items/runes.json` | `{ id, name, tier, level, slug, image }[]` | 33 runes with tier + level |
| `items/stat-definitions.json` | `{ key, display, category }[]` | ~80 canonical stat keys |
| `items/d2r/base-items.json` | `BaseItemSeedRow[]` | All armor, weapon, and misc base types |
| `items/d2r/unique-items.json` | `UniqueItemSeedRow[]` | Unique items with stats and base lookup name |
| `items/d2r/sets.json` | `SetSeedRow[]` | Set definitions with per-item stats and set bonuses |
| `items/d2r/runewords.json` | `RunewordSeedRow[]` | Runewords with rune recipe, valid bases, attributes |
| `items/d2r/affixes.json` | `AffixSeedRow[]` | Magic/rare prefixes and suffixes |
| `items/d2r/gems.json` | `GemSeedRow[]` | Gems with socketed effects |

All files are consumed by `prisma/seed.ts` and upserted into Postgres.

---

## 2. Seed Script (`prisma/seed.ts`)

Run with:

```bash
pnpm prisma db seed
```

Execution order matters — later functions depend on `BaseItem` rows created earlier:

```
seedStatDefinitions()   ← stat_definition table (no deps)
seedRunes()             ← rune + base_item tables
seedBaseItems()         ← base_item table
seedUniqueItems()       ← unique_item (looks up base_item by name)
seedSets()              ← item_set + set_item (looks up base_item by name)
seedRunewords()         ← runeword table (flat: bases[], attributes[])
seedAffixes()           ← affix table
seedGems()              ← gem table
```

Each function uses `upsert` with a deterministic `id` (e.g. `rune-el`, `unique-shako`, `rw-enigma`), so re-running the seed is safe and idempotent.

### Runes

`seedRunes()` creates two records per rune:

- **`Rune`** — catalog model for runeword recipe lookups (`rune-cat-{id}`)
- **`BaseItem`** (type `RUNE`) — so rune instances can be listed as tradeable items (`rune-{id}`)

### Runewords (flat schema)

Runewords no longer use a join table. The `Runeword` model stores:

```
name       String @unique
runes      String[]        ← ordered rune recipe (e.g. ["Jah", "Ith", "Ber"])
bases      String[]        ← valid base categories (e.g. ["armor", "weapon"])
attributes String[]        ← raw text lines ("+2 To All Skills")
stats      Json            ← structured key/value (for filtering)
level      Int?            ← required character level
ladder     Boolean?        ← ladder-season exclusive
tier       Int?            ← power tier 1–5
patch      Float?          ← version introduced (e.g. 2.4)
```

---

## 3. Database Schema (key models)

### `ItemInstance`

Created when a user lists a real item from their character. The critical computed fields are populated automatically on `POST /api/items`:

| Field | Type | Description |
|---|---|---|
| `gameMode` | `GameMode` | `SOFTCORE` or `HARDCORE` |
| `ladder` | `LadderType` | `LADDER` or `NON_LADDER` |
| `statKeys` | `String[]` | Normalized canonical stat keys (for `hasSome` filtering) |
| `searchText` | `String?` | Flat lowercase string indexed with GIN/pg_trgm for full-text search |
| `score` | `Float?` | Computed quality score (weighted stat sum × rarity multiplier) |
| `isPerfect` | `Boolean?` | True if all affix rolls are at max value |

### Full-text index

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX item_instance_search_text_gin
  ON item_instance USING GIN ("searchText" gin_trgm_ops);
```

This powers `searchText ILIKE '%shako%'` queries at scale.

---

## 4. Utility Libraries

### `lib/stat-normalization.ts`

Provides four exports used by `POST /api/items` after instance creation:

```ts
normalizeStatKey(raw)                          // "res all" → "all_resistances"
extractStatKeys(stats)                         // returns sorted canonical key[]
computeSearchText(name, baseName, stats)       // "shako plumed helm faster cast 45 magic find 50"
computeScore(stats, rarity)                    // weighted sum × rarity multiplier
isPerfectRoll(affixes)                         // true if every affix is at maxValue
```

**Aliases** map ~50 shorthand forms (e.g. `fcr`, `mf`, `res`, `ed`, `ias`) to canonical keys.

**Score weights** by stat: `magic_find` = 1.2, `all_resistances` = 1.5, `faster_cast_rate` = 1.3, etc.
**Rarity multipliers**: UNIQUE ×1.5, RUNEWORD ×1.4, RARE ×1.2, SET ×1.1.

### `lib/query-parser.ts`

Parses free-text search strings into a structured `ParsedItemQuery`:

```
"shako +2skills 50mf eth 6sox ilvl86 hc ladder"
→ {
    name:        "shako",
    statFilters: [{ key: "all_skills", min: 2 }, { key: "magic_find", min: 50 }],
    ethereal:    true,
    sockets:     6,
    ilvlMin:     86,
    gameMode:    "HARDCORE",
    ladder:      "LADDER",
  }
```

Token patterns:

| Pattern | Example | Maps to |
|---|---|---|
| `+Nstatkey` | `+2skills` | `statFilters` |
| `Nstatkey` | `50mf`, `75res` | `statFilters` |
| `eth` / `ethereal` | `eth` | `ethereal: true` |
| `Nsox` / `Ns` | `6sox`, `4s` | `sockets: N` |
| `ilvlN` | `ilvl86` | `ilvlMin: N` |
| `hc` / `hardcore` | `hc` | `gameMode: HARDCORE` |
| `sc` / `softcore` | `sc` | `gameMode: SOFTCORE` |
| `lad` / `ladder` | `lad` | `ladder: LADDER` |
| `nl` / `nonladder` | `nl` | `ladder: NON_LADDER` |
| `unique`, `rare`, `set`, `rw` | `unique` | `rarity` |
| anything else | `shako` | `name` fragment |

---

## 5. API

### `POST /api/items` — create a listed item instance

Accepts `CreateItemInstanceSchema` (defined in `types/d2items.ts`):

```jsonc
{
  "baseItemId": "shako",
  "rarity": "UNIQUE",
  "name": "Harlequin Crest",
  "ilvl": 90,
  "sockets": 0,
  "ethereal": false,
  "gameMode": "SOFTCORE",
  "ladder": "NON_LADDER",
  "stats": { "magic_find": 50, "faster_cast_rate": 0, "all_skills": 2 },
  "affixes": [{ "affixId": "affix-prefix-all-skills", "value": 2 }]
}
```

After the `ItemInstance` row is created, the route:
1. Calls `extractStatKeys(stats)` → stores in `statKeys[]`
2. Calls `computeSearchText(...)` → stores in `searchText`
3. Calls `computeScore(...)` → stores in `score`
4. Calls `isPerfectRoll(affixes)` → stores in `isPerfect`

### `GET /api/items` — search active listings

Supported query params:

| Param | Type | Description |
|---|---|---|
| `q` | string | Free-text (parsed by `parseItemQuery`) |
| `gameMode` | `SOFTCORE\|HARDCORE` | Filter by game mode |
| `ladder` | `LADDER\|NON_LADDER` | Filter by ladder status |
| `d2type` | `D2ItemType` | Filter by item type |
| `d2rarity` | `D2ItemRarity` | Filter by rarity |
| `ethereal` | `true\|false` | Ethereal only |
| `ilvlMin` / `ilvlMax` | number | Item level range |
| `socketsMin` / `socketsMax` | number | Socket count range |
| `statKey` + `statMin` | string + number | Single JSONB stat floor |
| `statKeys` | comma-separated | `hasSome` match against `statKeys[]` |
| `isPerfect` | `true` | Perfect-rolled items only |
| `page` | number | Pagination (20 per page) |

---

## 6. UI Components

### `D2ItemFilters`

Client component (`"use client"`) rendered on the `/trading` page. Updates URL search params on change (no form submit needed — uses `useTransition` + `router.push`).

Controls:
- Item Type — Radix Select
- Rarity — Radix Select
- **Game Mode** — Radix Select (Softcore / Hardcore)
- **Ladder** — Radix Select (Ladder / Non-Ladder)
- **Search** — free-text input (parsed server-side by `parseItemQuery`)
- Ethereal only — checkbox
- Item Level range — two number inputs
- Sockets range — two number inputs
- Stat key + min value — text + number inputs
- **Perfect rolls only** — checkbox

### `CreateListingDialog`

Adds **Mode** (Softcore/Hardcore) and **Ladder** (Non-Ladder/Ladder) selects when creating a new listing. Both values are submitted in the listing payload.

---

## 7. Data Flow (listing creation)

```
User fills CreateListingDialog
    ↓
POST /api/listings/update  (name, rarity, gameMode, ladder, spaceDustPrice)
    ↓
POST /api/items  (baseItemId, stats, gameMode, ladder, affixes)
    ↓
prisma.itemInstance.create
    ↓
lib/stat-normalization  →  statKeys, searchText, score, isPerfect
    ↓
prisma.itemInstance.update  (patch computed fields)
    ↓
Listing.itemInstanceId = instance.id
```

## 8. Data Flow (search)

```
User types in D2ItemFilters
    ↓
router.push(?q=shako+2skills+hc&ladder=LADDER)
    ↓
/trading page (Server Component)  reads searchParams
    ↓
prisma.listing.findMany  with instanceWhere:
    { gameMode: "HARDCORE", ladder: "LADDER",
      searchText: { contains: "shako", mode: "insensitive" },
      AND: [{ stats: { path: ["all_skills"], gte: 2 } }] }
    ↓  (GIN index on searchText, B-tree on gameMode/ladder)
Results → DbListingCard[]
```
