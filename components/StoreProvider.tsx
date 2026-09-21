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
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createInitialState,
  hasProgress,
  loadState,
  loadStateOrInitial,
  saveState,
  storageKeyFor,
  STORAGE_KEY,
} from "@/lib/state";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadCloudState, saveCloudState } from "@/lib/cloud";
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

export interface AuthUser {
  id: string;
  email: string;
}

interface StoreContextValue {
  state: AppState;
  hydrated: boolean;
  // Auth
  authConfigured: boolean;
  authLoading: boolean;
  user: AuthUser | null;
  syncing: boolean;
  signOut: () => Promise<void>;
  // Mutations
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

async function loadForUser(
  supa: SupabaseClient,
  userId: string,
): Promise<AppState> {
  const userKey = storageKeyFor(userId);
  // Cloud is the source of truth once a row exists.
  let cloud: AppState | null = null;
  try {
    cloud = await loadCloudState(supa, userId);
  } catch {
    cloud = null;
  }
  if (cloud) {
    saveState(cloud, userKey);
    return cloud;
  }
  // No cloud row yet: migrate guest progress up, else use any user cache/fresh.
  const guest = loadState(STORAGE_KEY);
  const seed =
    guest && hasProgress(guest)
      ? guest
      : loadState(userKey) ?? createInitialState();
  try {
    await saveCloudState(supa, userId, seed);
  } catch {
    /* offline — will retry on next change */
  }
  saveState(seed, userKey);
  return seed;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [authConfigured, setAuthConfigured] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [syncing, setSyncing] = useState(false);

  const userIdRef = useRef<string | null | undefined>(undefined);
  const hydratedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Bootstrap: local-only when not configured, else follow auth state ----
  useEffect(() => {
    const supa = getBrowserSupabase();
    if (!supa) {
      setAuthConfigured(false);
      setAuthLoading(false);
      setState(loadStateOrInitial(STORAGE_KEY));
      userIdRef.current = null;
      hydratedRef.current = true;
      setHydrated(true);
      return;
    }

    setAuthConfigured(true);
    let active = true;

    const { data: sub } = supa.auth.onAuthStateChange(async (_event, session) => {
      const u: AuthUser | null = session?.user
        ? { id: session.user.id, email: session.user.email ?? "" }
        : null;
      setUser(u);
      setAuthLoading(false);

      const newId = u?.id ?? null;
      if (newId === userIdRef.current && hydratedRef.current) return; // unchanged

      setSyncing(true);
      setHydrated(false);
      const next = u ? await loadForUser(supa, u.id) : loadStateOrInitial(STORAGE_KEY);
      if (!active) return;
      userIdRef.current = newId;
      setState(next);
      hydratedRef.current = true;
      setHydrated(true);
      setSyncing(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ---- Persist on change (guest → localStorage; signed-in → cache + cloud) ----
  useEffect(() => {
    if (!hydrated) return;
    const uid = userIdRef.current;
    if (uid) {
      saveState(state, storageKeyFor(uid));
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const supa = getBrowserSupabase();
        if (supa) void saveCloudState(supa, uid, state);
      }, 800);
    } else {
      saveState(state, STORAGE_KEY);
    }
  }, [state, hydrated]);

  const mutate = useCallback((fn: (prev: AppState) => AppState) => {
    setState((prev) => fn(prev));
  }, []);

  const signOut = useCallback(async () => {
    const supa = getBrowserSupabase();
    if (supa) await supa.auth.signOut(); // triggers onAuthStateChange → guest
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const nowIso = () => new Date().toISOString();
    return {
      state,
      hydrated,
      authConfigured,
      authLoading,
      user,
      syncing,
      signOut,
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
  }, [state, hydrated, authConfigured, authLoading, user, syncing, signOut, mutate]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
