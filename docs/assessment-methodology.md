# Assessment methodology

## Format

- **Multiple choice only.** Every question has exactly 4 options and exactly one
  correct answer. No free response, essays, or scored coding/diagram questions
  (builds involve code; formal assessment is MCQ-only).
- Six question **types**: conceptual, scenario, application, debugging,
  architecture, failure-mode. At least half of each day's bank is
  application/reasoning (scenario/application/debugging/architecture/failure-mode).
- Three **difficulties** targeting ~20% easy / 50% medium / 30% hard.
- **Distractor quality:** distractors are plausible; no joke answers, no
  "all of the above", no length/grammar giveaways. Exactly one option is clearly
  defensible.

## Selection & randomization

Implemented in [`lib/scoring.ts`](../lib/scoring.ts) with a deterministic seeded
RNG (`mulberry32`) so behavior is reproducible and testable.

- `selectQuestions` samples the daily size from the day's bank, honoring the
  difficulty mix, then shuffles.
- `shuffleOptions` shuffles displayed options **while preserving exactly one
  correct answer** (Invariant 8).
- `selectRetestQuestions` prefers questions covering **missed concepts** and
  avoids questions seen in prior attempts.

## Integrity

- **Before submission:** no correct answers, explanations, scoring, or hints are
  shown. Scoring only runs on submit.
- **After submission:** score, correct answers, per-question explanations, weak
  concepts, and retest recommendation are revealed.
- Submission is guarded against double-submit.

## Scoring & mastery

`scoreAnswers` = round(correct / total × 100). `categoryScores` computes a
percentage per category (conceptual / application / debugging / architecture),
only for categories present in the attempt.

Mastery bands (`masteryFromScore`):

| Score | Status |
| --- | --- |
| ≥ 90 | Mastered |
| 80–89 | Solid |
| 70–79 | Review required |
| < 70 | Relearn + retest |

Retest recommendation (`retestStatusFromScore`): `< 70` required, `< 80`
recommended, otherwise not needed.

## Multiple scores per day

`summarizeDay` tracks **first attempt / best / latest / retest count** and never
overwrites the first attempt. Mastery is driven by the **best** score; the
retest recommendation by the **latest**.

## Diagnosis & the review queue

Every question maps to a **concept**. `buildReviewQueue` derives the queue purely
from recorded results:

- A concept enters the queue only if it was **actually missed** (Invariant 4).
- Priority: repeated + still-wrong → **high**; wrong on latest → **medium**;
  previously missed but later correct → **low**.
- The queue updates automatically as new results are recorded.

## Retests

A retest is any attempt after the first. It draws different questions, targets
missed concepts, produces a separate `AssessmentResult`, and preserves the first
attempt. Improvement is reported as `best − first` (percentage points).
