# Curriculum

The 9-day path is authoritative and fixed in order. Each day is ~60 minutes
(Day 9 ~75). Source of truth: [`lib/curriculum.ts`](../lib/curriculum.ts).

Each day defines: learning objectives, concepts (with a "common misconception"),
failure modes, 2–3 core resources (+ optional deep dives), a build, and an
assessment sampled from that day's question bank.

| Day | Topic | Build | Daily assessment | Bank size |
| --- | --- | --- | --- | --- |
| 1 | Agent Fundamentals | Tiny tool-using calculator agent | 12 | 25 |
| 2 | Tools & Function Calling | Calculator + mock stock + constraint checker | 12 | 25 |
| 3 | RAG | Minimal doc→chunks→embeddings→retrieval→answer pipeline | 12 | 25 |
| 4 | Structured Outputs | Thesis → JSON constraints + two-layer validation | 12 | 25 |
| 5 | State, Memory & Orchestration | Research → Risk → Summary sequential workflow | 12 | 25 |
| 6 | Multi-Agent Systems | Research + Risk → Committee with deliberate disagreement | 14 | 30 |
| 7 | Frameworks & uAgents | Two uAgents exchanging a message | 12 | 25 |
| 8 | Agents × SwarmFolio | Agent → constraints → feasibility → conflict → revision loop | 12 | 25 |
| 9 | Mastery & System Design | Architecture artifact: the AI Investment Committee | 35 | 40 |

**Total question bank: 245+.**

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
