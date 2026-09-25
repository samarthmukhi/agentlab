import type { Build, Concept, Day } from "./types";

// ============================================================================
// The authoritative 9-day curriculum (Part 14). Order is fixed.
// Resource URLs point at official documentation / primary sources.
// ============================================================================

export const CONCEPTS: Concept[] = [
  // Day 1
  { id: "llm-vs-agent", name: "LLM vs Agent", description: "The difference between a single model call and a goal-driven loop.", dayId: "day-1" },
  { id: "agent-loop", name: "Agent loop", description: "Observe → reason → act → observe repeated toward a goal.", dayId: "day-1" },
  { id: "tools-environment", name: "Tools & environment", description: "External capabilities and the world the agent acts on.", dayId: "day-1" },
  { id: "when-not-agents", name: "When not to use agents", description: "Recognizing that a deterministic function or single call is enough.", dayId: "day-1" },
  { id: "agent-failure-basics", name: "Agent failure modes", description: "Loops, wrong tool, hallucinated actions.", dayId: "day-1" },
  // Day 2
  { id: "function-calling", name: "Function calling", description: "How a model requests a tool with structured arguments.", dayId: "day-2" },
  { id: "tool-schemas", name: "Tool schemas", description: "Describing tool inputs so the model can call them correctly.", dayId: "day-2" },
  { id: "tool-validation", name: "Argument validation", description: "Validating model-produced arguments before executing.", dayId: "day-2" },
  { id: "tool-errors", name: "Tool error handling", description: "Timeouts, unavailable tools, and feeding errors back.", dayId: "day-2" },
  { id: "tool-selection", name: "Tool selection", description: "Choosing the right tool (or none) for the step.", dayId: "day-2" },
  // Day 3
  { id: "why-rag", name: "Why RAG exists", description: "Grounding generation in external, current knowledge.", dayId: "day-3" },
  { id: "embeddings", name: "Embeddings", description: "Vector representations that capture semantic similarity.", dayId: "day-3" },
  { id: "chunking", name: "Chunking", description: "Splitting documents into retrievable units.", dayId: "day-3" },
  { id: "retrieval-relevance", name: "Retrieval relevance", description: "Why similar results can still be irrelevant.", dayId: "day-3" },
  { id: "grounding", name: "Grounding & hallucination", description: "Using retrieved context to constrain the answer.", dayId: "day-3" },
  // Day 4
  { id: "structured-output", name: "Structured output", description: "Forcing model output into a machine-readable shape.", dayId: "day-4" },
  { id: "schema-validation", name: "Schema validation", description: "Checking types, required fields, enums.", dayId: "day-4" },
  { id: "business-validation", name: "Business-rule validation", description: "Schema-valid is not the same as semantically valid.", dayId: "day-4" },
  { id: "malformed-output", name: "Malformed output handling", description: "Recovering from invalid JSON / missing fields.", dayId: "day-4" },
  // Day 5
  { id: "agent-state", name: "State", description: "Information carried across steps of a workflow.", dayId: "day-5" },
  { id: "memory", name: "Memory", description: "Information retained beyond the immediate context.", dayId: "day-5" },
  { id: "orchestration", name: "Orchestration", description: "Sequential, parallel, and conditional control flow.", dayId: "day-5" },
  { id: "termination", name: "Retries & termination", description: "Stopping conditions and retry logic.", dayId: "day-5" },
  // Day 6
  { id: "multi-agent-value", name: "Multi-agent value", description: "Specialization, parallelism, independent perspectives.", dayId: "day-6" },
  { id: "agent-coordination", name: "Coordination", description: "Sharing state and combining agent outputs.", dayId: "day-6" },
  { id: "agent-conflict", name: "Conflict & aggregation", description: "Handling disagreement between agents.", dayId: "day-6" },
  { id: "multi-agent-cost", name: "Multi-agent cost", description: "Latency, cost, and complexity tradeoffs.", dayId: "day-6" },
  { id: "when-not-multi", name: "When not to use multiple agents", description: "Avoiding needless multi-agent complexity.", dayId: "day-6" },
  // Day 7
  { id: "framework-tradeoffs", name: "Framework tradeoffs", description: "How LangGraph / CrewAI / SDKs differ conceptually.", dayId: "day-7" },
  { id: "uagents-identity", name: "uAgent identity & addresses", description: "How Fetch agents are addressed and discovered.", dayId: "day-7" },
  { id: "agent-messaging", name: "Agent messaging & protocols", description: "Message passing and protocols between agents.", dayId: "day-7" },
  // Day 8
  { id: "prob-vs-det", name: "Probabilistic vs deterministic", description: "LLM reasoning vs exact computation.", dayId: "day-8" },
  { id: "feasibility", name: "Feasibility & infeasibility", description: "Detecting when no solution can satisfy constraints.", dayId: "day-8" },
  { id: "conflict-detection", name: "Conflict detection", description: "Identifying and quantifying constraint conflicts.", dayId: "day-8" },
  { id: "feedback-loop", name: "Feedback loop & revision", description: "Feeding deterministic results back to the agent.", dayId: "day-8" },
  { id: "deterministic-verification", name: "Deterministic verification", description: "Forcing AI claims to answer to reality.", dayId: "day-8" },
];

