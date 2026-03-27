
const footerLinks = {
  "The Vault": ["Browse Listings", "Trending Items", "New Arrivals", "Price Index"],
  "Trade": ["Start a Trade", "My Offers", "Active Trades", "Trade History"],
  "Protocol": ["How It Works", "Security", "Fees", "Disputes"],
}

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest" aria-label="Site footer">
      {/* ── Top editorial bar ── */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-secondary/25 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* ── Main footer grid ── */}
        <div className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <svg width="22" height="28" viewBox="0 0 160 204" fill="none" aria-hidden="true" className="shrink-0">
                <defs>
                  <radialGradient id="ftr-eye-l" cx="50%" cy="50%" r="50%">
                    <stop offset="20%" stopColor="#ffc876" />
                    <stop offset="100%" stopColor="#f5a000" stopOpacity="0.5" />
                  </radialGradient>
                  <radialGradient id="ftr-eye-r" cx="50%" cy="50%" r="50%">
                    <stop offset="20%" stopColor="#ffc876" />
                    <stop offset="100%" stopColor="#f5a000" stopOpacity="0.5" />
                  </radialGradient>
                </defs>
                <path d="M56 54 L52 36 L65 54Z" fill="#13110c" />
                <path d="M72 54 L80 26 L88 54Z" fill="#13110c" />
                <path d="M104 54 L108 36 L95 54Z" fill="#13110c" />
                <rect x="50" y="53" width="60" height="12" fill="#13110c" />
                <path d="M56 54 L52 36 L65 54" fill="none" stroke="#f7bd48" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M72 54 L80 26 L88 54Z" fill="none" stroke="#f7bd48" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M104 54 L108 36 L95 54" fill="none" stroke="#f7bd48" strokeWidth="1.5" strokeLinejoin="round" />
                <rect x="50" y="53" width="60" height="12" fill="none" stroke="#f7bd48" strokeWidth="1.5" />
                <circle cx="80" cy="59" r="2.5" fill="#f7bd48" opacity="0.75" />
                <path d="M80 72 C42 72 34 96 34 116 C34 132 39 142 48 150 L50 156 L48 166 L56 158 L61 167 L67 158 L71 166 L77 160 L80 168 L83 160 L89 166 L93 158 L99 167 L104 158 L112 166 L110 156 L112 150 C121 142 126 132 126 116 C126 96 118 72 80 72 Z" fill="#111111" />
                <path d="M80 72 C42 72 34 96 34 116 C34 132 39 142 48 150 L50 156 L48 166 L56 158 L61 167 L67 158 L71 166 L77 160 L80 168 L83 160 L89 166 L93 158 L99 167 L104 158 L112 166 L110 156 L112 150 C121 142 126 132 126 116 C126 96 118 72 80 72 Z" fill="none" stroke="#f7bd48" strokeWidth="1.0" opacity="0.55" />
                <ellipse cx="62" cy="116" rx="16" ry="14" fill="url(#ftr-eye-l)" />
                <ellipse cx="98" cy="116" rx="16" ry="14" fill="url(#ftr-eye-r)" />
                <path d="M80 82 L84.5 90 L80 98 L75.5 90Z" fill="#f7bd48" opacity="0.65" />
              </svg>
              <span className="font-headline text-base font-bold italic tracking-tighter text-secondary">
                Market Base
              </span>
            </div>
            <p className="mb-8 font-body text-sm leading-relaxed text-on-surface-variant/60">
              A digital sanctum for peer-to-peer game item trading. Carved from the void, secured by the ledger.
            </p>
            {/* Stats row */}
            <div className="flex gap-8">
              <div>
                <p className="text-label-sm text-on-surface-variant/40">Items Listed</p>
                <p className="font-headline text-xl font-semibold text-secondary">12,440</p>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant/40">Traders</p>
                <p className="font-headline text-xl font-semibold text-secondary">3,210</p>
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-label-md mb-5 text-on-surface-variant/40">{section}</h3>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-sm text-on-surface-variant/70 transition-colors hover:text-secondary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-start gap-3 border-t border-outline-variant/15 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-label-sm text-on-surface-variant/35">
            © {new Date().getFullYear()} Marketbased — Ancient Market of Sanctuary
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-label-sm text-on-surface-variant/35 hover:text-secondary transition-colors">Terms</a>
            <a href="#" className="text-label-sm text-on-surface-variant/35 hover:text-secondary transition-colors">Privacy</a>
            <a href="#" className="text-label-sm text-on-surface-variant/35 hover:text-secondary transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

