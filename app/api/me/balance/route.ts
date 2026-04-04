import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { type NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { spaceDust: true },
  })

  return Response.json({ spaceDust: user?.spaceDust ?? 0 })
}
