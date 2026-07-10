export interface Chapter {
  no: string;
  title: string;
  href: string;
  blurb: string;
  tags: string[];
  layout: "feature" | "flip" | "band" | "strip";
  secondary?: { label: string; href: string };
  images?: string[];
  evidence?: {
    input: string;
    transform: string;
    output: string;
    guardrail: string;
  };
  artifact?: string;
}

export const chapters: Chapter[] = [
  {
    no: "01",
    title: "KOTA",
    href: "/work/kota",
    layout: "feature",
    blurb:
      "Turns restaurant phone calls into structured, actionable orders without requiring the restaurant to replace or deeply integrate its POS.",
    tags: ["real-time voice", "LLM orchestration", "menu grounding"],
    secondary: { label: "Call the line →", href: "/call" },
    evidence: {
      input: "messy phone speech",
      transform: "streaming STT + menu grounding",
      output: "kitchen-ready order",
      guardrail: "clarify before commit",
    },
    artifact: "live voice/order flow",
  },
  {
    no: "02",
    title: "ARCHON",
    href: "/work/archon",
    layout: "flip",
    blurb:
      "Unifies multiple AI models and coding agents into one orchestration layer for real development workflows.",
    tags: ["orchestration", "coding workers", "active R&D"],
    evidence: {
      input: "multi-step dev task",
      transform: "models + tools + workers",
      output: "inspectable agent session",
      guardrail: "trace, policy, recovery",
    },
    artifact: "open-source control plane",
  },
  {
    no: "03",
    title: "Latency report",
    href: "/latency",
    layout: "band",
    blurb:
      "A monthly measurement of turn latency, barge-in response, and call setup across the major hosted voice stacks. Fixed methodology, raw CSV with every report. First report in progress.",
    tags: ["latency", "methodology", "monthly"],
    secondary: { label: "Stress suite →", href: "/benchmark" },
    evidence: {
      input: "scripted calls across hosted stacks",
      transform: "identical prompts, fixed methodology",
      output: "p50 / p95 turn latency, raw CSV",
      guardrail: "no unmeasured numbers",
    },
    artifact: "monthly public report",
  },
];
