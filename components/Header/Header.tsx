"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const navLinks = [
  { label: "Runes", href: "/runes" },
  { label: "Trading", href: "#" },
  { label: "Leaderboard", href: "#" },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
            {/* Skull + crown logo mark */}
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

          {/* ── Desktop actions ── */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              aria-label="Account"
              className="flex min-h-10 min-w-10 items-center justify-center text-on-surface-variant/70 transition-colors hover:bg-surface-container hover:text-secondary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>

          {/* ── Mobile: account + hamburger ── */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              aria-label="Account"
              className="flex min-h-11 min-w-11 items-center justify-center text-on-surface-variant/70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex min-h-11 min-w-11 items-center justify-center text-on-surface-variant"
            >
              {menuOpen ? (
                /* X icon */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* Hamburger */
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
          <nav className="flex flex-col px-6 pt-10 pb-8 gap-0">
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
          <div className="px-6">
            <a
              href="#"
              onClick={() => setMenuOpen(false)}
              className="blood-gradient block w-full py-4 text-center text-label-md font-bold uppercase tracking-widest text-on-secondary"
            >
              Connect
            </a>
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

