import { describe, expect, it } from "vitest";
import { createInitialState, migrateState, STATE_VERSION } from "@/lib/state";
import { dayStatus, overallCompletion } from "@/lib/selectors";
import { DAYS } from "@/lib/curriculum";
import type { AssessmentResult } from "@/lib/types";

describe("initial state", () => {
  it("creates progress for every day and seeds research + hypotheses", () => {
    const s = createInitialState();
    expect(Object.keys(s.dayProgress)).toHaveLength(DAYS.length);
    expect(Object.keys(s.research)).toHaveLength(9);
    expect(s.hypotheses.length).toBeGreaterThan(0);
    expect(s.version).toBe(STATE_VERSION);
  });
});

describe("migration preserves user data and survives refresh", () => {
  it("merges partial persisted state onto baseline", () => {
    const persisted = {
      version: 1,
      currentDay: 4,
      dayProgress: { "day-1": { dayId: "day-1", learningComplete: true, buildComplete: true, documented: false } },
      results: [],
    };
    const s = migrateState(persisted);
    expect(s.currentDay).toBe(4);
    expect(s.dayProgress["day-1"].learningComplete).toBe(true);
    // Untouched days still exist.
    expect(s.dayProgress["day-9"]).toBeDefined();
    // Research seed restored.
    expect(Object.keys(s.research)).toHaveLength(9);
  });

  it("handles garbage input by returning a valid baseline", () => {
    expect(migrateState(null).version).toBe(STATE_VERSION);
    expect(migrateState("nonsense").dayProgress["day-1"]).toBeDefined();
    expect(migrateState(42).results).toEqual([]);
  });
});

describe("locking logic (assessment unlocks only after learn+build)", () => {
  it("assessment locked until both learning and build complete", () => {
    const s = createInitialState();
    expect(dayStatus(s, "day-1").assessmentUnlocked).toBe(false);
    s.dayProgress["day-1"].learningComplete = true;
    expect(dayStatus(s, "day-1").assessmentUnlocked).toBe(false);
    s.dayProgress["day-1"].buildComplete = true;
    expect(dayStatus(s, "day-1").assessmentUnlocked).toBe(true);
  });

  it("day is complete only with learn + build + an attempt", () => {
    const s = createInitialState();
    s.dayProgress["day-1"].learningComplete = true;
    s.dayProgress["day-1"].buildComplete = true;
    expect(dayStatus(s, "day-1").complete).toBe(false);
    const r: AssessmentResult = {
      id: "r1", assessmentId: "assess-1", dayId: "day-1", attemptNumber: 1,
      isRetest: false, score: 80, categoryScores: {}, answers: [], mistakes: [],
      completedAt: new Date().toISOString(),
    };
    s.results.push(r);
    expect(dayStatus(s, "day-1").complete).toBe(true);
  });
});

describe("overall completion reflects real progress, not clicks", () => {
  it("is 0 initially and rises with learn/build/assess", () => {
    const s = createInitialState();
    expect(overallCompletion(s)).toBe(0);
    s.dayProgress["day-1"].learningComplete = true;
    s.dayProgress["day-1"].buildComplete = true;
    const after = overallCompletion(s);
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(100);
  });
});
