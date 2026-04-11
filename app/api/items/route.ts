/**
 * GET  /api/items  — search listed ItemInstances with D2-specific filters
 * POST /api/items  — authenticated: create a new ItemInstance
 */

import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { type NextRequest } from "next/server"
import {
  CreateItemInstanceSchema,
  D2_GAME_MODES,
  D2_ITEM_RARITIES,
  D2_ITEM_TYPES,
  D2_LADDER_TYPES,
} from "@/types/d2items"
import type { D2GameMode, D2ItemRarity, D2ItemType, D2LadderType, D2ListingResult } from "@/types/d2items"
import { parseItemQuery } from "@/lib/query-parser"
import {
  computeScore,
  computeSearchText,
  extractStatKeys,
  isPerfectRoll,
} from "@/lib/stat-normalization"

// ─── GET /api/items ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const d2type = D2_ITEM_TYPES.includes(sp.get("type") as D2ItemType)
    ? (sp.get("type") as D2ItemType)
    : undefined

  const d2rarity = D2_ITEM_RARITIES.includes(sp.get("rarity") as D2ItemRarity)
    ? (sp.get("rarity") as D2ItemRarity)
    : undefined

  const gameMode = D2_GAME_MODES.includes(sp.get("gameMode") as D2GameMode)
    ? (sp.get("gameMode") as D2GameMode)
    : undefined

  const ladder = D2_LADDER_TYPES.includes(sp.get("ladder") as D2LadderType)
    ? (sp.get("ladder") as D2LadderType)
    : undefined

  const ethereal = sp.has("ethereal") ? sp.get("ethereal") === "true" : undefined
  const ilvlMin = sp.get("ilvlMin") ? parseInt(sp.get("ilvlMin")!, 10) : undefined
  const ilvlMax = sp.get("ilvlMax") ? parseInt(sp.get("ilvlMax")!, 10) : undefined
  const socketsMin = sp.get("socketsMin") ? parseInt(sp.get("socketsMin")!, 10) : undefined
  const socketsMax = sp.get("socketsMax") ? parseInt(sp.get("socketsMax")!, 10) : undefined
  const statKey = sp.get("statKey") ?? undefined
  const statMin = sp.get("statMin") ? Number(sp.get("statMin")) : undefined
  const name = sp.get("name")?.trim() ?? undefined
  const statKeysParam = sp.get("statKeys")?.trim() ?? undefined
  const isPerfectParam = sp.has("isPerfect") ? sp.get("isPerfect") === "true" : undefined
  const q = sp.get("q")?.trim() ?? undefined
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  // Parse free-text query string — result merges with explicit params
  const parsed = q ? parseItemQuery(q) : null

  const effectiveEthereal = ethereal ?? parsed?.ethereal
  const effectiveGameMode = gameMode ?? parsed?.gameMode
  const effectiveLadder = ladder ?? parsed?.ladder
  const effectiveRarity = d2rarity ?? parsed?.rarity
  const effectiveIlvlMin = ilvlMin ?? parsed?.ilvlMin
  const effectiveIlvlMax = ilvlMax ?? parsed?.ilvlMax
  const effectiveSockets = parsed?.sockets
  const effectiveName = name ?? parsed?.name

  // Merge stat filters from ?q parsed result
  const andStatFilters = (parsed?.statFilters ?? []).map((sf) => ({
    stats: { path: [sf.key], gte: sf.min },
  }))

  // Build instance where clause
  const instanceWhere = {
    ...(effectiveRarity ? { rarity: effectiveRarity } : {}),
    ...(effectiveEthereal !== undefined ? { ethereal: effectiveEthereal } : {}),
    ...(effectiveGameMode ? { gameMode: effectiveGameMode } : {}),
    ...(effectiveLadder ? { ladder: effectiveLadder } : {}),
    ...(isPerfectParam !== undefined ? { isPerfect: isPerfectParam } : {}),
    ...(effectiveIlvlMin !== undefined || effectiveIlvlMax !== undefined
      ? {
          ilvl: {
            ...(effectiveIlvlMin !== undefined ? { gte: effectiveIlvlMin } : {}),
            ...(effectiveIlvlMax !== undefined ? { lte: effectiveIlvlMax } : {}),
          },
        }
      : {}),
    ...(socketsMin !== undefined || socketsMax !== undefined || effectiveSockets !== undefined
      ? {
          sockets: {
            ...(socketsMin !== undefined ? { gte: socketsMin } : {}),
            ...(socketsMax !== undefined ? { lte: socketsMax } : {}),
            ...(effectiveSockets !== undefined ? { equals: effectiveSockets } : {}),
          },
        }
      : {}),
    ...(effectiveName
      ? { baseItem: { name: { contains: effectiveName, mode: "insensitive" as const } } }
      : {}),
    ...(d2type ? { baseItem: { type: d2type } } : {}),
    // Comma-separated statKeys (hasSome)
    ...(statKeysParam
      ? { statKeys: { hasSome: statKeysParam.split(",").map((s) => s.trim()).filter(Boolean) } }
      : {}),
    // GIN searchText ILIKE for full-text
    ...(q && !parsed?.statFilters.length && !parsed?.name
      ? { searchText: { contains: q.toLowerCase(), mode: "insensitive" as const } }
      : {}),
    // Single-stat JSONB path filter
    ...(statKey && statMin !== undefined
      ? { stats: { path: [statKey], gte: statMin } }
      : {}),
    // Multiple parsed stat filters — wrap in AND
    ...(andStatFilters.length > 0 ? { AND: andStatFilters } : {}),
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: {
        status: "active",
        itemInstanceId: { not: null },
        instance: instanceWhere,
      },
      include: {
        instance: {
          include: {
            baseItem: {
              select: {
                id: true,
                name: true,
                type: true,
                baseType: true,
                socketsMax: true,
                requiredLvl: true,
              },
            },
          },
        },
        seller: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.listing.count({
      where: {
        status: "active",
        itemInstanceId: { not: null },
        instance: instanceWhere,
      },
    }),
  ])

  const results: D2ListingResult[] = listings
    .filter((l) => l.instance !== null)
    .map((l) => ({
      listingId: l.id,
      itemInstanceId: l.itemInstanceId!,
      tradeCurrency: (l.tradeCurrency ?? null) as D2ListingResult["tradeCurrency"],
      spaceDustPrice: l.spaceDustPrice ?? null,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
      sellerUsername: l.seller.username,
      instance: {
        id: l.instance!.id,
        name: l.instance!.name,
        rarity: l.instance!.rarity as D2ItemRarity,
        ilvl: l.instance!.ilvl,
        sockets: l.instance!.sockets,
        ethereal: l.instance!.ethereal,
        identified: l.instance!.identified,
        gameMode: (l.instance!.gameMode ?? "SOFTCORE") as D2GameMode,
        ladder: (l.instance!.ladder ?? "NON_LADDER") as D2LadderType,
        statKeys: (l.instance!.statKeys as string[]) ?? [],
        searchText: l.instance!.searchText ?? null,
        score: l.instance!.score ?? null,
        isPerfect: l.instance!.isPerfect ?? null,
        stats: l.instance!.stats as Record<string, unknown>,
        baseItem: {
          id: l.instance!.baseItem.id,
          name: l.instance!.baseItem.name,
          type: l.instance!.baseItem.type as D2ItemType,
          baseType: l.instance!.baseItem.baseType,
          socketsMax: l.instance!.baseItem.socketsMax,
          requiredLvl: l.instance!.baseItem.requiredLvl,
        },
      },
    }))

  return Response.json({ items: results, total, page, pageSize })
}

