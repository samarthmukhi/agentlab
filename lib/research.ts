import type { Competitor, Hypothesis, Interview, ResearchEntry } from "./types";

// ============================================================================
// SwarmFolio research track — SEED SCAFFOLDING ONLY (Part 19-22).
// These are prompts/questions and empty fields for the user to fill with their
// OWN findings. Nothing here is fabricated as a finding. The `findings`,
// `evidence*`, and interview/competitor detail fields start empty.
// ============================================================================

export const RESEARCH_SEED: ResearchEntry[] = [
  {
    id: "research-1", day: 1,
    researchQuestion: "Who actually experiences constrained portfolio construction?",
    prompts: [
      "Who constructs portfolios (RIAs, wealth managers, family offices, institutions, robo-advisors)?",
      "Who defines the constraints, and how often?",
      "What kinds of constraints do they deal with?",
      "Who approves the final decision?",
    ],
    deliverable: "Customer Hypothesis v1 (+ falsification condition)",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
  {
    id: "research-2", day: 2,
    researchQuestion: "How do portfolios get constructed today?",
    prompts: [
      "Where does Excel / manual work show up?",
      "Which platforms/optimizers/risk systems are used?",
      "What is automated vs partially automated vs fully manual?",
    ],
    deliverable: "Current Workflow Map (automated / partial / manual / unknown)",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
  {
    id: "research-3", day: 3,
    researchQuestion: "What does the competitive landscape look like?",
    prompts: [
      "Map Orion, Tamarac, Black Diamond, Advyzon, Morningstar Office, optimization platforms.",
      "For each: customer, workflow, optimization, constraints, AI, feasibility, explainability, integration, pricing.",
      "Do NOT rank or pick a 'best' — just map.",
    ],
    deliverable: "Competitor Map (research, not a leaderboard)",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
  {
    id: "research-4", day: 4,
    researchQuestion: "Which constraints create actual mathematical difficulty?",
    prompts: [
      "For each constraint (position, sector, risk, liquidity, tax, turnover, benchmark, client, ESG): customer reason, mathematical effect, software support, potential pain.",
      "Which combinations can become infeasible?",
    ],
    deliverable: "Constraint Landscape",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
  {
    id: "research-5", day: 5,
    researchQuestion: "Is there a feasibility gap in existing tools?",
    prompts: [
      "Do systems explicitly say 'no feasible solution exists'?",
      "Or do they relax, prioritize, approximate, or require manual intervention?",
      "How are exceptions handled?",
    ],
    deliverable: "Feasibility Gap analysis",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
  {
    id: "research-6", day: 6,
    researchQuestion: "What do real practitioners say? (Customer discovery)",
    prompts: [
      "Ask HOW they construct portfolios today — not 'would you use SwarmFolio'.",
      "Ask about the last time constraints conflicted.",
      "Where do errors happen? What is manual? Who approves?",
      "Record interviews in the Interview tracker.",
    ],
    deliverable: "Interview notes (3+ conversations if possible)",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
  {
    id: "research-7", day: 7,
    researchQuestion: "Where does AI meet portfolio construction today?",
    prompts: [
      "Survey AI advisor assistants, portfolio analysis, personalization, compliance, construction.",
      "Where does probabilistic reasoning meet deterministic constraints?",
    ],
    deliverable: "AI × Portfolio Construction Landscape",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
  {
    id: "research-8", day: 8,
    researchQuestion: "Is there a viable business model?",
    prompts: [
      "Who pays and why? What economic value exists (analyst time, fewer errors, speed, auditability)?",
      "Map: Customer → Pain → Existing Cost → Economic Value → Buyer → Pricing Model.",
    ],
    deliverable: "Business Model sketch",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
  {
    id: "research-9", day: 9,
    researchQuestion: "Synthesis: what do I now believe, and what's the next experiment?",
    prompts: [
      "Current thesis. Evidence for. Evidence against.",
      "What changed my mind? Biggest uncertainty? Next experiment?",
    ],
    deliverable: "Research synthesis",
    sources: "", findings: "", evidenceFor: "", evidenceAgainst: "",
    interpretation: "", whatChanged: "", nextQuestion: "",
  },
];

// Seed hypotheses are STATEMENTS to test, with empty belief/evidence fields.
export const HYPOTHESIS_SEED: Hypothesis[] = [
  {
    id: "hyp-1",
    statement: "RIAs and wealth managers regularly experience painful constraint conflicts.",
    initialBelief: "", evidence: "", updatedBelief: "", nextTest: "",
    falsification: "If practitioners say conflicts are rare or trivially resolved by their current tools.",
  },
  {
    id: "hyp-2",
    statement: "Existing tools silently relax or approximate rather than reporting infeasibility.",
    initialBelief: "", evidence: "", updatedBelief: "", nextTest: "",
    falsification: "If leading platforms already surface explicit infeasibility with conflict explanations.",
  },
  {
    id: "hyp-3",
    statement: "A verification/decision layer between qualitative AI reasoning and hard constraints is valuable.",
    initialBelief: "", evidence: "", updatedBelief: "", nextTest: "",
    falsification: "If no customer will pay for verification separate from existing optimization software.",
  },
];

export const RESEARCH_DELIVERABLE_BY_DAY = (day: number) =>
  RESEARCH_SEED.find((r) => r.day === day);

// Empty starting collections — the user creates real entries.
export const INTERVIEWS_SEED: Interview[] = [];
export const COMPETITORS_SEED: Competitor[] = [];
