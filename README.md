# AgentLab

**An evidence-driven 9-day agentic-AI learning environment.**

> Learn → Build → Assess → Diagnose → Review → Retest → Document

Traditional learning tools measure *completion*. AgentLab is built around a
different question: **"Do I actually understand this?"** It refuses to confuse
exposure with understanding — completion ≠ mastery, reading ≠ mastery, a high
score on easy questions ≠ mastery.

It was built as preparation for a real agentic-AI project (an "AI Investment
Committee" that routes probabilistic AI reasoning through deterministic
verification). AgentLab teaches and drills the foundations for that system; it
does **not** build the system itself.

---

## Why it exists

The guiding principle behind the whole project:

> *I'm interested in building AI systems that don't just reason plausibly, but
> are forced to answer to reality.*

AgentLab applies that same idea to **learning**. Instead of

```
claim of understanding → "looks good" → done
```

it runs

```
claim of understanding → assessment → evidence → diagnosis → review → retest
```

Every assessment is real evidence. Weak concepts are derived from the questions
you actually miss. Retests draw different questions and never overwrite your
first attempt.

---

## The core loop

Each of the 9 days runs the same pipeline:

| Phase | What happens |
| --- | --- |
| **Learn** | Objectives, concepts (with common misconceptions), failure modes, 2–3 core resources. |
| **Build** | A small, concrete, testable implementation you write yourself (~20–30 min). |
| **Assess** | 10–15 MCQs (Day 9: 35), sampled from a bank. **Locked** until Learn + Build are complete. Answers hidden until you submit. |
| **Diagnose** | Score, category breakdown, and the specific concepts you missed. |
| **Review** | An auto-derived, prioritized review queue built purely from real mistakes. |
| **Retest** | Different questions targeting your missed concepts; first attempt preserved. |
| **Document** | A daily reflection + evidence (commits, screenshots, demos). |

---

## Curriculum

1. **Agent Fundamentals** — LLM vs agent, the agent loop, tools/environment, when *not* to use agents.
2. **Tools & Function Calling** — schemas, argument validation, tool errors, tool selection.
3. **RAG** — embeddings, chunking, retrieval relevance, grounding, why retrieval fails.
4. **Structured Outputs** — schema vs business-rule validation (schema-valid ≠ business-valid).
5. **State, Memory & Orchestration** — sequential/parallel/conditional, retries, termination.
6. **Multi-Agent Systems** — coordination, conflict/aggregation, cost, and when *not* to use many agents.
7. **Frameworks & Fetch/uAgents** — LangGraph / CrewAI / SDKs conceptually, then uAgents identity, addresses, messages.
8. **Agents × SwarmFolio** — probabilistic reasoning forced through a deterministic feasibility check, with a quantified conflict fed back for revision.
9. **Mastery & System Design** — 40-question comprehensive assessment + a (non-scored) architecture challenge.

See [`docs/curriculum.md`](docs/curriculum.md) for the full breakdown.

---

## Assessment methodology

- **Multiple choice only**, exactly one correct answer per question.
- **245+ questions** across the 9 banks, with a target mix of ~20% easy / 50%
  medium / 30% hard and **≥50% application/scenario/debugging/architecture**.
- Question selection, order, and option order are **randomized** (deterministic
  seed so tests are reproducible), while exactly one correct answer is preserved.
- **Answers and explanations stay hidden until submission.**
- Retests draw **different** questions and **target missed concepts**.

Mastery bands: `≥90 Mastered · 80–89 Solid · 70–79 Review · <70 Relearn+Retest`.
Scores tracked separately as **first attempt / best / latest**, never overwritten.

See [`docs/assessment-methodology.md`](docs/assessment-methodology.md).

---

## SwarmFolio research track

A parallel **research journal** (not the SwarmFolio product): a 9-day customer /
market / feasibility investigation with a hypothesis tracker, interview log, and
competitor map. Nothing is auto-generated or auto-concluded — you record your own
findings and update your own beliefs.

---

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v3** — minimal black/white/grayscale design system, light + dark
- **localStorage** persistence via a typed domain store (works with no backend)
- **Optional accounts + cloud sync** via **Supabase** (email/password), enabled
  only when env vars are present — otherwise the app runs fully local
- **Vitest** for the domain-logic test suite
- **No API key required to run.** The base product uses seeded content; the
  Supabase layer is optional and an LLM layer can be added later behind clean
  interfaces (see roadmap).

---

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Progress is saved in your browser and survives
refreshes; export/import a JSON backup from **Settings**.

### Accounts & cloud sync (optional)

By default AgentLab needs no account — progress lives in your browser. To add
**email/password accounts with cross-device sync**, set two Supabase env vars and
run one SQL script. When configured, a `/login` page appears, signing in migrates
your existing local progress to your account, and everything syncs to the cloud.
When not configured, the app stays fully local. Full walkthrough (Supabase setup
+ Vercel deploy) in [`docs/deployment.md`](docs/deployment.md).

```bash
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY
```

Other scripts:

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run test       # vitest run
npm run lint       # next lint
```

---

## Architecture at a glance

```
lib/            pure domain logic (no React)
  types.ts        typed models (Part 25)
  curriculum.ts   the 9 days, concepts, resources, builds
  questions/      the 245+ MCQ bank (one file per day + builder)
  scoring.ts      scoring, mastery, selection, review queue, retests
  state.ts        initial state, migration, load/save
  selectors.ts    locking + progress derivation
  review.ts       review-queue wiring
  report.ts       daily + final report generation (Markdown)
  research.ts     SwarmFolio research seed scaffolding
components/     StoreProvider (context + persistence) + UI
app/           routes: dashboard, learn, builds, assess, review,
               reports, swarmfolio, evidence, progress, settings
__tests__/     Vitest suites (scoring, bank integrity, state/locking)
```

See [`docs/architecture.md`](docs/architecture.md) and
[`docs/data-model.md`](docs/data-model.md).

---

## Limitations

This is a **personal learning system and an experimental assessment workflow.**
It does **not** claim scientifically validated mastery. Assessment scores are
evidence of performance on a specific question sample, not a certification.

---

## Roadmap

- Optional `LLMAssessmentGenerator` (behind the existing static interface) for
  generated question variants, targeted retests, and concept explanations.
- Spaced-repetition scheduling for the review queue.
- Richer evidence linking (per-concept, per-hypothesis).

---

_Built as preparation for a real agentic-AI project. The application is designed
around one principle: **don't confuse exposure with understanding.**_
