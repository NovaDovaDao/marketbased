---
description: "Scaffold a new marketplace feature end-to-end: API route, React component, unit test, and Storybook story. Parameterized: feature name, route path, and primary props."
name: "New Marketplace Feature"
argument-hint: "featureName=ListingCard route=/api/listings props=gameId,price,condition"
agent: "agent"
model: ["GPT-5 (copilot)"]
---

Scaffold a new marketplace feature consisting of:

- An API route under `app/api` (server handler and TypeScript types) for CRUD or action endpoints as requested.
- A Server Component React UI under `components/<FeatureName>/<FeatureName>.tsx` that follows the project `components.instructions.md` (Server-first, CVA for variants, Radix for interactive primitives). Add `"use client"` only if interactivity requires it.
- A Storybook story file `components/<FeatureName>/<FeatureName>.stories.tsx` showing CVA variants and accessibility states.
- A unit test `components/<FeatureName>/<FeatureName>.test.tsx` using Vitest + React Testing Library that checks rendering, variants, and basic accessibility attributes.

Inputs (provide as a single line or JSON):

- `featureName` (required): PascalCase name for component and folder, e.g. `ListingCard`.
- `route` (optional): API route path, e.g. `/api/listings` or `/api/listings/[id]/trade`.
- `props` (optional): Comma-separated list of primary props to include (snake or camel case), e.g. `gameId,price,condition`.
- `variants` (optional): Comma-separated CVA variants to scaffold (e.g., `size:sm,md;intent:primary,ghost`).
- `interactive` (optional): `true|false` — if true, include a minimal client-only wrapper for interactive behavior (e.g., favorite button).

Output format (must produce file diffs):

- For each file, output a unified patch snippet suitable for applying with `git apply` or for manual creation. Use clear file paths and the full file contents.

Quality rules (follow project conventions):

- Use integer `price` (cents) typing in TypeScript, never `number` for currency without context; add helper `formatPrice(cents)` if needed.
- Use CVA for variants and export the variant type.
- Prefer Radix primitives for non-trivial interactive widgets; include a small wrapper component marked with `"use client"` for client logic.
- Place stories and tests alongside the component.
- Keep API handlers strict-typed and validate inputs.

Example invocation:

- `featureName=ListingCard route=/api/listings props=gameId,price,condition variants=size:sm,md;intent:primary,ghost interactive=false`

Return only the file patches and a short bullet list of files created. If anything is ambiguous, ask one clarifying question before generating files.
