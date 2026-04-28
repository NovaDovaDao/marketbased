import { createPublicClient, http, parseAbiItem } from "viem"
import { base } from "viem/chains"

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
})

/** USDC contract on Base mainnet */
export const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const

/** Typed Transfer event ABI item — enables fully-typed log args from getLogs */
export const TRANSFER_EVENT = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
)

/** Receiving address for on-chain USDC payments. Falls back to MERCHANT_ADDRESS
 * so a single env var can drive both the legacy raw-transfer flow and Base Pay. */
export function getReceivingAddress(): `0x${string}` {
  const addr = process.env.RECEIVING_ADDRESS ?? process.env.MERCHANT_ADDRESS
  if (!addr) throw new Error("RECEIVING_ADDRESS or MERCHANT_ADDRESS env var is not set")
  return addr as `0x${string}`
}

/** Single source of truth for the Base Pay testnet flag — both client and server
 * read NEXT_PUBLIC_BASE_TESTNET; mismatch makes getPaymentStatus fail. */
export function isBaseTestnet(): boolean {
  return process.env.NEXT_PUBLIC_BASE_TESTNET === "true"
}
