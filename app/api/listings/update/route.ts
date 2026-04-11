import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { D2_TRADE_CURRENCIES } from "@/types/d2items";
import { type NextRequest } from "next/server";
import { z } from "zod";

const createListingSchema = z.object({
  id: z.string().uuid().optional(),
  contentId: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  baseName: z.string().min(1).max(200),
  rarity: z.string().min(1).max(50),
  spaceDustPrice: z.number().int().positive(),
  // D2R item instance fields (optional – for real player items)
  itemInstanceId: z.string().cuid().optional(),
  tradeCurrency: z.enum(D2_TRADE_CURRENCIES).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createListingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { id, contentId, name, baseName, rarity, spaceDustPrice, itemInstanceId, tradeCurrency } = parsed.data;
  const sellerId = session.user.id;

  // If attaching a D2R item instance, validate it exists and is not already listed
  if (itemInstanceId) {
    const existing = await prisma.itemInstance.findUnique({
      where: { id: itemInstanceId },
      include: { listing: { select: { id: true } } },
    });
    if (!existing) {
      return Response.json({ error: "ItemInstance not found" }, { status: 404 });
    }
    if (existing.listing && existing.listing.id !== id) {
      return Response.json({ error: "Item is already listed" }, { status: 409 });
    }
  }

  let listing;
  if (id) {
    // Update existing listing — ownership check is enforced in where clause
    listing = await prisma.listing.update({
      where: { id, sellerId },
      data: {
        price: {},
        spaceDustPrice,
        ...(itemInstanceId ? { itemInstanceId } : {}),
        ...(tradeCurrency ? { tradeCurrency } : {}),
      },
    });
  } else {
    listing = await prisma.listing.create({
      data: {
        contentId,
        name,
        baseName,
        rarity,
        price: {},
        sellerId,
        spaceDustPrice,
        ...(itemInstanceId ? { itemInstanceId } : {}),
        ...(tradeCurrency ? { tradeCurrency } : {}),
      },
    });
  }

  return Response.json(listing);
}
