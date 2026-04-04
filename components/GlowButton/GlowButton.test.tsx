import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { GlowButton } from "./GlowButton"

describe("GlowButton", () => {
  it("renders children", () => {
    render(<GlowButton>Pay Now</GlowButton>)
    expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument()
  })

  it("carries stripe variant classes by default", () => {
    render(<GlowButton>Stripe</GlowButton>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("from-violet-700")
  })

  it("carries paypal variant classes", () => {
    render(<GlowButton variant="paypal">PayPal</GlowButton>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("from-blue-700")
  })

  it("carries base variant classes", () => {
    render(<GlowButton variant="base">Base</GlowButton>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("from-cyan-700")
  })

  it("is disabled when disabled prop is set", () => {
    render(<GlowButton disabled>Can't click</GlowButton>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GlowButton onClick={onClick}>Click me</GlowButton>)
    await user.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <GlowButton disabled onClick={onClick}>
        Disabled
      </GlowButton>,
    )
    await user.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })

  it("applies md size classes", () => {
    render(<GlowButton size="md">Compact</GlowButton>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("px-5")
  })

  it("applies lg size classes and full width", () => {
    render(<GlowButton size="lg">Large</GlowButton>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("w-full")
  })

  it("merges custom className", () => {
    render(<GlowButton className="custom-class">Custom</GlowButton>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("custom-class")
  })
})
