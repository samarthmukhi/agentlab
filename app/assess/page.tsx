"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { LockBadge, MasteryBadge, ScorePill, SectionHeading } from "@/components/ui";
import { DAYS } from "@/lib/curriculum";
import { dayStatus } from "@/lib/selectors";
import { BANK_COUNTS } from "@/lib/questions";

export default function AssessIndex() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Assessment" title="Test your understanding" />
      <p className="max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
        Multiple-choice only, one correct answer each, sampled from a bank of{" "}
        <b>{Object.values(BANK_COUNTS).reduce((a, b) => a + b, 0)}</b> questions. Answers
        stay hidden until you submit. Retests draw different questions and never overwrite
        your first attempt.
      </p>
      <div className="card divide-y p-0">
        {DAYS.map((d) => {
          const s = dayStatus(state, d.id);
          return (
            <div key={d.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="mono w-8 text-xs" style={{ color: "var(--muted)" }}>
                D{d.dayNumber}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{d.title}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {d.assessmentSize} of {BANK_COUNTS[d.id]} questions · first{" "}
                  <ScorePill score={s.summary.firstAttempt} /> · best{" "}
                  <ScorePill score={s.summary.best} />
                </div>
              </div>
              <MasteryBadge status={s.summary.mastery} />
              <LockBadge unlocked={s.assessmentUnlocked} />
              {s.assessmentUnlocked ? (
                <Link href={`/assess/${d.id}`} className="btn btn-primary">
                  {s.attempted ? "Retest" : "Start"}
                </Link>
              ) : (
                <Link href={`/learn/${d.id}`} className="btn">
                  Unlock
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
