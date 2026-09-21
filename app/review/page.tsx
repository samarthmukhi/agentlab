"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { MasteryBadge, PriorityBadge, SectionHeading } from "@/components/ui";
import { CONCEPTS, conceptById, dayById } from "@/lib/curriculum";
import { reviewQueue } from "@/lib/review";
import { allDayStatuses } from "@/lib/selectors";
import type { Priority } from "@/lib/types";

export default function ReviewPage() {
  const { state, markReviewed } = useStore();
  const queue = reviewQueue(state);
  const statuses = allDayStatuses(state);

  const groups: { key: Priority | "resolved"; label: string }[] = [
    { key: "high", label: "High priority" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
  ];

  const mastered = statuses.filter((s) => s.summary.mastery === "mastered");

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Diagnosis" title="Review queue" />
      <p className="max-w-2xl text-sm" style={{ color: "var(--fg-soft)" }}>
        This queue is derived automatically from the concepts you actually missed — not
        from what you skipped. Prioritized by mistake count, recency, and retest status.
      </p>

      {queue.length === 0 ? (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
          Nothing to review yet. Take assessments and any missed concepts will appear here.
        </div>
      ) : (
        groups.map((g) => {
          const items = queue.filter((q) => q.priority === g.key);
          if (items.length === 0) return null;
          return (
            <section key={g.key}>
              <div className="label mb-2">{g.label}</div>
              <div className="card divide-y p-0">
                {items.map((item) => {
                  const concept = conceptById(item.conceptId);
                  const day = dayById(item.dayId);
                  return (
                    <div key={item.conceptId} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{item.concept}</span>
                          <PriorityBadge priority={item.priority} />
                        </div>
                        <div className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                          {item.reason} · {item.mistakeCount} mistake
                          {item.mistakeCount === 1 ? "" : "s"} · Day {day.dayNumber}
                          {item.lastReviewedAt &&
                            ` · reviewed ${new Date(item.lastReviewedAt).toLocaleDateString()}`}
                        </div>
                        {concept && (
                          <p className="mt-1 text-xs" style={{ color: "var(--fg-soft)" }}>
                            {concept.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/learn/${item.dayId}#learn`} className="btn">
                          Relearn
                        </Link>
                        <button className="btn" onClick={() => markReviewed(item.conceptId)}>
                          Mark reviewed
                        </button>
                        <Link href={`/assess/${item.dayId}`} className="btn btn-primary">
                          Retest
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {mastered.length > 0 && (
        <section>
          <div className="label mb-2">Mastered</div>
          <div className="flex flex-wrap gap-2">
            {mastered.map((s) => (
              <Link
                key={s.dayId}
                href={`/learn/${s.dayId}`}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
              >
                {dayById(s.dayId).title}
                <MasteryBadge status="mastered" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="pt-2 text-xs" style={{ color: "var(--muted)" }}>
        {CONCEPTS.length} tracked concepts across the curriculum.
      </p>
    </div>
  );
}
