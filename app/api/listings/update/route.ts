import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type Listing } from "@/generated/prisma/client";
import { type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Omit<Listing, "createdAt">;

  if (!body.price) {
    return Response.json({ error: "Missing price" }, { status: 400 });
  }

  const sellerId = session.user.id;

  const listing = await prisma.listing.upsert({
    where: { id: body.id ?? "", sellerId },
    update: { price: body.price },
    create: {
      baseName: body.baseName,
      contentId: body.contentId,
      name: body.name,
      price: body.price,
      rarity: body.rarity,
      sellerId,
    },
  });

  return Response.json(listing);
}
