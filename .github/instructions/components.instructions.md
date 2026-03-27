---
description: 'Use when creating or editing React component files under components/**/*.tsx. Enforces Server Component by default, `use client` only when needed, Class Variance Authority (CVA) for variants, and Radix UI primitives for interactive parts. Keywords: CVA, Class Variance Authority, Radix, Radix UI, Server Component, "use client", Tailwind, storybook, vitest.'
applyTo: "components/**/*.tsx"
---

# Component Guidelines (components/\*_/_.tsx)

- **Server-first:** Components in `components/**/*.tsx` should be implemented as Server Components by default. Add `"use client"` only at the top of a file when browser-only APIs, local state (useState), effects (useEffect), or event handlers that require client runtime are necessary.

- **CVA for variants:** Use Class Variance Authority (CVA) for any component that exposes visual variants (size, intent, shape). Keep style logic declarative and exported so it can be reused in tests and stories.

Example:

```tsx
import { cva } from "class-variance-authority"

const button = cva("px-4 py-2 rounded", {
  variants: {
    intent: { primary: "bg-blue-600 text-white", ghost: "bg-transparent" },
    size: { sm: "text-sm", md: "text-base" },
  },
  defaultVariants: { intent: "primary", size: "md" },
})

export type ButtonVariants = Parameters<typeof button>[0]

export default function Button({ className, ...props }: ButtonProps) {
  return <button className={button(props as ButtonVariants)} {...props} />
}
```

- **Radix UI for interactivity:** For widgets that require accessibility primitives (dialog, tooltip, dropdown, radio, checkbox), prefer Radix UI primitives. Wrap Radix pieces with your design tokens and CVA variants rather than copying markup.

- **Client boundary pattern:** If you need client behavior, keep the interactive logic in a small client-only component and keep the parent as a server component where possible.

- **Types & safety:** Use strict TypeScript types; avoid `any`. Export prop types and variant types for testing and docs. Prefer discriminated unions for conditional rendering when applicable.

- **Co-location:** Co-locate `Component.stories.tsx` and `Component.test.tsx` next to the component implementation. Stories should show all CVA variants; tests should cover variant logic and accessibility concerns.

- **Testing & accessibility:** Add unit tests for visual/variant logic and basic accessibility checks (aria attributes, focus management). Use Vitest + React Testing Library patterns used elsewhere in this repo.

- **PR checklist (apply before merging):**
  - Component defaults to Server Component unless `"use client"` is present and justified.
  - CVA used for variants where appropriate and `ButtonVariants` (or similar) exported.
  - Radix primitives used for interactive elements, not raw unmanaged DOM when accessibility is non-trivial.
  - `Component.stories.tsx` and `Component.test.tsx` added/updated.
  - No `any` in props; `noUncheckedIndexedAccess` respected.

## Short rationale

- Server Components keep rendering fast and reduce client bundle size.
- CVA centralizes variant logic and ensures consistent styling across stories/tests.
- Radix provides accessible primitives so we don't reimplement tricky keyboard/focus behavior.

## Example prompts (try these)

- "Create a `ListingCard` component that uses CVA for `condition` and `variant` styles and includes a story and tests."
- "Refactor `Button.tsx` to use CVA and export its variant type for tests."
- "Wrap an interactive `ConfirmDialog` with Radix primitives and make the trigger client-only."
