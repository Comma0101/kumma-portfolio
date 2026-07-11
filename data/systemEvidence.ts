export type EvidenceKind = "live" | "open-source" | "artifact" | "workflow";

export interface SystemEvidence {
  slug: "kota" | "archon" | "benchmark" | "field-notes";
  label: string;
  status: string;
  signal: string;
  input: string;
  transform: string;
  output: string;
  guardrail: string;
  kind: EvidenceKind;
  href: string;
  external?: boolean;
}

export const systemEvidence: SystemEvidence[] = [
  {
    slug: "kota",
    label: "KOTA",
    status: "live voice system",
    signal: "call -> order",
    input: "messy restaurant phone speech",
    transform: "streaming STT, menu grounding, confidence loop",
    output: "kitchen-ready order ticket",
    guardrail: "clarifies ambiguity before commit",
    kind: "live",
    href: "/work/kota",
  },
  {
    slug: "archon",
    label: "ARCHON",
    status: "open-source control plane",
    signal: "route -> worker",
    input: "multi-step development task",
    transform: "model routing, tools, memory, human approvals",
    output: "inspectable agent work session",
    guardrail: "trace, policy, recovery",
    kind: "open-source",
    href: "/work/archon",
  },
  {
    slug: "benchmark",
    label: "Voice stress suite",
    status: "open eval suite",
    signal: "scenario -> score",
    input: "50 hard call scenarios",
    transform: "rubric scoring, downloadable audio",
    output: "published scores, warts included",
    guardrail: "no unmeasured numbers",
    kind: "open-source",
    href: "/benchmark",
  },
  {
    slug: "field-notes",
    label: "Field Notes",
    status: "engineering notes",
    signal: "build -> explain",
    input: "system implementation",
    transform: "technical narrative and design reasoning",
    output: "reusable operating insight",
    guardrail: "no fabricated metrics",
    kind: "artifact",
    href: "/blog",
  },
];
