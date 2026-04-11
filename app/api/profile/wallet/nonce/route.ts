import { auth } from "@/app/utils/auth"
import { prisma } from "@/app/lib/prisma"
import { generateRandomString } from "better-auth/crypto"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// Nonce expires after 5 minutes
const NONCE_TTL_MS = 5 * 60 * 1000

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const nonce = generateRandomString(32, "a-z", "A-Z", "0-9")
  const userId = session.user.id

  // One active nonce per user — delete any existing then create fresh
  await prisma.walletNonce.deleteMany({ where: { userId } })
  await prisma.walletNonce.create({
    data: {
      id: generateRandomString(16, "a-z", "A-Z", "0-9"),
      userId,
      value: nonce,
      expiresAt: new Date(Date.now() + NONCE_TTL_MS),
    },
  })

  return NextResponse.json({ nonce })
}
