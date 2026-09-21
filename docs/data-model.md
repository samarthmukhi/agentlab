# Data model

Full definitions: [`lib/types.ts`](../lib/types.ts). Highlights below.

## Curriculum (static)

- **Day** — `id, dayNumber, title, description, estimatedMinutes,
  learningObjectives[], concepts[], failureModes[], resources[], buildId,
  assessmentId, assessmentSize, conceptIds[]`.
- **Build** — `id, dayId, title, why, goal, prerequisites[], instructions[],
  expectedBehavior, constraints[], suggestedMinutes, evidenceRequired, extension`.
- **LearningResource** — `title, source, url, section?, estimatedMinutes, why,
  tier ("core" | "optional")`.
- **Concept** — `id, name, description, dayId`.
- **Question** — `id, dayId, topic, concept, category, type, difficulty,
  question, options[4], correctAnswer, explanation, sourceReference?, tags[]`.

## Runtime / persisted (`AppState`)

- **DayProgress** — `learningComplete, buildComplete, documented`.
- **AssessmentResult** — `id, assessmentId, dayId, attemptNumber, isRetest,
  score, categoryScores, answers[], mistakes[], completedAt`.
- **AnswerRecord** — `questionId, concept, category, selected, correct`.
- **ReviewItem** (derived) — `conceptId, concept, dayId, priority, reason,
  mistakeCount, lastReviewedAt?, retestStatus`.
- **Reflection** — the six daily prompts + `updatedAt`.
- **Evidence** — `id, title, type, date, ref, description, relatedDay?, relatedTo?`.
- **ResearchEntry**, **Hypothesis**, **Interview**, **Competitor** — the
  SwarmFolio research track.
- **finalChallenge** — the Day 9 architecture write-up.
- **settings** — `displayName`.

## Invariants (enforced by tests)

1. Explanations/answers hidden before submission.
2. Completing content ≠ mastery (mastery requires assessment evidence).
3. Retests never overwrite the first attempt.
4. Weak concepts are derived from actual mistakes.
5. The review queue updates automatically.
6. Reports reflect only stored data.
7. Refresh does not destroy progress (localStorage + migration).
8. Every question has exactly one correct answer (preserved through shuffling).
9. Assessment cannot be submitted twice accidentally.
10. No API key is required for the base application.
