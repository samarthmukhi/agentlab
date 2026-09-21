"use client";

import { useEffect, useState } from "react";
import { useStore } from "./StoreProvider";
import { newId } from "@/lib/id";
import type { EvidenceType, Reflection } from "@/lib/types";

const FIELDS: { key: keyof Omit<Reflection, "dayId" | "updatedAt">; label: string; placeholder: string }[] = [
  { key: "learned", label: "What I learned", placeholder: "Key things that clicked today…" },
  { key: "surprised", label: "What surprised me", placeholder: "Anything unexpected…" },
  { key: "unclear", label: "What remains unclear", placeholder: "Open questions to revisit…" },
  { key: "built", label: "What I built", placeholder: "The build + how it went…" },
  { key: "toReview", label: "What to review", placeholder: "Concepts to reinforce…" },
  { key: "tomorrow", label: "Tomorrow", placeholder: "Next step…" },
];

const EVIDENCE_TYPES: EvidenceType[] = [
  "commit",
  "screenshot",
  "demo-url",
  "code-path",
  "note",
];

export function ReflectionForm({ dayId }: { dayId: string }) {
  const { state, saveReflection, markDocumented, addEvidence } = useStore();
  const existing = state.reflections[dayId];
  const progress = state.dayProgress[dayId];

  const [draft, setDraft] = useState<Reflection>(
    existing ?? {
      dayId,
      learned: "",
      surprised: "",
      unclear: "",
      built: "",
      toReview: "",
      tomorrow: "",
      updatedAt: "",
    },
  );
  const [savedAt, setSavedAt] = useState<string | null>(existing?.updatedAt ?? null);

  // Re-sync if switching between days.
  useEffect(() => {
    setDraft(
      state.reflections[dayId] ?? {
        dayId,
        learned: "",
        surprised: "",
        unclear: "",
        built: "",
        toReview: "",
        tomorrow: "",
        updatedAt: "",
      },
    );
    setSavedAt(state.reflections[dayId]?.updatedAt ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId]);

  const save = () => {
    const now = new Date().toISOString();
    saveReflection({ ...draft, dayId, updatedAt: now });
    setSavedAt(now);
  };

  // Quick evidence
  const [evTitle, setEvTitle] = useState("");
  const [evType, setEvType] = useState<EvidenceType>("commit");
  const [evRef, setEvRef] = useState("");

  const addEv = () => {
    if (!evTitle.trim()) return;
    addEvidence({
      id: newId("ev"),
      title: evTitle.trim(),
      type: evType,
      date: new Date().toISOString(),
      ref: evRef.trim(),
      description: "",
      relatedDay: dayId,
    });
    setEvTitle("");
    setEvRef("");
  };

  const dayEvidence = state.evidence.filter((e) => e.relatedDay === dayId);

  return (
    <div className="card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="label">{f.label}</span>
            <textarea
              className="input mt-1 min-h-[70px] resize-y"
              placeholder={f.placeholder}
              value={draft[f.key]}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={save}>
          Save reflection
        </button>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={progress?.documented ?? false}
            onChange={(e) => markDocumented(dayId, e.target.checked)}
          />
          Mark day documented
        </label>
        {savedAt && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Saved {new Date(savedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Quick evidence */}
      <div className="mt-5 border-t pt-4">
        <div className="label mb-2">Attach evidence</div>
        <div className="flex flex-wrap gap-2">
          <input
            className="input max-w-[200px]"
            placeholder="Title (e.g. Build 1 commit)"
            value={evTitle}
            onChange={(e) => setEvTitle(e.target.value)}
          />
          <select
            className="input max-w-[150px]"
            value={evType}
            onChange={(e) => setEvType(e.target.value as EvidenceType)}
          >
            {EVIDENCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className="input max-w-[240px]"
            placeholder="URL or path (optional)"
            value={evRef}
            onChange={(e) => setEvRef(e.target.value)}
          />
          <button className="btn" onClick={addEv}>
            Add
          </button>
        </div>
        {dayEvidence.length > 0 && (
          <ul className="mt-3 space-y-1">
            {dayEvidence.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-xs">
                <span
                  className="rounded px-1.5 py-0.5 font-semibold uppercase"
                  style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                >
                  {e.type}
                </span>
                <span className="font-medium">{e.title}</span>
                {e.ref && (
                  <span className="mono truncate" style={{ color: "var(--muted)" }}>
                    {e.ref}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
