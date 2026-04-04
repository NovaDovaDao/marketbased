import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { type NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const purchaseId = req.nextUrl.searchParams.get("purchaseId")
  if (!purchaseId) {
    return Response.json({ error: "Missing purchaseId" }, { status: 400 })
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: { status: true, userId: true, spaceDust: true },
  })

  if (!purchase || purchase.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({ status: purchase.status, spaceDust: purchase.spaceDust })
}
