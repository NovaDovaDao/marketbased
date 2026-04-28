import type { Meta, StoryObj } from "@storybook/react"
import { CheckoutConfirmationDialog } from "./CheckoutConfirmationDialog"

const meta: Meta<typeof CheckoutConfirmationDialog> = {
  title: "Marketplace/CheckoutConfirmationDialog",
  component: CheckoutConfirmationDialog,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
}
export default meta

type Story = StoryObj<typeof CheckoutConfirmationDialog>

const triggerBtn = (
  <button className="border border-amber-900/60 bg-amber-950 px-4 py-2 text-sm text-amber-400">
    Buy
  </button>
)

export const ListingWithEnoughBalance: Story = {
  args: {
    item: {
      kind: "listing",
      listingId: "lst-001",
      itemName: "Harlequin Crest",
      priceSpaceDust: 1450,
      sellerName: "FrostMage",
    },
    initialBalance: 5000,
    disableRedirect: true,
    trigger: triggerBtn,
  },
}

export const ListingInsufficientBalance: Story = {
  args: {
    item: {
      kind: "listing",
      listingId: "lst-002",
      itemName: "Enigma (Mage Plate)",
      priceSpaceDust: 8000,
      sellerName: "RuneTrader",
    },
    initialBalance: 1200,
    disableRedirect: true,
    trigger: triggerBtn,
  },
}

export const RunePurchase: Story = {
  args: {
    item: {
      kind: "rune",
      runeId: 23,
      itemName: "Ohm Rune",
      priceSpaceDust: 1000,
    },
    initialBalance: 3500,
    disableRedirect: true,
    trigger: triggerBtn,
  },
}
