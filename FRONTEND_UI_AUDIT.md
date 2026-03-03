# ResolvePath Frontend UI Audit (Current Code Snapshot)

Generated: 2026-03-03  
Scope: UI implementation currently in this repository (`app/`, `components/`, `lib/mock-data.ts`)  
Goal: Give a precise frontend handoff for ChatGPT/UI refinement.

## 1) Branding Assets In Use

- Primary logo file in app: `public/logo.jpeg`
- Also present (currently not used in nav): `public/resolvepath-logo.svg`
- Logo placement:
  - Desktop left nav header (`components/ui/SideNav.tsx`): `Image width=170 height=40`
  - Mobile top header (`components/app-shell.tsx`): `Image width=145 height=32`

## 2) Color Tokens (Exact)

Defined in `tailwind.config.ts` and mirrored in `app/globals.css` CSS variables.

| Token | Hex | CSS Var | Current Usage Intent in Code |
|---|---|---|---|
| `brand.navy` | `#921E2B` | `--rp-navy` | Primary brand surfaces, active nav, headings, borders |
| `brand.teal` | `#E14040` | `--rp-teal` | Accent actions (`teal` button variant), highlights |
| `brand.gray` | `#F9C2B2` | `--rp-gray` | Chips, soft panels, hover backgrounds |
| `brand.amber` | `#F48787` | `--rp-amber` | Warning/risk blocks |
| `brand.ink` | `#6B2C35` | `--rp-ink` | Body text (overridden globally to black; see section 3) |
| `brand.cloud` | `#F3F6F9` | `--rp-cloud` | Subtle panel background |
| White | `#FFFFFF` | `--rp-white` | Cards/input surfaces |

Additional hardcoded color:
- `#F9C2B2` used in `Chip` danger variant (`components/ui/Chip.tsx`).

## 3) Global Text Rule (Important)

`app/globals.css` applies a global override:

- Most text elements (`h1..h6`, `p`, `span`, `label`, `li`, `th`, `td`, etc.) are forced to `color: #000`.
- Classes containing `text-brand-navy` and `text-brand-ink` are also forced to black, except:
  - `button`
  - rounded-full links (`a[class*="rounded-full"]`)

Effect:
- Non-button text appears black app-wide.
- Button text remains per button variant (white for primary/teal, black for secondary/ghost).

## 4) Foundations: Typography, Radius, Shadows, Background

### Typography
- Font: Inter from `next/font/google` (`app/layout.tsx`)
- Body class: `font-sans`
- Common scales:
  - Hero/counts: `text-3xl`
  - Section headings: `text-2xl`, `text-xl`
  - Card headings: `text-base`
  - Body: `text-sm`
  - Meta/helper: `text-xs`

### Radius
- Cards: `rounded-3xl`
- Major pills/buttons/chips: `rounded-full`
- Inputs and smaller containers: `rounded-xl` / `rounded-2xl`

### Shadows
- Tailwind token `shadow-card`: `0 10px 30px rgba(146, 30, 43, 0.10)`
- Tailwind token `shadow-soft`: `0 6px 18px rgba(146, 30, 43, 0.08)`
- Global class overrides in CSS:
  - `.shadow-card`: `0 14px 32px rgba(146, 30, 43, 0.10)`
  - `.shadow-soft`: `0 8px 20px rgba(146, 30, 43, 0.08)`

### App Background
`body` uses layered gradients:
- Radial at top-left in red tint
- Radial at top-right in dark-red tint
- Linear background from `#f7f9fc` to `#f3f6f9`

## 5) App Frame / Positioning (Global)

From `components/app-shell.tsx`:

- Outer page: `min-h-screen`
- Max canvas width: `max-w-[1720px]`, centered
- Desktop layout: horizontal split
  - Left: fixed-width side nav (`w-[272px]`, only on `lg+`)
  - Right: flexible content column (`flex-1`, header + main + footer)
- Header:
  - Sticky top, translucent white: `bg-white/90 backdrop-blur`
  - Border bottom: `border-brand-navy/10`
  - Padding: `px-4 sm:px-6 lg:px-8`, `py-4`
