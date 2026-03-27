# Marketbased — Game Marketplace & Trading

A Next.js 15 app for buying, selling, and trading games. Built on the [next-enterprise boilerplate](https://docs.blazity.com).

## Project Domain

This is a game marketplace and trading platform. Core features include game listings, buy/sell/trade flows, pricing, user profiles, and inventory management. When generating code, apply marketplace domain conventions: items have conditions, prices, and ownership; trades involve two parties; all financial values should be handled as integers (cents) not floats.

## Architecture

- **App Router**: All routes live in `app/`. Layouts at `app/layout.tsx`, pages at `app/page.tsx`, API routes at `app/api/`.
- **Components**: One folder per component at `components/<Name>/<Name>.tsx`. Co-locate stories (`.stories.tsx`) and unit tests (`.test.tsx`) in the same folder.
- **Styles**: Tailwind CSS v4 via `styles/tailwind.css`. Use utility classes — no separate CSS modules.
- **Env vars**: Declare and validate all env vars in `env.mjs` using T3 Env + Zod before using them anywhere.
- **Imports**: Use the `@/` alias (maps to root). Never use relative imports that climb more than one level (`../../`).

## Build & Test

```bash
pnpm dev          # start dev server (Turbopack)
pnpm build        # production build
pnpm lint         # ESLint
pnpm format       # Prettier write
pnpm test         # Vitest unit tests (jsdom)
pnpm e2e:headless # Playwright e2e tests (requires running server at :3000)
pnpm storybook    # component explorer on :6006
pnpm analyze      # bundle size analyzer
```

Node ≥ 20 required. Always use `pnpm`, never `npm` or `yarn`.

## Code Conventions

- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`. No `any` — use `unknown` and narrow.
- **Components**: Prefer Server Components by default. Add `"use client"` only when you need interactivity or browser APIs.
- **CVA**: Use [Class Variance Authority](http://cva.style/) for component variants (see `components/Button/Button.tsx` for the pattern).
- **Radix UI**: Use Radix primitives for accessible interactive components (dialogs, dropdowns, tooltips). See `components/Tooltip/Tooltip.tsx`.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:` etc. Config in `git-conventional-commits.yaml`.

## Marketplace-Specific Patterns

- **Prices**: Store and compute in integer cents; format for display only at the UI boundary.
- **Game listings**: Always include `condition`, `price`, `sellerId`, and `gameId` fields.
- **Trade flows**: Trades are between two users — validate both parties' ownership before confirming.
- **Auth**: Gate seller/buyer actions behind authentication; unauthenticated users can browse listings only.

## Testing

- Unit tests use Vitest + React Testing Library. Place `.test.tsx` next to the component.
- E2E tests use Playwright in `e2e/`. Tests run against `http://127.0.0.1:3000`.
- Smoke tests cover critical paths: listing creation, trade initiation, checkout.

## Deployment

Deployed on Vercel. Install command is `corepack enable && pnpm install` (set in `vercel.json`).
