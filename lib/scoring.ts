// ============================================================================
// Pure domain logic: scoring, mastery, question selection, review queue,
// retest targeting. No React, no DOM, no localStorage — everything here is a
// pure function so it can be unit-tested directly (Part 37).
// ============================================================================

import type {
  AnswerRecord,
  AssessmentResult,
  Category,
  Difficulty,
  MasteryStatus,
  Priority,
  Question,
  ReviewItem,
  RetestStatus,
} from "./types";

// ---------------------------------------------------------------------------
// Deterministic seeded RNG (mulberry32) so randomization is testable and a
// given seed reproduces the same sample.
// ---------------------------------------------------------------------------

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Question selection
// ---------------------------------------------------------------------------

/**
 * Select `size` questions from `pool`, roughly honoring the target difficulty
 * mix (20% easy / 50% medium / 30% hard) and preferring not to repeat any
 * question in `exclude` (used so retests draw different questions).
 */
export function selectQuestions(
  pool: Question[],
  size: number,
  seed: number,
  exclude: Set<string> = new Set(),
): Question[] {
  const rng = makeRng(seed);
  const fresh = pool.filter((q) => !exclude.has(q.id));
  // If excluding leaves too few questions, allow reuse as a fallback.
  const usable = fresh.length >= size ? fresh : pool;

  const byDiff: Record<Difficulty, Question[]> = {
    easy: shuffle(usable.filter((q) => q.difficulty === "easy"), rng),
    medium: shuffle(usable.filter((q) => q.difficulty === "medium"), rng),
    hard: shuffle(usable.filter((q) => q.difficulty === "hard"), rng),
  };

  const targets: Record<Difficulty, number> = {
    easy: Math.round(size * 0.2),
    medium: Math.round(size * 0.5),
    hard: size - Math.round(size * 0.2) - Math.round(size * 0.5),
  };

  const picked: Question[] = [];
  const takeFrom = (d: Difficulty, n: number) => {
    for (let i = 0; i < n && byDiff[d].length > 0; i++) picked.push(byDiff[d].shift()!);
  };
  takeFrom("easy", targets.easy);
  takeFrom("medium", targets.medium);
  takeFrom("hard", targets.hard);

  // Backfill from any remaining questions if a bucket was short.
  const remaining = shuffle(
    [...byDiff.easy, ...byDiff.medium, ...byDiff.hard],
    rng,
  );
  while (picked.length < size && remaining.length > 0) picked.push(remaining.shift()!);

  return shuffle(picked, rng).slice(0, Math.min(size, picked.length));
}

/**
 * Produce a per-question option ordering that shuffles the displayed options
 * while tracking where the correct answer moved to. Returns the shuffled
 * option array plus the new correct index. Guarantees exactly one correct
 * answer is preserved (Invariant 8).
 */
