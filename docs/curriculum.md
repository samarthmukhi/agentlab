# Curriculum

The 9-day path is authoritative and fixed in order. Each day's agents track is
scoped to **~20–25 minutes total** (learn + build + assess combined; Day 9 ~25).
The SwarmFolio research track is separate. Source of truth:
[`lib/curriculum.ts`](../lib/curriculum.ts).

Each day defines: learning objectives, concepts (with a "common misconception"),
failure modes, 2–3 core resources (+ optional deep dives), a build, and an
assessment sampled from that day's question bank.

Builds are ~10-minute micro-exercises; the daily quiz is short (~8 questions)
and samples from a much larger bank so retests draw different questions.

| Day | Topic | Micro-build (~10 min) | Daily quiz | Bank size |
| --- | --- | --- | --- | --- |
| 1 | Agent Fundamentals | One-turn tool decision | 8 | 25 |
| 2 | Tools & Function Calling | Validate a tool argument | 8 | 25 |
| 3 | RAG | Tiny retrieval by similarity | 8 | 25 |
| 4 | Structured Outputs | Two-layer validation | 8 | 25 |
| 5 | State, Memory & Orchestration | State through three steps | 8 | 25 |
| 6 | Multi-Agent Systems | Surface a disagreement | 8 | 30 |
| 7 | Frameworks & uAgents | Two uAgents, one message | 8 | 25 |
| 8 | Agents × SwarmFolio | Infeasible → revise → feasible | 8 | 25 |
| 9 | Mastery & System Design | Architecture artifact (evidence only) | 20 | 40 |

**Total question bank: 245.**

## Educational quality bar

Every concept is taught to answer more than "what is it?": *why it exists, what
problem it solves, what it looks like technically, when to use it, when NOT to,
what can go wrong, and how to debug it.* Failure modes are taught explicitly
(e.g. RAG: poor chunking, similar-but-irrelevant retrieval, missing document,
context overload).

Two themes recur throughout:

1. **When *not* to use agents / multiple agents.** Agents are a design choice,
   not a requirement. If a deterministic function or a single call suffices, use
   it.
2. **Deterministic verification.** Probabilistic reasoning should answer to an
   exact check. Structured-valid ≠ semantically valid; a confident answer ≠ a
   verified answer.

## Resources

Resources point at official documentation and primary sources (Anthropic /
OpenAI / LangGraph / CrewAI / Fetch docs, and the original RAG paper). Each day
shows at most 2–3 core resources plus optional deep dives, to avoid overload.
URLs live in `lib/curriculum.ts` and should be re-verified periodically.
