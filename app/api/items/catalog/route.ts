/**
 * GET /api/items/catalog
 *
 * Search the static D2R item catalog (BaseItem, UniqueItem, SetItem, Runeword).
 * Used by CreateListingDialog to power the item-search dropdown.
 *
 * Query params:
 *   q        – name fragment (case-insensitive ILIKE)
 *   type     – D2ItemType enum value
 *   page     – page number (1-based, default 1)
 *   pageSize – results per page (default 20, max 50)
 */

import { prisma } from "@/app/lib/prisma"
import type { CatalogItem, CatalogPage, D2ItemType } from "@/types/d2items"
import { D2_ITEM_TYPES } from "@/types/d2items"
import { type NextRequest } from "next/server"

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get("q")?.trim() ?? ""
  const typeParam = searchParams.get("type") ?? ""
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`, 10)),
  )
  const skip = (page - 1) * pageSize

  const typeFilter = D2_ITEM_TYPES.includes(typeParam as D2ItemType)
    ? (typeParam as D2ItemType)
    : undefined

  const nameFilter = q.length >= 2 ? { contains: q, mode: "insensitive" as const } : undefined

  // Fetch from all four catalog tables in parallel
  const [baseItems, uniqueItems, setItems, runewords] = await Promise.all([
    prisma.baseItem.findMany({
      where: {
        ...(nameFilter ? { name: nameFilter } : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      select: { id: true, name: true, type: true, baseType: true },
    }),

    prisma.uniqueItem.findMany({
      where: nameFilter ? { name: nameFilter } : {},
      select: {
        id: true,
        name: true,
        stats: true,
        baseItem: { select: { type: true, baseType: true } },
      },
    }),

    prisma.setItem.findMany({
      where: nameFilter ? { name: nameFilter } : {},
      select: {
        id: true,
        name: true,
        stats: true,
        baseItem: { select: { type: true, baseType: true } },
      },
    }),

    prisma.runeword.findMany({
      where: nameFilter ? { name: nameFilter } : {},
      select: { id: true, name: true, stats: true, bases: true },
    }),
  ])

  // Normalise into CatalogItem shape
  const items: CatalogItem[] = [
    ...baseItems.map((b) => ({
      id: b.id,
      kind: "base" as const,
      name: b.name,
      type: b.type as D2ItemType,
      rarity: "NORMAL" as const,
      baseType: b.baseType,
      stats: null,
    })),
    ...uniqueItems.map((u) => ({
      id: u.id,
      kind: "unique" as const,
      name: u.name,
      type: (u.baseItem.type ?? null) as D2ItemType | null,
      rarity: "UNIQUE" as const,
      baseType: u.baseItem.baseType,
      stats: u.stats as Record<string, unknown>,
    })),
    ...setItems.map((s) => ({
      id: s.id,
      kind: "set-item" as const,
      name: s.name,
      type: (s.baseItem.type ?? null) as D2ItemType | null,
      rarity: "SET" as const,
      baseType: s.baseItem.baseType,
      stats: s.stats as Record<string, unknown>,
    })),
    ...runewords.map((r) => ({
      id: r.id,
      kind: "runeword" as const,
      name: r.name,
      type: null,
      rarity: "RUNEWORD" as const,
      baseType: r.bases.join(", "),
      stats: r.stats as Record<string, unknown>,
    })),
  ]

  // Sort by name then paginate
  items.sort((a, b) => a.name.localeCompare(b.name))
  const total = items.length
  const paged = items.slice(skip, skip + pageSize)

  const result: CatalogPage = { items: paged, total, page, pageSize }
  return Response.json(result)
}
