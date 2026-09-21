"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { EditableField, EditableInput } from "@/components/EditableField";
import { EmptyState, SectionHeading } from "@/components/ui";
import { newId } from "@/lib/id";
import type { Competitor, Interview } from "@/lib/types";

type Tab = "research" | "hypotheses" | "interviews" | "competitors";

const TABS: { key: Tab; label: string }[] = [
  { key: "research", label: "Research journal" },
  { key: "hypotheses", label: "Hypotheses" },
  { key: "interviews", label: "Interviews" },
  { key: "competitors", label: "Competitors" },
];

export default function SwarmfolioPage() {
  const [tab, setTab] = useState<Tab>("research");
  return (
    <div className="space-y-6">
      <div>
        <div className="label mb-1">Parallel research track</div>
        <h1 className="text-2xl font-semibold tracking-tight">SwarmFolio validation</h1>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
          A research journal — <b>not</b> the SwarmFolio product. Test two questions: is
          SwarmFolio solving a real problem, and can agentic AI add to it? Record only your
          own findings; nothing here is auto-generated or auto-concluded.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key}
            className="border-b-2 px-3 py-2 text-sm"
            style={{
              borderColor: tab === t.key ? "var(--fg)" : "transparent",
              color: tab === t.key ? "var(--fg)" : "var(--muted)",
              fontWeight: tab === t.key ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "research" && <ResearchJournal />}
      {tab === "hypotheses" && <Hypotheses />}
      {tab === "interviews" && <Interviews />}
      {tab === "competitors" && <Competitors />}
    </div>
  );
}

