# ResolvePath Backend

ResolvePath backend persistence and generation APIs for Next.js App Router.

## Stack

- Next.js route handlers (App Router)
- TypeScript
- Prisma + SQLite
- OpenAI API (optional) with deterministic fallback generation
- Dashboard AI Support widget (bottom-right) backed by `/api/assistant`

## Database

Schema is in [prisma/schema.prisma](/Users/mauriciojardim/Resolvepath/prisma/schema.prisma).

Models:

- `Case`
- `TimelineEvent`
- `OutputVersion`
- `Template`
- `Setting` (singleton id `1`)

Note: SQLite + Prisma uses `TEXT` for JSON-like fields (`outputsJson`, `riskFlagsJson`) and API responses return parsed JSON objects/arrays.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env
```

3. Run migrations and seed templates:

```bash
npm run db:setup
```

4. Start server:

```bash
npm run dev
```

## Environment

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
```

If `OPENAI_API_KEY` is missing, generation automatically uses deterministic fallback outputs.

## API Surface

### Cases

- `POST /api/cases` create case
- `GET /api/cases` list cases
- `GET /api/cases/:id` get case detail
- `PUT /api/cases/:id` update summary/preferences/status

### Timeline

- `POST /api/cases/:id/timeline` add timeline event
- `DELETE /api/timeline/:eventId` delete timeline event

### Generation + Versions

- `POST /api/cases/:id/generate` run risk engine, generate outputs, store `OutputVersion`
- `GET /api/cases/:id/versions` list versions
- `POST /api/cases/:id/versions/:versionId/restore` restore version by copying to a new latest version

### Templates

- `GET /api/templates?scenario=PERFORMANCE`
- `POST /api/templates`
- `PUT /api/templates/:id`
- `DELETE /api/templates/:id`

### Settings

- `GET /api/settings`
- `POST /api/settings/disclaimer`
- `PUT /api/settings/policy`

### AI Support

- `GET /api/assistant` availability + monitoring snapshot
- `POST /api/assistant` ResolvePath-focused chat reply with OpenAI/fallback

### Practice Simulator AI

- `POST /api/practice/respond` role-play reply for Practice Mode with UK employment-process aware prompting (OpenAI/fallback)

## Risk Engine

`lib/server/riskEngine.ts`

Returns:

```ts
{
  riskFlags: RiskFlag[];
  highRisk: boolean;
  missingInfo: {
    noTimeline: boolean;
    tooGeneric: boolean;
    noSpecificExamples: boolean;
  };
}
```

High-risk keyword groups:

- discrimination/protected characteristic
- harassment/sexual harassment
- whistleblowing
- pregnancy/maternity
- dismissal/terminate
- settlement agreement

Missing info checks:

- no timeline events
- generic summary/no specific examples

## Generation Service

`lib/server/generateOutputs.ts`

- `generateOutputsStandard(...)`
- `generateOutputsSafety(...)`
- `generateOutputs(...)`

Safety mode enforces neutral, escalation-oriented drafting and avoids decisive action language.

The **not legal advice** reminder is returned in `POST /api/cases/:id/generate` as `safetyGate` text only when high risk is detected.

## Unit Tests

Risk engine basic tests:

```bash
npm run test:risk
```

## Sample cURL

Create case:

```bash
curl -X POST http://localhost:3000/api/cases \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Performance case - A. Smith",
    "scenario":"PERFORMANCE",
    "summary":"Two KPI misses in February with coaching already provided.",
    "tonePreference":"neutral",
    "lengthPreference":"standard"
  }'
```

Add timeline event:

```bash
curl -X POST http://localhost:3000/api/cases/<CASE_ID>/timeline \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-02-20","note":"Coaching check-in with agreed actions"}'
```

Generate outputs:

```bash
curl -X POST http://localhost:3000/api/cases/<CASE_ID>/generate \
  -H 'Content-Type: application/json' \
  -d '{"mode":"standard","tonePreference":"supportive","lengthPreference":"detailed"}'
```

List versions:

```bash
curl http://localhost:3000/api/cases/<CASE_ID>/versions
```

Restore version:

```bash
curl -X POST http://localhost:3000/api/cases/<CASE_ID>/versions/<VERSION_ID>/restore
```

Accept disclaimer:

```bash
curl -X POST http://localhost:3000/api/settings/disclaimer
```

Save org policy text:

```bash
curl -X PUT http://localhost:3000/api/settings/policy \
  -H 'Content-Type: application/json' \
  -d '{"orgPolicyText":"Follow internal policy steps and HR review for high-risk concerns."}'
```

AI support prompt:

```bash
curl -X POST http://localhost:3000/api/assistant \
  -H 'Content-Type: application/json' \
  -d '{
    "page": "/",
    "messages": [
      { "role": "user", "content": "Show monitoring snapshot" }
    ]
  }'
```

Practice simulator prompt:

```bash
curl -X POST http://localhost:3000/api/practice/respond \
  -H 'Content-Type: application/json' \
  -d '{
    "scenario": "performance",
    "character": "Defensive",
    "difficulty": 3,
    "messages": [
      { "role": "assistant", "content": "Practice partner ready." },
      { "role": "user", "content": "I want to discuss concerns about your recent targets." }
    ]
  }'
```