export function shuffleOptions(
  question: Question,
  seed: number,
): { options: string[]; correctIndex: number; order: number[] } {
  const rng = makeRng(seed);
  const order = shuffle(
    question.options.map((_, i) => i),
    rng,
  );
  const options = order.map((i) => question.options[i]);
  const correctIndex = order.indexOf(question.correctAnswer);
  return { options, correctIndex, order };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export function scoreAnswers(answers: AnswerRecord[]): number {
  if (answers.length === 0) return 0;
  const correct = answers.filter((a) => a.correct).length;
  return Math.round((correct / answers.length) * 100);
}

export function categoryScores(
  answers: AnswerRecord[],
): Partial<Record<Category, number>> {
  const cats: Category[] = ["conceptual", "application", "debugging", "architecture"];
  const out: Partial<Record<Category, number>> = {};
  for (const cat of cats) {
    const inCat = answers.filter((a) => a.category === cat);
    if (inCat.length === 0) continue;
    const correct = inCat.filter((a) => a.correct).length;
    out[cat] = Math.round((correct / inCat.length) * 100);
  }
  return out;
}

/** Concept names for the questions answered incorrectly. */
export function mistakeConcepts(answers: AnswerRecord[]): string[] {
  return answers.filter((a) => !a.correct).map((a) => a.concept);
}

// ---------------------------------------------------------------------------
// Mastery
// ---------------------------------------------------------------------------

export function masteryFromScore(score: number | null): MasteryStatus {
  if (score === null) return "untested";
  if (score >= 90) return "mastered";
  if (score >= 80) return "solid";
  if (score >= 70) return "review";
  return "relearn";
}

export const MASTERY_LABEL: Record<MasteryStatus, string> = {
  mastered: "Mastered",
  solid: "Solid",
  review: "Review required",
  relearn: "Relearn + retest",
  untested: "Untested",
};

export function retestStatusFromScore(score: number | null): RetestStatus {
  if (score === null) return "not-needed";
  if (score < 70) return "required";
  if (score < 80) return "recommended";
  return "not-needed";
}

// ---------------------------------------------------------------------------
// Result aggregation across attempts (never overwrite first attempt)
// ---------------------------------------------------------------------------

export interface DayScoreSummary {
  dayId: string;
  firstAttempt: number | null;
  latest: number | null;
  best: number | null;
  retestCount: number;
  mastery: MasteryStatus;
  retestStatus: RetestStatus;
  categoryScores: Partial<Record<Category, number>>;
}

/** Results for one day, ordered oldest first. */
export function summarizeDay(dayId: string, results: AssessmentResult[]): DayScoreSummary {
  const dayResults = results
    .filter((r) => r.dayId === dayId)
    .sort((a, b) => a.attemptNumber - b.attemptNumber);

  if (dayResults.length === 0) {
    return {
      dayId,
      firstAttempt: null,
      latest: null,
      best: null,
      retestCount: 0,
      mastery: "untested",
      retestStatus: "not-needed",
      categoryScores: {},
    };
  }

  const firstAttempt = dayResults[0].score;
  const latest = dayResults[dayResults.length - 1].score;
  const best = Math.max(...dayResults.map((r) => r.score));
  const retestCount = dayResults.filter((r) => r.isRetest).length;
  const latestResult = dayResults[dayResults.length - 1];

  return {
    dayId,
    firstAttempt,
    latest,
    best,
    retestCount,
    // Mastery reflects best demonstrated understanding.
    mastery: masteryFromScore(best),
    // Retest recommendation is driven by the latest attempt.
    retestStatus:
      retestStatusFromScore(latest) === "not-needed" && retestCount > 0
        ? "passed"
        : retestStatusFromScore(latest),
    categoryScores: latestResult.categoryScores,
  };
}

// ---------------------------------------------------------------------------
// Review queue derivation (Invariant 4: derived from actual mistakes)
// ---------------------------------------------------------------------------

interface ConceptStat {
  concept: string;
  conceptId: string;
  dayId: string;
  mistakeCount: number;
  lastResultRetest: boolean;
  everCorrect: boolean;
  latestWrong: boolean;
}

/**
 * Build the review queue purely from recorded results. A concept enters the
 * queue when it has been missed at least once and is not yet resolved.
 */
export function buildReviewQueue(
  results: AssessmentResult[],
  conceptToId: (concept: string) => string,
  conceptToDay: (concept: string) => string,
  overrides: Record<string, { lastReviewedAt?: string }> = {},
): ReviewItem[] {
  const stats = new Map<string, ConceptStat>();
  // Results in chronological order.
  const ordered = results
    .slice()
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  for (const result of ordered) {
    for (const ans of result.answers) {
      const key = ans.concept;
      if (!stats.has(key)) {
        stats.set(key, {
          concept: key,
          conceptId: conceptToId(key),
          dayId: conceptToDay(key),
          mistakeCount: 0,
          lastResultRetest: false,
          everCorrect: false,
          latestWrong: false,
        });
      }
      const s = stats.get(key)!;
      if (ans.correct) s.everCorrect = true;
      else s.mistakeCount += 1;
      s.latestWrong = !ans.correct; // last write wins → most recent outcome
      s.lastResultRetest = result.isRetest;
    }
  }

  const items: ReviewItem[] = [];
  for (const s of stats.values()) {
    if (s.mistakeCount === 0) continue; // only concepts actually missed
    // Resolved: eventually answered correctly on the most recent encounter.
    const resolved = !s.latestWrong && s.everCorrect;

    let priority: Priority;
    let reason: string;
    if (s.latestWrong && s.mistakeCount >= 2) {
      priority = "high";
      reason = `Missed ${s.mistakeCount} times, still wrong on the latest attempt.`;
    } else if (s.latestWrong) {
      priority = "medium";
      reason = "Missed on the most recent attempt.";
    } else if (resolved) {
      priority = "low";
      reason = "Previously missed, later answered correctly.";
    } else {
      priority = "medium";
      reason = `Missed ${s.mistakeCount} time(s).`;
    }

    items.push({
      conceptId: s.conceptId,
      concept: s.concept,
      dayId: s.dayId,
      priority,
      reason,
      mistakeCount: s.mistakeCount,
      lastReviewedAt: overrides[s.conceptId]?.lastReviewedAt,
      retestStatus: resolved ? "passed" : s.latestWrong ? "recommended" : "not-needed",
    });
  }

  const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  return items.sort(
    (a, b) => rank[a.priority] - rank[b.priority] || b.mistakeCount - a.mistakeCount,
  );
}

// ---------------------------------------------------------------------------
// Retest question targeting
// ---------------------------------------------------------------------------

/**
 * Choose questions for a retest: prefer questions that cover the concepts the
 * user missed, drawing from questions not seen in the given prior attempt.
 */
export function selectRetestQuestions(
  pool: Question[],
  missedConcepts: string[],
  size: number,
  seed: number,
  seenQuestionIds: Set<string>,
): Question[] {
  const rng = makeRng(seed);
  const missed = new Set(missedConcepts);

  const unseen = pool.filter((q) => !seenQuestionIds.has(q.id));
  const base = unseen.length >= size ? unseen : pool;

  const targeted = shuffle(base.filter((q) => missed.has(q.concept)), rng);
  const rest = shuffle(base.filter((q) => !missed.has(q.concept)), rng);

  const picked = [...targeted, ...rest].slice(0, size);
  return shuffle(picked, rng);
}
