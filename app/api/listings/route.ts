import { prisma } from "@/app/lib/prisma";
import { type NextRequest } from "next/server";
import { z } from "zod";

const listingsQuerySchema = z.object({
  status: z.string().optional(),
  tradeCurrency: z.string().optional(),
  sellerId: z.string().optional(),
  search: z.string().max(200).optional(),
  /** Page cursor — listing ID to start after (exclusive). */
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * GET /api/listings
 * Public endpoint. Returns active listings with seller info and optional filters.
 * Supports cursor-based pagination via `cursor` (last listing ID) and `limit`.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = req.nextUrl;

  const parsed = listingsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, tradeCurrency, sellerId, search, cursor, limit } = parsed.data;

  const listings = await prisma.listing.findMany({
    where: {
      status: status ?? "active",
      ...(tradeCurrency ? { tradeCurrency } : {}),
      ...(sellerId ? { sellerId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { baseName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      seller: { select: { id: true, username: true, image: true } },
      instance: {
        select: {
          id: true,
          rarity: true,
          ethereal: true,
          sockets: true,
          gameMode: true,
          ladder: true,
          stats: true,
          statKeys: true,
        },
      },
    },
  });

  const hasMore = listings.length > limit;
  const items = hasMore ? listings.slice(0, limit) : listings;
  const nextCursor = hasMore ? (items.at(-1)?.id ?? null) : null;

  return Response.json({ items, nextCursor, hasMore });
}