- Main content area:
  - `px-4 py-6 sm:px-6 lg:px-8`
- Footer:
  - Bottom border `brand-navy/10`
  - Centered tiny text
  - Current text: `InnoWeb Ventures Ltd`

## 6) Side Navigation Map

From `components/ui/SideNav.tsx`:

- Visible on `lg+`; hidden on smaller screens.
- Background: `bg-white/90`, right border, blur.
- Top: logo block.
- Middle: nav items stack `space-y-2`
- Bottom: guidance card (`mt-auto`) using `bg-brand-cloud`.

Nav item states:
- Active: `bg-brand-navy text-white shadow-soft`
- Inactive: `text-black hover:bg-brand-gray/65`

## 7) Reusable UI Components (Exact Style)

### `Button` (`components/ui/Button.tsx`)
- Base: rounded-full, semibold, shadow-soft, transition.
- Variants:
  - `primary`: `bg-brand-navy text-white`
  - `secondary`: white with border, `text-black`
  - `ghost`: transparent, `text-black`
  - `teal`: `bg-brand-teal text-white`
- Sizes:
  - `sm`: `h-9 px-3 text-xs`
  - `md`: `h-10 px-4 text-sm`

### `Card` (`components/ui/Card.tsx`)
- `rounded-3xl border border-brand-navy/10 bg-white shadow-card`
- Default internal padding: `p-5 sm:p-6`

### `Chip` (`components/ui/Chip.tsx`)
- Pill height: `h-7` (`ChipButton` is `h-8`)
- Variants:
  - `default`: `bg-brand-gray/75 text-black`
  - `selected`: `bg-brand-navy text-white`
  - `success`: `bg-brand-teal/20 text-black`
  - `warning`: `bg-brand-amber/30 text-black`
  - `danger`: `bg-[#F9C2B2]/50 text-black`

### `Stepper` (`components/ui/Stepper.tsx`)
- Wrapper card style with 6-column layout on `md+`.
- States:
  - Active step: navy background with white text.
  - Complete step: pale gray background.
  - Inactive step: white background, muted text.

### `OutputCard` (`components/ui/OutputCard.tsx`)
- Card with title + action buttons (`Copy`, `Edit/Done`).
- Body textarea: fixed `h-52`, rounded, soft tinted background.

### `RiskFlagList` (`components/ui/RiskFlagList.tsx`)
- Each flag is a card row.
- High severity rows add amber border/background tint.

## 8) Route-by-Route Layout and Position

## `/` Dashboard

Structure (`app/page.tsx`):
1. KPI row: `grid gap-4 md:grid-cols-3 xl:grid-cols-4`
   - Open Cases
   - Ready
   - Needs Review
   - Action card (dark background + CTA)
2. Scenario section:
   - Header row (title + subtitle)
   - Tile grid: `md:grid-cols-2 xl:grid-cols-3`
3. Bottom analytics split:
   - `lg:grid-cols-[1.2fr_0.8fr]`
   - Left: Recent Case Activity
   - Right: Quality Signal

## `/cases/new` New Case Wizard

Structure (`components/new-case-wizard.tsx`):
- Top stepper then a single active step panel.
- Steps:
1. Scenario selection tiles (`md:2 cols`, `xl:3 cols`)
2. Intake form grid (`md:2 cols`, larger textareas span 2 cols)
3. Summary editor (`textarea h-80`)
4. Timeline list + add-event button
5. Risk flags + safety gate card
6. Outputs hub:
   - Top controls card (tone chips, length chips, regenerate)
   - Main split: `xl:grid-cols-[1fr_320px]`
     - Left: output cards + version history card
     - Right: quality checks card + amber recommendation block
- Bottom persistent nav row: Back / Continue
- Modal:
  - Center overlay (`fixed inset-0`) for adding timeline events

## `/cases` My Cases

Structure (`app/cases/page.tsx`):
- Intro card
- Data table card (horizontal scroll if needed)
  - `min-w-[820px]`
  - Row hover tint and click-to-open behavior

## `/cases/[id]` Case Detail

