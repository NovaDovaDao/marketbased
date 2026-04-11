import { auth } from "@/app/utils/auth"
import { prisma } from "@/app/lib/prisma"
import { generateRandomString } from "better-auth/crypto"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { verifySiweMessage } from "viem/siwe"

const publicClient = createPublicClient({ chain: base, transport: http() })

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json()) as {
    message?: string
    signature?: string
    walletAddress?: string
  }

  const { message, signature, walletAddress } = body

  if (!message || !signature || !walletAddress) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Retrieve and validate the nonce stored for this user
  const verification = await prisma.walletNonce.findFirst({
    where: { userId: session.user.id, expiresAt: { gt: new Date() } },
  })

  if (!verification) {
    return NextResponse.json({ error: "Nonce expired or not found" }, { status: 400 })
  }

  // Verify the SIWE signature against the stored nonce
  const valid = await verifySiweMessage(publicClient, {
    address: walletAddress as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
    nonce: verification.value,
  })

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Consume the nonce so it can't be replayed
  await prisma.walletNonce.delete({ where: { id: verification.id } })

  // Upsert the wallet address linked to this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).walletAddress.upsert({
    where: { address: walletAddress.toLowerCase() },
    update: { userId: session.user.id, chainId: base.id },
    create: {
      id: generateRandomString(16, "a-z", "A-Z", "0-9"),
      userId: session.user.id,
      address: walletAddress.toLowerCase(),
      chainId: base.id,
      isPrimary: true,
    },
  })

  return NextResponse.json({ success: true, address: walletAddress.toLowerCase() })
}

// Remove a linked wallet
export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { address } = (await req.json()) as { address?: string }
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).walletAddress.deleteMany({
    where: { address: address.toLowerCase(), userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
