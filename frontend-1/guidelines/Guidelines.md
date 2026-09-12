# CarbonLoop Design System Guidelines

## Brand

CarbonLoop is a B2B industrial marketplace connecting CO₂ suppliers and buyers. Tone: premium, industrial-tech, data-driven, restrained. Enterprise analytics dashboard aesthetic — not consumer SaaS.

**Avoid:** neon, cyberpunk, glowing text, heavy 3D, aggressive animation, environmental clichés (leaves, globes, cartoon nature icons).

---

## Color System (70 / 20 / 10)

| Role | Token | Hex |
|------|-------|-----|
| Background | `--color-background` | `#FAFAF9` |
| Surface | `--color-surface` | `#FFFFFF` |
| Surface warm | `--color-surface-warm` | `#F1F1EF` |
| Charcoal (text, dark bg) | `--color-charcoal` | `#1A1D1B` |
| Deep green (nav, anchor) | `--color-deep-green` | `#0F3D2E` |
| Teal accent | `--color-teal` | `#2E9E8A` |
| Border | `--color-border` | `#E5E5E2` |
| Text secondary | `--color-text-secondary` | `#5A5C5A` |
| Text muted | `--color-text-muted` | `#8A8C8A` |

**Teal accent rules:** use only for primary CTA, match scores, and small highlights. Never as a background fill.

---

## Typography

| Face | Weight | Use |
|------|--------|-----|
| IBM Plex Sans | 300–700 | All UI text, headings, body |
| JetBrains Mono | 400–500 | Data values, percentages, prices |

**Eyebrow / badge labels:** 11px, weight 600, letter-spacing 0.09em, all-caps. Use `.label-caps` class.

---

## Spacing Scale

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`

Generous whitespace — never cram cards edge-to-edge.

---

## Radius & Shadow

- Standard cards: `border-radius: 8px`
- Modals, floating panels: `border-radius: 12px`
- Badges / pills: `border-radius: 9999px`
- Card shadow: `0 4px 16px rgba(0,0,0,0.06)` — never hard drop shadows
- Hover shadow: `0 8px 24px rgba(0,0,0,0.10)` with `translateY(-2px)`

---

## Glassmorphism

Use **only** on: hero floating cards, match score cards, filter panels, modals.

Recipe:
- Fill: `rgba(255,255,255,0.10)` (light) or `rgba(26,29,27,0.08)` (dark)
- Backdrop blur: `blur(16px)–blur(24px)`
- Border: `1px solid rgba(255,255,255,0.18)`

Everything else (dashboard cards, tables, lists) stays solid white/off-white with `#E5E5E2` border. No glass.

---

## The CarbonLoop Orb

A small abstract sphere with a thin circular orbit ring. Muted teal-on-charcoal or teal-on-white. Used as:
- Logomark in the nav
- Loading indicator (animated)
- Empty state graphic
- Hero visual

This is the **one** recurring brand element. Do not invent a second brand motif.

Variants: `teal-on-dark`, `teal-on-white`, `teal-on-green`

---

## Micro-interactions

- Card hover: `translateY(-2px)`, shadow increases — 200ms ease. Use `.card-lift` class.
- Button hover: soft color shift (teal → `#3BB8A2`), slight `translateY(-1px)` — 150–200ms
- Tab/nav active: soft background fill — 150ms ease
- All transitions: fade with optional slight vertical movement (8px max). No slides, no zooms, no parallax.

---

## Component Patterns

**Badge / Pill:** `.label-caps` + `border-radius: 9999px` + variant background tints (neutral / teal / green / warning)

**Stat Tile:** white card, label-caps eyebrow, JetBrains Mono value, delta in teal (positive) or warm red (negative)

**ListingCard:** white card with `.card-lift`, badge type indicator, 2-col data grid, match score pill

**MatchScore:** glassmorphic mini-card with SVG arc gauge in teal, JetBrains Mono percentage

**Nav:** deep green `#0F3D2E`, Orb logomark, tab buttons with soft active fill, user avatar pill
