# Design system

Visual direction: minimal, technical, calm, premium — closer to Vercel / Linear /
Raycast than a colorful SaaS dashboard.

## Color

Grayscale-first, defined as CSS variables on `:root` in
[`app/globals.css`](../app/globals.css), with a dark theme under
`@media (prefers-color-scheme: dark)` (guarded by
`:root:not([data-theme="light"])`) and an explicit `:root[data-theme="dark"]`.
Users can force light/dark/system in Settings.

Color is used **sparingly and only semantically** (ok / warn / bad / info), and
never as the *only* signal — status also carries text and a shape/glyph
(Part 30). No gradients, neon, or decorative color.

## Typography

- **Inter** for UI text (`--font-sans`).
- **JetBrains Mono** for scores, IDs, technical metadata, and generated reports
  (`--font-mono`), with tabular numerals.

## Components

Thin borders, restrained radius (8–10px), generous whitespace, subtle
transitions only. Primitives live in `components/ui.tsx`: `ProgressBar`,
`MasteryBadge`, `PriorityBadge`, `ScorePill`, `Stat`, `LockBadge`,
`SectionHeading`, `Pipeline`, `EmptyState`.

## Accessibility

- Semantic HTML, labelled controls, `aria-*` on radios/progress.
- Visible focus outline (`:focus-visible`).
- Status never conveyed by color alone (glyphs + text).
- Keyboard operable; the assessment supports a numbered question jump grid.

## Responsiveness

Desktop-first but mobile-usable: the sidebar collapses to a top **Menu** bar
under `lg`, grids reflow to fewer columns, and there's a 16px side gutter with no
horizontal page scroll.
