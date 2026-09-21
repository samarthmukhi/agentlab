"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import {
  MasteryBadge,
  PriorityBadge,
  ProgressBar,
  ScorePill,
  SectionHeading,
  Stat,
} from "@/components/ui";
import { DAYS, TOTAL_DAYS, dayById } from "@/lib/curriculum";
import { allDayStatuses, dashboardStats } from "@/lib/selectors";
import { reviewQueue } from "@/lib/review";

export default function DashboardPage() {
  const { state } = useStore();
  const stats = dashboardStats(state);
  const statuses = allDayStatuses(state);
  const today = dayById(`day-${Math.min(state.currentDay, TOTAL_DAYS)}`);
  const queue = reviewQueue(state);
  const highPriority = queue.filter((q) => q.priority === "high").slice(0, 4);
  const recent = state.results.slice(-4).reverse();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label mb-1">9-day agentic AI sprint</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Day {state.currentDay} / {TOTAL_DAYS}
            <span className="ml-3 text-base font-normal" style={{ color: "var(--muted)" }}>
              {today.title}
            </span>
          </h1>
        </div>
        <Link href={`/learn/${today.id}`} className="btn btn-primary">
          Go to today →
        </Link>
      </div>

      {/* Today card */}
      <div className="card p-5">
        <div className="label mb-2">Today&apos;s goal</div>
        <p className="text-sm" style={{ color: "var(--fg-soft)" }}>
          {today.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/learn/${today.id}`} className="btn">
            Learn
          </Link>
          <Link href={`/builds#${today.buildId}`} className="btn">
            Build
          </Link>
          <Link href={`/assess/${today.id}`} className="btn">
            Assess
          </Link>
          <Link href="/swarmfolio" className="btn">
            Research
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Overall" value={`${stats.overall}%`} sub="learn · build · assess" />
        <Stat
          label="First-attempt avg"
          value={stats.firstAttemptAvg === null ? "—" : `${stats.firstAttemptAvg}%`}
        />
        <Stat
          label="Best score"
          value={stats.bestScore === null ? "—" : `${stats.bestScore}%`}
        />
        <Stat label="Mastered" value={`${stats.masteredCount} / ${TOTAL_DAYS}`} />
        <Stat label="Needs review" value={stats.needsReviewCount} />
        <Stat label="Retests" value={stats.retestCount} />
        <Stat label="Builds" value={`${stats.buildsComplete} / ${TOTAL_DAYS}`} />
        <Stat label="Research" value={`${stats.researchComplete} / 9`} sub="entries filled" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Topic mastery */}
        <section>
          <SectionHeading eyebrow="Evidence, not vibes" title="Topic mastery" />
          <div className="card divide-y p-0">
            {statuses.map((s) => {
              const d = dayById(s.dayId);
              const best = s.summary.best;
              return (
                <Link
                  key={s.dayId}
                  href={`/learn/${s.dayId}`}
                  className="flex items-center gap-4 p-3 transition-colors hover:bg-[var(--surface-2)]"
                >
                  <span
                    className="mono w-7 shrink-0 text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    D{d.dayNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{d.title}</span>
                      <span className="mono text-xs" style={{ color: "var(--muted)" }}>
                        {best === null ? "—" : `${best}%`}
                      </span>
                    </div>
                    <ProgressBar value={best ?? 0} />
                  </div>
                  <MasteryBadge status={s.summary.mastery} />
                </Link>
              );
            })}
          </div>
        </section>

        <div className="space-y-8">
          {/* Weak areas */}
          <section>
            <SectionHeading eyebrow="Diagnosis" title="Weak areas" right={<Link className="text-xs underline" href="/review">Review queue →</Link>} />
            {highPriority.length === 0 ? (
              <div className="card p-4 text-sm" style={{ color: "var(--muted)" }}>
                No high-priority weaknesses yet. Take an assessment to generate diagnosis.
              </div>
            ) : (
              <div className="card divide-y p-0">
                {highPriority.map((q) => (
                  <div key={q.conceptId} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{q.concept}</div>
                      <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
                        {q.reason}
                      </div>
                    </div>
                    <PriorityBadge priority={q.priority} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent results */}
          <section>
            <SectionHeading eyebrow="History" title="Recent results" />
            {recent.length === 0 ? (
              <div className="card p-4 text-sm" style={{ color: "var(--muted)" }}>
                No assessments submitted yet.
              </div>
            ) : (
              <div className="card divide-y p-0">
                {recent.map((r) => {
                  const d = dayById(r.dayId);
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-3 p-3">
                      <div>
                        <div className="text-sm font-medium">
                          {d.title}
                          {r.isRetest && (
                            <span
                              className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                              style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                            >
                              Retest #{r.attemptNumber - 1}
                            </span>
                          )}
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>
                          {new Date(r.completedAt).toLocaleString()}
                        </div>
                      </div>
                      <ScorePill score={r.score} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <p className="pt-4 text-center text-xs" style={{ color: "var(--muted)" }}>
        {DAYS.length} days · completion ≠ mastery · answers stay hidden until you submit
      </p>
    </div>
  );
}