export const conceptById = (id: string) => CONCEPTS.find((c) => c.id === id);
export const conceptByName = (name: string) => CONCEPTS.find((c) => c.name === name);

// ---------------------------------------------------------------------------
// Builds
// ---------------------------------------------------------------------------

export const BUILDS: Build[] = [
  {
    id: "build-1",
    dayId: "day-1",
    title: "One-turn tool decision",
    why: "The smallest honest taste of an agent: watch it decide to call a tool, read the result, and answer — or answer directly with no tool.",
    goal: "A tiny function that, given a request, decides whether to call a calculator tool or answer directly, runs it once, and returns the result.",
    prerequisites: ["Basic Python (functions, if/else, for loop)", "No API key — the decision is just a rule"],
    instructions: [
      "Write a `calculator(expr)` function that returns `eval(expr)`.",
      "Write `needs_calculator(req)`: loop over the characters and return True if any is a digit, else False.",
      "Write `agent(req)`: if it needs the calculator, print 'decision: use calculator' and call it; else print 'decision: answer directly'.",
      "Run it on '(3+4)*2' and on 'hello' and print the result each time.",
    ],
    expectedBehavior: "'(3+4)*2' calls the tool once and returns 14; 'hello' answers directly with no tool call.",
    constraints: ["Print the decision", "At most one tool call"],
    suggestedMinutes: 10,
    evidenceRequired: "Commit link or code path + a screenshot of the printed decisions.",
    extension: "Add a max-iteration guard and a second tool to choose between.",
  },
  {
    id: "build-2",
    dayId: "day-2",
    title: "Validate a tool argument",
    why: "Bad arguments must never reach a tool. This is the SwarmFolio-shaped move: validate before executing.",
    goal: "A `checkConstraint(weight, max)` tool with a schema check that returns a structured error on bad input instead of crashing.",
    prerequisites: ["Python 3.10+", "Build 1"],
    instructions: [
      "Write `check_constraint(weight, max)` returning a dict `{\"ok\": ..., \"violation_pp\": ...}`.",
      "Before running, validate `weight` is a number in [0,1]; else return `{\"ok\": False, \"error\": ...}`.",
      "Call with (0.4, 0.25) and with a bad value; `print` both results.",
    ],
    expectedBehavior: "(0.4, 0.25) reports a 15pp violation; a bad argument returns a structured error, not a crash.",
    constraints: ["No unhandled exceptions", "Validate before the tool body runs"],
    suggestedMinutes: 10,
    evidenceRequired: "Code path + screenshot of the handled validation error.",
    extension: "Reject an invented tool name (hallucinated-tool guard).",
  },
  {
    id: "build-3",
    dayId: "day-3",
    title: "Tiny retrieval by similarity",
    why: "See retrieval — and its failure — in ten minutes, without a vector database.",
    goal: "Score a few text chunks against a query, retrieve the top ones, answer from them, then ask something the chunks can't answer.",
    prerequisites: ["Python 3.10+", "A handful of short strings", "Embeddings optional — word-overlap works as a fallback"],
    instructions: [
      "Make a list of 4 short chunks.",
      "Score each against a query (cosine if you have embeddings, else word overlap); print top-2 + scores.",
      "Answer from the top chunk; then run a query the chunks can't answer and observe similar-but-irrelevant hits.",
    ],
    expectedBehavior: "An in-corpus query retrieves the right chunk; the unanswerable query surfaces similar-but-irrelevant chunks — retrieval relevance failing in front of you.",
    constraints: ["Answer only from retrieved chunks", "Print scores"],
    suggestedMinutes: 12,
    evidenceRequired: "Code path + screenshot of retrieved chunks with scores.",
    extension: "Add chunk overlap or metadata filtering and compare.",
  },
  {
    id: "build-4",
    dayId: "day-4",
    title: "Two-layer validation",
    why: "The exact hinge of the future system: schema-valid is not business-valid.",
    goal: "Validate a constraint object with a schema check, then a business-rule check, and catch a value the schema misses.",
    prerequisites: ["Python 3.10+", "A constraint dict `{\"type\", \"sector\", \"value\"}`"],
    instructions: [
      "Define the constraint dict and a set of allowed `type` values.",
      "`schema_valid`: `type` in the allowed set and `value` is a number.",
      "`business_valid`: `0 <= value <= 1`. Test `{\"type\": \"sector_max\", \"sector\": \"Tech\", \"value\": -5}`.",
    ],
    expectedBehavior: "`value:-5` passes the schema but is rejected by business validation.",
    constraints: ["Two clearly separated layers", "Distinguish schema vs business errors"],
    suggestedMinutes: 10,
    evidenceRequired: "Code path + screenshot of the schema-valid-but-business-invalid rejection.",
    extension: "Detect a min>max contradiction across two constraints and report the gap.",
  },
  {
    id: "build-5",
    dayId: "day-5",
    title: "State through three steps",
    why: "State passing is the substrate of every multi-step agent — in miniature.",
    goal: "Pass one state object through research → risk → summary, reading only what earlier steps wrote.",
    prerequisites: ["Python 3.10+", "Build 1"],
    instructions: [
      "`state = {}` (a dict); `research` writes `state[\"findings\"]`.",
      "`risk` reads `state[\"findings\"]`, writes `state[\"risk\"]`.",
      "`summary` reads both and returns a string; `print` `state` after each step.",
    ],
    expectedBehavior: "State flows forward; each step reads only prior outputs; you can see it grow at each stage.",
    constraints: ["Pass state explicitly (no globals)", "Clear end"],
    suggestedMinutes: 10,
    evidenceRequired: "Code path + screenshot of the state at each step.",
    extension: "Add a conditional: skip Risk if Research found nothing.",
  },
  {
    id: "build-6",
    dayId: "day-6",
    title: "Surface a disagreement",
    why: "Multi-agent value shows up when you refuse to average a conflict away.",
    goal: "Two functions return opposite calls; a committee states the conflict instead of blending it.",
    prerequisites: ["Python 3.10+", "Build 5"],
    instructions: [
      "`research()` → 'bullish', `risk()` → 'bearish' on the same input (two Python functions).",
      "`committee(r, k)`: if they conflict, return a decision that states BOTH positions and the disagreement.",
      "Print the surfaced conflict (no blended number).",
    ],
    expectedBehavior: "The disagreement is explicit, not averaged into a bland score.",
    constraints: ["No silent averaging", "Conflict is visible"],
    suggestedMinutes: 10,
    evidenceRequired: "Code path + screenshot of the surfaced conflict.",
    extension: "Add a reconciliation policy (e.g. defer to risk on safety).",
  },
  {
    id: "build-7",
    dayId: "day-7",
    title: "Two uAgents, one message",
    why: "The smallest real Fetch thing: one agent messages another and gets a reply.",
    goal: "Agent A sends a message to Agent B; B replies; both addresses are printed.",
    prerequisites: ["uAgents installed (local run)", "Python"],
    instructions: [
      "Create two uAgents sharing one message model.",
      "A sends a request to B's address on startup; B handles it and replies.",
      "Print each agent's address and the request/response.",
    ],
    expectedBehavior: "You see both addresses and a request/response round-trip in the logs.",
    constraints: ["Use the official uAgents message model", "Run locally, no secrets"],
    suggestedMinutes: 12,
    evidenceRequired: "Code path + screenshot of the round-trip logs.",
    extension: "Add a second message type via a small protocol.",
  },
  {
    id: "build-8",
    dayId: "day-8",
    title: "Infeasible → revise → feasible",
    why: "The whole thesis in one file: probabilistic reasoning forced to answer to a deterministic check, then revised.",
    goal: "A deterministic checker flags an impossible constraint pair with a quantified gap; you revise and rerun to FEASIBLE.",
    prerequisites: ["Python 3.10+", "Build 4"],
    instructions: [
      "Constraints: Tech ≥ 0.40 and Tech ≤ 0.25.",
      "`check()` (a Python function) detects min>max and returns INFEASIBLE + the gap (15pp).",
      "Relax/drop one constraint and rerun → FEASIBLE.",
    ],
    expectedBehavior: "First run: INFEASIBLE with a 15pp conflict. After revision: FEASIBLE.",
    constraints: ["The check is deterministic (no LLM inside)", "Quantify the conflict"],
    suggestedMinutes: 12,
    evidenceRequired: "Code path + screenshot of INFEASIBLE→revision→FEASIBLE.",
    extension: "Add a second impossible pair and confirm both are reported.",
  },
  {
    id: "build-9",
    dayId: "day-9",
    title: "Architecture artifact: the AI Investment Committee",
    why: "Day 9 is synthesis — design the full system on paper to prove you can assemble the pieces.",
    goal: "A diagram or short write-up connecting Research/Macro/Risk agents → committee → structured constraints → feasibility → feedback → revision.",
    prerequisites: ["Everything from Days 1–8"],
    instructions: [
      "Sketch the agent topology and the data flowing between components.",
      "Mark where RAG, tools, structured output, state, and the deterministic verification boundary each live.",
      "Note one failure mode per component; attach it as evidence.",
    ],
    expectedBehavior: "A coherent architecture you could actually start building at LA Hacks.",
    constraints: ["Show the deterministic verification boundary", "Label failure modes"],
    suggestedMinutes: 12,
    evidenceRequired: "Diagram/image or written architecture attached as evidence (not MCQ-scored).",
    extension: "Add an evaluation plan: how would you know it works?",
  },
];

