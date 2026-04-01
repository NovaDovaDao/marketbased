"use client"

import { authClient } from "@/app/utils/auth-client"
import type { UserProfile } from "@/types/user"
import Image from "next/image"
import { useCallback, useState } from "react"
import { createWalletClient, custom } from "viem"
import { createSiweMessage } from "viem/siwe"
import { base } from "viem/chains"

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}

export interface UserProfileHeroProps {
  profile: Pick<UserProfile, "username" | "displayName" | "avatarUrl" | "bannerUrl" | "bio" | "reputation">
}

export default function UserProfileHero({ profile }: UserProfileHeroProps) {
  const { username, displayName, avatarUrl, bannerUrl, bio, reputation } = profile
  const { data: session } = authClient.useSession()

  const isOwner = session?.user.name === username

  // ── Username editing ──────────────────────────────────────────
  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameInput, setUsernameInput] = useState(username)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [currentUsername, setCurrentUsername] = useState(username)

  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault()
    const next = usernameInput.trim().toLowerCase()
    if (next === currentUsername) { setEditingUsername(false); return }
    setUsernameLoading(true)
    setUsernameError(null)
    const res = await fetch("/api/profile/username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: next }),
    })
    const body = (await res.json()) as { username?: string; error?: string }
    setUsernameLoading(false)
    if (!res.ok) {
      setUsernameError(body.error ?? "Failed to update username.")
    } else {
      setCurrentUsername(body.username ?? next)
      setEditingUsername(false)
    }
  }

  // ── Wallet linking ────────────────────────────────────────────
  const [savedAddress, setSavedAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = useCallback(async () => {
    if (connecting || !isOwner) return
    setConnecting(true)
    setError(null)

    try {
      if (!window.ethereum) {
        setError("No wallet detected. Install MetaMask or Coinbase Wallet.")
        return
      }

      // 1. Get wallet address
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as `0x${string}`[]
      const address = accounts[0]
      if (!address) { setError("No account selected."); return }

      // 2. Fetch a nonce tied to this session
      const nonceRes = await fetch("/api/profile/wallet/nonce", { credentials: "include" })
      if (!nonceRes.ok) throw new Error("Failed to get nonce")
      const { nonce } = (await nonceRes.json()) as { nonce: string }

      // 3. Build and sign the SIWE message
      const message = createSiweMessage({
        address,
        chainId: base.id,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
        statement: "Link this wallet to my Market Base profile",
      })

      const walletClient = createWalletClient({
        account: address,
        chain: base,
        transport: custom(window.ethereum),
      })
      const signature = await walletClient.signMessage({ account: address, message })

      // 4. Verify signature server-side and save to DB
      const saveRes = await fetch("/api/profile/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, signature, walletAddress: address }),
      })

      if (!saveRes.ok) {
        const body = (await saveRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? "Failed to save wallet")
      }

      const { address: saved } = (await saveRes.json()) as { address: string }
      setSavedAddress(saved)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Wallet connection failed."
      if (msg.includes("rejected") || msg.includes("denied")) {
        setError("Signature rejected.")
      } else {
        setError(msg)
      }
    } finally {
      setConnecting(false)
    }
  }, [connecting, isOwner])

  const displayAddress = savedAddress
    ? `${savedAddress.slice(0, 6)}…${savedAddress.slice(-4)}`
    : null

  return (
    <section aria-label={`${displayName} profile header`}>
      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden bg-surface-container-low sm:h-52 md:h-64">
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(140,0,0,0.22) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/3"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(247,189,72,0.07) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <Image
          src={bannerUrl}
          alt={`${displayName} banner`}
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          priority
          unoptimized
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to bottom, transparent, #131313)" }}
          aria-hidden="true"
        />
      </div>

      {/* Identity row */}
      <div className="relative -mt-10 flex flex-col gap-4 px-5 sm:-mt-12 md:flex-row md:items-end md:justify-between md:px-8">
        {/* Left: avatar + name + bio */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-6">
          <div
            className="relative h-20 w-20 shrink-0 overflow-hidden bg-surface-container-lowest sm:h-24 sm:w-24 md:h-28 md:w-28"
            style={{ boxShadow: "inset 0px 4px 16px rgba(0,0,0,0.9), 0 0 0 2px rgba(247,189,72,0.15)" }}
            aria-hidden="true"
          >
            <Image src={avatarUrl} alt={`${displayName} avatar`} fill sizes="112px" className="object-cover" unoptimized />
          </div>

          <div className="flex flex-col gap-1 pb-1">
            <h1
              className="font-headline text-2xl font-extrabold italic leading-none tracking-editorial text-secondary sm:text-3xl md:text-4xl"
              style={{ textShadow: "0 0 40px rgba(247,189,72,0.25)" }}
            >
              {displayName}
            </h1>
            {isOwner && editingUsername ? (
              <form onSubmit={(e) => void handleSaveUsername(e)} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-on-surface-variant/40">@</span>
                  <input
                    autoFocus
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    maxLength={20}
                    className="w-40 border-b border-secondary/40 bg-transparent text-sm text-on-surface focus:border-secondary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={usernameLoading}
                    className="text-xs text-secondary hover:text-secondary/70 disabled:opacity-50"
                  >
                    {usernameLoading ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingUsername(false); setUsernameInput(currentUsername); setUsernameError(null) }}
                    className="text-xs text-on-surface-variant/40 hover:text-on-surface-variant/70"
                  >
                    Cancel
                  </button>
                </div>
                {usernameError && <p className="text-[11px] text-red-400/80">{usernameError}</p>}
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-headline text-sm text-on-surface-variant/60 md:text-base">
                  @{currentUsername}
                </p>
                {isOwner && (
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-[10px] text-on-surface-variant/30 hover:text-secondary/60 transition-colors uppercase tracking-widest"
                    aria-label="Edit username"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
            <p className="mt-1 max-w-sm font-headline text-sm leading-relaxed text-on-surface-variant/80 md:text-base">{bio}</p>
          </div>
        </div>

        {/* Right: rep + wallet */}
        <div className="flex flex-row items-center gap-4 md:flex-col md:items-end md:gap-3">
          {/* Reputation badge */}
          <div
            className="flex flex-col items-center bg-surface-container-high px-4 py-3"
            aria-label={`Reputation score ${reputation.score.toFixed(1)} from ${reputation.totalReviews} reviews`}
          >
            <span className="font-headline text-2xl font-extrabold text-secondary leading-none">
              {reputation.score.toFixed(1)}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-widest text-on-surface-variant/50">
              Rep · {reputation.totalReviews} reviews
            </span>
          </div>

          {/* Wallet — only visible to the profile owner */}
          {isOwner && (
            <div className="flex flex-col items-end gap-1">
              {displayAddress ? (
                <div
                  className="inline-flex items-center gap-2 px-6 py-3 font-headline text-sm font-bold uppercase tracking-widest"
                  style={{ background: "linear-gradient(135deg, #f7bd48 0%, #e0a830 100%)", color: "#0e0e0e", boxShadow: "0 0 18px rgba(247,189,72,0.35)" }}
                  title={savedAddress ?? ""}
                  aria-label={`Wallet linked: ${savedAddress}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: "#0e0e0e", opacity: 0.6 }} aria-hidden="true" />
                  {displayAddress}
                </div>
              ) : (
                <button
                  onClick={() => void connectWallet()}
                  disabled={connecting}
                  aria-label="Link wallet to profile"
                  className="inline-flex items-center px-6 py-3 font-headline text-sm font-bold uppercase tracking-widest transition-opacity duration-300 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #8c0000 0%, #920603 100%)", color: "#fff8e7" }}
                >
                  {connecting ? "Connecting…" : "Link Wallet"}
                </button>
              )}
              {error && <p className="text-[11px] text-red-400/80">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
