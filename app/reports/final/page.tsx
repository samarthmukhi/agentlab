"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { DownloadButton } from "@/components/DownloadButton";
import { ImprovementChart, ScoreChart } from "@/components/Charts";
import { SectionHeading, Stat } from "@/components/ui";
import { dashboardStats } from "@/lib/selectors";
import { finalChartRows, finalReportMarkdown } from "@/lib/report";

export default function FinalReport() {
  const { state } = useStore();
  const stats = dashboardStats(state);
  const rows = finalChartRows(state);
  const md = finalReportMarkdown(state);

  const firsts = rows.map((r) => r.first).filter((v): v is number => v !== null);
  const bests = rows.map((r) => r.best).filter((v): v is number => v !== null);
  const firstAvg = firsts.length ? Math.round(firsts.reduce((a, b) => a + b, 0) / firsts.length) : null;
  const bestAvg = bests.length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.length) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label mb-1">Documentation</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            AgentLab — 9-Day Learning Report
          </h1>
        </div>
        <DownloadButton filename="agentlab-final-report.md" content={md} label="Export report" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Overall" value={`${stats.overall}%`} />
        <Stat label="First-attempt avg" value={firstAvg === null ? "—" : `${firstAvg}%`} />
        <Stat label="Best avg" value={bestAvg === null ? "—" : `${bestAvg}%`} />
        <Stat
          label="Avg improvement"
          value={
            firstAvg !== null && bestAvg !== null ? `${bestAvg - firstAvg >= 0 ? "+" : ""}${bestAvg - firstAvg}pp` : "—"
          }
        />
      </div>

      <section>
        <SectionHeading eyebrow="Charts" title="First attempt vs best" />
        <ScoreChart rows={rows} />
      </section>

      <section>
        <SectionHeading title="Improvement after review (best − first)" />
        <ImprovementChart rows={rows} />
      </section>

      <section>
        <SectionHeading eyebrow="Full document" title="Report" />
        <pre
          className="card overflow-x-auto whitespace-pre-wrap p-5 text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {md}
        </pre>
      </section>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        This report reflects only stored data. It makes no claim of scientifically
        validated mastery.{" "}
        <Link href="/swarmfolio" className="underline">
          SwarmFolio research →
        </Link>
      </p>
    </div>
  );
}
