import type { Category, Difficulty, Question, QuestionType } from "../types";

// Compact question definition to keep the large bank readable.
export interface QDef {
  c: string; // concept name (must match a curriculum concept name)
  cat: Category;
  t: QuestionType;
  d: Difficulty;
  q: string;
  o: [string, string, string, string];
  a: number; // index (0-3) of the correct option
  e: string; // explanation shown after submission
  ref?: string;
  tags?: string[];
}

/**
 * Expand compact defs into full Question objects with stable ids.
 * Also asserts each question has exactly one valid correct index (Invariant 8).
 */
export function bank(dayId: string, topic: string, defs: QDef[]): Question[] {
  return defs.map((d, i) => {
    if (d.o.length !== 4) {
      throw new Error(`${dayId} q${i + 1}: must have exactly 4 options`);
    }
    if (d.a < 0 || d.a > 3) {
      throw new Error(`${dayId} q${i + 1}: correct index out of range`);
    }
    const num = String(i + 1).padStart(2, "0");
    return {
      id: `${dayId}-q${num}`,
      dayId,
      topic,
      concept: d.c,
      category: d.cat,
      type: d.t,
      difficulty: d.d,
      question: d.q,
      options: d.o,
      correctAnswer: d.a,
      explanation: d.e,
      sourceReference: d.ref,
      tags: d.tags ?? [d.c],
    } satisfies Question;
  });
}
