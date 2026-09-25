"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { SectionHeading } from "@/components/ui";
import { BUILDS, dayById } from "@/lib/curriculum";

export default function BuildsPage() {
  const { state, markBuildComplete } = useStore();
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Phase 2 of the loop" title="Build exercises" />
      <p className="max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
        Small, concrete, testable builds — you write the code. Each maps to the day&apos;s
        concepts and to a piece of the future AI Investment Committee.
      </p>
      <p
        className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
        style={{ background: "var(--surface-2)", color: "var(--fg-soft)" }}
      >
        <span aria-hidden>🐍</span>
        <span>
          All builds are in <b>Python (3.10+)</b>. Day 7 uses Fetch&apos;s uAgents
          (a Python library). No other language needed.
        </span>
      </p>
      <div className="space-y-5">
        {BUILDS.map((b) => {
          const day = dayById(b.dayId);
          const done = state.dayProgress[b.dayId]?.buildComplete ?? false;
          return (
            <div key={b.id} id={b.id} className="card scroll-mt-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mono text-xs" style={{ color: "var(--muted)" }}>
                    DAY {day.dayNumber} · ~{b.suggestedMinutes} min
                  </div>
                  <h3 className="mt-0.5 text-base font-semibold">{b.title}</h3>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={done}
                    onChange={(e) => markBuildComplete(b.dayId, e.target.checked)}
                  />
                  Complete
                </label>
              </div>

              <p className="mt-3 text-sm" style={{ color: "var(--fg-soft)" }}>
                <span className="label mr-1">Why</span>
                {b.why}
              </p>
              <p className="mt-2 text-sm">
                <span className="label mr-1">Goal</span>
                {b.goal}
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="label mb-1">Instructions</div>
                  <ol className="list-decimal space-y-1 pl-5 text-sm" style={{ color: "var(--fg-soft)" }}>
                    {b.instructions.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ol>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="label mb-1">Expected behavior</div>
                    <p className="text-sm" style={{ color: "var(--fg-soft)" }}>
                      {b.expectedBehavior}
                    </p>
                  </div>
                  <div>
                    <div className="label mb-1">Constraints</div>
                    <ul className="list-disc space-y-0.5 pl-5 text-sm" style={{ color: "var(--fg-soft)" }}>
                      {b.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="label mb-1">Prerequisites</div>
                    <p className="text-sm" style={{ color: "var(--fg-soft)" }}>
                      {b.prerequisites.join(" · ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 rounded-md p-3 text-sm md:grid-cols-2" style={{ background: "var(--surface-2)" }}>
                <div>
                  <span className="label mr-1">Evidence</span>
                  {b.evidenceRequired}
                </div>
                <div>
                  <span className="label mr-1">Extension</span>
                  {b.extension}
                </div>
              </div>

              <div className="mt-4">
                <Link href={`/learn/${b.dayId}#document`} className="btn">
                  Attach evidence →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
