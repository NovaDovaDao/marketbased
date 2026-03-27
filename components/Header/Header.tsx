"use client"

import { useEffect, useState } from "react"

const navLinks = [
  { label: "Runes", href: "/runes" },
  { label: "Trades", href: "#" },
  { label: "Ledger", href: "#" },
  { label: "Players", href: "#" },
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
          <a href="/" className="flex items-center gap-3 no-underline" aria-label="Obsidian Vault — home">
            {/* Skull + crown logo mark */}
            <svg
              width="28"
              height="36"
              viewBox="0 0 160 204"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <defs>
                <radialGradient id="hdr-eye-l" cx="50%" cy="50%" r="50%">
                  <stop offset="20%" stopColor="#ffc876" />
                  <stop offset="100%" stopColor="#f5a000" stopOpacity="0.5" />
                </radialGradient>
                <radialGradient id="hdr-eye-r" cx="50%" cy="50%" r="50%">
                  <stop offset="20%" stopColor="#ffc876" />
                  <stop offset="100%" stopColor="#f5a000" stopOpacity="0.5" />
                </radialGradient>
              </defs>
              {/* Crown fill */}
              <path d="M56 54 L52 36 L65 54Z" fill="#13110c" />
              <path d="M72 54 L80 26 L88 54Z" fill="#13110c" />
              <path d="M104 54 L108 36 L95 54Z" fill="#13110c" />
              <rect x="50" y="53" width="60" height="12" fill="#13110c" />
              {/* Crown gold outline */}
              <path d="M56 54 L52 36 L65 54" fill="none" stroke="#f7bd48" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M72 54 L80 26 L88 54Z" fill="none" stroke="#f7bd48" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M104 54 L108 36 L95 54" fill="none" stroke="#f7bd48" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="50" y="53" width="60" height="12" fill="none" stroke="#f7bd48" strokeWidth="1.5" />
              <circle cx="80" cy="59" r="2.5" fill="#f7bd48" opacity="0.75" />
              {/* Skull body */}
              <path d="M80 72 C42 72 34 96 34 116 C34 132 39 142 48 150 L50 156 L48 166 L56 158 L61 167 L67 158 L71 166 L77 160 L80 168 L83 160 L89 166 L93 158 L99 167 L104 158 L112 166 L110 156 L112 150 C121 142 126 132 126 116 C126 96 118 72 80 72 Z" fill="#111111" />
              {/* Skull gold rim */}
              <path d="M80 72 C42 72 34 96 34 116 C34 132 39 142 48 150 L50 156 L48 166 L56 158 L61 167 L67 158 L71 166 L77 160 L80 168 L83 160 L89 166 L93 158 L99 167 L104 158 L112 166 L110 156 L112 150 C121 142 126 132 126 116 C126 96 118 72 80 72 Z" fill="none" stroke="#f7bd48" strokeWidth="1.0" opacity="0.55" />
              {/* Eye sockets */}
              <ellipse cx="62" cy="116" rx="16" ry="14" fill="url(#hdr-eye-l)" />
              <ellipse cx="98" cy="116" rx="16" ry="14" fill="url(#hdr-eye-r)" />
              {/* Forehead diamond */}
              <path d="M80 82 L84.5 90 L80 98 L75.5 90Z" fill="#f7bd48" opacity="0.65" />
            </svg>
            <span>
              OBSIDIAN VAULT
            </span>
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

