import type { Meta, StoryObj } from "@storybook/react"
import { GlowButton } from "./GlowButton"

const meta = {
  title: "GlowButton",
  component: GlowButton,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "deep-space",
      values: [{ name: "deep-space", value: "#050510" }],
    },
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["stripe", "paypal", "base"],
    },
    size: {
      control: "radio",
      options: ["md", "lg"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof GlowButton>

export default meta
type Story = StoryObj<typeof meta>

export const Stripe: Story = {
  args: {
    variant: "stripe",
    size: "lg",
    children: "Pay $50 with Card",
  },
}

export const PayPal: Story = {
  args: {
    variant: "paypal",
    size: "lg",
    children: "Pay with PayPal",
  },
}

export const Base: Story = {
  args: {
    variant: "base",
    size: "lg",
    children: "⚡ Generate Payment Address",
  },
}

export const Compact: Story = {
  args: {
    variant: "stripe",
    size: "md",
    children: "Buy Now",
  },
}

export const Disabled: Story = {
  args: {
    variant: "stripe",
    size: "lg",
    disabled: true,
    children: "Select a tier first",
  },
}

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "320px",
        padding: "24px",
        background: "#050510",
      }}
    >
      <GlowButton variant="stripe">Pay with Card (Stripe)</GlowButton>
      <GlowButton variant="paypal">Pay with PayPal</GlowButton>
      <GlowButton variant="base">⚡ Pay with USDC on Base</GlowButton>
      <GlowButton variant="stripe" disabled>
        Select a tier first
      </GlowButton>
    </div>
  ),
}
