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

/** Per-user cache key so a signed-in user's cached state never leaks to a guest
 * or another account on a shared browser. */
export function storageKeyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}::${userId}` : STORAGE_KEY;
}

export function loadState(key: string = STORAGE_KEY): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return migrateState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function loadStateOrInitial(key: string = STORAGE_KEY): AppState {
  return loadState(key) ?? createInitialState();
}

export function saveState(state: AppState, key: string = STORAGE_KEY): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode / quota). Fail silently;
    // the app must still work in-memory for the session.
  }
}

/** True when the state carries real user activity worth migrating to the cloud. */
export function hasProgress(state: AppState): boolean {
  if (state.results.length > 0) return true;
  if (state.evidence.length > 0) return true;
  if (state.interviews.length > 0) return true;
  if (state.competitors.length > 0) return true;
  if (Object.keys(state.reflections).length > 0) return true;
  if (state.finalChallenge.notes.trim().length > 0) return true;
  if (Object.values(state.dayProgress).some((d) => d.learningComplete || d.buildComplete))
    return true;
  if (Object.values(state.research).some((r) => r.findings.trim() || r.interpretation.trim()))
    return true;
  if (state.hypotheses.some((h) => h.initialBelief.trim() || h.evidence.trim()))
    return true;
  return false;
}
