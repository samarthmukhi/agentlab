"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/components/StoreProvider";
import { DownloadButton } from "@/components/DownloadButton";
import { MasteryBadge } from "@/components/ui";
import { DAYS } from "@/lib/curriculum";
import { dayStatus } from "@/lib/selectors";
import { dailyReportMarkdown } from "@/lib/report";

export default function DayReport() {
  const params = useParams<{ day: string }>();
  const day = DAYS.find((d) => d.id === params.day);
  const { state } = useStore();

  if (!day) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm">Unknown day.</p>
        <Link href="/reports" className="btn mt-4">
          Reports
        </Link>
      </div>
    );
  }

  const s = dayStatus(state, day.id);
  const md = dailyReportMarkdown(state, day.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mono text-xs" style={{ color: "var(--muted)" }}>
            DAY {day.dayNumber} REPORT
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{day.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <MasteryBadge status={s.summary.mastery} />
          <DownloadButton filename={`agentlab-day-${day.dayNumber}.md`} content={md} />
        </div>
      </div>

      <pre
        className="card overflow-x-auto whitespace-pre-wrap p-5 text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {md}
      </pre>

      <div className="flex gap-2">
        <Link href={`/learn/${day.id}#document`} className="btn">
          Edit reflection
        </Link>
        <Link href="/reports" className="btn">
          All reports
        </Link>
      </div>
    </div>
  );
}
