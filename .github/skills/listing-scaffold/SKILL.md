---
name: listing-scaffold
description: "Scaffold a complete game listing feature: Type definitions, API route, Server Component (CVA + Radix), Storybook story, and Vitest unit tests. Use when you want a ready-to-review listing feature scaffold for marketplace flow."
argument-hint: "featureName=ListingCard route=/api/listings props=gameId,price,condition"
user-invocable: true
---

# Listing Scaffold Skill

## What this skill does

Generates a full, reviewable scaffold for a marketplace listing feature:

- A Prisma model block added to `prisma/schema.prisma` (datasource, generator, and the listing model with correct field types)
- TypeScript types derived from Prisma's generated `@prisma/client` types (no hand-rolled interfaces for DB-backed fields)
- A `lib/prisma.ts` singleton that exports the shared `PrismaClient` instance
- API route(s) under `app/api` for CRUD or action endpoints that query through Prisma; inputs validated with `zod` before reaching Prisma
- A Server Component UI in `components/<FeatureName>/<FeatureName>.tsx` that uses CVA for variants and Radix for interactive primitives where applicable
- A Storybook story `components/<FeatureName>/<FeatureName>.stories.tsx` showing variants
- A Vitest unit test `components/<FeatureName>/<FeatureName>.test.tsx` covering rendering, variants, and basic accessibility
- Optional small client-only wrapper for interactivity (favorites, trade dialog) when `interactive=true`

## When to use

- Adding a new listing UI + API in the marketplace
- Prototyping listing behavior that honors project conventions (cents for price, CVA, Radix, server-first components)
- Creating consistent stories and tests quickly for review

## Inputs

The skill expects a single-line argument or JSON with these fields:

- `featureName` (required): PascalCase name, e.g., `ListingCard`
- `route` (optional): API base path, e.g., `/api/listings` (defaults to `/api/<feature-kebab>`)
- `props` (optional): Comma-separated props to include, e.g., `gameId,price,condition`
- `variants` (optional): CVA variant spec, e.g., `size:sm,md;intent:primary,ghost`
- `interactive` (optional): `true|false` — include a minimal client wrapper for interactive bits

If any required input is missing, the skill will ask one clarifying question.

## Procedure (step-by-step)

1. Confirm `featureName` and `route` with the user if not provided.
2. Update `prisma/schema.prisma`:
   - Ensure a `datasource db` block (provider = `"postgresql"`, url via `env("DATABASE_URL")`) and a `generator client` block (provider = `"prisma-client"`) are present.
   - Add a `model <FeatureName>` block with fields mapped to the listing domain: `id`, `createdAt`, `updatedAt`, `gameId`, `priceCents` (Int), `condition` (enum), `sellerId`, and any extra props requested.
   - Add a `Condition` enum block if not already present (`NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `POOR`).
   - Use `@id @default(autoincrement())`, `@default(now())`, and `@updatedAt` attributes as appropriate.
   - Note in the checklist that the developer must run `pnpm prisma migrate dev --name add-<feature-kebab>` and `pnpm prisma generate` after applying the schema change.
3. Create (or verify) `lib/prisma.ts` — a singleton `PrismaClient` instance following the Next.js recommended pattern to avoid exhausting connections in development:
   ```ts
   import { PrismaClient } from "@prisma/client"
   const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
   export const prisma = globalForPrisma.prisma ?? new PrismaClient()
   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
   ```
4. Create a utility file `lib/format-price.ts` exporting `formatPrice(cents: number): string`. Do **not** duplicate Prisma-generated types — import them directly from `@prisma/client` (e.g., `import type { <FeatureName>, Condition } from "@prisma/client"`).
5. Create API handler(s) in `app/api/<kebab>/route.ts`:
   - Import `prisma` from `@/lib/prisma`.
   - Validate request bodies with `zod` before calling Prisma (same pattern as `env.mjs`).
   - Use Prisma query methods (`findMany`, `findUniqueOrThrow`, `create`, `update`, `delete`) — never raw SQL unless performance-critical and confirmed with the user.
   - Return typed JSON responses with appropriate HTTP status codes.
6. Scaffold component at `components/<FeatureName>/<FeatureName>.tsx`:
   - Server-first by default; fetch data via `prisma` directly inside the Server Component where applicable.
   - CVA-based `variants` exported.
   - Export `FeatureNameProps` type that references Prisma types (e.g., `Pick<PrismaListing, "priceCents" | "condition">`).
   - If `interactive=true`, add `components/<FeatureName>/client/<FeatureName>.client.tsx` with `"use client"` and small handlers.
7. Add Storybook story `components/<FeatureName>/<FeatureName>.stories.tsx` showing variants and sample data (mock Prisma-shaped objects matching the schema).
8. Add unit test `components/<FeatureName>/<FeatureName>.test.tsx` using Vitest + React Testing Library; mock `lib/prisma.ts` with `vi.mock`.
9. Return a unified patch for all created/modified files and a short testing checklist.

## Output format

- A list of affected files with one-line rationales
- Unified patch snippets for each file ready to apply (git apply compatible)
- Short testing checklist with commands to run locally

## Quality rules & conventions

- Prices stored and handled as integer cents (`priceCents Int` in Prisma schema). Provide `formatPrice` from `lib/format-price.ts` for UI display only.
- Never hand-roll TypeScript interfaces for Prisma-backed models — import them from `@prisma/client` after `prisma generate`.
- Use the `lib/prisma.ts` singleton; never instantiate `PrismaClient` inline in route files.
- Validate all external inputs with `zod` **before** passing them to Prisma — treat Prisma as an internal, trusted layer.
- Use CVA for styling variants and export variant types for tests/stories.
- Prefer Radix primitives for any non-trivial interactive widget; include small client-only wrapper components for client logic.
- Keep server code strictly typed — use Prisma's generated `Prisma.XxxGetPayload` helpers for complex include/select shapes.
- Co-locate stories and tests with the component.

## Safety & scope

- Skill edits only files inside the repository; it will not run commands or deploy.
- Schema changes (`prisma/schema.prisma`) are flagged explicitly in the output — the developer must run migrations manually.
- If changes touch authentication, database adapters, or external infra, the skill will pause and ask for confirmation.

## Examples

- `featureName=ListingCard route=/api/listings props=gameId,price,condition variants=size:sm,md;intent:primary,ghost interactive=false`
- `{"featureName":"ListingCard","route":"/api/listings","props":"gameId,price,condition","variants":"size:sm,md;intent:primary,ghost","interactive":true}`

## References

- Follow project conventions in `.github/copilot-instructions.md` and `/.github/instructions/components.instructions.md` for CVA, Radix, Server Components patterns.
- Prisma schema authoring: https://www.prisma.io/docs/orm/prisma-schema/overview
- Prisma data model (models, enums, attributes): https://www.prisma.io/docs/orm/prisma-schema/data-model/models
- Next.js + Prisma singleton pattern: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help
- Example output format: the skill returns unified patch snippets and a testing checklist.
