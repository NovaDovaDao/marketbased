import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function MePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  redirect(`/profile/${user?.username ?? session.user.id}`)
}
