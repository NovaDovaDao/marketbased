import type { TradingListing } from "@/types/trading"
import type { Meta, StoryObj } from "@storybook/react"
import TradingListingCard from "./TradingListingCard"

const base: TradingListing = {
  id: "story-001",
  name: "Harlequin Crest",
  slug: "harlequin-crest",
  image: "https://diablo2.io/ic/items/unique/harlequin-crest-shako.png",
  category: "Uniques",
  itemType: "Helm",
  bodyLocation: "Head",
  craftType: null,
  gemType: null,
  tier: "Elite",
  weaponType: null,
  rarity: "Unique",
  sellerStanding: "Trusted",
  stats: [
    "+2 To All Skills",
    "+1.5 Life Per Character Level",
    "+1.5 Mana Per Character Level",
    "Damage Reduced By 10%",
  ],
  skills: ["all-skills"],
  relicStatus: ["makeOffer"],
  craftingState: [],
  requiredLevel: 62,
  ladder: "Ladder",
  mode: "Softcore",
  platform: "PC",
  region: "Americas",
  version: "ETR",
  sellerId: "user-vault-keeper",
  priceUsdCents: 28400,
  priceForumGold: 1450,
  priceEth: 120000,
  listedAt: "2026-03-28T12:00:00Z",
}

const meta: Meta<typeof TradingListingCard> = {
  title: "Components/TradingListingCard",
  component: TradingListingCard,
  parameters: { layout: "padded" },
  argTypes: {
    tier: {
      control: { type: "select" },
      options: ["Elite", "Exceptional", "Normal"],
    },
  },
}

export default meta
type Story = StoryObj<typeof TradingListingCard>

export const EliteUnique: Story = {
  args: { listing: base, tier: "Elite" },
}

export const ExceptionalUnique: Story = {
  args: {
    listing: {
      ...base,
      id: "story-002",
      name: "Magefist",
      slug: "magefist",
      tier: "Exceptional",
      itemType: "Gloves",
      bodyLocation: "Hands",
      stats: ["+1 To Fire Skills", "20% Faster Cast Rate", "Regenerate Mana 25%"],
      skills: ["fire-spells"],
      priceUsdCents: 2400,
      priceForumGold: 120,
      priceEth: 10000,
    },
    tier: "Exceptional",
  },
}

export const NormalRune: Story = {
  args: {
    listing: {
      ...base,
      id: "story-003",
      name: "Zod Rune",
      slug: "zod-rune",
      image: "https://cdn.nookazon.com/diablo2resurrected/rune/zod_rune.png",
      category: "Runes",
      itemType: null,
      bodyLocation: null,
      tier: "Elite",
      rarity: "Unique",
      stats: ["Weapon: Indestructible", "Armor/Helm/Shield: Indestructible"],
      skills: [],
      priceUsdCents: 120000,
      priceForumGold: 8000,
      priceEth: 550000,
    },
    tier: "Elite",
  },
}

export const EtherealItem: Story = {
  args: {
    listing: {
      ...base,
      id: "story-004",
      name: "Ethereal Shako",
      slug: "ethereal-shako",
      relicStatus: ["ethereal", "makeOffer"],
      tier: "Elite",
    },
    tier: "Elite",
  },
}

export const SetItem: Story = {
  args: {
    listing: {
      ...base,
      id: "story-005",
      name: "Tal Rasha's Guardianship",
      slug: "tal-rashas-guardianship",
      category: "Sets",
      itemType: "Body Armor",
      bodyLocation: "Torso",
      rarity: "Set",
      tier: "Elite",
      stats: ["+400 Defense", "+88 To Mana", "All Resistances +40%"],
      skills: [],
      priceUsdCents: 18000,
      priceForumGold: 900,
      priceEth: 80000,
      relicStatus: ["free"],
    },
    tier: "Elite",
  },
}

export const NoEthPrice: Story = {
  args: {
    listing: {
      ...base,
      id: "story-006",
      name: "Shael Rune",
      slug: "shael-rune",
      image: "https://cdn.nookazon.com/diablo2resurrected/rune/shael_rune.png",
      category: "Runes",
      itemType: null,
      bodyLocation: null,
      tier: "Normal",
      rarity: "Normal",
      stats: ["Weapon: 20% Increased Attack Speed"],
      skills: [],
      priceUsdCents: 200,
      priceForumGold: 10,
      priceEth: null,
      relicStatus: ["free"],
    },
    tier: "Normal",
  },
}