export const buildById = (id: string) => BUILDS.find((b) => b.id === id)!;

// ---------------------------------------------------------------------------
// Days
// ---------------------------------------------------------------------------

export const DAYS: Day[] = [
  {
    id: "day-1",
    dayNumber: 1,
    title: "Agent Fundamentals",
    description:
      "What an LLM actually is, how an agent differs, and the loop that turns a model into an agent. Crucially: when you should NOT reach for an agent at all.",
    estimatedMinutes: 22,
    learningObjectives: [
      { id: "d1o1", text: "Distinguish an LLM (input→output) from an agent (goal→loop→result)." },
      { id: "d1o2", text: "Describe the agent loop: reason → act → observe → repeat." },
      { id: "d1o3", text: "Name the pieces: model, tool, environment, action, observation, state." },
      { id: "d1o4", text: "Explain when an agent is unnecessary." },
      { id: "d1o5", text: "Recognize basic agent failure modes." },
    ],
    concepts: [
      { concept: "LLM vs Agent", what: "An LLM maps input to output in one shot. An agent wraps a model in a loop that can take actions and observe results toward a goal.", why: "Most 'agent' bugs are really 'this should have been one model call' or 'this should have been code'.", misconception: "That anything using an LLM is an agent. A single classification call is not an agent." },
      { concept: "The agent loop", what: "Goal → model reasons → chooses an action/tool → environment returns an observation → model reasons again → ... → result.", why: "Every framework is a variation on this loop. Understanding it makes frameworks legible.", misconception: "That the loop must always call a tool. Deciding to answer directly is a valid action." },
      { concept: "Tools & environment", what: "A tool is an external capability (a function, an API). The environment is the system the agent affects and reads from.", why: "Agents are only as capable as their tools and only as safe as their environment boundaries.", misconception: "That more tools always help. Too many tools degrade tool selection." },
      { concept: "When NOT to use agents", what: "If a deterministic function or a single call solves it, use that. Agents add latency, cost, and failure surface.", why: "The strongest engineers reach for the simplest thing that works.", misconception: "That agentic architecture is inherently better. It is a design choice, not a requirement." },
    ],
    failureModes: [
      "Infinite loops (no termination guard)",
      "Wrong tool selected for the step",
      "An agent used where a plain function would do",
      "Tool failure not handled",
      "Hallucinated action / invented tool",
    ],
    resources: [
      { id: "d1r1", title: "Building effective agents", source: "Anthropic", url: "https://www.anthropic.com/engineering/building-effective-agents", estimatedMinutes: 15, why: "The clearest practical framing of when to use agents vs workflows vs a single call.", tier: "core" },
      { id: "d1r2", title: "Agents", source: "OpenAI Agents guide", url: "https://platform.openai.com/docs/guides/agents", estimatedMinutes: 10, why: "A second vendor's practical definition of the agent loop and tools.", tier: "optional" },
      { id: "d1r3", title: "A survey of the agent loop pattern", source: "OpenAI Cookbook", url: "https://cookbook.openai.com/", section: "Agents", estimatedMinutes: 10, why: "Concrete examples of the reason/act/observe cycle.", tier: "optional" },
    ],
    buildId: "build-1",
    assessmentId: "assess-1",
    assessmentSize: 8,
    conceptIds: ["llm-vs-agent", "agent-loop", "tools-environment", "when-not-agents", "agent-failure-basics"],
  },
  {
    id: "day-2",
    dayNumber: 2,
    title: "Tools & Function Calling",
    description:
      "How a model asks to use a tool, how you describe tools with schemas, and how to validate arguments and handle tool errors — including the failure modes that bite in production.",
    estimatedMinutes: 22,
    learningObjectives: [
      { id: "d2o1", text: "Explain function calling: the model emits a structured tool request." },
      { id: "d2o2", text: "Write a tool schema (name, args, types)." },
      { id: "d2o3", text: "Validate arguments before executing a tool." },
      { id: "d2o4", text: "Handle tool errors and feed them back into the loop." },
      { id: "d2o5", text: "Diagnose wrong-tool and hallucinated-tool failures." },
    ],
    concepts: [
      { concept: "Function calling", what: "The model doesn't run code; it emits a structured request naming a tool and arguments, which your code executes.", why: "This boundary is where most safety and validation belongs.", misconception: "That the model executes the function. It only proposes the call." },
      { concept: "Tool schemas", what: "A machine-readable description of a tool's name, parameters, and types that the model uses to form calls.", why: "Good schemas dramatically reduce malformed calls.", misconception: "That a vague description is fine. Ambiguous schemas produce wrong arguments." },
      { concept: "Argument validation", what: "Checking the model's arguments against the schema (and business rules) before running the tool.", why: "The model can and will produce out-of-range or wrong-typed arguments.", misconception: "That schema conformance guarantees valid arguments." },
      { concept: "Tool error handling", what: "Returning tool failures (timeout, unavailable, bad output) back to the loop as observations the model can react to.", why: "Robust agents treat errors as data, not crashes.", misconception: "That a tool exception should bubble up and kill the run." },
    ],
    failureModes: [
      "Invalid / out-of-range arguments",
      "Calling an unavailable tool",
      "Tool timeout",
      "Wrong output shape from a tool",
      "Schema mismatch between tool and call",
      "Hallucinated tool that doesn't exist",
    ],
    resources: [
      { id: "d2r1", title: "Tool use (function calling)", source: "Anthropic docs", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", estimatedMinutes: 15, why: "Authoritative reference for tool schemas and the tool-use loop.", tier: "core" },
      { id: "d2r2", title: "Function calling", source: "OpenAI docs", url: "https://platform.openai.com/docs/guides/function-calling", estimatedMinutes: 12, why: "The other canonical function-calling reference and JSON-schema conventions.", tier: "optional" },
    ],
    buildId: "build-2",
    assessmentId: "assess-2",
    assessmentSize: 8,
    conceptIds: ["function-calling", "tool-schemas", "tool-validation", "tool-errors", "tool-selection"],
  },
  {
    id: "day-3",
    dayNumber: 3,
    title: "Retrieval-Augmented Generation (RAG)",
    description:
      "Why models need external knowledge, how retrieval works end to end, and — most importantly — why retrieval fails even when results look similar.",
    estimatedMinutes: 22,
    learningObjectives: [
      { id: "d3o1", text: "Explain why RAG exists and what problem it solves." },
      { id: "d3o2", text: "Trace the pipeline: documents → chunks → embeddings → search → context → answer." },
      { id: "d3o3", text: "Explain embeddings, chunking, and top-k retrieval." },
      { id: "d3o4", text: "Diagnose why semantically similar retrieval can still be irrelevant." },
      { id: "d3o5", text: "Explain grounding and how RAG reduces (but doesn't eliminate) hallucination." },
    ],
    concepts: [
      { concept: "Why RAG exists", what: "Models have a fixed, stale, general knowledge. RAG injects specific, current, private context at query time.", why: "It is the cheapest way to make a model answer from your data.", misconception: "That RAG 'teaches' the model. It supplies context; it doesn't change weights." },
      { concept: "Embeddings", what: "Vectors placing semantically similar text near each other so similarity search can find related passages.", why: "They power retrieval without keyword matching.", misconception: "That closeness in vector space means 'contains the answer'. It means 'is about similar things'." },
      { concept: "Chunking", what: "Splitting documents into units small enough to retrieve precisely but large enough to be meaningful.", why: "Bad chunking is the most common cause of bad retrieval.", misconception: "That bigger chunks are always better — they dilute relevance." },
      { concept: "Retrieval relevance", what: "Top-k returns the most similar chunks, which may still not contain the needed fact.", why: "This is the #1 debugging trap in RAG.", misconception: "That high similarity implies correct grounding." },
    ],
    failureModes: [
      "Poor chunking (too big / too small / split mid-idea)",
      "Retrieval returns similar-but-irrelevant chunks",
      "The answering document isn't in the corpus",
      "Stale document retrieved",
      "Context overload (too many chunks)",
    ],
    resources: [
      { id: "d3r1", title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", source: "Lewis et al., 2020 (arXiv)", url: "https://arxiv.org/abs/2005.11401", estimatedMinutes: 20, why: "The original RAG paper — read the abstract, intro, and method.", tier: "core" },
      { id: "d3r2", title: "Embeddings", source: "OpenAI docs", url: "https://platform.openai.com/docs/guides/embeddings", estimatedMinutes: 12, why: "Practical grounding in what embeddings are and how similarity search uses them.", tier: "optional" },
      { id: "d3r3", title: "Contextual retrieval", source: "Anthropic", url: "https://www.anthropic.com/news/contextual-retrieval", estimatedMinutes: 12, why: "How to reduce retrieval failure with better chunk context.", tier: "optional" },
    ],
    buildId: "build-3",
    assessmentId: "assess-3",
    assessmentSize: 8,
    conceptIds: ["why-rag", "embeddings", "chunking", "retrieval-relevance", "grounding"],
  },
  {
    id: "day-4",
    dayNumber: 4,
    title: "Structured Outputs",
    description:
      "Turning a model's natural language into machine-valid JSON — and the crucial insight that schema-valid does not mean business-valid.",
    estimatedMinutes: 22,
    learningObjectives: [
      { id: "d4o1", text: "Force model output into a schema (types, required fields, enums)." },
      { id: "d4o2", text: "Distinguish schema validation from business-rule validation." },
      { id: "d4o3", text: "Give an example of schema-valid but semantically invalid output." },
      { id: "d4o4", text: "Handle malformed / missing / wrong-typed output." },
    ],
    concepts: [
      { concept: "Structured output", what: "Constraining the model to emit JSON matching a declared shape so downstream code can rely on it.", why: "It is the bridge from language to deterministic systems.", misconception: "That structured output guarantees correct content — it only guarantees shape." },
      { concept: "Schema validation", what: "Checking the output has the right fields, types, and allowed enum values.", why: "It catches shape errors early.", misconception: "That passing schema validation means the value is meaningful." },
      { concept: "Business-rule validation", what: "Checking values are semantically legal (e.g. a weight in [0,1]; no sector min>max).", why: "This is where `maxSectorWeight: -5` gets caught even though it's a valid number.", misconception: "That the schema can express all business rules." },
      { concept: "Malformed output handling", what: "Recovering from invalid JSON, missing fields, or wrong types — often by re-prompting or repairing.", why: "Models occasionally emit broken output; production code must survive it.", misconception: "That the model always returns parseable JSON." },
    ],
    failureModes: [
      "Malformed JSON",
      "Missing required fields",
      "Wrong type for a field",
      "Schema-valid but semantically invalid (e.g. negative weight)",
      "Contradictory constraints that each pass validation",
    ],
    resources: [
      { id: "d4r1", title: "Structured outputs", source: "OpenAI docs", url: "https://platform.openai.com/docs/guides/structured-outputs", estimatedMinutes: 12, why: "How to force schema-conformant output and why it's not the whole story.", tier: "core" },
      { id: "d4r2", title: "Increase output consistency (JSON mode / tools)", source: "Anthropic docs", url: "https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency", estimatedMinutes: 10, why: "Techniques for reliable structured output from Claude.", tier: "optional" },
    ],
    buildId: "build-4",
    assessmentId: "assess-4",
    assessmentSize: 8,
    conceptIds: ["structured-output", "schema-validation", "business-validation", "malformed-output"],
  },
  {
    id: "day-5",
    dayNumber: 5,
    title: "State, Memory & Orchestration",
    description:
      "How information moves across the steps of a workflow, the difference between state and memory, and the shapes of orchestration: sequential, parallel, conditional.",
    estimatedMinutes: 22,
    learningObjectives: [
      { id: "d5o1", text: "Define state and distinguish it from memory." },
      { id: "d5o2", text: "Describe sequential, parallel, and conditional workflows." },
      { id: "d5o3", text: "Explain state passing between steps." },
      { id: "d5o4", text: "Reason about retries and termination conditions." },
    ],
    concepts: [
      { concept: "State", what: "The information a workflow needs to carry from one step to the next during a single run.", why: "Losing or corrupting state is a top source of multi-step bugs.", misconception: "That state and memory are the same thing." },
      { concept: "Memory", what: "Information retained beyond the immediate step/context — across turns or runs.", why: "Not every agent needs persistent memory; adding it prematurely adds complexity.", misconception: "That every agent must have long-term memory." },
      { concept: "Orchestration", what: "The control logic deciding order: sequential (A→B→C), parallel (A,B together), or conditional (branch on a value).", why: "Choosing the right shape controls latency, cost, and correctness.", misconception: "That everything must be sequential." },
      { concept: "Retries & termination", what: "Bounded retry logic and explicit stopping conditions.", why: "Without them, workflows hang or loop forever.", misconception: "That retries are always safe — unbounded retries amplify failures and cost." },
    ],
    failureModes: [
      "Corrupted or lost state between steps",
      "Race conditions in parallel branches",
      "A failed branch left unhandled",
      "Infinite loop with no termination",
      "Termination condition never met",
    ],
    resources: [
      { id: "d5r1", title: "LangGraph: low-level concepts (state, nodes, edges)", source: "LangChain docs", url: "https://langchain-ai.github.io/langgraph/concepts/low_level/", estimatedMinutes: 15, why: "The clearest model of explicit state and orchestration as a graph.", tier: "core" },
      { id: "d5r2", title: "Workflows and agents", source: "Anthropic (Building effective agents)", url: "https://www.anthropic.com/engineering/building-effective-agents", section: "Workflows", estimatedMinutes: 10, why: "Sequential vs parallel vs routing patterns explained plainly.", tier: "optional" },
    ],
    buildId: "build-5",
    assessmentId: "assess-5",
    assessmentSize: 8,
    conceptIds: ["agent-state", "memory", "orchestration", "termination"],
  },
  {
    id: "day-6",
    dayNumber: 6,
    title: "Multi-Agent Systems",
    description:
      "When multiple specialized agents beat one, how they coordinate and disagree, and the real costs — latency, money, complexity — that make multi-agent a last resort, not a default.",
    estimatedMinutes: 22,
    learningObjectives: [
      { id: "d6o1", text: "Explain what multiple agents can add: specialization, parallelism, criticism." },
      { id: "d6o2", text: "Describe coordination, shared state, and aggregation." },
      { id: "d6o3", text: "Handle conflict between agents without silently averaging." },
      { id: "d6o4", text: "Weigh latency, cost, and complexity of multi-agent designs." },
      { id: "d6o5", text: "Decide when NOT to use multiple agents." },
    ],
    concepts: [
      { concept: "Multi-agent value", what: "Separate agents with distinct roles can specialize, work in parallel, and critique each other.", why: "Specialization and independent perspectives can raise quality.", misconception: "That more agents always means better results." },
      { concept: "Coordination", what: "Sharing state and combining outputs across agents.", why: "Poor coordination produces inconsistent or duplicated work.", misconception: "That agents self-organize without an aggregation strategy." },
      { concept: "Conflict & aggregation", what: "When agents disagree, the system must surface or reconcile the conflict deliberately.", why: "Silent averaging hides important disagreement.", misconception: "That you should always blend agent outputs into one number." },
      { concept: "When NOT to use multiple agents", what: "If a single agent or workflow suffices, multiple agents just add latency, cost, and coordination failure.", why: "Complexity should be justified by value.", misconception: "That multi-agent is a sign of sophistication." },
    ],
    failureModes: [
      "Redundant agents doing the same work",
      "Conflicting outputs with no reconciliation",
      "Communication / coordination overhead",
      "Latency multiplied across agents",
      "Cost multiplied across agents",
      "Coordination failure / deadlock",
    ],
    resources: [
      { id: "d6r1", title: "How we built a multi-agent research system", source: "Anthropic", url: "https://www.anthropic.com/engineering/multi-agent-research-system", estimatedMinutes: 18, why: "A real multi-agent system with honest discussion of costs and coordination.", tier: "core" },
      { id: "d6r2", title: "CrewAI concepts (agents, tasks, crews)", source: "CrewAI docs", url: "https://docs.crewai.com/concepts/agents", estimatedMinutes: 12, why: "A framework's take on roles, coordination, and aggregation.", tier: "optional" },
    ],
    buildId: "build-6",
    assessmentId: "assess-6",
    assessmentSize: 8,
    conceptIds: ["multi-agent-value", "agent-coordination", "agent-conflict", "multi-agent-cost", "when-not-multi"],
  },
  {
    id: "day-7",
    dayNumber: 7,
    title: "Frameworks & Fetch / uAgents",
    description:
      "A conceptual tour of the major agent frameworks (not mastery of each), then a focused look at Fetch's uAgents: identity, addresses, messages, and protocols.",
    estimatedMinutes: 22,
    learningObjectives: [
      { id: "d7o1", text: "Compare LangGraph, CrewAI, OpenAI Agents SDK, Google ADK conceptually." },
      { id: "d7o2", text: "Explain uAgent identity and addresses." },
      { id: "d7o3", text: "Describe messages and protocols between agents." },
      { id: "d7o4", text: "Know what Agentverse is for at a high level." },
    ],
    concepts: [
      { concept: "Framework tradeoffs", what: "LangGraph = explicit stateful graphs; CrewAI = role/crew abstraction; OpenAI Agents SDK = lightweight loop+handoffs; Google ADK = Google-ecosystem agents.", why: "Choosing a framework is choosing a way to express state, tools, and control flow.", misconception: "That you must master every framework. Grasp the axes: orchestration, tools, state, communication." },
      { concept: "uAgent identity & addresses", what: "Each uAgent has a cryptographic identity and an address other agents use to reach it.", why: "Addressing is how decentralized agents find and message each other.", misconception: "That agents communicate by function call — here it's message passing to addresses." },
      { concept: "Agent messaging & protocols", what: "uAgents exchange typed messages, optionally organized into protocols defining message flows.", why: "Protocols make inter-agent communication predictable and discoverable.", misconception: "That messaging is unstructured text — it's typed models." },
    ],
    failureModes: [
      "Choosing a heavyweight framework for a trivial task",
      "Message model mismatch between agents",
      "Wrong / unknown recipient address",
      "No protocol → brittle ad-hoc messaging",
    ],
    resources: [
      { id: "d7r1", title: "Fetch.ai documentation", source: "Fetch.ai", url: "https://fetch.ai/docs", estimatedMinutes: 12, why: "Entry point for Fetch concepts and the uAgents ecosystem.", tier: "optional" },
      { id: "d7r2", title: "uAgents documentation", source: "Fetch.ai", url: "https://uagents.fetch.ai/docs", estimatedMinutes: 15, why: "Identity, addresses, messages, and protocols — the Day 7 build depends on this.", tier: "core" },
      { id: "d7r3", title: "Agentverse", source: "Fetch.ai", url: "https://agentverse.ai/", estimatedMinutes: 8, why: "Where uAgents can be hosted and discovered.", tier: "optional" },
      { id: "d7r4", title: "LangGraph vs CrewAI (concepts only)", source: "LangChain / CrewAI docs", url: "https://langchain-ai.github.io/langgraph/concepts/high_level/", estimatedMinutes: 10, why: "Compare orchestration philosophies at a high level.", tier: "optional" },
    ],
    buildId: "build-7",
    assessmentId: "assess-7",
    assessmentSize: 8,
    conceptIds: ["framework-tradeoffs", "uagents-identity", "agent-messaging"],
  },
  {
    id: "day-8",
    dayNumber: 8,
    title: "Agents × SwarmFolio (Deterministic Verification)",
    description:
      "The heart of the project: probabilistic AI reasoning forced to answer to a deterministic feasibility check, with a quantified conflict fed back so the agent can revise.",
    estimatedMinutes: 22,
    learningObjectives: [
      { id: "d8o1", text: "Contrast probabilistic reasoning with deterministic computation." },
      { id: "d8o2", text: "Detect infeasibility and quantify a constraint conflict." },
      { id: "d8o3", text: "Feed a deterministic result back into an agent for revision." },
      { id: "d8o4", text: "Explain why deterministic verification matters for trustworthy AI." },
    ],
    concepts: [
      { concept: "Probabilistic vs deterministic", what: "LLMs produce plausible outputs with variance; feasibility checks and math are exact and repeatable.", why: "Putting a deterministic check after the model is how you force claims to answer to reality.", misconception: "That a confident LLM answer is a verified answer." },
      { concept: "Feasibility & infeasibility", what: "Some constraint sets admit no solution (Tech≥40% and Tech≤25%). A good system says so instead of faking an answer.", why: "Silent best-effort answers to impossible problems are dangerous.", misconception: "That the optimizer should always return 'a' portfolio." },
      { concept: "Conflict detection", what: "Identifying which constraints conflict and by how much (a 15-percentage-point gap).", why: "Quantified conflicts give the agent something concrete to revise.", misconception: "That reporting 'infeasible' is enough — you must localize and quantify it." },
      { concept: "Feedback loop & revision", what: "The conflict explanation is fed back so the agent can relax or drop a constraint and rerun.", why: "This closes the claim→test→evidence→revision loop.", misconception: "That the agent should re-guess blindly rather than use the checker's output." },
    ],
    failureModes: [
      "Returning a fabricated 'best-effort' answer to an impossible problem",
      "Reporting infeasible without localizing the conflict",
      "Not quantifying the conflict magnitude",
      "Revising without using the deterministic feedback",
      "Putting the LLM inside the deterministic check",
    ],
    resources: [
      { id: "d8r1", title: "Building effective agents (evaluator/optimizer loop)", source: "Anthropic", url: "https://www.anthropic.com/engineering/building-effective-agents", section: "Evaluator-optimizer", estimatedMinutes: 10, why: "The generate → check → revise pattern this whole day is built on.", tier: "core" },
      { id: "d8r2", title: "Tool use for verification", source: "Anthropic docs", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", estimatedMinutes: 10, why: "Wiring a deterministic checker as a tool the agent must answer to.", tier: "optional" },
    ],
    buildId: "build-8",
    assessmentId: "assess-8",
    assessmentSize: 8,
    conceptIds: ["prob-vs-det", "feasibility", "conflict-detection", "feedback-loop", "deterministic-verification"],
  },
  {
    id: "day-9",
    dayNumber: 9,
    title: "Mastery & System Design",
    description:
      "No new technical content. Review everything, take the comprehensive assessment, then design the full AI Investment Committee as an architecture artifact.",
    estimatedMinutes: 25,
    learningObjectives: [
      { id: "d9o1", text: "Demonstrate integrated understanding across all eight topics." },
      { id: "d9o2", text: "Reason about failure modes end to end." },
      { id: "d9o3", text: "Design a multi-agent system with a deterministic verification boundary." },
    ],
    concepts: [
      { concept: "Synthesis", what: "Comprehensive review across agents, tools, RAG, structured output, state, multi-agent, frameworks, and verification.", why: "Integration is where real understanding shows.", misconception: "That mastering topics separately means you can assemble them." },
    ],
    failureModes: [
      "Knowing pieces but unable to connect them",
      "Designing complexity that isn't justified",
      "Omitting the deterministic verification boundary",
    ],
    resources: [
      { id: "d9r1", title: "Building effective agents (full)", source: "Anthropic", url: "https://www.anthropic.com/engineering/building-effective-agents", estimatedMinutes: 20, why: "Re-read as a capstone; it ties every pattern together.", tier: "core" },
    ],
    buildId: "build-9",
    assessmentId: "assess-9",
    assessmentSize: 20,
    conceptIds: [], // day 9 samples across all days
  },
];

export const dayById = (id: string) => DAYS.find((d) => d.id === id)!;
export const dayByNumber = (n: number) => DAYS.find((d) => d.dayNumber === n)!;
export const TOTAL_DAYS = DAYS.length;
