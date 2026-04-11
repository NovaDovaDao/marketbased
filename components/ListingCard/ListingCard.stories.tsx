import type { Meta, StoryObj } from "@storybook/react"
import ListingCard, { type ListingWithSeller } from "./ListingCard"

const baseSeller = {
  id: "seller-001",
  username: "VaultKeeper",
  image: null,
}

const baseListing: ListingWithSeller = {
  id: "listing-001",
  name: "Harlequin Crest",
  baseName: "Shako",
  rarity: "UNIQUE",
  spaceDustPrice: 1200,
  status: "active",
  createdAt: new Date("2026-03-28T12:00:00Z"),
  tradeCurrency: "SPACE_DUST",
  seller: baseSeller,
}

const meta: Meta<typeof ListingCard> = {
  title: "Marketplace/ListingCard",
  component: ListingCard,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  args: {
    listing: baseListing,
  },
}
export default meta

type Story = StoryObj<typeof ListingCard>

export const UniqueItem: Story = {
  args: {
    listing: { ...baseListing, rarity: "UNIQUE", name: "Harlequin Crest" },
  },
}

export const SetItem: Story = {
  args: {
    listing: {
      ...baseListing,
      rarity: "SET",
      name: "Trang-Oul's Head",
      baseName: "Cantor Trophy",
      spaceDustPrice: 450,
    },
  },
}

export const Runeword: Story = {
  args: {
    listing: {
      ...baseListing,
      rarity: "RUNEWORD",
      name: "Enigma",
      baseName: "Mage Plate",
      spaceDustPrice: 9800,
    },
  },
}

export const RareItem: Story = {
  args: {
    listing: {
      ...baseListing,
      rarity: "RARE",
      name: "Armageddon Blade",
      baseName: "Phase Blade",
      spaceDustPrice: 620,
    },
  },
}

export const MagicItem: Story = {
  args: {
    listing: {
      ...baseListing,
      rarity: "MAGIC",
      name: "Merciless Bone Wand of the Wraith",
      baseName: "Bone Wand",
      spaceDustPrice: 80,
    },
  },
}

export const NormalItem: Story = {
  args: {
    listing: {
      ...baseListing,
      rarity: "NORMAL",
      name: "Superior Crystal Sword",
      baseName: "Crystal Sword",
      spaceDustPrice: 30,
    },
  },
}

export const SmallSize: Story = {
  args: {
    listing: baseListing,
    size: "sm",
  },
}

export const NoPrice: Story = {
  name: "Offer-Only (no price)",
  args: {
    listing: { ...baseListing, spaceDustPrice: null },
  },
}
