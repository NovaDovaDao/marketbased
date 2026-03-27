---
description: "Use when producing or implementing UI/visual designs. Enforces mobile-first, pixel-polish, Awwwards/Behance-level visual quality across mobile and desktop. Keywords: responsive, mobile-first, pixel-perfect, visual-design, awwwards, behance, accessibility, design-tokens, export-specs"
applyTo: ["design/**", "components/**/*.tsx", "styles/**"]
---

# Visual & Design Guidelines (applies to design files and component work)

These instructions ensure designs look exceptional on mobile and desktop — the product of an Awwwards/Behance-caliber craft process — while remaining implementable in this repository.

Principles

- Mobile-first: design and validate at small breakpoints first, then scale up. Every screen must be visually perfect at mobile widths before desktop treatments are added.
- Pixel polish: spacing, alignment, and typography should be visually and numerically consistent. Use a spacing scale and baseline grid (4px rhythm) and ensure elements snap to the grid.
- Respect the project's design language: follow `stitch/obsidian_vault/DESIGN.md` (tone, colors, no border-radius, tonal layering). Do not introduce styles that contradict this file.
- Accessibility as craft: visual sophistication must not break contrast, legibility, or touch target expectations.

Breakpoints & Layout

- Base (mobile): 375px — design primary interactions and flows here.
- Medium (tablet): 768px — adapt layout with additional columns or increased gutters.
- Large (desktop): 1024px+ — introduce richer compositions and side panels.
- Use fluid spacing where appropriate (clamp/min/max) but ensure key breakpoints are pixel-perfect.

Typography

- Use modular scale with fluid type: define `clamp()` ranges for headings and body so they feel designed at every width.
- Preserve typographic rhythm: line-height and vertical rhythm must align to the 4px grid. Tighten tracking for display only where legible.

Spacing & Grid

- 4px baseline grid; prefer multiples of 8px for larger gaps (8,16,24,32...).
- Align elements on a vertical column baseline; avoid one-off offsets.

Visual Assets & Images

- Export raster assets at 2x and 3x for retina. Use WebP where supported.
- Provide focal-point and crop guidance for each image to ensure mobile crops stay composed.
- Optimize images for performance: resize to nearest display size and compress lossily for previews, losslessly for hero imagery as needed.

Interaction & Motion

- Use subtle, purposeful motion; avoid gratuitous animations.
- Respect `prefers-reduced-motion` — provide non-animated alternatives.
- Interaction timings: 120–200ms for micro-interactions; 300–450ms for content transitions.

Touch Targets & Controls

- Minimum touch target: 44x44px. Ensure hit areas are generous on mobile even if visuals are smaller.
- Provide clear primary/secondary affordances — primary actions must be visually prominent.

Color & Contrast

- Maintain WCAG AA contrast for body text and interactive controls. For display or decorative treatments, ensure critical content meets contrast.
- Follow `DESIGN.md` palette and "No-Line Rule". Use tonal shifts, not borders, to separate regions.

Performance & Feasibility

- Prefer CSS-driven effects over bitmap overlays where possible; avoid heavy shadows or large blurred effects that slow paint.
- When proposing complex visuals, include implementation notes (blend-mode, layered gradients, noise overlays) and fallbacks for browsers that lack support.

Dependency constraints

- Only use design libraries, UI primitives, or component packages that are already listed in the project's `package.json`. Do not add new runtime dependencies as part of a design handoff without prior approval.
- If a desired UI primitive or visual effect isn't available from packages in `package.json`, implement it using existing tools (Tailwind, CVA, Radix primitives included in the repo) or provide a small, implementable CSS plan and a dependency request issue describing the justification, security considerations, and rollback plan.
- When requesting a new package, open an issue and include: package name, suggested version, rationale, impact area, and migration/rollback notes. Obtain approval before merging changes that add the dependency.

Handoff & Implementation Notes

- Provide a short implementation specs block with each design deliverable: tokens used, breakpoint adjustments, exported assets, and CSS hints (Tailwind classes / CVA variant notes).
- For component designs meant for `components/**/*.tsx`, include a Storybook example with responsive knobs and statements of expected CVA variants.

Quality Checklist (must pass before design is marked "ready for dev")

- [ ] Mobile views are pixel-checked and annotated (Figma/MD with screenshots).
- [ ] Desktop and tablet adaptations are documented with breakpoints and behavior notes.
- [ ] All images have export specs (sizes, formats, focal points).
- [ ] Touch targets meet minimum sizes on mobile.
- [ ] Contrast and typography pass WCAG AA for body text and controls.
- [ ] Interaction states (hover, focus, active) documented.
- [ ] Implementation notes: CSS hints, CVA variants, Storybook story references.

Acceptance for PRs / Design-to-Code

- Every UI PR that changes visuals must link to the design file and list which checklist items were completed.
- Designers and engineers must agree on any trade-offs (e.g., mobile composition vs. heavy desktop-only visuals) before merging.

Example prompts

- "Design a mobile-first `ListingCard` that matches DESIGN.md and includes focal crops and export specs."
- "Produce a Storybook-ready component spec for `TradeDialog` with mobile and desktop variants and CVA notes."
