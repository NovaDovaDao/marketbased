import type { Meta, StoryObj } from "@storybook/react"
import RuneCard from "./RuneCard"

const meta: Meta<typeof RuneCard> = {
  title: "Marketplace/RuneCard",
  component: RuneCard,
  parameters: {
    layout: "padded",
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#131313" }] },
  },
  argTypes: {
    tier: { control: "select", options: ["low", "mid", "high"] },
    price: { control: "number" },
  },
}

export default meta
type Story = StoryObj<typeof RuneCard>

const elRune = {
  id: 1,
  name: "El",
  slug: "el",
  level: 11,
  tier: "low" as const,
  image: "https://cdn.nookazon.com/diablo2resurrected/rune/el_rune.png",
}
const istRune = {
  id: 24,
  name: "Ist",
  slug: "ist",
  level: 51,
  tier: "mid" as const,
  image: "https://cdn.nookazon.com/diablo2resurrected/rune/ist_rune.png",
}
const zodRune = {
  id: 33,
  name: "Zod",
  slug: "zod",
  level: 69,
  tier: "high" as const,
  image: "https://cdn.nookazon.com/diablo2resurrected/rune/zod_rune.png",
}

export const Common: Story = {
  args: { rune: elRune, price: 500 },
}

export const Uncommon: Story = {
  args: { rune: istRune, price: 85000 },
}

export const Rare: Story = {
  args: { rune: zodRune, price: 2500000 },
}

export const Unlisted: Story = {
  args: { rune: zodRune },
}

export const AllTiers: Story = {
  render: () => (
    <div
      className="grid grid-cols-3 gap-6"
      style={{ fontFamily: "Newsreader, serif", background: "#131313", padding: 24 }}
    >
      <RuneCard rune={elRune} price={500} />
      <RuneCard rune={istRune} price={85000} />
      <RuneCard rune={zodRune} price={2500000} />
    </div>
  ),
}
