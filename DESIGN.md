---
name: MLI Modern
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#002046'
  on-primary: '#ffffff'
  primary-container: '#1b365d'
  on-primary-container: '#87a0cd'
  inverse-primary: '#aec7f7'
  secondary: '#325f9e'
  on-secondary: '#ffffff'
  secondary-container: '#91baff'
  on-secondary-container: '#164987'
  tertiary: '#001f4a'
  on-tertiary: '#ffffff'
  tertiary-container: '#003472'
  on-tertiary-container: '#6e9ef7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f7'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2e476f'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a9c8ff'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#124684'
  tertiary-fixed: '#d7e2ff'
  tertiary-fixed-dim: '#acc7ff'
  on-tertiary-fixed: '#001a40'
  on-tertiary-fixed-variant: '#004492'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  space-unit: 8px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system focuses on a **Corporate Modern** aesthetic that emphasizes trust, precision, and clarity. The brand personality is professional yet approachable, shedding the traditional rigidity of financial institutions for a more fluid, digital-first experience.

The visual style leverages **Minimalism** with an emphasis on white space to reduce cognitive load. By utilizing high-quality typography and a refined color palette, the UI evokes a sense of calm authority. The interface should feel "airy" and spacious, moving away from dense, data-heavy layouts toward a more intentional, editorial flow.

## Colors
The palette is rooted in the heritage Navy (#1B365D), which serves as the primary brand anchor for navigation, headers, and high-emphasis components. The secondary blue (#2E5B9A) is used for primary actions and interactive states.

A range of "Cool Neutrals" derived from the navy base provides the foundation for the UI:
- **Surface:** A very light tint of blue (#F8FAFC) replaces pure white for a softer, more modern feel.
- **Accents:** Tertiary blues are reserved for informational highlights and data visualization.
- **Contrast:** Text colors transition from deep navy for headlines to a mid-range slate for body text to maintain hierarchy without harshness.

## Typography
Inter is utilized as a single-family system to ensure a systematic and utilitarian feel. Hierarchy is established through significant weight variance and generous line heights. 

To achieve the "airy" feel, headlines use negative letter-spacing for a tighter, more modern lockup, while smaller labels use increased letter-spacing for legibility. Body text is prioritized for readability with a minimum size of 16px to ensure accessibility across all touchpoints.

## Layout & Spacing
This design system employs a **Fluid Grid** model based on an 8px base unit. The layout is designed to breathe, with significant vertical rhythm (Stack LG) between sections to prevent visual clutter.

- **Desktop:** 12-column grid with a 1280px max-width, utilizing 24px gutters and 48px outer margins.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

Whitespace is treated as a core design element. Elements should never feel cramped; when in doubt, increase padding. Horizontal containers should use internal padding that matches the gutter width to maintain alignment.

## Elevation & Depth
Hierarchy is conveyed through **Tonal Layers** and extremely soft **Ambient Shadows**. 

Instead of traditional heavy shadows, the system uses "Elevated Surfaces" characterized by a slight color shift and a high-diffusion, low-opacity shadow (e.g., Blur 24px, Y-Offset 8px, 4% Opacity Navy). This creates a sense of physical layering without breaking the minimalist aesthetic. Primary backgrounds should remain flat, while interactive cards and modals sit on these elevated layers.

## Shapes
The shape language is defined by **Full Roundedness (Pill-shaped)**. This choice softens the professional navy palette, making the interface feel friendly and technologically advanced. 

Every interactive element—from buttons to input fields—must follow this rounded logic. Small components (chips, icons) use the standard 1rem radius, while larger containers (cards, modals) scale up to 2rem or 3rem to maintain the visual curve proportion.

## Components

### Buttons
Primary buttons are fully rounded (pill-shaped) using the brand navy. They feature generous horizontal padding (32px) to emphasize the shape. Secondary buttons use a light blue tint background with navy text.

### Input Fields
Inputs must have a pill-shaped border-radius. Borders are thin (1px) in a soft neutral grey, shifting to the primary blue on focus. Helper text and labels should align with the start of the text inside the pill to maintain vertical flow.

### Cards
Cards are the primary container for information. They should feature 32px internal padding and a `rounded-xl` (3rem) radius. Subtle ambient shadows should only appear on hover to signify interactivity.

### Chips & Badges
Chips use a 100% rounded radius. Use high-contrast combinations (e.g., Navy text on Light Blue background) for status indicators.

### Lists & Navigation
Navigation items should have a pill-shaped hover state. Lists should use generous vertical spacing (16px between items) to maintain the "airy" feel requested. Use chevron-right icons for drill-down lists to imply motion.