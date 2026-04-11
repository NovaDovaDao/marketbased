import { prisma } from "@/app/lib/prisma";
import { type NextRequest } from "next/server";

type RouteContext = { params: Promise<{ listingId: string }> };

/**
 * GET /api/listings/[id]
 * Public endpoint. Returns a single listing with seller info, item instance, and offers count.
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<Response> {
  const { listingId: id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, username: true, image: true } },
      instance: {
        select: {
          id: true,
          rarity: true,
          ethereal: true,
          sockets: true,
          ilvl: true,
          gameMode: true,
          ladder: true,
          stats: true,
          statKeys: true,
          rawText: true,
          baseItem: { select: { name: true, type: true } },
          affixes: {
            select: {
              value: true,
              affix: { select: { name: true, statKey: true, type: true } },
            },
          },
        },
      },
      _count: { select: { offers: { where: { status: "pending" } } } },
    },
  });

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  return Response.json(listing);
}
