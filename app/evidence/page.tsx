"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { EmptyState, SectionHeading } from "@/components/ui";
import { DAYS } from "@/lib/curriculum";
import { newId } from "@/lib/id";
import type { EvidenceType } from "@/lib/types";

const TYPES: EvidenceType[] = [
  "commit",
  "screenshot",
  "demo-url",
  "research-source",
  "interview",
  "document",
  "code-path",
  "note",
];

export default function EvidencePage() {
  const { state, addEvidence, removeEvidence } = useStore();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EvidenceType>("commit");
  const [ref, setRef] = useState("");
  const [description, setDescription] = useState("");
  const [relatedDay, setRelatedDay] = useState("");
  const [filter, setFilter] = useState<EvidenceType | "all">("all");

  const add = () => {
    if (!title.trim()) return;
    addEvidence({
      id: newId("ev"),
      title: title.trim(),
      type,
      date: new Date().toISOString(),
      ref: ref.trim(),
      description: description.trim(),
      relatedDay: relatedDay || undefined,
    });
    setTitle("");
    setRef("");
    setDescription("");
  };

  const items = state.evidence.filter((e) => filter === "all" || e.type === filter);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Proof of work" title="Evidence" />
      <p className="max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
        Commits, screenshots, demos, sources, interviews. Only what you record — nothing is
        fabricated as evidence on your behalf.
      </p>

      <div className="card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label">Title</span>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Day 3 RAG pipeline commit" />
          </label>
          <label className="block">
            <span className="label">Type</span>
            <select className="input mt-1" value={type} onChange={(e) => setType(e.target.value as EvidenceType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">URL / path</span>
            <input className="input mt-1" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="https://github.com/… or src/rag.py" />
          </label>
          <label className="block">
            <span className="label">Related day</span>
            <select className="input mt-1" value={relatedDay} onChange={(e) => setRelatedDay(e.target.value)}>
              <option value="">—</option>
              {DAYS.map((d) => (
                <option key={d.id} value={d.id}>
                  Day {d.dayNumber} — {d.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="label">Description</span>
            <textarea className="input mt-1 resize-y" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>
        <div className="mt-4">
          <button className="btn btn-primary" onClick={add}>
            Add evidence
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="label">Filter</span>
        <button className="btn" onClick={() => setFilter("all")} style={filter === "all" ? { background: "var(--surface-2)" } : undefined}>
          all ({state.evidence.length})
        </button>
        {TYPES.map((t) => {
          const n = state.evidence.filter((e) => e.type === t).length;
          if (n === 0) return null;
          return (
            <button key={t} className="btn" onClick={() => setFilter(t)} style={filter === t ? { background: "var(--surface-2)" } : undefined}>
              {t} ({n})
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState title="No evidence yet" hint="Attach your first commit, screenshot, or source above." />
      ) : (
        <div className="card divide-y p-0">
          {items.map((e) => (
            <div key={e.id} className="flex items-start gap-3 p-4">
              <span
                className="mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                style={{ background: "var(--surface-2)", color: "var(--muted)" }}
              >
                {e.type}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{e.title}</div>
                {e.description && (
                  <div className="text-xs" style={{ color: "var(--fg-soft)" }}>
                    {e.description}
                  </div>
                )}
                {e.ref &&
                  (e.ref.startsWith("http") ? (
                    <a href={e.ref} target="_blank" rel="noreferrer noopener" className="mono text-xs underline" style={{ color: "var(--info)" }}>
                      {e.ref} ↗
                    </a>
                  ) : (
                    <span className="mono text-xs" style={{ color: "var(--muted)" }}>
                      {e.ref}
                    </span>
                  ))}
                <div className="mt-0.5 text-[11px]" style={{ color: "var(--muted)" }}>
                  {new Date(e.date).toLocaleDateString()}
                  {e.relatedDay && ` · ${e.relatedDay}`}
                </div>
              </div>
              <button className="btn" onClick={() => removeEvidence(e.id)} style={{ color: "var(--bad)" }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
