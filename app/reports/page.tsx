"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { MasteryBadge, ScorePill, SectionHeading } from "@/components/ui";
import { DAYS } from "@/lib/curriculum";
import { dayStatus } from "@/lib/selectors";

export default function ReportsIndex() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Documentation"
        title="Reports"
        right={
          <Link href="/reports/final" className="btn btn-primary">
            Final report →
          </Link>
        }
      />
      <p className="max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
        Daily reports summarize what you learned, built, scored, and still need to review.
        The final report aggregates everything into an evidence-backed narrative.
      </p>
      <div className="card divide-y p-0">
        {DAYS.map((d) => {
          const s = dayStatus(state, d.id);
          return (
            <Link
              key={d.id}
              href={`/reports/${d.id}`}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--surface-2)]"
            >
              <span className="mono w-8 text-xs" style={{ color: "var(--muted)" }}>
                D{d.dayNumber}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{d.title}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {s.documented ? "Documented" : "Not documented"} · first{" "}
                  <ScorePill score={s.summary.firstAttempt} />
                </div>
              </div>
              <MasteryBadge status={s.summary.mastery} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
