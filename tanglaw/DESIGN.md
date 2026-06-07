---
name: TANGLAW
description: AI-Powered Scholarship Navigation Portal
colors:
  primary: "#1B4079"
  secondary: "#4D7C8A"
  tertiary: "#7F9C96"
  quaternary: "#8FAD88"
  canvas: "#CBDF90"
  surface: "#F4F9E2"
  ink: "#1B4079"
  ink-secondary: "#334155"
  accent-rose: "#E8C4C4"
  accent-periwinkle: "#B8C9E8"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontWeight: 900
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "12px 32px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: TANGLAW

## 1. Overview

**Creative North Star: "The Guiding Beacon"**

TANGLAW's design system is built to provide clarity and hope to students navigating the often-opaque world of scholarships. The aesthetic philosophy centers on "The Guiding Beacon"—a steady, reliable light that illuminates the path forward. It combines the professional weight of a financial portal with the approachable warmth of an academic mentor.

The system explicitly rejects the cold, bureaucratic feel of traditional government portals. Instead, it uses a vibrant, nature-inspired palette and soft, organic shapes to reduce the anxiety associated with complex applications.

**Key Characteristics:**
- **Steady Depth**: Use of layered surfaces and subtle glassmorphism to create a sense of hierarchy without clutter.
- **Organic Precision**: High-precision data and labels paired with soft, rounded corners and natural color transitions.
- **Guiding Motion**: Purposeful, choreographed transitions that lead the user's eye to the next actionable step.

## 2. Colors

The palette is a transition from deep, reliable blues to vibrant, hopeful greens, reflecting the journey from search to success.

### Primary
- **Deep Marine** (#1B4079): The anchor color. Used for primary actions, main headings, and branding. It conveys authority and reliability.

### Secondary
- **Slate Teal** (#4D7C8A): Used for supporting elements, icons, and secondary backgrounds. Provides a bridge between the deep primary and the brighter canvas.

### Tertiary
- **Sage Mist** (#7F9C96): Used for borders, dividers, and subtle accents. Softens the transition between layers.

### Neutral
- **Verdant Sage** (#CBDF90): The "Canvas" color. Used for the main page background to create a unique, fresh identity.
- **Morning Mist** (#F4F9E2): The "Surface" color. Used for cards and containers to provide a clean, high-contrast area for content.
- **Ink Main** (#1B4079): Primary text color, ensuring high contrast and brand consistency.
- **Ink Secondary** (#334155): Used for body text and descriptive labels to reduce visual weight.

### Named Rules
**The Rarity Rule.** The Deep Marine primary is used sparingly on the canvas to ensure that "Begin Journey" and other critical calls-to-action command immediate attention.

## 3. Typography

**Display Font:** Outfit (with sans-serif fallback)
**Body Font:** Inter (with sans-serif fallback)

**Character:** The pairing of the bold, geometric Outfit for headings and the highly readable Inter for body text balances personality with utility.

### Hierarchy
- **Display** (Black 900, 6rem, 1.1): Used for hero titles and major section headers.
- **Headline** (Bold 700, 2.25rem, 1.2): Used for component titles and card headers.
- **Title** (Bold 700, 1.25rem, 1.4): Used for sub-sections and prominent labels.
- **Body** (Normal 400, 1rem, 1.6): Used for all prose and descriptive text. Max line length: 75ch.
- **Label** (Black 900, 0.75rem, 0.32em tracking, Uppercase): Used for eyebrows, badges, and button text.

### Named Rules
**The Eyebrow Rule.** Every major section is preceded by a high-tracking, uppercase eyebrow label to provide instant context and reinforce the "Beacon" hierarchy.

## 4. Elevation

The system uses tonal layering and subtle backdrop blurs instead of heavy shadows. Depth is conveyed through color shifts (Canvas → Surface) and 1px borders.

### Shadow Vocabulary
- **Subtle Float** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Used sparingly on hover states for buttons and interactive cards.

### Named Rules
**The Glass Layer Rule.** Use `backdrop-blur-sm` and low-opacity white backgrounds (`bg-white/5`) for elements that need to feel like they are floating above the organic canvas.

## 5. Components

### Buttons
- **Shape:** Pill-shaped (9999px radius)
- **Primary:** Deep Marine background with white text. High-tracking uppercase labels.
- **Hover:** Slight scale-up (1.03x) and color darkening to Deep Marine Hover (#122f64).

### Cards
- **Shape:** Generously rounded (2rem / 32px radius)
- **Background:** Morning Mist (#F4F9E2) with 80% opacity and blur.
- **Border:** 1px subtle border using Sage Mist (#7F9C96) at low opacity.

### Inputs
- **Style:** Rounded-xl (12px), background matches the surface but with a distinct border.
- **Focus:** Border shift to Primary with a subtle ring.

## 6. Do's and Don'ts

### Do:
- **Do** use uppercase with high tracking (0.3em+) for short labels and eyebrows.
- **Do** use `text-balance` on headings to ensure even line distribution.
- **Do** use the Verdant Sage (#CBDF90) as the primary background to maintain the "Tanglaw" identity.

### Don't:
- **Don't** use sharp corners; every container should have a minimum of 8px (rounded-sm) radius.
- **Don't** use pure black or grey for text; always use Deep Marine (#1B4079) or tinted slates to keep the "alive" feel.
- **Don't** use cluttered news-style layouts; prioritize white space (Canvas) to guide the user's eye.
