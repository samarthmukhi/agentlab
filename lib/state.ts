import { DAYS } from "./curriculum";
import { HYPOTHESIS_SEED, RESEARCH_SEED } from "./research";
import type { AppState, DayProgress, ResearchEntry } from "./types";

export const STATE_VERSION = 1;
export const STORAGE_KEY = "agentlab.state.v1";

export function createInitialState(now: string = new Date().toISOString()): AppState {
  const dayProgress: Record<string, DayProgress> = {};
  for (const d of DAYS) {
    dayProgress[d.id] = {
      dayId: d.id,
      learningComplete: false,
      buildComplete: false,
      documented: false,
    };
  }
  const research: Record<string, ResearchEntry> = {};
  for (const r of RESEARCH_SEED) {
    research[r.id] = { ...r };
  }
  return {
    version: STATE_VERSION,
    startedAt: now,
    currentDay: 1,
    dayProgress,
    results: [],
    reflections: {},
    reviewOverrides: {},
    evidence: [],
    research,
    hypotheses: HYPOTHESIS_SEED.map((h) => ({ ...h })),
    interviews: [],
    competitors: [],
    finalChallenge: { notes: "" },
    settings: { displayName: "" },
  };
}

/**
 * Merge a persisted (possibly older / partial) state onto a fresh baseline so
 * new curriculum days / research seeds appear without wiping user progress.
 */
export function migrateState(raw: unknown): AppState {
  const base = createInitialState();
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Partial<AppState>;

  const merged: AppState = {
    ...base,
    ...s,
    version: STATE_VERSION,
    startedAt: s.startedAt ?? base.startedAt,
    dayProgress: { ...base.dayProgress, ...(s.dayProgress ?? {}) },
    results: Array.isArray(s.results) ? s.results : [],
    reflections: s.reflections ?? {},
    reviewOverrides: s.reviewOverrides ?? {},
    evidence: Array.isArray(s.evidence) ? s.evidence : [],
    research: { ...base.research, ...(s.research ?? {}) },
    hypotheses: Array.isArray(s.hypotheses) && s.hypotheses.length
      ? s.hypotheses
      : base.hypotheses,
    interviews: Array.isArray(s.interviews) ? s.interviews : [],
    competitors: Array.isArray(s.competitors) ? s.competitors : [],
    finalChallenge: s.finalChallenge ?? base.finalChallenge,
    settings: { ...base.settings, ...(s.settings ?? {}) },
  };
  return merged;
}

export function loadState(): AppState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return migrateState(JSON.parse(raw));
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode / quota). Fail silently;
    // the app must still work in-memory for the session.
  }
}
