import { describe, expect, it } from "vitest";
import { BANK_COUNTS, QUESTION_BANK, questionsForDay } from "@/lib/questions";
import { DAYS } from "@/lib/curriculum";
import { conceptByName } from "@/lib/curriculum";

const MIN_PER_DAY: Record<string, number> = {
  "day-1": 25,
  "day-2": 25,
  "day-3": 25,
  "day-4": 25,
  "day-5": 25,
  "day-6": 30,
  "day-7": 25,
  "day-8": 25,
  "day-9": 40,
};

describe("question bank integrity", () => {
  it("has at least 245 questions total", () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(245);
  });

  it("meets the minimum count per day", () => {
    for (const [dayId, min] of Object.entries(MIN_PER_DAY)) {
      expect(BANK_COUNTS[dayId], `${dayId} count`).toBeGreaterThanOrEqual(min);
    }
  });

  it("every question has exactly 4 options and a valid single correct index", () => {
    for (const q of QUESTION_BANK) {
      expect(q.options, q.id).toHaveLength(4);
      expect(q.correctAnswer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer, q.id).toBeLessThan(4);
      expect(typeof q.options[q.correctAnswer], q.id).toBe("string");
    }
  });

  it("has unique ids", () => {
    const ids = new Set(QUESTION_BANK.map((q) => q.id));
    expect(ids.size).toBe(QUESTION_BANK.length);
  });

  it("has no duplicate option text within a question", () => {
    for (const q of QUESTION_BANK) {
      const set = new Set(q.options.map((o) => o.trim().toLowerCase()));
      expect(set.size, q.id).toBe(4);
    }
  });

  it("every question can sample enough for its assessment size", () => {
    for (const d of DAYS) {
      expect(questionsForDay(d.id).length, d.id).toBeGreaterThanOrEqual(d.assessmentSize);
    }
  });

  it("each daily assessment size fits the daily-assessment spec (10-15, day9 30-40)", () => {
    for (const d of DAYS) {
      if (d.dayNumber === 9) {
        expect(d.assessmentSize).toBeGreaterThanOrEqual(30);
        expect(d.assessmentSize).toBeLessThanOrEqual(40);
      } else {
        expect(d.assessmentSize).toBeGreaterThanOrEqual(10);
        expect(d.assessmentSize).toBeLessThanOrEqual(15);
      }
    }
  });

  it("at least 50% of each day-1..8 bank is application/scenario/debugging/architecture/failure-mode", () => {
    const reasoning = new Set(["application", "scenario", "debugging", "architecture", "failure-mode"]);
    for (const d of DAYS) {
      const qs = questionsForDay(d.id);
      const r = qs.filter((q) => reasoning.has(q.type)).length;
      expect(r / qs.length, `${d.id} reasoning ratio`).toBeGreaterThanOrEqual(0.5);
    }
  });

  it("maps most concept names to a known concept (review mapping)", () => {
    // Day 9 reuses names; ensure the vast majority resolve.
    const unresolved = QUESTION_BANK.filter((q) => !conceptByName(q.concept));
    expect(unresolved.map((q) => q.concept)).toEqual([]);
  });

  it("has a reasonable difficulty spread per day (not all one difficulty)", () => {
    for (const d of DAYS) {
      const qs = questionsForDay(d.id);
      const diffs = new Set(qs.map((q) => q.difficulty));
      expect(diffs.size, `${d.id} difficulty variety`).toBeGreaterThanOrEqual(2);
    }
  });
});
