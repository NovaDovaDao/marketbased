# Design System Document: Marketbased

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Relic of the Scribe."** We are not building a standard web interface; we are manifesting a digital artifact. This system rejects the sterility of modern "flat" design in favor of a gritty, immersive, and dark fantasy atmosphere inspired by high-stakes medieval trade and gothic exploration.

To achieve this, the design system utilizes **Intentional Asymmetry** and **Tonal Depth**. By avoiding rigid, centered grids and instead using offset headers and varying container heights, we mimic the organic feel of a hand-inked manuscript or a stone-carved altar. The goal is to make the user feel like they are interacting with a physical object that has weight, history, and a touch of danger.

---

## 2. Colors & Atmospheric Lighting
Our palette is rooted in the darkness of the abyss, punctuated by the glint of weathered gold and the visceral strike of blood red.

*   **Surface Hierarchy (Obsidian Tiers):**
    *   **Base Layer:** `surface` (#131313) is your void.
    *   **Nesting:** Use `surface_container_lowest` (#0e0e0e) for inset areas (like empty inventory slots) and `surface_container_highest` (#353535) for elevated elements (like active modal windows).
*   **The "No-Line" Rule:** Standard 1px solid CSS borders are strictly prohibited for sectioning. Contrast must be achieved through background shifts. A `surface_container_low` card sitting on a `surface` background provides enough distinction to feel like a slab of stone resting on a dark floor.
*   **The "Glass & Gradient" Rule:** To simulate "Atmospheric Lighting," primary CTAs and active states should use a linear gradient from `primary` (#ffb4a8) to `primary_container` (#8c0000). This creates a "glow" effect as if lit by a nearby torch.
*   **Signature Textures:** Apply a subtle noise overlay (2-3% opacity) on all `surface` elements to break the digital flatness and simulate the grit of charcoal and obsidian.

---

## 3. Typography: The Newsreader Serif
Typography is the primary vehicle for the "Manuscript" feel. We use **Newsreader** exclusively to provide an editorial, authoritative tone.

*   **Display & Headlines:** Use `display-lg` (3.5rem) and `headline-lg` (2rem) with wide letter-spacing (-0.02em) to command attention. These should always be in `secondary` (#f7bd48) to mimic gold-leaf lettering.
*   **Body & Utility:** `body-md` (0.875rem) in `on_surface_variant` (#e3beb8) ensures high readability against dark backgrounds without the "vibration" of pure white text.
*   **The Hierarchy of Truth:**
    *   **Gold (`secondary`):** Reserved for titles, rare items, and headers.
    *   **Red (`primary`):** Reserved for life-threatening alerts or irreversible actions.
    *   **Stone (`on_surface`):** Reserved for general information and lore.

---

## 4. Elevation & Depth
In this design system, elevation is a psychological state, not just a CSS property.

*   **Tonal Layering:** Depth is achieved by stacking. A `surface_container_highest` element should never sit directly on `surface_container_lowest`. You must transition through the tiers to create a "stepped" altar effect.
*   **Ambient Shadows:** Traditional drop shadows are replaced by "Glow Voids." Use extra-diffused shadows (blur: 32px+) with a low-opacity (6%) tint of `primary_container`. This makes floating elements look like they are emanating a faint, dark heat.
*   **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., a high-density data table), use `outline_variant` at 15% opacity. It should be felt, not seen.
*   **Glassmorphism:** For floating menus, use a `surface_variant` background with a `backdrop-filter: blur(12px)`. This creates the illusion of "translucent obsidian," allowing the grit of the background to bleed through.

---

## 5. Components

### Buttons (The Sigils)
*   **Primary:** A gradient from `primary_container` to `on_primary_fixed_variant`. Text is `on_primary_fixed` (Deep Blood). These represent high-impact actions.
*   **Secondary (The Gilded):** No background fill. Use a "Ghost Border" of `secondary` (#f7bd48) and text in `secondary`. On hover, the background fills with a 10% opacity `secondary` glow.
*   **Tertiary:** Pure text-link style using `tertiary` (#e9bf9a).

### Cards & Lists (The Stone Tablets)
*   **Layout:** Strictly `0px` border-radius. Every element is hard-edged and monolithic.
*   **Separation:** Forbid the use of divider lines. Use `1.5rem` (Spacing 6) of vertical whitespace or a shift from `surface_container` to `surface_container_high`.

### Input Fields (The Inscribed)
*   **Styling:** Inputs are recessed using `surface_container_lowest`. The cursor and focus state should utilize `secondary` (Gold) to signify the "ink" being applied to the page.
*   **Error States:** Use `error` (#ffb4ab) text and a soft `error_container` outer glow.

### Additional Signature Component: The Item "Socket"
*   For trading interfaces, items should be housed in a 1:1 aspect ratio square using `surface_container_low` with an inset `inner-shadow` to simulate a physical socket in a stone wall.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align headers to the left and action buttons to the far right, leaving intentional "dead space" in the center to create tension.
*   **Use High-Contrast Gold:** Ensure all critical navigation is in `secondary_fixed_dim` for a premium, high-end feel.
*   **Respect the Serif:** Keep line-heights generous (1.6 for body) to maintain the manuscript aesthetic.

### Don’t:
*   **No Rounded Corners:** Never use `border-radius`. Everything in this world is carved from stone or forged in fire.
*   **No Pure White:** Avoid `#FFFFFF` for text. Use `on_surface_variant` to keep the atmosphere heavy and atmospheric.
*   **No Standard Grids:** Avoid the "Bootstrap" look. Vary your column widths to make the page feel like a custom-bound book.
*   **No Rapid Transitions:** Use 300ms "Ease-In-Out" for hovers to mimic the slow, heavy movement of ancient mechanisms.