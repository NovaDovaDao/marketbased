import type { Meta, StoryObj } from "@storybook/react"
import TradingSidebar from "./TradingSidebar"

const meta: Meta<typeof TradingSidebar> = {
  title: "Components/TradingSidebar",
  component: TradingSidebar,
  parameters: { layout: "fullscreen" },
}

export default meta
type Story = StoryObj<typeof TradingSidebar>

export const Default: Story = {
  args: {
    activeFilters: {},
  },
}

export const WithCategoryFilter: Story = {
  args: {
    activeFilters: {
      category: "Uniques",
    },
  },
}

export const WithBodyLocationAndTier: Story = {
  args: {
    activeFilters: {
      bodyLocation: "Head",
      tier: "Elite",
    },
  },
}

export const WithMultipleStats: Story = {
  args: {
    activeFilters: {
      stats: ["all-skills", "fcr"],
    },
  },
}

export const WithSkillsAndWeaponType: Story = {
  args: {
    activeFilters: {
      skills: ["fire-spells", "cold-spells"],
      weaponType: "Polearm",
    },
  },
}

export const AllSectionsOpen: Story = {
  args: {
    activeFilters: {
      category: "Runewords",
      tier: "Elite",
      weaponType: "Polearm",
      craftType: "Runeword",
      bodyLocation: "Torso",
    },
  },
}
