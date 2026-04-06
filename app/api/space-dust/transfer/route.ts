import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { type NextRequest } from "next/server"
import { z } from "zod"

const transferSchema = z.object({
  recipientUsername: z.string().min(1).max(50),
  amount: z.number().int().min(1).max(10_000_000),
  note: z.string().max(200).optional(),
})

/**
 * POST /api/space-dust/transfer
 * Sends Space Dust from the authenticated user to another user by username.
 * - Auth required; 401 if unauthenticated.
 * - Validates input with Zod; 400 on bad input.
 * - Looks up recipient by username; 404 if not found.
 * - Prevents self-transfer; 400 if sender === recipient.
 * - Executes atomically: balance check + decrement/increment + audit log in one transaction.
 * - Returns 402 if sender has insufficient Space Dust.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const senderId = session.user.id

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = transferSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { recipientUsername, amount, note } = parsed.data

  const recipient = await prisma.user.findFirst({
    where: { username: recipientUsername },
    select: { id: true },
  })

  if (!recipient) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  if (recipient.id === senderId) {
    return Response.json({ error: "Cannot send Space Dust to yourself" }, { status: 400 })
  }

  const recipientId = recipient.id

  try {
    await prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUniqueOrThrow({
        where: { id: senderId },
        select: { spaceDust: true },
      })

      if (sender.spaceDust < amount) {
        throw new Error("insufficient_space_dust")
      }

      await tx.user.update({
        where: { id: senderId },
        data: { spaceDust: { decrement: amount } },
      })

      await tx.user.update({
        where: { id: recipientId },
        data: { spaceDust: { increment: amount } },
      })

      await tx.spaceDustTransfer.create({
        data: { senderId, recipientId, amount, note },
      })
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    if (msg === "insufficient_space_dust") {
      return Response.json({ error: "insufficient_space_dust" }, { status: 402 })
    }
    throw err
  }

  return Response.json({ success: true })
}
