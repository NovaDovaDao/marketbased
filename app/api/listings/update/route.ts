import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type NextRequest } from "next/server";
import { z } from "zod";

const createListingSchema = z.object({
  id: z.string().uuid().optional(),
  contentId: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  baseName: z.string().min(1).max(200),
  rarity: z.string().min(1).max(50),
  spaceDustPrice: z.number().int().positive(),
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

  const { id, contentId, name, baseName, rarity, spaceDustPrice } = parsed.data;
  const sellerId = session.user.id;

  let listing;
  if (id) {
    // Update existing listing — ownership check is enforced in where clause
    listing = await prisma.listing.update({
      where: { id, sellerId },
      data: { price: {}, spaceDustPrice },
    });
  } else {
    listing = await prisma.listing.create({
      data: { contentId, name, baseName, rarity, price: {}, sellerId, spaceDustPrice },
    });
  }

  return Response.json(listing);
}
