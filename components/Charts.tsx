"use client";

import type { FinalChartRow } from "@/lib/report";

/** Grouped vertical bars: first attempt vs best score per day. */
export function ScoreChart({ rows }: { rows: FinalChartRow[] }) {
  const max = 100;
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "var(--line-strong)" }} />
          First attempt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "var(--fg)" }} />
          Best
        </span>
      </div>
      <div className="flex items-end gap-2" style={{ height: 160 }}>
        {rows.map((r) => (
          <div key={r.day} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div className="flex h-full w-full items-end justify-center gap-0.5">
              <div
                className="w-1/2 rounded-t-sm"
                style={{
                  height: `${((r.first ?? 0) / max) * 100}%`,
                  background: "var(--line-strong)",
                  minHeight: r.first !== null ? 2 : 0,
                }}
                title={`First: ${r.first ?? "—"}`}
              />
              <div
                className="w-1/2 rounded-t-sm"
                style={{
                  height: `${((r.best ?? 0) / max) * 100}%`,
                  background: "var(--fg)",
                  minHeight: r.best !== null ? 2 : 0,
                }}
                title={`Best: ${r.best ?? "—"}`}
              />
            </div>
            <span className="mono text-[10px]" style={{ color: "var(--muted)" }}>
              D{r.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal improvement bars (best − first). */
export function ImprovementChart({ rows }: { rows: FinalChartRow[] }) {
  const withData = rows.filter((r) => r.improvement !== null);
  if (withData.length === 0)
    return (
      <div className="card p-5 text-sm" style={{ color: "var(--muted)" }}>
        No improvement data yet — take a first attempt and a retest.
      </div>
    );
  const maxAbs = Math.max(10, ...withData.map((r) => Math.abs(r.improvement ?? 0)));
  return (
    <div className="card space-y-2 p-5">
      {withData.map((r) => {
        const v = r.improvement ?? 0;
        return (
          <div key={r.day} className="flex items-center gap-3 text-xs">
            <span className="mono w-8 shrink-0" style={{ color: "var(--muted)" }}>
              D{r.day}
            </span>
            <div className="h-4 flex-1 overflow-hidden rounded" style={{ background: "var(--surface-2)" }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${(Math.abs(v) / maxAbs) * 100}%`,
                  background: v >= 0 ? "var(--ok)" : "var(--bad)",
                }}
              />
            </div>
            <span className="mono w-12 shrink-0 text-right">
              {v >= 0 ? "+" : ""}
              {v}pp
            </span>
          </div>
        );
      })}
    </div>
  );
}
