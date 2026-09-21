// ============================================================================
// AgentLab domain types
// Part 25 of the specification. These typed models are the single source of
// truth for the whole application.
// ============================================================================

// ---------------------------------------------------------------------------
// Curriculum (static, seeded content)
// ---------------------------------------------------------------------------

export type QuestionType =
  | "conceptual"
  | "scenario"
  | "application"
  | "debugging"
  | "architecture"
  | "failure-mode";

export type Difficulty = "easy" | "medium" | "hard";

/** Assessment "category" — a coarser grouping used for category scores. */
export type Category = "conceptual" | "application" | "debugging" | "architecture";

export interface LearningObjective {
  id: string;
  text: string;
}

export interface LearningResource {
  id: string;
  title: string;
  source: string;
  url: string;
  section?: string;
  estimatedMinutes: number;
  why: string;
  tier: "core" | "optional";
}

export interface ConceptNote {
  concept: string;
  what: string;
  why: string;
  misconception?: string;
}

export interface Build {
  id: string;
  dayId: string;
  title: string;
  why: string;
  goal: string;
  prerequisites: string[];
  instructions: string[];
  expectedBehavior: string;
  constraints: string[];
  suggestedMinutes: number;
  evidenceRequired: string;
  extension: string;
}

export interface Day {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  learningObjectives: LearningObjective[];
  concepts: ConceptNote[];
  failureModes: string[];
  resources: LearningResource[];
  buildId: string;
  assessmentId: string;
  /** Number of questions to sample for the daily assessment. */
  assessmentSize: number;
  /** Concept ids taught this day (used for review/mastery grouping). */
  conceptIds: string[];
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export interface Question {
  id: string;
  dayId: string;
  topic: string;
  concept: string;
  category: Category;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options: string[];
  /** Index into `options` of the single correct answer. */
  correctAnswer: number;
  explanation: string;
  sourceReference?: string;
  tags: string[];
}

export interface Concept {
  id: string;
  name: string;
  description: string;
  dayId: string;
}

// ---------------------------------------------------------------------------
// Runtime / user state (persisted)
// ---------------------------------------------------------------------------

export type Phase = "learn" | "build" | "assess" | "review" | "document";

export interface DayProgress {
  dayId: string;
  learningComplete: boolean;
  buildComplete: boolean;
  /** Ids of best attempts + retests recorded for this day's assessment. */
  documented: boolean;
}

/** A single answered question inside an attempt. */
export interface AnswerRecord {
  questionId: string;
  concept: string;
  category: Category;
  selected: number; // index chosen
  correct: boolean;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  dayId: string;
  attemptNumber: number; // 1 = first attempt, >1 = retest
  isRetest: boolean;
  score: number; // 0..100
  categoryScores: Partial<Record<Category, number>>;
  answers: AnswerRecord[];
  mistakes: string[]; // concept names missed
  completedAt: string; // ISO
}

export type MasteryStatus =
  | "mastered" // >= 90
  | "solid" // 80-89
  | "review" // 70-79
  | "relearn" // < 70
  | "untested";

export type Priority = "high" | "medium" | "low";
export type RetestStatus = "not-needed" | "recommended" | "required" | "passed";

export interface ReviewItem {
  conceptId: string;
  concept: string;
  dayId: string;
  priority: Priority;
  reason: string;
  mistakeCount: number;
  lastReviewedAt?: string;
  retestStatus: RetestStatus;
}

export interface Reflection {
  dayId: string;
  learned: string;
  surprised: string;
  unclear: string;
  built: string;
  toReview: string;
  tomorrow: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export type EvidenceType =
  | "commit"
  | "screenshot"
  | "demo-url"
  | "research-source"
  | "interview"
  | "document"
  | "code-path"
  | "note";

export interface Evidence {
  id: string;
  title: string;
  type: EvidenceType;
  date: string;
  ref: string; // url or path
  description: string;
  relatedDay?: string;
  relatedTo?: string; // concept or hypothesis id
}

// ---------------------------------------------------------------------------
// SwarmFolio research track
// ---------------------------------------------------------------------------

export interface ResearchEntry {
  id: string;
  day: number;
  researchQuestion: string;
  prompts: string[]; // seeded guiding sub-questions
  deliverable: string; // seeded deliverable name
  sources: string;
  findings: string;
  evidenceFor: string;
  evidenceAgainst: string;
  interpretation: string;
  whatChanged: string;
  nextQuestion: string;
  updatedAt?: string;
}

export interface Hypothesis {
  id: string;
  statement: string;
  initialBelief: string;
  evidence: string;
  updatedBelief: string;
  nextTest: string;
  falsification: string;
  updatedAt?: string;
}

export interface Interview {
  id: string;
  role: string;
  orgType: string;
  date: string;
  workflow: string;
  constraints: string;
  painPoints: string;
  existingSoftware: string;
  manualWork: string;
  frequency: string;
  severity: string;
  observations: string;
  quotes: string;
  followUps: string;
  linkedHypothesis?: string;
}

export interface Competitor {
  id: string;
  name: string;
  category: string;
  customer: string;
  workflow: string;
  optimization: string;
  constraintHandling: string;
  ai: string;
  feasibilityHandling: string;
  explainability: string;
  integration: string;
  pricing: string;
  evidence: string;
  url: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Root persisted state
// ---------------------------------------------------------------------------

export interface AppState {
  version: number;
  startedAt: string;
  currentDay: number;
  dayProgress: Record<string, DayProgress>;
  results: AssessmentResult[];
  reflections: Record<string, Reflection>;
  reviewOverrides: Record<string, { lastReviewedAt?: string }>;
  evidence: Evidence[];
  research: Record<string, ResearchEntry>; // keyed by research id
  hypotheses: Hypothesis[];
  interviews: Interview[];
  competitors: Competitor[];
  finalChallenge: {
    notes: string;
    updatedAt?: string;
  };
  settings: {
    displayName: string;
  };
}
