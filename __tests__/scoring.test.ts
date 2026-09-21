import { describe, expect, it } from "vitest";
import {
  buildReviewQueue,
  categoryScores,
  makeRng,
  masteryFromScore,
  mistakeConcepts,
  retestStatusFromScore,
  scoreAnswers,
  selectQuestions,
  selectRetestQuestions,
  shuffle,
  shuffleOptions,
  summarizeDay,
} from "@/lib/scoring";
import type { AnswerRecord, AssessmentResult, Question } from "@/lib/types";

const q = (over: Partial<Question>): Question => ({
  id: "x",
  dayId: "day-1",
  topic: "t",
  concept: "c",
  category: "conceptual",
  type: "conceptual",
  difficulty: "medium",
  question: "?",
  options: ["a", "b", "c", "d"],
  correctAnswer: 0,
  explanation: "e",
  tags: [],
  ...over,
});

const ans = (over: Partial<AnswerRecord>): AnswerRecord => ({
  questionId: "x",
  concept: "c",
  category: "conceptual",
  selected: 0,
  correct: true,
  ...over,
});

describe("scoring", () => {
  it("scores a perfect and empty set", () => {
    expect(scoreAnswers([ans({}), ans({})])).toBe(100);
    expect(scoreAnswers([])).toBe(0);
  });

  it("rounds partial scores", () => {
    const a = [ans({ correct: true }), ans({ correct: false }), ans({ correct: true })];
    expect(scoreAnswers(a)).toBe(67);
  });

  it("computes category scores only for present categories", () => {
    const a = [
      ans({ category: "debugging", correct: false }),
      ans({ category: "debugging", correct: true }),
      ans({ category: "conceptual", correct: true }),
    ];
    const cs = categoryScores(a);
    expect(cs.debugging).toBe(50);
    expect(cs.conceptual).toBe(100);
    expect(cs.architecture).toBeUndefined();
  });

  it("lists missed concepts", () => {
    const a = [ans({ concept: "A", correct: false }), ans({ concept: "B", correct: true })];
    expect(mistakeConcepts(a)).toEqual(["A"]);
  });
});

describe("mastery thresholds", () => {
  it("maps scores to mastery bands", () => {
    expect(masteryFromScore(95)).toBe("mastered");
    expect(masteryFromScore(90)).toBe("mastered");
    expect(masteryFromScore(85)).toBe("solid");
    expect(masteryFromScore(75)).toBe("review");
    expect(masteryFromScore(60)).toBe("relearn");
    expect(masteryFromScore(null)).toBe("untested");
  });

  it("maps scores to retest status", () => {
    expect(retestStatusFromScore(85)).toBe("not-needed");
    expect(retestStatusFromScore(75)).toBe("recommended");
    expect(retestStatusFromScore(65)).toBe("required");
    expect(retestStatusFromScore(null)).toBe("not-needed");
  });
});

describe("randomization is deterministic + valid", () => {
  it("shuffle with same seed reproduces order", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffle(arr, makeRng(42));
    const b = shuffle(arr, makeRng(42));
    expect(a).toEqual(b);
  });

  it("shuffleOptions preserves exactly one correct answer", () => {
    const question = q({ correctAnswer: 2 });
    for (let seed = 0; seed < 20; seed++) {
      const { options, correctIndex } = shuffleOptions(question, seed);
      expect(options).toHaveLength(4);
      expect(options[correctIndex]).toBe(question.options[2]);
    }
  });
});

describe("question selection", () => {
  const pool: Question[] = Array.from({ length: 30 }, (_, i) =>
    q({
      id: `q${i}`,
      difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
    }),
  );

  it("selects the requested number", () => {
    expect(selectQuestions(pool, 12, 1)).toHaveLength(12);
  });

  it("excludes given ids when possible (different retest questions)", () => {
    const first = selectQuestions(pool, 10, 1);
    const seen = new Set(first.map((x) => x.id));
    const retest = selectRetestQuestions(pool, [], 10, 2, seen);
    // With 30 in pool and 10 seen, 20 remain — retest should avoid all seen.
    expect(retest.every((x) => !seen.has(x.id))).toBe(true);
  });

  it("targets missed concepts in retests", () => {
    const p2: Question[] = [
      ...Array.from({ length: 5 }, (_, i) => q({ id: `m${i}`, concept: "Missed" })),
      ...Array.from({ length: 15 }, (_, i) => q({ id: `o${i}`, concept: "Other" })),
    ];
    const retest = selectRetestQuestions(p2, ["Missed"], 5, 3, new Set());
    const missedCount = retest.filter((x) => x.concept === "Missed").length;
    expect(missedCount).toBeGreaterThanOrEqual(4);
  });
});

describe("summarizeDay never overwrites first attempt", () => {
  const mk = (n: number, score: number, retest: boolean): AssessmentResult => ({
    id: `r${n}`,
    assessmentId: "assess-1",
    dayId: "day-1",
    attemptNumber: n,
    isRetest: retest,
    score,
    categoryScores: {},
    answers: [],
    mistakes: [],
    completedAt: new Date(2026, 0, n).toISOString(),
  });

  it("keeps first attempt and tracks best/latest", () => {
    const results = [mk(1, 72, false), mk(2, 91, true), mk(3, 80, true)];
    const s = summarizeDay("day-1", results);
    expect(s.firstAttempt).toBe(72);
    expect(s.best).toBe(91);
    expect(s.latest).toBe(80);
    expect(s.retestCount).toBe(2);
    expect(s.mastery).toBe("mastered"); // best drives mastery
  });

  it("returns untested with no results", () => {
    const s = summarizeDay("day-1", []);
    expect(s.firstAttempt).toBeNull();
    expect(s.mastery).toBe("untested");
  });
});

describe("review queue derives from actual mistakes", () => {
  const res = (mistakes: string[], answers: AnswerRecord[], iso: string): AssessmentResult => ({
    id: `r-${iso}`,
    assessmentId: "assess-1",
    dayId: "day-1",
    attemptNumber: 1,
    isRetest: false,
    score: 0,
    categoryScores: {},
    answers,
    mistakes,
    completedAt: iso,
  });

  it("only queues concepts that were missed", () => {
    const results = [
      res(["Chunking"], [ans({ concept: "Chunking", correct: false }), ans({ concept: "Embeddings", correct: true })], "2026-01-01"),
    ];
    const queue = buildReviewQueue(results, (c) => c, () => "day-3");
    expect(queue).toHaveLength(1);
    expect(queue[0].concept).toBe("Chunking");
  });

  it("marks repeated recent misses as high priority", () => {
    const results = [
      res([], [ans({ concept: "RAG", correct: false })], "2026-01-01"),
      res([], [ans({ concept: "RAG", correct: false })], "2026-01-02"),
    ];
    const queue = buildReviewQueue(results, (c) => c, () => "day-3");
    expect(queue[0].priority).toBe("high");
    expect(queue[0].mistakeCount).toBe(2);
  });

  it("downgrades a concept later answered correctly", () => {
    const results = [
      res([], [ans({ concept: "State", correct: false })], "2026-01-01"),
      res([], [ans({ concept: "State", correct: true })], "2026-01-02"),
    ];
    const queue = buildReviewQueue(results, (c) => c, () => "day-5");
    expect(queue[0].priority).toBe("low");
    expect(queue[0].retestStatus).toBe("passed");
  });
});
