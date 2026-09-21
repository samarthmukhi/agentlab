"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { ImprovementChart, ScoreChart } from "@/components/Charts";
import { MasteryBadge, ProgressBar, ScorePill, SectionHeading, Stat } from "@/components/ui";
import { DAYS, dayById } from "@/lib/curriculum";
import { allDayStatuses, dashboardStats } from "@/lib/selectors";
import { finalChartRows } from "@/lib/report";
import type { Category } from "@/lib/types";

export default function ProgressPage() {
  const { state } = useStore();
  const stats = dashboardStats(state);
  const statuses = allDayStatuses(state);
  const rows = finalChartRows(state);

  // Category performance aggregated across all results.
  const cats: Category[] = ["conceptual", "application", "debugging", "architecture"];
  const catAgg: Record<Category, { correct: number; total: number }> = {
    conceptual: { correct: 0, total: 0 },
    application: { correct: 0, total: 0 },
    debugging: { correct: 0, total: 0 },
    architecture: { correct: 0, total: 0 },
  };
  for (const r of state.results) {
    for (const a of r.answers) {
      catAgg[a.category].total++;
      if (a.correct) catAgg[a.category].correct++;
    }
  }
  const catScores = cats.map((c) => ({
    cat: c,
    pct: catAgg[c].total ? Math.round((catAgg[c].correct / catAgg[c].total) * 100) : null,
    total: catAgg[c].total,
  }));
  const weakestCat = catScores
    .filter((c) => c.pct !== null)
    .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))[0];

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Analytics" title="Progress" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Overall" value={`${stats.overall}%`} />
        <Stat label="First-attempt avg" value={stats.firstAttemptAvg === null ? "—" : `${stats.firstAttemptAvg}%`} />
        <Stat label="Best score" value={stats.bestScore === null ? "—" : `${stats.bestScore}%`} />
        <Stat label="Retests" value={stats.retestCount} />
      </div>

      <section>
        <SectionHeading title="First attempt vs best" />
        <ScoreChart rows={rows} />
      </section>

      <section>
        <SectionHeading title="Improvement after review" />
        <ImprovementChart rows={rows} />
      </section>

      <section>
        <SectionHeading title="Category performance" />
        <div className="card space-y-3 p-5">
          {catScores.map((c) => (
            <div key={c.cat}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="capitalize">{c.cat}</span>
                <span className="mono text-xs" style={{ color: "var(--muted)" }}>
                  {c.pct === null ? "—" : `${c.pct}%`} · {c.total} q
                </span>
              </div>
              <ProgressBar value={c.pct ?? 0} />
            </div>
          ))}
          {weakestCat && (
            <p className="pt-1 text-sm" style={{ color: "var(--warn)" }}>
              ▲ {weakestCat.cat} is currently your weakest assessment category ({weakestCat.pct}%).
            </p>
          )}
          {state.results.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No assessments yet — category analytics appear after your first submission.
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHeading title="Per-day detail" />
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ color: "var(--muted)" }}>
                <th className="p-3 font-medium">Day</th>
                <th className="p-3 font-medium">Learn</th>
                <th className="p-3 font-medium">Build</th>
                <th className="p-3 font-medium">First</th>
                <th className="p-3 font-medium">Best</th>
                <th className="p-3 font-medium">Latest</th>
                <th className="p-3 font-medium">Mastery</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((s) => {
                const d = dayById(s.dayId);
                return (
                  <tr key={s.dayId} className="border-b">
                    <td className="p-3">
                      <Link href={`/learn/${s.dayId}`} className="underline">
                        D{d.dayNumber} {d.title}
                      </Link>
                    </td>
                    <td className="p-3">{s.learningComplete ? "✓" : "○"}</td>
                    <td className="p-3">{s.buildComplete ? "✓" : "○"}</td>
                    <td className="p-3"><ScorePill score={s.summary.firstAttempt} /></td>
                    <td className="p-3"><ScorePill score={s.summary.best} /></td>
                    <td className="p-3"><ScorePill score={s.summary.latest} /></td>
                    <td className="p-3"><MasteryBadge status={s.summary.mastery} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHeading title="Completion" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Builds" value={`${stats.buildsComplete} / ${DAYS.length}`} />
          <Stat label="Research entries" value={`${stats.researchComplete} / 9`} />
          <Stat
            label="Documented days"
            value={`${statuses.filter((s) => s.documented).length} / ${DAYS.length}`}
          />
        </div>
      </section>
    </div>
  );
}
