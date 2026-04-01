"use client"

import { authClient } from "@/app/utils/auth-client"
import Image from "next/image"
import { useEffect, useState } from "react"

const navLinks = [
  { label: "Runes", href: "/runes" },
  { label: "Trading", href: "/trading" },
  { label: "Leaderboard", href: "#" },
]

type SessionUser = { id: string; name: string; username?: string }

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = authClient.useSession()
  const sessionUser = session?.user as SessionUser | undefined
  const profileHref = sessionUser?.username ? `/profile/${sessionUser.username}` : "/me"
  const displayName = sessionUser?.username ?? sessionUser?.name ?? ""

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
          </nav>
          <div className="px-6 pt-2 flex flex-col gap-4">
            {session ? (
              <>
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


