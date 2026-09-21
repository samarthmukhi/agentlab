import { DAYS, TOTAL_DAYS } from "./curriculum";
import { summarizeDay, type DayScoreSummary } from "./scoring";
import type { AppState } from "./types";

export interface DayStatus {
  dayId: string;
  learningComplete: boolean;
  buildComplete: boolean;
  /** Assessment unlocks only when BOTH learning and build are complete. */
  assessmentUnlocked: boolean;
  attempted: boolean;
  documented: boolean;
  summary: DayScoreSummary;
  /** A day is "complete" when learning, build, and a first attempt exist. */
  complete: boolean;
}

export function dayStatus(state: AppState, dayId: string): DayStatus {
  const p = state.dayProgress[dayId] ?? {
    dayId,
    learningComplete: false,
    buildComplete: false,
    documented: false,
  };
  const summary = summarizeDay(dayId, state.results);
  const attempted = summary.firstAttempt !== null;
  const assessmentUnlocked = p.learningComplete && p.buildComplete;
  return {
    dayId,
    learningComplete: p.learningComplete,
    buildComplete: p.buildComplete,
    assessmentUnlocked,
    attempted,
    documented: p.documented,
    summary,
    complete: p.learningComplete && p.buildComplete && attempted,
  };
}

export function allDayStatuses(state: AppState): DayStatus[] {
  return DAYS.map((d) => dayStatus(state, d.id));
}

/** Overall completion: weighted across learn/build/assess per day. */
export function overallCompletion(state: AppState): number {
  let done = 0;
  const perDay = 3; // learn, build, assessment attempt
  for (const d of DAYS) {
    const s = dayStatus(state, d.id);
    if (s.learningComplete) done++;
    if (s.buildComplete) done++;
    if (s.attempted) done++;
  }
  return Math.round((done / (TOTAL_DAYS * perDay)) * 100);
}

export interface DashboardStats {
  currentDay: number;
  overall: number;
  firstAttemptAvg: number | null;
  bestScore: number | null;
  masteredCount: number;
  needsReviewCount: number;
  retestCount: number;
  buildsComplete: number;
  researchComplete: number;
}

export function dashboardStats(state: AppState): DashboardStats {
  const statuses = allDayStatuses(state);
  const firsts = statuses
    .map((s) => s.summary.firstAttempt)
    .filter((v): v is number => v !== null);
  const bests = statuses
    .map((s) => s.summary.best)
    .filter((v): v is number => v !== null);

  const mastered = statuses.filter((s) => s.summary.mastery === "mastered").length;
  const needsReview = statuses.filter(
    (s) => s.summary.mastery === "review" || s.summary.mastery === "relearn",
  ).length;
  const retests = state.results.filter((r) => r.isRetest).length;
  const builds = statuses.filter((s) => s.buildComplete).length;

  const researchComplete = Object.values(state.research).filter(
    (r) => r.findings.trim().length > 0 || r.interpretation.trim().length > 0,
  ).length;

  return {
    currentDay: state.currentDay,
    overall: overallCompletion(state),
    firstAttemptAvg: firsts.length
      ? Math.round(firsts.reduce((a, b) => a + b, 0) / firsts.length)
      : null,
    bestScore: bests.length ? Math.max(...bests) : null,
    masteredCount: mastered,
    needsReviewCount: needsReview,
    retestCount: retests,
    buildsComplete: builds,
    researchComplete,
  };
}
