import type { Meta, StoryObj } from "@storybook/react"
import CoreParameters from "./CoreParameters"

const meta: Meta<typeof CoreParameters> = {
  title: "Components/CoreParameters",
  component: CoreParameters,
  parameters: { layout: "fullscreen" },
}

export default meta
type Story = StoryObj<typeof CoreParameters>

export const Default: Story = {
  args: {
    activeFilters: {},
  },
}

export const WithActiveEthereal: Story = {
  args: {
    activeFilters: {
      relicStatus: ["ethereal"],
      levelMin: "40",
      levelMax: "99",
    },
  },
}

export const WithCraftingAndLevel: Story = {
  args: {
    activeFilters: {
      craftingState: ["socketed", "corrupted"],
      levelMin: "60",
      rarity: "Unique",
      sellerStanding: "Trusted",
    },
  },
}

export const LadderSoftcorePC: Story = {
  args: {
    activeFilters: {
      ladder: "Ladder",
      gameMode: "Softcore",
      platform: "PC",
      version: "ETR",
      region: "Americas",
    },
  },
}
