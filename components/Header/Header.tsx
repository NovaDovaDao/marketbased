"use client"

import { authClient } from "@/app/utils/auth-client"
import { CreateListingDialog } from "@/components/CreateListingDialog/CreateListingDialog"
import Image from "next/image"
import { useEffect, useState } from "react"

const navLinks = [
  { label: "Runes", href: "/runes" },
  { label: "Trading", href: "/trading" },
  { label: "Shop", href: "/store" },
  { label: "Leaderboard", href: "#" },
]

type SessionUser = { id: string; name: string; username?: string }

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [spaceDust, setSpaceDust] = useState<number | null>(null)
  const { data: session } = authClient.useSession()
  const sessionUser = session?.user as SessionUser | undefined
  const profileHref = sessionUser?.username ? `/profile/${sessionUser.username}` : "/me"
  const displayName = sessionUser?.username ?? sessionUser?.name ?? ""

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/trade-rooms")
      if (!res.ok) return
      const rooms = (await res.json()) as { unreadCount: number }[]
      setUnreadCount(rooms.reduce((sum, r) => sum + r.unreadCount, 0))
    } catch {
      // silently ignore — badge just stays stale
    }
  }

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/me/balance")
      if (!res.ok) return
      const data = (await res.json()) as { spaceDust: number }
      setSpaceDust(data.spaceDust)
    } catch {
      // ignore
    }
  }

  // Poll for unread count when authenticated
  useEffect(() => {
    if (!sessionUser) {
      setUnreadCount(0)
      setSpaceDust(null)
      return
    }
    void fetchUnread()
    void fetchBalance()
    const interval = setInterval(() => { void fetchUnread() }, 30_000)
    const balanceInterval = setInterval(() => { void fetchBalance() }, 60_000)
    const onFocus = () => { void fetchUnread() }
    const onNewRoom = () => { void fetchUnread() }
    const onBalanceUpdate = () => { void fetchBalance() }
    window.addEventListener("focus", onFocus)
    window.addEventListener("trade-room-unread-updated", onNewRoom)
    window.addEventListener("space-dust-updated", onBalanceUpdate)
    return () => {
      clearInterval(interval)
      clearInterval(balanceInterval)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("trade-room-unread-updated", onNewRoom)
      window.removeEventListener("space-dust-updated", onBalanceUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-[#0e0e0e] shadow-blood"
            : "bg-[rgba(13,13,13,0.92)] backdrop-blur-sm",
        ].join(" ")}
        aria-label="Site header"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          {/* ── Brand mark ── */}
          <a href="/" className="flex items-center gap-3 no-underline" aria-label="Market Base — home">
            <Image src="/logo.svg" alt="Market Base" width={50} height={50} />
          </a>

          {/* ── Desktop nav ── */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-label-md text-on-surface-variant/70 transition-colors duration-150 hover:text-secondary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── Auth button (desktop) ── */}
          <div className="hidden items-center gap-4 md:flex">
            {session ? (
              <>
                {/* Space Dust balance */}
                {spaceDust !== null && (
                  <a
                    href="/store"
                    className="flex items-center gap-1.5 rounded border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/20"
                    aria-label="Space Dust balance — buy more"
                  >
                    ✨ {spaceDust.toLocaleString()} sd
                  </a>
                )}
                {/* Messages icon with unread badge */}
                <a
                  href="/trade-rooms"
                  aria-label={unreadCount > 0 ? `Messages (${unreadCount} unread)` : "Messages"}
                  className="relative inline-flex items-center justify-center text-on-surface-variant/70 transition-colors duration-150 hover:text-secondary"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </a>
                <CreateListingDialog
                  trigger={
                    <button className="inline-flex items-center gap-1.5 border border-secondary/40 px-3.5 py-1.5 font-headline text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                      </svg>
                      Sell
                    </button>
                  }
                />
                <a
                  href={profileHref}
                  className="text-label-md text-on-surface-variant/70 transition-colors duration-150 hover:text-secondary"
                >
                  {displayName}
                </a>
                <button
                  onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}
                  className="text-label-md text-on-surface-variant/40 transition-colors duration-150 hover:text-secondary"
                >
                  Sign out
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="rounded border border-secondary/40 px-4 py-1.5 text-label-md text-secondary transition-colors duration-150 hover:bg-secondary/10"
              >
                Log in
              </a>
            )}
          </div>

          {/* ── Mobile: hamburger ── */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex min-h-11 min-w-11 items-center justify-center text-on-surface-variant"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="15" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Divider line: gold at bottom of header ── */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-secondary/30 to-transparent" />
      </header>

      {/* ── Mobile nav drawer ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0e0e0e] pt-16"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col gap-0 px-6 pt-10 pb-8">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  "border-b border-outline-variant/20 py-5",
                  "text-headline-md font-headline font-semibold",
                  "text-on-surface-variant transition-colors hover:text-secondary",
                  i === 0 ? "border-t" : "",
                ].join(" ")}
              >
                {link.label}
              </a>
            ))}
            {session && (
              <a
                href="/trade-rooms"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-outline-variant/20 py-5 text-headline-md font-headline font-semibold text-on-surface-variant transition-colors hover:text-secondary"
              >
                Messages
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </a>
            )}
          </nav>
          <div className="px-6 pt-2 flex flex-col gap-4">
            {session ? (
              <>
                {spaceDust !== null && (
                  <a
                    href="/store"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-400/20"
                  >
                    ✨ {spaceDust.toLocaleString()} Space Dust — Buy More
                  </a>
                )}
                <CreateListingDialog
                  trigger={
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex items-center gap-2 border border-secondary/40 px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                      </svg>
                      Sell Item
                    </button>
                  }
                />
                <a
                  href={profileHref}
                  onClick={() => setMenuOpen(false)}
                  className="text-label-md text-on-surface-variant/70 transition-colors hover:text-secondary"
                >
                  {displayName}
                </a>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })
                  }}
                  className="text-left text-label-md text-on-surface-variant/40 transition-colors hover:text-secondary"
                >
                  Sign out
                </button>
              </>
            ) : (
              <a
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-block rounded border border-secondary/40 px-5 py-2 text-label-md text-secondary transition-colors hover:bg-secondary/10"
              >
                Log in
              </a>
            )}
          </div>

          {/* bottom brand label */}
          <p className="absolute bottom-8 left-6 text-label-sm text-on-surface-variant/30">
            Ancient Market of Sanctuary
          </p>
        </div>
      )}
    </>
  )
}


