export const heroContent = {
  eyebrow: "Independent production AI systems practice · Los Angeles",
  title: "Build production AI without hidden failure at 3 hard boundaries.",
  titleEmphasis: "3 hard boundaries.",
  subtext:
    "I audit, design, and ship the system around the model—latency, grounding, tools, guardrails, recovery, and the workflow it must operate inside.",
  primaryCta: { label: "Start a project", href: "/contact" },
  secondaryCta: { label: "Hear the voice demo", href: "/call" },
  availability:
    "Available for focused audits, scoped builds, and ongoing advisory. Usually replies within a day.",
} as const;

export const productionBoundaries = [
  {
    label: "Latency",
    explanation:
      "The interaction must respond before the user or operator loses the thread.",
  },
  {
    label: "Ambiguity",
    explanation:
      "The system must know when to clarify, validate, or hand off before acting.",
  },
  {
    label: "Workflow",
    explanation:
      "Model output must become a correct, inspectable action inside a real process.",
  },
] as const;

export const engagements = [
  {
    title: "Production AI audit",
    when:
      "The demo works, but real inputs expose latency, ambiguity, grounding, integration, or recovery failures.",
    description:
      "A focused technical diagnosis of the boundary blocking a dependable production release.",
    deliverables: [
      "Failure-path and architecture review",
      "Latency, evaluation, and guardrail findings",
      "Prioritized remediation roadmap",
    ],
    cta: { label: "Discuss this engagement →", href: "/contact" },
  },
  {
    title: "Build engagement",
    when:
      "A difficult voice, orchestration, TTS, evaluation, or workflow system needs one accountable technical owner.",
    description:
      "A scoped implementation shaped around the operational constraint, existing stack, and handoff path.",
    deliverables: [
      "Production architecture and working system",
      "Tests, observability, and recovery behavior",
      "Documented handoff into the existing stack",
    ],
    cta: { label: "Discuss this engagement →", href: "/contact" },
  },
  {
    title: "Advisory",
    when:
      "The team is already building and needs recurring specialist judgment at a hard production-AI boundary.",
    description:
      "Ongoing architecture, evaluation, reliability, and implementation guidance tied to active delivery decisions.",
    deliverables: [
      "Architecture and failure-mode reviews",
      "Evaluation and reliability guidance",
      "Decision notes with concrete next actions",
    ],
    cta: { label: "Discuss this engagement →", href: "/contact" },
  },
] as const;

export const researchProof = [
  {
    label: "Benchmark",
    title: "Production AI stress suite",
    href: "/benchmark",
    status: "Open stress suite",
    summary:
      "Scenarios for testing latency, ambiguity, tool use, guardrails, and recovery under difficult inputs.",
  },
  {
    label: "Latency",
    title: "Real-time systems methodology",
    href: "/latency",
    status: "Report in progress",
    summary:
      "A methodology-first report for measuring the interaction budget across a real-time AI pipeline.",
  },
  {
    label: "Patterns",
    title: "Production reference library",
    href: "/patterns",
    status: "Reference library",
    summary:
      "Concrete patterns for clarification, validation, routing, handoff, observability, and recovery.",
  },
  {
    label: "Field Notes",
    title: "Build reasoning and implementation notes",
    href: "/blog",
    status: "Ongoing notes",
    summary:
      "Technical notes that expose the tradeoffs, experiments, and implementation choices behind the work.",
  },
] as const;

export const homeContent = {
  heroContent,
  productionBoundaries,
  engagements,
  researchProof,
} as const;
