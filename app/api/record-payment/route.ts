import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/utils/auth";
import { type NextRequest } from "next/server";
import { createPublicClient, http, parseEther } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({
  chain: base,
  transport: http(),
});

const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS as `0x${string}`;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    txHash: `0x${string}`;
    amount: string;
    listingId?: string;
  };
  const { txHash, amount, listingId } = body;

  if (!txHash || !amount) {
    return Response.json({ error: "Missing txHash or amount" }, { status: 400 });
  }

  try {
    // 1. Verify the transaction on Base mainnet
    const receipt = await client.waitForTransactionReceipt({ hash: txHash });
    const tx = await client.getTransaction({ hash: txHash });

    const isLegit =
      receipt.status === "success" &&
      tx.to?.toLowerCase() === MERCHANT_ADDRESS?.toLowerCase() &&
      tx.value >= parseEther(amount);

    if (!isLegit) {
      return Response.json({ error: "Invalid Transaction" }, { status: 400 });
    }

    // 2. Persist — txHash is @unique so duplicate submissions fail safely
    const record = await prisma.transaction.create({
      data: {
        txHash,
        buyerId: session.user.id,
        buyerEmail: session.user.email,
        amount: { eth: amount },
        status: "CONFIRMED",
        listingId: listingId ?? null,
      },
    });

    // TODO: send receipt email via Resend
    console.info("Payment confirmed, record id:", record.id);

    return Response.json({ success: true, id: record.id });
  } catch (err) {
    console.error("Payment verification error:", err);
    return Response.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
