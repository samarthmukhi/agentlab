"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import { newId } from "@/lib/id";

const DIAGRAM = `        Research Agent ─┐
        Macro Agent ────┤
        Risk Agent ─────┘
                 │
                 ▼
        Investment Committee   (RAG · tools · structured output · state)
                 │
                 ▼
        Structured Constraints
                 │
                 ▼
        ┌─── Deterministic verification boundary ───┐
        │            SwarmFolio checker             │
        └───────────────┬───────────────────────────┘
                        │
              ┌─────────┴─────────┐
          FEASIBLE            INFEASIBLE
              │                    │
              │                    ▼
              │           Conflict explanation
              │                    │
              │                    ▼
              │            Agent revision ──┐
              └────────────◄────────────────┘`;

export function FinalChallenge() {
  const { state, updateFinalChallenge, addEvidence } = useStore();
  const [notes, setNotes] = useState(state.finalChallenge.notes);
  const [saved, setSaved] = useState<string | null>(state.finalChallenge.updatedAt ?? null);

  const save = () => {
    updateFinalChallenge(notes);
    setSaved(new Date().toISOString());
  };

  return (
    <div className="card p-5">
      <div className="label mb-1">Not part of the MCQ score — evidence only</div>
      <h3 className="text-base font-semibold">Design the AI Investment Committee</h3>
      <p className="mt-2 text-sm" style={{ color: "var(--fg-soft)" }}>
        Reason about how the full system connects: Research / Macro / Risk agents → a
        committee → structured constraints → the deterministic feasibility check → feedback
        → revision. Mark where RAG, tools, structured output, state, and orchestration each
        live, and label one failure mode per component.
      </p>

      <pre
        className="mt-4 overflow-x-auto rounded-md p-4 text-xs leading-relaxed"
        style={{ background: "var(--surface-2)", fontFamily: "var(--font-mono)", color: "var(--fg-soft)" }}
      >
        {DIAGRAM}
      </pre>

      <label className="mt-4 block">
        <span className="label">Your architecture write-up</span>
        <textarea
          className="input mt-1 min-h-[160px] resize-y"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explain the topology, the data flowing between components, the verification boundary, and one failure mode per component…"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={save}>
          Save write-up
        </button>
        <button
          className="btn"
          onClick={() =>
            addEvidence({
              id: newId("ev"),
              title: "Final architecture challenge",
              type: "document",
              date: new Date().toISOString(),
              ref: "",
              description: "AI Investment Committee architecture artifact",
              relatedDay: "day-9",
            })
          }
        >
          Attach as evidence
        </button>
        {saved && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Saved {new Date(saved).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
