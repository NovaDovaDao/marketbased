import type { Meta, StoryObj } from "@storybook/react"
import { TradeDialog } from "./TradeDialog"

const meta: Meta<typeof TradeDialog> = {
  title: "Marketplace/TradeDialog",
  component: TradeDialog,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
}
export default meta

type Story = StoryObj<typeof TradeDialog>

export const Default: Story = {
  args: {
    listingId: "listing-001",
    listingName: "Harlequin Crest",
    askingSpaceDust: 1200,
    trigger: <button className="border border-amber-900/60 bg-amber-950 px-4 py-2 text-sm text-amber-400">Make Offer</button>,
  },
}

export const NoAskingPrice: Story = {
  args: {
    listingId: "listing-002",
    listingName: "Enigma (Mage Plate)",
    askingSpaceDust: null,
    trigger: <button className="border border-amber-900/60 bg-amber-950 px-4 py-2 text-sm text-amber-400">Make Offer</button>,
  },
}
