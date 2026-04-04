import type { Meta, StoryObj } from "@storybook/react"
import { SpaceDustStore } from "./SpaceDustStore"

const meta = {
  title: "SpaceDustStore",
  component: SpaceDustStore,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "deep-space",
      values: [{ name: "deep-space", value: "#050510" }],
    },
    viewport: {
      defaultViewport: "responsive",
    },
  },
} satisfies Meta<typeof SpaceDustStore>

export default meta
type Story = StoryObj<typeof meta>

/** Default state — no tier selected, Stripe tab active */
export const Default: Story = {}

/** Mobile viewport (375px) — single column grid */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
}

/** Tablet viewport (768px) — three-column grid */
export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
}
