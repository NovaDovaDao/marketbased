# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint with auto-fix
pnpm prettier:fix # Auto-format code
pnpm test         # Run Vitest unit tests
pnpm test:watch   # Tests in watch mode
pnpm e2e:headless # Playwright e2e (requires server on :3000)
pnpm storybook    # Component explorer on :6006
```

Run a single Vitest test file: `pnpm test path/to/file.test.ts`

## Architecture

**Market Base** is a Next.js App Router marketplace for trading Diablo II items and runes. It combines traditional web auth with blockchain-native authentication

### Key directories
- `app/api/` — API routes (listings CRUD, payment recording, trade rooms)
- `app/utils/auth.ts` — Self-hosted Better Auth instance (Prisma adapter). Exports `auth` and `Session` type.
- `app/utils/auth-client.ts` — Client-side Better Auth SDK. Use `authClient.useSession()`, `authClient.signIn.*`, `authClient.signOut()`.
- `app/lib/prisma.ts` — Prisma client singleton
- `components/` — UI components, one folder per component with co-located tests/stories
- `items/` — Static JSON catalogs for runes and trading items
- `prisma/schema.prisma` — PostgreSQL schema. Includes auth tables (`User`, `Session`, `Account`, `Verification`) and app tables. All in the `public` schema.
- `env.mjs` — T3 Env + Zod environment variable validation (all env vars declared here)

### Auth
**Self-hosted Better Auth** runs inside the Next.js app at `/api/auth/*`, backed by the Neon Postgres database via the Prisma adapter.

- **Server-side**: `import { auth } from "@/app/utils/auth"` — call `auth.api.getSession({ headers: await headers() })` in Server Components/Actions.
- **Client-side**: `import { authClient } from "@/app/utils/auth-client"` — points at `NEXT_PUBLIC_BETTER_AUTH_URL` (same origin in production). Use `authClient.useSession()` for reactive state, `authClient.signIn.*` / `authClient.signOut()` for auth actions.
- **Auth tables** (`session`, `account`, `verification`) are managed by Better Auth in the `public` schema and included in `prisma/schema.prisma`. Run `prisma db push` after schema changes.
- OAuth providers (Discord) and email OTP are configured in `app/utils/auth.ts`.
- **Wallet nonces** (SIWE) are stored in the dedicated `WalletNonce` / `wallet_nonce` table — separate from Better Auth's `verification` table.

### Payments
`app/api/record-payment/route.ts` verifies Base chain transactions on-chain via Viem before persisting them. It checks that the recipient matches `MERCHANT_ADDRESS` and prevents duplicate submissions using a unique constraint on `txHash`.

### Database
Prisma with PostgreSQL (Neon). Auth models: `User`, `Session`, `Account`, `Verification`. App models: `Listing`, `Offer`, `Transaction`, `WalletAddress`, `WalletNonce`, `TradeRoom`, `Message`, `Purchase`, `ItemPurchase`, `SpaceDustTransfer`, and D2R item catalog models. All in the `public` schema. `price` and `offerData` fields are stored as JSON to support both crypto amounts and in-game currency (runes).

### Data flow for listings
Static item catalogs (`items/runes.json`, `items/trading-listings.json`) seed the UI. Authenticated sellers create `Listing` records via `POST /api/listings/update`.

## Conventions
- **TypeScript strict mode** — `noUncheckedIndexedAccess` is enabled
- **Server Components by default** — add `"use client"` only when needed
- **Component variants** use Class Variance Authority (CVA)
- **Radix UI** primitives + Tailwind CSS v4 for all UI
- **Conventional Commits** enforced (see `git-conventional-commits.yaml`)
- Package manager is **pnpm only** (Node ≥ 20, pnpm ≥ 10, corepack enabled)

## Environment variables
All declared and validated in `env.mjs`. Required server vars: `DATABASE_URL` (Neon connection string), `BETTER_AUTH_SECRET` (min 32 chars), `BETTER_AUTH_URL` (app base URL, e.g. `http://localhost:3000`). Required client var: `NEXT_PUBLIC_BETTER_AUTH_URL` (same value as `BETTER_AUTH_URL`). See `.env.example` for the full list.
