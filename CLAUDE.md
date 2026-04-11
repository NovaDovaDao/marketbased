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
- `app/utils/auth.ts` — Server-side `getSession()` helper — calls Neon Auth API, syncs app user on first sign-in
- `app/utils/auth-client.ts` — Client-side Better Auth SDK pointed at Neon Auth URL
- `app/lib/prisma.ts` — Prisma client singleton
- `components/` — UI components, one folder per component with co-located tests/stories
- `items/` — Static JSON catalogs for runes and trading items
- `prisma/schema.prisma` — PostgreSQL schema (app tables only; auth tables live in `neon_auth` schema)
- `env.mjs` — T3 Env + Zod environment variable validation (all env vars declared here)

### Auth
**Neon Auth** is the auth provider — a hosted Better Auth service provisioned in the Neon database. Auth data (users, sessions, accounts, verifications) lives in the `neon_auth` schema; app-specific user data lives in the public `user` table.

- **Server-side**: `import { getSession } from "@/app/utils/auth"` — calls `NEON_AUTH_URL/get-session`, creates the app `user` row on first sign-in (username auto-generated).
- **Client-side**: `import { authClient } from "@/app/utils/auth-client"` — Better Auth client SDK pointed at the Neon Auth URL. Use `authClient.useSession()` for reactive session state, `authClient.signIn.*` / `authClient.signOut()` for auth actions.
- **Chat service**: queries `neon_auth.session` (same schema as Better Auth) to validate WebSocket connections.
- OAuth providers (Discord, Google, GitHub) and email OTP are configured in the **Neon Auth console** — not in code.

### Payments
`app/api/record-payment/route.ts` verifies Base chain transactions on-chain via Viem before persisting them. It checks that the recipient matches `MERCHANT_ADDRESS` and prevents duplicate submissions using a unique constraint on `txHash`.

### Database
Prisma with PostgreSQL (Neon). App models: `User`, `Listing`, `Offer`, `Transaction`, `WalletAddress`, `TradeRoom`, `Message`, `Purchase`, `ItemPurchase`, `SpaceDustTransfer`, and D2R item catalog models. Auth tables (`session`, `account`, etc.) are managed by Neon Auth in the `neon_auth` schema. `price` and `offerData` fields are stored as JSON to support both crypto amounts and in-game currency (runes).

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
All declared and validated in `env.mjs`. Required server vars: `DATABASE_URL` (Neon connection string), `NEON_AUTH_URL` (from Neon Auth provisioning). See `.env.example` for the full list.
