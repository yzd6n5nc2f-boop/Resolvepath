# ResolvePath Templates Library Audit

Generated: 2026-03-03  
Scope: exact current implementation of Templates Library and its integration with the rest of ResolvePath.

## 1) Front-End Entry Points

- Route entry: `/templates`  
  File: `app/templates/page.tsx`
- Main UI component: `TemplatesLibrary`  
  File: `components/templates-library.tsx`
- App frame + nav context:
  - `components/app-shell.tsx`
  - `components/ui/SideNav.tsx`

## 2) Current Templates Library UI (Exact Behavior)

File: `components/templates-library.tsx`

What the page currently does:
- Renders a page card with:
  - title: `Templates Library`
  - helper text: `Filter and preview scenario-specific drafting templates.`
- Renders a search input:
  - filters by `name` or `preview` (case-insensitive substring)
- Renders scenario filter chips:
  - `All` + one chip for each scenario in `scenarioList`
- Renders template cards in responsive grid:
  - `md:grid-cols-2`
  - `xl:grid-cols-3`

What it does not do (currently):
- No API call to `/api/templates`
- No persistence
- No "open", "apply to case", "copy", or "edit" action
- No empty-state message if no templates match (grid just renders nothing)

## 3) Exact Templates Displayed in UI

Source: `lib/mock-data.ts` (`mockTemplates`)

| id | scenario | name | preview |
|---|---|---|---|
| t1 | performance | Performance Meeting Agenda | Opening context, evidence review, support options, and agreed milestones. |
| t2 | conduct | Conduct Investigation Prompt | Capture facts, witness input, and objective standards for consistency. |
| t3 | sickness_absence | Return to Work Structure | Discuss wellbeing, adjustments, and phased return checkpoints. |
| t4 | grievance | Grievance Acknowledgement | Confirm receipt, process timeline, and point of contact. |
| t5 | conflict | Mediation Ground Rules | Shared standards, respectful dialogue commitments, and follow-up reviews. |
| t6 | flexible_working | Flexible Working Assessment | Role coverage analysis, alternatives, and trial period framing. |

## 4) Back-End Template Model and API (Exists but Not Used by UI)

### Prisma model

File: `prisma/schema.prisma`

`Template` fields:
- `id` (uuid string)
- `scenario` (string)
- `name` (string)
- `body` (string)
- `createdAt` (datetime)

### Seeded backend templates

File: `prisma/seed.js`  
Seed count: 8 templates

Scenario values are uppercase:
- `PERFORMANCE` (2)
- `CONDUCT` (2)
- `SICKNESS_ABSENCE` (1)
- `GRIEVANCE` (1)
- `CONFLICT` (1)
- `FLEXIBLE_WORKING` (1)

### API routes

- `GET /api/templates?scenario=PERFORMANCE`
- `POST /api/templates`
- `PUT /api/templates/:id`
- `DELETE /api/templates/:id`

Files:
- `app/api/templates/route.ts`
- `app/api/templates/[id]/route.ts`

## 5) Important Data Contract Mismatch

There is a current mismatch between front-end and back-end scenario enums:

- Front-end scenario keys (UI/mock): lowercase snake case  
  Example: `performance`, `sickness_absence`
- Back-end domain/API scenario keys: uppercase  
  Example: `PERFORMANCE`, `SICKNESS_ABSENCE`

Impact:
- If Templates Library starts calling `/api/templates` without normalization, scenario filtering will not align.

## 6) How Templates Library Fits Into Rest of App (Current State)

### Navigation and information architecture

- Side nav includes `Templates` route.
- App shell title map includes `Templates Library`.
- So page placement in product IA is correct.

### Relationship to New Case flow

- New Case step 1 text says scenario choice preloads prompts/templates.
- In current code, New Case wizard does not load or apply template library content.
- No shared state between template selection and case creation.

### Relationship to Output generation

- Output generation uses:
  - case summary
  - timeline
  - risk engine
  - tone/length preferences
- It does not currently read template records.

### Relationship to Case Detail

- Case detail outputs are editable/generated content.
- No linkage to which template pack (if any) was used.

## 7) UI System Alignment for Templates Screen

Templates screen is already aligned with app-wide component tokens:

- Uses `Card` component for section and item containers.
- Uses `ChipButton` for scenario filters.
- Uses global neutral tokens from `app/globals.css`:
  - `--color-surface`, `--color-surface-2`, `--color-border`, `--color-text`, `--color-text-muted`

## 8) Gaps to Address for a Production-Ready Templates Feature

1. Data source gap:
- UI uses `mockTemplates`; backend `Template` data is unused.

2. Action gap:
- No per-template actions (`Preview full body`, `Use in case`, `Copy`, `Favorite`).

3. Workflow gap:
- No entry point from New Case wizard into templates.
- No mechanism to inject selected template text into summary/output drafting.

4. Traceability gap:
- Case records do not store selected template IDs.

5. Enum consistency gap:
- Lowercase vs uppercase scenario values need standardization or mapping layer.

## 9) Suggested Integration Fit (Minimal, High-Value)

Phase 1:
- Replace `mockTemplates` with `GET /api/templates`.
- Add scenario mapping helper:
  - UI: lowercase keys
  - API: uppercase keys

Phase 2:
- Add "Use Template" CTA on each card.
- If launched from `/cases/new?scenario=...`, pre-filter templates to that scenario.
- On selection, pass template payload into wizard summary/intake defaults.

Phase 3:
- Store template provenance on case generation (e.g., `appliedTemplateIds`).
- Show applied templates in case detail audit/version history.

## 10) Exact File List for ChatGPT Refinement Context

Core UI:
- `app/templates/page.tsx`
- `components/templates-library.tsx`
- `lib/mock-data.ts`

App fit:
- `components/app-shell.tsx`
- `components/ui/SideNav.tsx`
- `components/new-case-wizard.tsx`
- `components/case-detail-view.tsx`

Backend:
- `prisma/schema.prisma`
- `prisma/seed.js`
- `lib/server/domain.ts`
- `app/api/templates/route.ts`
- `app/api/templates/[id]/route.ts`

## 11) Paste-Ready Prompt for ChatGPT

```md
Refine the ResolvePath Templates Library to be production-ready while preserving current app IA and visual style.

Current state:
- Front-end route: /templates (app/templates/page.tsx -> components/templates-library.tsx)
- Uses local mockTemplates (6 entries) from lib/mock-data.ts
- Search + scenario chips + card grid are implemented
- No API integration, no apply action, no case linkage
- Backend already has Template CRUD + SQLite model + seed data
- Scenario enum mismatch:
  - Front-end uses lowercase keys: performance, conduct, sickness_absence, grievance, conflict, flexible_working
  - Backend API/domain use uppercase keys: PERFORMANCE, CONDUCT, SICKNESS_ABSENCE, GRIEVANCE, CONFLICT, FLEXIBLE_WORKING

What I need:
1) Implement API-backed Templates Library using /api/templates
2) Add reliable scenario mapping between UI and API
3) Add "Use Template" action that can feed New Case wizard defaults
4) Keep current neutral card/chip style system and spacing
5) Add empty state and loading state
6) Add optional case-level traceability of selected template(s)

Please return:
- exact code-level plan
- file-by-file edits
- data contract changes (if needed)
- any migration notes
```

