
# Market Base — Game Marketplace & Trading

Lightweight Next.js marketplace for buying, selling, and trading games. Built on the next-enterprise starter and adapted for a game-focused marketplace.

## Quickstart

Requirements: Node >= 24 and pnpm.

## Installation

Enable corepack

```
corepack enable && corepack enable npm
```

This needs to be done only once - you do not need to run it again for other projects. The `corepack enable npm` command may seem unreasonable as we are using `pnpm`. It is well explained in the Matt's TotalTypeScript article

Install dependencies

```
pnpm install --frozen-lockfile
```

Run the project

```
pnpm dev
```

You can now begin development on your project. We recommend reviewing the rest of the documentation to understand the project structure and the business benefits our configuration provides.

Install and run locally:

```
corepack enable && pnpm install
pnpm dev
```

Common tasks:

```
pnpm build        # production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm test         # Vitest unit tests
pnpm e2e:headless # Playwright e2e (server on :3000)
```

## Project structure

- `app/` — Next.js App Router (layouts, pages, API routes)
- `components/` — UI components (one folder per component)
- `public/` — Static assets (logo: `/logo.svg`)
- `styles/` — Tailwind entry
- `types/`, `items/`, `e2e/` — supporting files and tests

Notes:
- Components default to Server Components; add `"use client"` only when needed.