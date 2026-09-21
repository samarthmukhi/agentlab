"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/components/StoreProvider";
import {
  LockBadge,
  MasteryBadge,
  Pipeline,
  ScorePill,
  SectionHeading,
} from "@/components/ui";
import { DAYS, buildById, dayById } from "@/lib/curriculum";
import { dayStatus } from "@/lib/selectors";
import { reviewQueue } from "@/lib/review";
import { ReflectionForm } from "@/components/ReflectionForm";
import { FinalChallenge } from "@/components/FinalChallenge";

export default function DaySession() {
  const params = useParams<{ day: string }>();
  const dayId = params.day;
  const day = DAYS.find((d) => d.id === dayId);
  const { state, markLearningComplete, markBuildComplete } = useStore();

  if (!day) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm">Unknown day.</p>
        <Link href="/learn" className="btn mt-4">
          Back to curriculum
        </Link>
      </div>
    );
  }

  const s = dayStatus(state, day.id);
  const build = buildById(day.buildId);
  const dayConcepts = new Set(day.conceptIds);
  const weak = reviewQueue(state).filter(
    (q) => dayConcepts.has(q.conceptId) || q.dayId === day.id,
  );
  const prev = DAYS.find((d) => d.dayNumber === day.dayNumber - 1);
  const next = DAYS.find((d) => d.dayNumber === day.dayNumber + 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-3">
          <span className="mono text-xs" style={{ color: "var(--muted)" }}>
            DAY {day.dayNumber} / 9 · ~{day.estimatedMinutes} min
          </span>
          <MasteryBadge status={s.summary.mastery} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{day.title}</h1>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
          {day.description}
        </p>
        <div className="mt-4">
          <Pipeline
            phase={[
              { name: "Learn", done: s.learningComplete, current: !s.learningComplete },
              { name: "Build", done: s.buildComplete, current: s.learningComplete && !s.buildComplete },
              { name: "Assess", done: s.attempted, current: s.assessmentUnlocked && !s.attempted },
              { name: "Review", done: s.attempted && weak.length === 0 },
              { name: "Document", done: s.documented },
            ]}
          />
        </div>
      </div>

      {/* LEARN */}
      <section id="learn" className="scroll-mt-4">
        <SectionHeading
          eyebrow="Phase 1"
          title="Learn"
          right={
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.learningComplete}
                onChange={(e) => markLearningComplete(day.id, e.target.checked)}
                className="h-4 w-4"
              />
              Mark learning complete
            </label>
          }
        />

        <div className="card p-5">
          <div className="label mb-2">Learning objectives</div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {day.learningObjectives.map((o) => (
              <li key={o.id} className="flex gap-2 text-sm">
                <span aria-hidden style={{ color: "var(--muted)" }}>
                  ○
                </span>
                <span style={{ color: "var(--fg-soft)" }}>{o.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {day.concepts.map((c) => (
            <div key={c.concept} className="card p-4">
              <h4 className="text-sm font-semibold">{c.concept}</h4>
              <p className="mt-1.5 text-sm" style={{ color: "var(--fg-soft)" }}>
                <span className="label mr-1">What</span> {c.what}
              </p>
              <p className="mt-1.5 text-sm" style={{ color: "var(--fg-soft)" }}>
                <span className="label mr-1">Why</span> {c.why}
              </p>
              {c.misconception && (
                <p
                  className="mt-2 rounded-md p-2 text-xs"
                  style={{ background: "var(--warn-bg)", color: "var(--warn)" }}
                >
                  <b>Common misconception:</b> {c.misconception}
                </p>
              )}
            </div>
          ))}
        </div>

        {day.failureModes.length > 0 && (
          <div className="card mt-4 p-4">
            <div className="label mb-2">Failure modes to watch</div>
            <div className="flex flex-wrap gap-2">
              {day.failureModes.map((f) => (
                <span
                  key={f}
                  className="rounded-md px-2 py-1 text-xs"
                  style={{ background: "var(--surface-2)", color: "var(--fg-soft)" }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        <div className="mt-4 space-y-3">
          <div className="label">Core resources (max 2–3)</div>
          {day.resources
            .filter((r) => r.tier === "core")
            .map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                className="card flex items-start justify-between gap-4 p-4 transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {r.title} <span style={{ color: "var(--muted)" }}>↗</span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {r.source}
                    {r.section ? ` · ${r.section}` : ""}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--fg-soft)" }}>
                    {r.why}
                  </div>
                </div>
                <span className="mono shrink-0 text-xs" style={{ color: "var(--muted)" }}>
                  ~{r.estimatedMinutes}m
                </span>
              </a>
            ))}
          {day.resources.some((r) => r.tier === "optional") && (
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-medium">
                Optional deep dive
              </summary>
              <div className="mt-3 space-y-2">
                {day.resources
                  .filter((r) => r.tier === "optional")
                  .map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block text-sm underline"
                      style={{ color: "var(--fg-soft)" }}
                    >
                      {r.title} — {r.source} (~{r.estimatedMinutes}m)
                    </a>
                  ))}
              </div>
            </details>
          )}
        </div>
      </section>

      {/* BUILD */}
      <section id="build" className="scroll-mt-4">
        <SectionHeading
          eyebrow="Phase 2"
          title="Build"
          right={
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.buildComplete}
                onChange={(e) => markBuildComplete(day.id, e.target.checked)}
                className="h-4 w-4"
              />
              Mark build complete
            </label>
          }
        />
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold">{build.title}</h4>
            <span className="mono text-xs" style={{ color: "var(--muted)" }}>
              ~{build.suggestedMinutes}m
            </span>
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--fg-soft)" }}>
            {build.why}
          </p>
          <p className="mt-2 text-sm">
            <span className="label mr-1">Goal</span> {build.goal}
          </p>
          <Link href={`/builds#${build.id}`} className="btn mt-4">
            Full build spec →
          </Link>
        </div>
      </section>

      {/* ASSESS */}
      <section id="assess" className="scroll-mt-4">
        <SectionHeading
          eyebrow="Phase 3"
          title="Assess"
          right={<LockBadge unlocked={s.assessmentUnlocked} />}
        />
        <div className="card p-5">
          {!s.assessmentUnlocked ? (
            <div>
              <p className="text-sm" style={{ color: "var(--fg-soft)" }}>
                Assessment is locked until both learning and the build are complete.
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>
                  {s.learningComplete ? "✓" : "○"} Learning{" "}
                  {s.learningComplete ? "complete" : "incomplete"}
                </li>
                <li>
                  {s.buildComplete ? "✓" : "○"} Build{" "}
                  {s.buildComplete ? "complete" : "incomplete"}
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <div style={{ color: "var(--fg-soft)" }}>
                  {day.assessmentSize} questions sampled from a bank. Answers and
                  explanations stay hidden until you submit.
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
                  <span>First attempt: <ScorePill score={s.summary.firstAttempt} /></span>
                  <span>Best: <ScorePill score={s.summary.best} /></span>
                  <span>Latest: <ScorePill score={s.summary.latest} /></span>
                </div>
              </div>
              <Link href={`/assess/${day.id}`} className="btn btn-primary">
                {s.attempted ? "Retake / Retest →" : "Start assessment →"}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* REVIEW */}
      <section id="review" className="scroll-mt-4">
        <SectionHeading
          eyebrow="Phase 4"
          title="Review"
          right={<Link href="/review" className="text-xs underline">Full queue →</Link>}
        />
        <div className="card p-5">
          {!s.attempted ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Take the assessment to generate a diagnosis of weak concepts.
            </p>
          ) : weak.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--ok)" }}>
              ✓ No outstanding weak concepts for this day.
            </p>
          ) : (
            <ul className="space-y-2">
              {weak.map((w) => (
                <li key={w.conceptId} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <span className="font-medium">{w.concept}</span>
                    <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>
                      {w.reason}
                    </span>
                  </div>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                    style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                  >
                    {w.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* DOCUMENT */}
      <section id="document" className="scroll-mt-4">
        <SectionHeading eyebrow="Phase 5" title="Document" />
        <ReflectionForm dayId={day.id} />
      </section>

      {/* FINAL ARCHITECTURE CHALLENGE (Day 9 only) */}
      {day.dayNumber === 9 && (
        <section id="challenge" className="scroll-mt-4">
          <SectionHeading eyebrow="Capstone" title="Final architecture challenge" />
          <FinalChallenge />
        </section>
      )}

      {/* Prev/next */}
      <div className="flex items-center justify-between border-t pt-4">
        {prev ? (
          <Link href={`/learn/${prev.id}`} className="btn">
            ← Day {prev.dayNumber}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/${next.id}`} className="btn">
            Day {next.dayNumber} →
          </Link>
        ) : (
          <Link href="/reports/final" className="btn btn-primary">
            Final report →
          </Link>
        )}
      </div>
    </div>
  );
}
