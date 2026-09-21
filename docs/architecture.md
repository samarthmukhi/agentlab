# Architecture

AgentLab is a client-side Next.js (App Router) app. All domain logic is pure and
lives in `lib/`, separated from React so it can be unit-tested directly. State is
held in a React context and persisted to `localStorage`. There is **no backend
and no API key**.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│ app/  (routes, "use client" pages)                          │
│   dashboard · learn · builds · assess · review · reports ·  │
│   swarmfolio · evidence · progress · settings               │
├─────────────────────────────────────────────────────────────┤
│ components/  StoreProvider (context + persistence),         │
│              Nav, UI primitives, forms, charts              │
├─────────────────────────────────────────────────────────────┤
│ lib/  PURE domain logic (no React, no DOM)                  │
│   types · curriculum · questions/ · scoring · selectors ·   │
│   review · report · state · research · id                   │
├─────────────────────────────────────────────────────────────┤
│ localStorage  (typed AppState, migrated on load)            │
└─────────────────────────────────────────────────────────────┘
```

## Data flow

1. `StoreProvider` hydrates `AppState` from `localStorage` on mount
   (`lib/state.ts` → `loadState` → `migrateState`) and persists on every change.
2. Pages read state via `useStore()` and derive views with pure selectors
   (`lib/selectors.ts`, `lib/scoring.ts`, `lib/review.ts`).
3. Mutations go through typed store actions (mark complete, record result, save
   reflection, add evidence, update research, etc.).

## Key design decisions

- **Pure core, thin React.** Everything scoring/mastery/selection/review-related
  is a pure function, making the critical logic trivially testable.
- **Deterministic randomization.** A seeded RNG makes selection/shuffling
  reproducible so tests can assert on it while the UI still feels random.
- **Locking is derived, not stored.** `dayStatus` computes whether the assessment
  is unlocked (`learningComplete && buildComplete`) rather than persisting a
  separate flag — completion can't be faked.
- **State migration.** `migrateState` merges persisted state onto a fresh
  baseline so new curriculum/research seeds appear without wiping user progress,
  and garbage input degrades gracefully to a valid baseline.
- **Optional AI layer, cleanly deferred.** Assessment content is static and
  seeded. A future `LLMAssessmentGenerator` can implement the same generator
  interface without changing the MVP; **no secrets are ever hardcoded** and any
  future key would come from an environment variable.

## Persistence & privacy

All data is local to the browser (`localStorage`, key `agentlab.state.v1`).
Reads/writes are wrapped in try/catch so private mode / disabled storage
degrades to in-memory for the session. Export/import JSON is available in
Settings. Nothing is sent anywhere.

## Testing

`__tests__/` (Vitest) covers scoring, mastery thresholds, question selection,
option randomization, review-queue derivation, retest targeting, state
migration, locking, and question-bank integrity. See `docs/data-model.md` for the
types these tests exercise.
