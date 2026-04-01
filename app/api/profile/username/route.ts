import { auth } from "@/app/utils/auth"
import { prisma } from "@/app/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const COOLDOWN_DAYS = 30
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000
const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { username } = (await req.json()) as { username?: string }

  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–20 characters: lowercase letters, numbers, underscores only." },
      { status: 400 },
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (prisma as any).user.findUnique({
    where: { id: session.user.id },
    select: { usernameUpdatedAt: true },
  }) as { usernameUpdatedAt: Date | null } | null

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Enforce 30-day cooldown
  if (user.usernameUpdatedAt) {
    const msSinceLastChange = Date.now() - user.usernameUpdatedAt.getTime()
    if (msSinceLastChange < COOLDOWN_MS) {
      const availableAt = new Date(user.usernameUpdatedAt.getTime() + COOLDOWN_MS)
      return NextResponse.json(
        {
          error: `You can change your username again on ${availableAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
          availableAt: availableAt.toISOString(),
        },
        { status: 429 },
      )
    }
  }

  // Check uniqueness
  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing && existing.id !== session.user.id) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any).user.update({
    where: { id: session.user.id },
    data: { username, usernameUpdatedAt: new Date() },
    select: { username: true, usernameUpdatedAt: true },
  }) as { username: string; usernameUpdatedAt: Date }

  return NextResponse.json({ username: updated.username, usernameUpdatedAt: updated.usernameUpdatedAt })
}
