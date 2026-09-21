"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { LockBadge, MasteryBadge, ProgressBar, ScorePill } from "@/components/ui";
import { DAYS, dayById } from "@/lib/curriculum";
import { dayStatus } from "@/lib/selectors";
import { questionsForDay } from "@/lib/questions";
import {
  categoryScores,
  masteryFromScore,
  mistakeConcepts,
  retestStatusFromScore,
  scoreAnswers,
  selectQuestions,
  selectRetestQuestions,
  shuffleOptions,
} from "@/lib/scoring";
import { newId } from "@/lib/id";
import type { AnswerRecord, AssessmentResult, Category, Question } from "@/lib/types";

interface PreparedQuestion {
  q: Question;
  options: string[];
  correctIndex: number;
}

export default function AssessPage() {
  const params = useParams<{ day: string }>();
  const day = DAYS.find((d) => d.id === params.day);
  const { state, recordResult } = useStore();

  const [phase, setPhase] = useState<"intro" | "running" | "submitted">("intro");
  const [seed, setSeed] = useState(0);
  const [isRetest, setIsRetest] = useState(false);
  const [prepared, setPrepared] = useState<PreparedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const s = day ? dayStatus(state, day.id) : null;

  if (!day || !s) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm">Unknown day.</p>
        <Link href="/assess" className="btn mt-4">
          Assessments
        </Link>
      </div>
    );
  }

  const priorForDay = state.results.filter((r) => r.dayId === day.id);

  function begin(retest: boolean) {
    if (!day) return;
    const pool = questionsForDay(day.id);
    const newSeed = Date.now() % 2147483647;
    let chosen: Question[];
    if (retest) {
      const missed = Array.from(
        new Set(priorForDay.flatMap((r) => r.mistakes)),
      );
      const seen = new Set(
        priorForDay.flatMap((r) => r.answers.map((a) => a.questionId)),
      );
      chosen = selectRetestQuestions(pool, missed, day.assessmentSize, newSeed, seen);
    } else {
      chosen = selectQuestions(pool, day.assessmentSize, newSeed);
    }
    const prep = chosen.map((q, i) => {
      const sh = shuffleOptions(q, newSeed + i * 101);
      return { q, options: sh.options, correctIndex: sh.correctIndex };
    });
    setSeed(newSeed);
    setIsRetest(retest);
    setPrepared(prep);
    setAnswers({});
    setCurrent(0);
    setResult(null);
    setPhase("running");
  }

  function submit() {
    if (!day || submitting) return; // guard double submit (Invariant 9)
    setSubmitting(true);
    const answerRecords: AnswerRecord[] = prepared.map((p) => {
      const selected = answers[p.q.id] ?? -1;
      return {
        questionId: p.q.id,
        concept: p.q.concept,
        category: p.q.category,
        selected,
        correct: selected === p.correctIndex,
      };
    });
    const score = scoreAnswers(answerRecords);
    const res: AssessmentResult = {
      id: newId("res"),
      assessmentId: day.assessmentId,
      dayId: day.id,
      attemptNumber: priorForDay.length + 1,
      isRetest,
      score,
      categoryScores: categoryScores(answerRecords),
      answers: answerRecords,
      mistakes: mistakeConcepts(answerRecords),
      completedAt: new Date().toISOString(),
    };
    recordResult(res);
    setResult(res);
    setPhase("submitted");
    setSubmitting(false);
  }

  // ---- Locked ----
  if (!s.assessmentUnlocked) {
    return (
      <div className="space-y-4">
        <Header day={day} />
        <div className="card p-6">
          <div className="mb-3">
            <LockBadge unlocked={false} />
          </div>
          <p className="text-sm" style={{ color: "var(--fg-soft)" }}>
            Assessment is locked. Complete both learning and the build first — completion
            of content is required before you can test understanding.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>{s.learningComplete ? "✓" : "○"} Learning</li>
            <li>{s.buildComplete ? "✓" : "○"} Build</li>
          </ul>
          <Link href={`/learn/${day.id}`} className="btn mt-4">
            Go complete the prerequisites →
          </Link>
        </div>
      </div>
    );
  }

  // ---- Intro ----
  if (phase === "intro") {
    return (
      <div className="space-y-5">
        <Header day={day} />
        <div className="card p-6">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <div className="label">Questions</div>
              <div className="mono text-lg">{day.assessmentSize}</div>
            </div>
            <div>
              <div className="label">First attempt</div>
              <ScorePill score={s.summary.firstAttempt} />
            </div>
            <div>
              <div className="label">Best</div>
              <ScorePill score={s.summary.best} />
            </div>
            <div>
              <div className="label">Latest</div>
              <ScorePill score={s.summary.latest} />
            </div>
            <div>
              <div className="label">Retests</div>
              <span className="mono">{s.summary.retestCount}</span>
            </div>
          </div>
          <p className="mt-4 text-sm" style={{ color: "var(--fg-soft)" }}>
            Multiple choice, one correct answer each. Question and option order are
            randomized. <b>Correct answers and explanations are hidden until you submit.</b>
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {priorForDay.length === 0 ? (
              <button className="btn btn-primary" onClick={() => begin(false)}>
                Start assessment →
              </button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => begin(true)}>
                  Start retest (targets missed concepts) →
                </button>
                <button className="btn" onClick={() => begin(false)}>
                  Fresh full attempt
                </button>
              </>
            )}
          </div>
          {s.summary.retestStatus === "required" && (
            <p className="mt-3 text-sm" style={{ color: "var(--bad)" }}>
              ▲ Retest required — your latest score is below 70%.
            </p>
          )}
          {s.summary.retestStatus === "recommended" && (
            <p className="mt-3 text-sm" style={{ color: "var(--warn)" }}>
              ▲ Retest recommended — your latest score is below 80%.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---- Running ----
  if (phase === "running") {
    const p = prepared[current];
    const answered = Object.keys(answers).length;
    const allAnswered = answered === prepared.length;
    return (
      <div className="space-y-5">
        <Header day={day} />
        <div className="flex items-center justify-between text-sm">
          <span className="mono" style={{ color: "var(--muted)" }}>
            Question {current + 1} / {prepared.length}
            {isRetest && " · retest"}
          </span>
          <span className="mono" style={{ color: "var(--muted)" }}>
            {answered} answered
          </span>
        </div>
        <ProgressBar value={((current + 1) / prepared.length) * 100} />

        <div className="card p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            <Tag>{p.q.type}</Tag>
            <Tag>{p.q.difficulty}</Tag>
            <Tag>{p.q.concept}</Tag>
          </div>
          <p className="text-base font-medium leading-relaxed">{p.q.question}</p>
          <div className="mt-4 space-y-2" role="radiogroup" aria-label="Answer options">
            {p.options.map((opt, i) => {
              const selected = answers[p.q.id] === i;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAnswers({ ...answers, [p.q.id]: i })}
                  className="flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors"
                  style={{
                    borderColor: selected ? "var(--fg)" : "var(--line-strong)",
                    background: selected ? "var(--surface-2)" : "var(--bg)",
                  }}
                >
                  <span
                    className="mono flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs"
                    style={{
                      borderColor: selected ? "var(--fg)" : "var(--line-strong)",
                      background: selected ? "var(--fg)" : "transparent",
                      color: selected ? "var(--bg)" : "var(--muted)",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            className="btn"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            ← Previous
          </button>
          <div className="flex gap-2">
            {current < prepared.length - 1 ? (
              <button className="btn" onClick={() => setCurrent((c) => c + 1)}>
                Next →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={!allAnswered || submitting}
                onClick={submit}
                title={allAnswered ? "" : "Answer all questions before submitting"}
              >
                Submit assessment
              </button>
            )}
          </div>
        </div>
        {!allAnswered && current === prepared.length - 1 && (
          <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
            Answer all {prepared.length} questions to submit ({prepared.length - answered}{" "}
            remaining).
          </p>
        )}
        {/* Jump grid */}
        <div className="flex flex-wrap gap-1.5">
          {prepared.map((pp, i) => (
            <button
              key={pp.q.id}
              onClick={() => setCurrent(i)}
              aria-label={`Go to question ${i + 1}`}
              className="mono h-7 w-7 rounded border text-xs"
              style={{
                borderColor: i === current ? "var(--fg)" : "var(--line)",
                background:
                  answers[pp.q.id] !== undefined ? "var(--surface-2)" : "var(--bg)",
                fontWeight: i === current ? 700 : 400,
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Submitted ----
  if (phase === "submitted" && result) {
    return (
      <ResultsView
        dayId={day.id}
        result={result}
        prepared={prepared}
        answers={answers}
        onRetest={() => begin(true)}
      />
    );
  }

  return null;
}

function Header({ day }: { day: (typeof DAYS)[number] }) {
  return (
    <div>
      <div className="mono mb-1 text-xs" style={{ color: "var(--muted)" }}>
        DAY {day.dayNumber} ASSESSMENT
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{day.title}</h1>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: "var(--surface-2)", color: "var(--muted)" }}
    >
      {children}
    </span>
  );
}

function ResultsView({
  dayId,
  result,
  prepared,
  answers,
  onRetest,
}: {
  dayId: string;
  result: AssessmentResult;
  prepared: PreparedQuestion[];
  answers: Record<string, number>;
  onRetest: () => void;
}) {
  const day = dayById(dayId);
  const mastery = masteryFromScore(result.score);
  const retest = retestStatusFromScore(result.score);
  const cats: Category[] = ["conceptual", "application", "debugging", "architecture"];
  const mistakeCounts = result.mistakes.reduce(
    (acc, c) => ((acc[c] = (acc[c] ?? 0) + 1), acc),
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="mono mb-1 text-xs" style={{ color: "var(--muted)" }}>
          DAY {day.dayNumber} · {result.isRetest ? "RETEST" : "FIRST ATTEMPT"}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mono text-4xl font-bold">{result.score}%</div>
            <div className="mt-1">
              <MasteryBadge status={mastery} />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            {cats.map((c) => (
              <div key={c}>
                <div className="label">{c}</div>
                <div className="mono text-lg">
                  {result.categoryScores[c] === undefined
                    ? "—"
                    : `${result.categoryScores[c]}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {retest === "required" && (
          <p className="mt-4 rounded-md p-3 text-sm" style={{ background: "var(--bad-bg)", color: "var(--bad)" }}>
            ▲ Retest required (below 70%). Review the missed concepts, then retest — a
            retest draws different questions and never overwrites your first attempt.
          </p>
        )}
        {retest === "recommended" && (
          <p className="mt-4 rounded-md p-3 text-sm" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}>
            ▲ Retest recommended (below 80%).
          </p>
        )}
        {retest === "not-needed" && (
          <p className="mt-4 rounded-md p-3 text-sm" style={{ background: "var(--ok-bg)", color: "var(--ok)" }}>
            ✓ Solid or better. No retest required.
          </p>
        )}
      </div>

      {Object.keys(mistakeCounts).length > 0 && (
        <div className="card p-5">
          <div className="label mb-2">Weak concepts (added to review queue)</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(mistakeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([c, n]) => (
                <span
                  key={c}
                  className="rounded-md px-2 py-1 text-xs"
                  style={{ background: "var(--warn-bg)", color: "var(--warn)" }}
                >
                  {n}× {c}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Per-question review with explanations (now unlocked) */}
      <div className="space-y-3">
        <div className="label">Answer review &amp; explanations</div>
        {prepared.map((p, i) => {
          const sel = answers[p.q.id] ?? -1;
          const correct = sel === p.correctIndex;
          return (
            <div key={p.q.id} className="card p-4">
              <div className="flex items-start gap-2">
                <span
                  className="mono mt-0.5 shrink-0 text-xs font-semibold"
                  style={{ color: correct ? "var(--ok)" : "var(--bad)" }}
                >
                  {correct ? "✓" : "✗"} Q{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.q.question}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {p.options.map((opt, j) => {
                      const isCorrect = j === p.correctIndex;
                      const isSel = j === sel;
                      return (
                        <li
                          key={j}
                          className="flex items-center gap-2 rounded px-2 py-1"
                          style={{
                            background: isCorrect
                              ? "var(--ok-bg)"
                              : isSel
                                ? "var(--bad-bg)"
                                : "transparent",
                          }}
                        >
                          <span
                            className="mono text-xs"
                            style={{
                              color: isCorrect
                                ? "var(--ok)"
                                : isSel
                                  ? "var(--bad)"
                                  : "var(--muted)",
                            }}
                          >
                            {String.fromCharCode(65 + j)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="ml-auto text-xs" style={{ color: "var(--ok)" }}>
                              correct
                            </span>
                          )}
                          {isSel && !isCorrect && (
                            <span className="ml-auto text-xs" style={{ color: "var(--bad)" }}>
                              your answer
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <p
                    className="mt-2 rounded-md p-2 text-sm"
                    style={{ background: "var(--surface-2)", color: "var(--fg-soft)" }}
                  >
                    {p.q.explanation}
                    {p.q.sourceReference && (
                      <span className="mt-1 block text-xs" style={{ color: "var(--muted)" }}>
                        Source: {p.q.sourceReference}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <button className="btn btn-primary" onClick={onRetest}>
          Retest missed concepts →
        </button>
        <Link href="/review" className="btn">
          Review queue
        </Link>
        <Link href={`/reports/${dayId}`} className="btn">
          Day report
        </Link>
        <Link href={`/learn/${dayId}#document`} className="btn">
          Document today
        </Link>
      </div>
    </div>
  );
}
