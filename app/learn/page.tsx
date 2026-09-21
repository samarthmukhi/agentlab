"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { LockBadge, MasteryBadge, Pipeline, SectionHeading } from "@/components/ui";
import { DAYS } from "@/lib/curriculum";
import { dayStatus } from "@/lib/selectors";

export default function LearnIndex() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Curriculum" title="The 9-day path" />
      <p className="max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
        Each day runs the same loop: <b>Learn → Build → Assess → Review → Document</b>.
        Assessment unlocks only after you complete both learning and the build.
      </p>
      <div className="space-y-3">
        {DAYS.map((d) => {
          const s = dayStatus(state, d.id);
          return (
            <Link
              key={d.id}
              href={`/learn/${d.id}`}
              className="card block p-4 transition-colors hover:bg-[var(--surface-2)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="mono text-xs" style={{ color: "var(--muted)" }}>
                      DAY {d.dayNumber}
                    </span>
                    <h3 className="text-base font-semibold">{d.title}</h3>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
                    {d.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <MasteryBadge status={s.summary.mastery} />
                  <span className="mono text-xs" style={{ color: "var(--muted)" }}>
                    ~{d.estimatedMinutes} min
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Pipeline
                  phase={[
                    { name: "Learn", done: s.learningComplete },
                    { name: "Build", done: s.buildComplete },
                    { name: "Assess", done: s.attempted },
                    { name: "Document", done: s.documented },
                  ]}
                />
                <LockBadge unlocked={s.assessmentUnlocked} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
