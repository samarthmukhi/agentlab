import { DAYS, dayById } from "./curriculum";
import { MASTERY_LABEL, summarizeDay } from "./scoring";
import { allDayStatuses, dashboardStats } from "./selectors";
import { reviewQueue } from "./review";
import type { AppState } from "./types";

function countMistakes(state: AppState): [string, number][] {
  const counts: Record<string, number> = {};
  for (const r of state.results) {
    for (const m of r.mistakes) counts[m] = (counts[m] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export function dailyReportMarkdown(state: AppState, dayId: string): string {
  const day = dayById(dayId);
  const summary = summarizeDay(dayId, state.results);
  const reflection = state.reflections[dayId];
  const p = state.dayProgress[dayId];
  const dayResults = state.results.filter((r) => r.dayId === dayId);
  const mistakeCounts: Record<string, number> = {};
  for (const r of dayResults) for (const m of r.mistakes) mistakeCounts[m] = (mistakeCounts[m] ?? 0) + 1;
  const evidence = state.evidence.filter((e) => e.relatedDay === dayId);

  const L = (v: string | undefined) => (v && v.trim() ? v.trim() : "_(not recorded)_");

  return `# Day ${day.dayNumber} Report — ${day.title}

- **Date:** ${new Date().toLocaleDateString()}
- **Topic:** ${day.title}
- **Learning:** ${p?.learningComplete ? "Complete" : "Incomplete"}
- **Build:** ${p?.buildComplete ? "Complete" : "Incomplete"}
- **First attempt:** ${summary.firstAttempt === null ? "—" : summary.firstAttempt + "%"}
- **Best / Latest:** ${summary.best === null ? "—" : summary.best + "%"} / ${summary.latest === null ? "—" : summary.latest + "%"}
- **Mastery:** ${MASTERY_LABEL[summary.mastery]}

## Category scores
${Object.entries(summary.categoryScores).length
  ? Object.entries(summary.categoryScores).map(([c, v]) => `- ${c}: ${v}%`).join("\n")
  : "_No assessment submitted yet._"}

## Mistakes
${Object.entries(mistakeCounts).length
  ? Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]).map(([c, n]) => `- ${n}× ${c}`).join("\n")
  : "_None recorded._"}

## Reflection
- **What I learned:** ${L(reflection?.learned)}
- **What surprised me:** ${L(reflection?.surprised)}
- **What remains unclear:** ${L(reflection?.unclear)}
- **What I built:** ${L(reflection?.built)}
- **What to review:** ${L(reflection?.toReview)}
- **Tomorrow:** ${L(reflection?.tomorrow)}

## Evidence
${evidence.length
  ? evidence.map((e) => `- [${e.type}] ${e.title}${e.ref ? ` — ${e.ref}` : ""}`).join("\n")
  : "_No evidence attached._"}
`;
}

export interface FinalChartRow {
  day: number;
  title: string;
  first: number | null;
  best: number | null;
  latest: number | null;
  improvement: number | null;
}

export function finalChartRows(state: AppState): FinalChartRow[] {
  return DAYS.map((d) => {
    const s = summarizeDay(d.id, state.results);
    return {
      day: d.dayNumber,
      title: d.title,
      first: s.firstAttempt,
      best: s.best,
      latest: s.latest,
      improvement:
        s.firstAttempt !== null && s.best !== null ? s.best - s.firstAttempt : null,
    };
  });
}

export function finalReportMarkdown(state: AppState): string {
  const stats = dashboardStats(state);
  const statuses = allDayStatuses(state);
  const rows = finalChartRows(state);
  const mistakes = countMistakes(state);
  const queue = reviewQueue(state);
  const retests = state.results.filter((r) => r.isRetest);

  const firsts = rows.map((r) => r.first).filter((v): v is number => v !== null);
  const bests = rows.map((r) => r.best).filter((v): v is number => v !== null);
  const firstAvg = firsts.length ? Math.round(firsts.reduce((a, b) => a + b, 0) / firsts.length) : null;
  const bestAvg = bests.length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.length) : null;

  const strongest = statuses
    .filter((s) => s.summary.best !== null)
    .sort((a, b) => (b.summary.best ?? 0) - (a.summary.best ?? 0))
    .slice(0, 3)
    .map((s) => `${dayById(s.dayId).title} (${s.summary.best}%)`);
  const weakest = statuses
    .filter((s) => s.summary.best !== null)
    .sort((a, b) => (a.summary.best ?? 0) - (b.summary.best ?? 0))
    .slice(0, 3)
    .map((s) => `${dayById(s.dayId).title} (${s.summary.best}%)`);

  return `# AgentLab — 9-Day Learning Report

## Executive summary
A personal, evidence-driven agentic-AI sprint. This report reflects **only stored data**;
no results are fabricated.

- **Overall completion:** ${stats.overall}%
- **Days with a first attempt:** ${firsts.length} / ${DAYS.length}
- **First-attempt average:** ${firstAvg === null ? "—" : firstAvg + "%"}
- **Best-score average:** ${bestAvg === null ? "—" : bestAvg + "%"}
- **Average improvement (best − first):** ${
    firstAvg !== null && bestAvg !== null ? bestAvg - firstAvg + " pp" : "—"
  }
- **Highest score:** ${bests.length ? Math.max(...bests) + "%" : "—"}
- **Lowest first score:** ${firsts.length ? Math.min(...firsts) + "%" : "—"}
- **Retests taken:** ${retests.length}
- **Builds completed:** ${stats.buildsComplete} / ${DAYS.length}

## Per-day performance
| Day | Topic | First | Best | Latest | Δ |
| --- | --- | --- | --- | --- | --- |
${rows
  .map(
    (r) =>
      `| ${r.day} | ${r.title} | ${r.first ?? "—"} | ${r.best ?? "—"} | ${r.latest ?? "—"} | ${
        r.improvement === null ? "—" : (r.improvement >= 0 ? "+" : "") + r.improvement
      } |`,
  )
  .join("\n")}

## Strongest concepts
${strongest.length ? strongest.map((s) => `- ${s}`).join("\n") : "_No data yet._"}

## Weakest concepts
${weakest.length ? weakest.map((s) => `- ${s}`).join("\n") : "_No data yet._"}

## Most common mistakes
${mistakes.length ? mistakes.slice(0, 8).map(([c, n]) => `- ${n}× ${c}`).join("\n") : "_None recorded._"}

## Outstanding review queue
${queue.length ? queue.map((q) => `- [${q.priority}] ${q.concept} — ${q.reason}`).join("\n") : "_Empty._"}

## Retest history
${
  retests.length
    ? retests
        .map((r) => `- ${dayById(r.dayId).title}: retest #${r.attemptNumber - 1} → ${r.score}%`)
        .join("\n")
    : "_No retests taken._"
}

## Final architecture challenge
${state.finalChallenge.notes.trim() ? state.finalChallenge.notes.trim() : "_Not yet attempted._"}

## Reflection
${state.reflections["day-9"]?.learned?.trim() || "_Add a Day 9 reflection to populate this._"}

---
_This is a personal learning system and an experimental assessment workflow. It does not
claim scientifically validated mastery._
`;
}
