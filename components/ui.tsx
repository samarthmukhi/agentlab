import Link from "next/link";
import type { MasteryStatus, Priority } from "@/lib/types";
import { MASTERY_LABEL } from "@/lib/scoring";

export function ProgressBar({
  value,
  label,
  className = "",
}: {
  value: number; // 0..100
  label?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span style={{ color: "var(--fg-soft)" }}>{label}</span>
          <span className="mono" style={{ color: "var(--muted)" }}>
            {Math.round(v)}%
          </span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--surface-2)" }}
        role="progressbar"
        aria-valuenow={Math.round(v)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${v}%`, background: "var(--fg)" }}
        />
      </div>
    </div>
  );
}

const masteryStyle: Record<MasteryStatus, { bg: string; fg: string; mark: string }> = {
  mastered: { bg: "var(--ok-bg)", fg: "var(--ok)", mark: "●" },
  solid: { bg: "var(--info-bg)", fg: "var(--info)", mark: "◆" },
  review: { bg: "var(--warn-bg)", fg: "var(--warn)", mark: "▲" },
  relearn: { bg: "var(--bad-bg)", fg: "var(--bad)", mark: "■" },
  untested: { bg: "var(--surface-2)", fg: "var(--muted)", mark: "○" },
};

export function MasteryBadge({ status }: { status: MasteryStatus }) {
  const s = masteryStyle[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.fg }}
    >
      <span aria-hidden>{s.mark}</span>
      {MASTERY_LABEL[status]}
    </span>
  );
}

const priorityStyle: Record<Priority, { fg: string; bg: string; mark: string }> = {
  high: { fg: "var(--bad)", bg: "var(--bad-bg)", mark: "▲▲" },
  medium: { fg: "var(--warn)", bg: "var(--warn-bg)", mark: "▲" },
  low: { fg: "var(--muted)", bg: "var(--surface-2)", mark: "·" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = priorityStyle[priority];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wide"
      style={{ background: s.bg, color: s.fg }}
    >
      <span aria-hidden>{s.mark}</span>
      {priority}
    </span>
  );
}

export function ScorePill({ score }: { score: number | null }) {
  if (score === null)
    return (
      <span className="mono text-sm" style={{ color: "var(--muted)" }}>
        —
      </span>
    );
  return <span className="mono text-sm font-semibold">{score}%</span>;
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className="mono mt-1 text-2xl font-semibold">{value}</div>
      {sub && (
        <div className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function LockBadge({ unlocked }: { unlocked: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{
        background: unlocked ? "var(--ok-bg)" : "var(--surface-2)",
        color: unlocked ? "var(--ok)" : "var(--muted)",
      }}
    >
      <span aria-hidden>{unlocked ? "◍" : "🔒"}</span>
      {unlocked ? "Unlocked" : "Locked"}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="label mb-1">{eyebrow}</div>}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Pipeline({
  phase,
}: {
  phase: { name: string; done: boolean; current?: boolean }[];
}) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs">
      {phase.map((p, i) => (
        <li key={p.name} className="flex items-center gap-1">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
            style={{
              background: p.current
                ? "var(--fg)"
                : p.done
                  ? "var(--ok-bg)"
                  : "var(--surface-2)",
              color: p.current
                ? "var(--bg)"
                : p.done
                  ? "var(--ok)"
                  : "var(--muted)",
              fontWeight: p.current ? 600 : 500,
            }}
          >
            <span aria-hidden>{p.done ? "✓" : p.current ? "▶" : "○"}</span>
            {p.name}
          </span>
          {i < phase.length - 1 && (
            <span aria-hidden style={{ color: "var(--line-strong)" }}>
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div
      className="card flex flex-col items-center justify-center gap-1 p-10 text-center"
      style={{ borderStyle: "dashed" }}
    >
      <p className="text-sm font-medium">{title}</p>
      {hint && (
        <p className="max-w-sm text-xs" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function LinkButton({
  href,
  children,
  primary,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="btn" aria-disabled style={{ opacity: 0.45, cursor: "not-allowed" }}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={`btn ${primary ? "btn-primary" : ""}`}>
      {children}
    </Link>
  );
}
