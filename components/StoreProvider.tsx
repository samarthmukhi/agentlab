"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createInitialState, loadState, saveState } from "@/lib/state";
import type {
  AppState,
  AssessmentResult,
  Competitor,
  Evidence,
  Hypothesis,
  Interview,
  Reflection,
  ResearchEntry,
} from "@/lib/types";

interface StoreContextValue {
  state: AppState;
  hydrated: boolean;
  setCurrentDay: (day: number) => void;
  markLearningComplete: (dayId: string, value: boolean) => void;
  markBuildComplete: (dayId: string, value: boolean) => void;
  recordResult: (result: AssessmentResult) => void;
  markDocumented: (dayId: string, value: boolean) => void;
  saveReflection: (reflection: Reflection) => void;
  markReviewed: (conceptId: string) => void;
  addEvidence: (e: Evidence) => void;
  removeEvidence: (id: string) => void;
  updateResearch: (id: string, patch: Partial<ResearchEntry>) => void;
  addHypothesis: (h: Hypothesis) => void;
  updateHypothesis: (id: string, patch: Partial<Hypothesis>) => void;
  removeHypothesis: (id: string) => void;
  addInterview: (i: Interview) => void;
  updateInterview: (id: string, patch: Partial<Interview>) => void;
  removeInterview: (id: string) => void;
  addCompetitor: (c: Competitor) => void;
  updateCompetitor: (id: string, patch: Partial<Competitor>) => void;
  removeCompetitor: (id: string) => void;
  updateFinalChallenge: (notes: string) => void;
  updateSettings: (patch: Partial<AppState["settings"]>) => void;
  resetAll: () => void;
  exportState: () => string;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const persistRef = useRef(false);

  // Hydrate from localStorage on mount (client only).
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
    persistRef.current = true;
  }, []);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (persistRef.current && hydrated) saveState(state);
  }, [state, hydrated]);

  const mutate = useCallback((fn: (prev: AppState) => AppState) => {
    setState((prev) => fn(prev));
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const nowIso = () => new Date().toISOString();
    return {
      state,
      hydrated,
      setCurrentDay: (day) => mutate((p) => ({ ...p, currentDay: day })),
      markLearningComplete: (dayId, v) =>
        mutate((p) => ({
          ...p,
          dayProgress: {
            ...p.dayProgress,
            [dayId]: { ...p.dayProgress[dayId], learningComplete: v },
          },
        })),
      markBuildComplete: (dayId, v) =>
        mutate((p) => ({
          ...p,
          dayProgress: {
            ...p.dayProgress,
            [dayId]: { ...p.dayProgress[dayId], buildComplete: v },
          },
        })),
      recordResult: (result) =>
        mutate((p) => ({ ...p, results: [...p.results, result] })),
      markDocumented: (dayId, v) =>
        mutate((p) => ({
          ...p,
          dayProgress: {
            ...p.dayProgress,
            [dayId]: { ...p.dayProgress[dayId], documented: v },
          },
        })),
      saveReflection: (reflection) =>
        mutate((p) => ({
          ...p,
          reflections: { ...p.reflections, [reflection.dayId]: reflection },
        })),
      markReviewed: (conceptId) =>
        mutate((p) => ({
          ...p,
          reviewOverrides: {
            ...p.reviewOverrides,
            [conceptId]: { lastReviewedAt: nowIso() },
          },
        })),
      addEvidence: (e) => mutate((p) => ({ ...p, evidence: [e, ...p.evidence] })),
      removeEvidence: (id) =>
        mutate((p) => ({ ...p, evidence: p.evidence.filter((e) => e.id !== id) })),
      updateResearch: (id, patch) =>
        mutate((p) => ({
          ...p,
          research: {
            ...p.research,
            [id]: { ...p.research[id], ...patch, updatedAt: nowIso() },
          },
        })),
      addHypothesis: (h) => mutate((p) => ({ ...p, hypotheses: [...p.hypotheses, h] })),
      updateHypothesis: (id, patch) =>
        mutate((p) => ({
          ...p,
          hypotheses: p.hypotheses.map((h) =>
            h.id === id ? { ...h, ...patch, updatedAt: nowIso() } : h,
          ),
        })),
      removeHypothesis: (id) =>
        mutate((p) => ({ ...p, hypotheses: p.hypotheses.filter((h) => h.id !== id) })),
      addInterview: (i) => mutate((p) => ({ ...p, interviews: [i, ...p.interviews] })),
      updateInterview: (id, patch) =>
        mutate((p) => ({
          ...p,
          interviews: p.interviews.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      removeInterview: (id) =>
        mutate((p) => ({ ...p, interviews: p.interviews.filter((i) => i.id !== id) })),
      addCompetitor: (c) => mutate((p) => ({ ...p, competitors: [c, ...p.competitors] })),
      updateCompetitor: (id, patch) =>
        mutate((p) => ({
          ...p,
          competitors: p.competitors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCompetitor: (id) =>
        mutate((p) => ({ ...p, competitors: p.competitors.filter((c) => c.id !== id) })),
      updateFinalChallenge: (notes) =>
        mutate((p) => ({ ...p, finalChallenge: { notes, updatedAt: nowIso() } })),
      updateSettings: (patch) =>
        mutate((p) => ({ ...p, settings: { ...p.settings, ...patch } })),
      resetAll: () => mutate(() => createInitialState()),
      exportState: () => JSON.stringify(state, null, 2),
    };
  }, [state, hydrated, mutate]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