Structure (`components/case-detail-view.tsx`):
1. Top case metadata card (title, scenario, status chip, export button)
2. Tabs card: Summary / Timeline / Outputs / Versions
3. Conditional tab content:
   - Summary tab: `xl:grid-cols-[1fr_340px]` (summary + risk column)
   - Timeline tab: single list card
   - Outputs tab: `xl:grid-cols-[1fr_320px]` (outputs + quality panel)
   - Versions tab: version timeline + 3 metric tiles

## `/templates` Templates Library

Structure (`components/templates-library.tsx`):
- Filter/search card
  - Search input on left
  - Scenario chip filters on right (`lg:grid-cols-[1fr_auto]`)
- Template grid: `md:grid-cols-2 xl:grid-cols-3`

## `/practice` Practice Mode

Structure (`components/practice-mode-ui.tsx`):
- Two-column layout: `xl:grid-cols-[320px_1fr]`
  - Left settings panel (scenario, character, difficulty, scorecard)
  - Right chat card (`min-h-[620px]`) with:
    - Header
    - Scroll transcript
    - Composer/footer

## `/settings` Settings

Structure (`components/settings-ui.tsx`):
- Intro card
- Disclaimer card with checkbox acceptance
- Preferences card:
  - Retention toggle row
  - Policy upload placeholder panel
  - Save button + saved chip

## `/cases/[id]/print` Printable Export View

Structure:
- Centered column `max-w-4xl`
- Sequential cards for each output section
- Print button hidden in print media

## 9) Interaction States and Visual Behavior

- Selected chips/tabs are dark filled; unselected are pale with black text.
- Table rows, cards, and list rows generally use gentle tinted hover (`brand-gray` opacity).
- Risk/high-risk states use `brand-amber` translucent blocks.
- Modal overlay uses dark translucent tint + blur.
- Copy actions in output cards show temporary `Copied`/`Copy failed` text.

## 10) Frontend Content/Position Inventory (Quick Reference)

- Header: page title + `Start New Case` button
- Left nav items: Dashboard, Start New Case, My Cases, Templates, Practice, Settings
- Footer: `InnoWeb Ventures Ltd`
- Global paddings:
  - Horizontal: `4 / 6 / 8` scale by breakpoint
  - Vertical main: `py-6`
- Common card stack rhythm: `space-y-4` or `space-y-5/6/7`

## 11) Hand-off Prompt You Can Paste Into ChatGPT

```md
Use the following frontend implementation snapshot as source of truth and propose a refined UI pass without changing information architecture:

- Framework: Next.js + Tailwind, Inter font
- Logo asset: public/logo.jpeg (used in side nav and mobile header)
- Global app shell: max width 1720px, left rail 272px on lg+, sticky top header, footer text "InnoWeb Ventures Ltd"
- Current color tokens:
  - brand.navy #921E2B
  - brand.teal #E14040
  - brand.gray #F9C2B2
  - brand.amber #F48787
  - brand.ink #6B2C35
  - brand.cloud #F3F6F9
- Global text override: non-button text is forced to black.
- Buttons keep current text colors by variant.

Pages/layouts:
1) Dashboard: KPI row (3/4 cols), scenario grid (2/3 cols), bottom 1.2fr/0.8fr split.
2) New Case Wizard: 6-step flow, output step split 1fr/320px plus right Quality Checks panel.
3) My Cases: data table with status chips and row-open behavior.
4) Case Detail: tabbed sections; summary split 1fr/340px; outputs split 1fr/320px.
5) Templates: filter/search card + template grid.
6) Practice: 320px left settings + right chat panel.
7) Settings: disclaimer + retention toggle + upload placeholder.

Refinement task:
- Keep all page structure and component hierarchy.
- Improve spacing rhythm, hierarchy clarity, and consistency of component states.
- Keep text black (except existing button state text colors).
- Return an implementation-ready style adjustment plan + exact Tailwind class edits.
```

## 12) Notes

- This document reflects current code, not intended final brand fidelity.
- If you want, next step can be a second MD diff plan: "current vs target brand-corrected UI".