function ResearchJournal() {
  const { state, updateResearch } = useStore();
  const entries = Object.values(state.research).sort((a, b) => a.day - b.day);
  return (
    <div className="space-y-4">
      {entries.map((r) => (
        <details key={r.id} className="card p-5" open={r.day <= 1}>
          <summary className="cursor-pointer">
            <span className="mono text-xs" style={{ color: "var(--muted)" }}>
              DAY {r.day}
            </span>
            <span className="ml-3 text-sm font-semibold">{r.researchQuestion}</span>
          </summary>
          <div className="mt-3 space-y-3">
            <div className="rounded-md p-3 text-sm" style={{ background: "var(--surface-2)" }}>
              <div className="label mb-1">Guiding questions</div>
              <ul className="list-disc space-y-0.5 pl-5" style={{ color: "var(--fg-soft)" }}>
                {r.prompts.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                <b>Deliverable:</b> {r.deliverable}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <EditableField label="Sources" value={r.sources} onCommit={(v) => updateResearch(r.id, { sources: v })} />
              <EditableField label="Findings" value={r.findings} onCommit={(v) => updateResearch(r.id, { findings: v })} />
              <EditableField label="Evidence for" value={r.evidenceFor} onCommit={(v) => updateResearch(r.id, { evidenceFor: v })} />
              <EditableField label="Evidence against" value={r.evidenceAgainst} onCommit={(v) => updateResearch(r.id, { evidenceAgainst: v })} />
              <EditableField label="Interpretation" value={r.interpretation} onCommit={(v) => updateResearch(r.id, { interpretation: v })} />
              <EditableField label="What changed my mind" value={r.whatChanged} onCommit={(v) => updateResearch(r.id, { whatChanged: v })} />
              <EditableField label="Next question" value={r.nextQuestion} onCommit={(v) => updateResearch(r.id, { nextQuestion: v })} />
            </div>
            {r.updatedAt && (
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                Updated {new Date(r.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function Hypotheses() {
  const { state, updateHypothesis, addHypothesis, removeHypothesis } = useStore();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          className="btn"
          onClick={() =>
            addHypothesis({
              id: newId("hyp"),
              statement: "New hypothesis (edit me)",
              initialBelief: "",
              evidence: "",
              updatedBelief: "",
              nextTest: "",
              falsification: "",
            })
          }
        >
          + Add hypothesis
        </button>
      </div>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        The system will never declare a hypothesis true for you — you update the belief
        based on evidence.
      </p>
      {state.hypotheses.map((h) => (
        <div key={h.id} className="card p-5">
          <EditableInput
            label="Hypothesis"
            value={h.statement}
            onCommit={(v) => updateHypothesis(h.id, { statement: v })}
          />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <EditableField label="Initial belief" value={h.initialBelief} onCommit={(v) => updateHypothesis(h.id, { initialBelief: v })} />
            <EditableField label="Evidence" value={h.evidence} onCommit={(v) => updateHypothesis(h.id, { evidence: v })} />
            <EditableField label="Updated belief" value={h.updatedBelief} onCommit={(v) => updateHypothesis(h.id, { updatedBelief: v })} />
            <EditableField label="Next test" value={h.nextTest} onCommit={(v) => updateHypothesis(h.id, { nextTest: v })} />
            <EditableField label="Falsification condition" value={h.falsification} onCommit={(v) => updateHypothesis(h.id, { falsification: v })} />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              className="btn"
              onClick={() => removeHypothesis(h.id)}
              style={{ color: "var(--bad)" }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const emptyInterview = (): Interview => ({
  id: newId("intv"),
  role: "",
  orgType: "",
  date: new Date().toISOString().slice(0, 10),
  workflow: "",
  constraints: "",
  painPoints: "",
  existingSoftware: "",
  manualWork: "",
  frequency: "",
  severity: "",
  observations: "",
  quotes: "",
  followUps: "",
});

function Interviews() {
  const { state, addInterview, updateInterview, removeInterview } = useStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="max-w-xl text-xs" style={{ color: "var(--muted)" }}>
          Ask HOW they build portfolios today — not &quot;would you use SwarmFolio&quot;.
        </p>
        <button className="btn" onClick={() => addInterview(emptyInterview())}>
          + New interview
        </button>
      </div>
      {state.interviews.length === 0 ? (
        <EmptyState title="No interviews yet" hint="Add a customer-discovery conversation to start building evidence." />
      ) : (
        state.interviews.map((i) => (
          <div key={i.id} className="card p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <EditableInput label="Role" value={i.role} onCommit={(v) => updateInterview(i.id, { role: v })} />
              <EditableInput label="Org type" value={i.orgType} onCommit={(v) => updateInterview(i.id, { orgType: v })} />
              <EditableInput label="Date" value={i.date} onCommit={(v) => updateInterview(i.id, { date: v })} />
              <EditableInput label="Frequency" value={i.frequency} onCommit={(v) => updateInterview(i.id, { frequency: v })} />
              <EditableField label="Workflow" value={i.workflow} onCommit={(v) => updateInterview(i.id, { workflow: v })} />
              <EditableField label="Constraints" value={i.constraints} onCommit={(v) => updateInterview(i.id, { constraints: v })} />
              <EditableField label="Pain points" value={i.painPoints} onCommit={(v) => updateInterview(i.id, { painPoints: v })} />
              <EditableField label="Existing software" value={i.existingSoftware} onCommit={(v) => updateInterview(i.id, { existingSoftware: v })} />
              <EditableField label="Manual work" value={i.manualWork} onCommit={(v) => updateInterview(i.id, { manualWork: v })} />
              <EditableInput label="Severity" value={i.severity} onCommit={(v) => updateInterview(i.id, { severity: v })} />
              <EditableField label="Observations" value={i.observations} onCommit={(v) => updateInterview(i.id, { observations: v })} />
              <EditableField label="Quotes" value={i.quotes} onCommit={(v) => updateInterview(i.id, { quotes: v })} />
              <EditableField label="Follow-ups" value={i.followUps} onCommit={(v) => updateInterview(i.id, { followUps: v })} />
            </div>
            <div className="mt-3 flex justify-end">
              <button className="btn" onClick={() => removeInterview(i.id)} style={{ color: "var(--bad)" }}>
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const emptyCompetitor = (): Competitor => ({
  id: newId("comp"),
  name: "",
  category: "",
  customer: "",
  workflow: "",
  optimization: "",
  constraintHandling: "",
  ai: "",
  feasibilityHandling: "",
  explainability: "",
  integration: "",
  pricing: "",
  evidence: "",
  url: "",
  notes: "",
});

function Competitors() {
  const { state, addCompetitor, updateCompetitor, removeCompetitor } = useStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="max-w-xl text-xs" style={{ color: "var(--muted)" }}>
          Map competitors — do not rank them or pick a &quot;best&quot;. This is research,
          not a leaderboard.
        </p>
        <button className="btn" onClick={() => addCompetitor(emptyCompetitor())}>
          + Add competitor
        </button>
      </div>
      {state.competitors.length === 0 ? (
        <EmptyState title="No competitors mapped yet" hint="e.g. Orion, Tamarac, Black Diamond, Advyzon, Morningstar Office." />
      ) : (
        state.competitors.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <EditableInput label="Name" value={c.name} onCommit={(v) => updateCompetitor(c.id, { name: v })} />
              <EditableInput label="Category" value={c.category} onCommit={(v) => updateCompetitor(c.id, { category: v })} />
              <EditableInput label="Customer" value={c.customer} onCommit={(v) => updateCompetitor(c.id, { customer: v })} />
              <EditableInput label="URL" value={c.url} onCommit={(v) => updateCompetitor(c.id, { url: v })} />
              <EditableField label="Core workflow" value={c.workflow} onCommit={(v) => updateCompetitor(c.id, { workflow: v })} />
              <EditableField label="Optimization" value={c.optimization} onCommit={(v) => updateCompetitor(c.id, { optimization: v })} />
              <EditableField label="Constraint handling" value={c.constraintHandling} onCommit={(v) => updateCompetitor(c.id, { constraintHandling: v })} />
              <EditableField label="AI" value={c.ai} onCommit={(v) => updateCompetitor(c.id, { ai: v })} />
              <EditableField label="Feasibility handling" value={c.feasibilityHandling} onCommit={(v) => updateCompetitor(c.id, { feasibilityHandling: v })} />
              <EditableField label="Explainability" value={c.explainability} onCommit={(v) => updateCompetitor(c.id, { explainability: v })} />
              <EditableField label="Integration" value={c.integration} onCommit={(v) => updateCompetitor(c.id, { integration: v })} />
              <EditableField label="Pricing" value={c.pricing} onCommit={(v) => updateCompetitor(c.id, { pricing: v })} />
              <EditableField label="Evidence" value={c.evidence} onCommit={(v) => updateCompetitor(c.id, { evidence: v })} />
              <EditableField label="Notes" value={c.notes} onCommit={(v) => updateCompetitor(c.id, { notes: v })} />
            </div>
            <div className="mt-3 flex justify-end">
              <button className="btn" onClick={() => removeCompetitor(c.id)} style={{ color: "var(--bad)" }}>
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
