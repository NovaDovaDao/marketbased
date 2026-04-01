import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type NextRequest } from "next/server";

/**
 * POST /api/offers/[offerId]/decline
 * Seller declines a pending offer.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { offerId } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { listing: { select: { sellerId: true } } },
  });

  if (!offer) return Response.json({ error: "Offer not found" }, { status: 404 });
  if (offer.listing.sellerId !== session.user.id)
    return Response.json({ error: "Only the seller can decline an offer" }, { status: 403 });
  if (offer.status !== "pending")
    return Response.json({ error: "Offer is no longer pending" }, { status: 409 });

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: { status: "declined" },
  });

  return Response.json(updated);
}