// ─── POST /api/items ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: unknown = await req.json()
  const parsedBody = CreateItemInstanceSchema.safeParse(body)
  if (!parsedBody.success) {
    return Response.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    )
  }

  const {
    baseItemId,
    rarity,
    name,
    ilvl,
    sockets,
    ethereal,
    identified,
    gameMode,
    ladder,
    stats,
    rawText,
    affixes,
  } = parsedBody.data

  // Confirm BaseItem exists
  const baseItem = await prisma.baseItem.findUnique({ where: { id: baseItemId } })
  if (!baseItem) {
    return Response.json({ error: "BaseItem not found" }, { status: 404 })
  }

  // Create instance (affixes included for isPerfect check below)
  const instance = await prisma.itemInstance.create({
    data: {
      baseItemId,
      rarity,
      name,
      ilvl,
      sockets,
      ethereal: ethereal ?? false,
      identified: identified ?? true,
      gameMode: gameMode ?? "SOFTCORE",
      ladder: ladder ?? "NON_LADDER",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stats: stats as any,
      rawText,
      affixes: {
        create: (affixes ?? []).map(({ affixId, value }) => ({ affixId, value })),
      },
    },
    include: {
      baseItem: { select: { id: true, name: true, type: true, baseType: true } },
      affixes: { include: { affix: { select: { maxValue: true } } } },
    },
  })

  // Compute derived fields
  const statKeys = extractStatKeys(stats as Record<string, unknown>)
  const searchText = computeSearchText(
    name ?? instance.baseItem.name,
    instance.baseItem.name,
    stats as Record<string, unknown>,
  )
  const score = computeScore(stats as Record<string, unknown>, rarity)
  const perfect = isPerfectRoll(
    instance.affixes.map((a) => ({ value: a.value ?? 0, affix: { maxValue: a.affix.maxValue } })),
  )

  // Patch computed fields back onto the record
  const updated = await prisma.itemInstance.update({
    where: { id: instance.id },
    data: {
      statKeys,
      searchText,
      score,
      ...(perfect !== null ? { isPerfect: perfect } : {}),
    },
    include: {
      baseItem: { select: { id: true, name: true, type: true, baseType: true } },
    },
  })

  return Response.json(updated, { status: 201 })
}
