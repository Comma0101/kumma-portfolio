export interface TechStack {
  name: string;
  description: string;
  icon: string;
}

// Proof shown high on the page and on the home cards.
// These are system ATTRIBUTES / architecture facts (e.g. "Real-time",
// "3 models", "Rules enforced"), NOT measured performance metrics. Keep that
// distinction honest: never present an attribute as a benchmark.
// Add real measured numbers only when verified (KOTA: median latency, calls
// handled, concurrent sessions; ARCHON: GitHub stars, and only if the repo is
// public and the count is meaningful). An unverifiable number is worse than an
// honest fact.
export interface Metric {
  value: string;
  label: string;
  accent?: boolean;
}

export interface NarrativeArc {
  context: string;
  decision: string;
  outcome: string;
  impact?: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  details: string;
  subtitle?: string;
  tagline?: string;
  outcome?: string;
  overview?: {
    headline: string;
    content: string;
  };
  narrative?: NarrativeArc;
  techStack?: TechStack[];
  philosophical?: string;
  metrics?: Metric[];
  demoUrl?: string;
  caseStudyUrl?: string;
  websiteUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "KOTA",
    slug: "kota",
    description: "A voice-first AI system that captures real-time calls, resolves intent into structured actions, and integrates directly into kitchen workflows.",
    subtitle: "Conversation as infrastructure.",
    tagline:
      "Restaurants don't need more apps. They need fewer missed orders.",
    outcome:
      "Turns restaurant phone calls into structured, actionable orders without requiring the restaurant to replace or deeply integrate its POS.",
    details:
      "KOTA replaces manual phone handling with a real-time voice agent that listens, structures, and executes orders directly into kitchen workflows without requiring a POS dependency.",
    overview: {
      headline: "System Overview",
      content:
        "KOTA unifies telephony streaming, real-time speech recognition, LLM-driven intent resolution, and menu grounding into one production flow designed for peak-hour reliability."
    },
    narrative: {
      context:
        "Independent restaurants lose orders when phone volume exceeds staff capacity. Existing solutions force POS lock-in or require workflow rewrites.",
      decision:
        "We designed a voice-first pipeline that captures raw speech, resolves intent through menu-grounded LLM orchestration, and executes structured orders directly into kitchen workflows.",
      outcome:
        "Call handling became autonomous: the system guides customers, confirms modifiers, and commits complete order tickets in seconds with no staff intervention required.",
      impact:
        "Restaurants reclaim service bandwidth without adopting new hardware or changing how their kitchen operates."
    },
    techStack: [
      {
        name: "Voice Agent Infrastructure",
        description: "Real-time telephony streaming with speech capture",
        icon: "microphone"
      },
      {
        name: "Real-time Speech",
        description: "Deepgram Nova-2 for low-latency transcription",
        icon: "brain"
      },
      {
        name: "LLM Orchestration",
        description: "Structured intent extraction with menu grounding",
        icon: "brain"
      },
      {
        name: "Menu Grounding System",
        description: "Dynamic menu intelligence for accurate order resolution",
        icon: "receipt"
      },
      {
        name: "Order Execution Layer",
        description: "Direct kitchen workflow integration without POS dependency",
        icon: "cloud"
      }
    ],
    philosophical:
      "If software can listen in real time, it can operate in real time.",
    metrics: [
      { value: "Live", label: "product site", accent: true },
      { value: "Real-time", label: "speech to order" },
      { value: "POS-independent", label: "no replacement" },
    ],
    websiteUrl: "https://kota.kummalabs.com",
    featured: true
  },
  {
    id: 2,
    title: "ARCHON",
    slug: "archon",
    description:
      "A lightweight, self-aware AI agent that orchestrates models, tools, memory, and other coding agents through one inspectable control plane.",
    subtitle: "A self-aware personal agent.",
    tagline:
      "Most AI products fail not on the model, but on orchestration.",
    outcome:
      "Unifies multiple AI models and coding agents into one orchestration layer for real development workflows.",
    details:
      "Archon is a personal AI agent (Python, CLI-first) that coordinates Claude, GPT, and Gemini, runs a deep tool layer over the filesystem, web, and MCP servers, keeps compressed long-term memory, and delegates real work to coding-agent workers like Claude Code, Codex, and OpenCode through a router. It reaches the operator through the terminal, Telegram with human approvals, voice, and phone calls.",
    overview: {
      headline: "What Archon is",
      content:
        "Archon is an evolving, self-aware personal agent: a control plane that plans, routes, executes, and recovers across providers and tools, with persistent memory, context compression, usage accounting, and human approval built in, rather than a single chat wrapper."
    },
    narrative: {
      context:
        "Single-prompt chat wrappers break on real, multi-step work. Reliability comes from orchestration, memory, and the ability to inspect and approve what the agent did, not from a bigger model.",
      decision:
        "Build a lightweight control plane in Python: route across Claude, GPT, and Gemini, expose tools over the filesystem, web, and MCP, persist compressed memory, and delegate heavy tasks to coding-agent workers (Claude Code, Codex, OpenCode) through a worker router, with policy and human approval as first-class.",
      outcome:
        "Work flows through sessions, jobs, and turns with reasoning traces, redaction, and usage tracking. Archon reaches the operator on the terminal, Telegram, voice, and live phone calls, and runs its own news and deep-research pipelines.",
      impact:
        "A foundation for autonomous but inspectable personal systems, where orchestration, memory, and recovery absorb the complexity that would otherwise leak into every task."
    },
    techStack: [
      {
        name: "Model layer",
        description: "Anthropic Claude, OpenAI, and Google Gemini behind one agent",
        icon: "brain"
      },
      {
        name: "Control plane",
        description: "Orchestrator, policy, sessions, and jobs over execution turns",
        icon: "cloud"
      },
      {
        name: "Worker delegation",
        description: "Routes heavy tasks to coding agents: Claude Code, Codex, OpenCode",
        icon: "cloud"
      },
      {
        name: "Tools and MCP",
        description: "Filesystem, web read and search, content, and Model Context Protocol tools",
        icon: "receipt"
      },
      {
        name: "Memory and context",
        description: "Persistent memory with context compression, distillation, and usage accounting",
        icon: "brain"
      },
      {
        name: "Channels",
        description: "Terminal REPL, Telegram with approvals, voice (STT and TTS), and Twilio calls",
        icon: "microphone"
      },
      {
        name: "Safety",
        description: "Redaction, policy guardrails, and human approval gates",
        icon: "globe"
      }
    ],
    philosophical:
      "Intelligence is not the model. It is the system around it.",
    metrics: [
      { value: "3", label: "models orchestrated" },
      { value: "3", label: "coding agents delegated" },
      { value: "Open", label: "source, self-hostable", accent: true },
    ],
    repoUrl: "https://github.com/Comma0101/archon",
    featured: true
  },
  {
    id: 3,
    title: "Market Systems",
    slug: "market-systems",
    subtitle: "Decision architecture under uncertainty.",
    tagline: "Insight is not enough. A system is only real when it stays executable under pressure.",
    outcome:
      "Converts discretionary market reading into a rules-based MNQ/MES execution framework designed to prioritize process, risk control, and repeatability over daily P&L.",
    description: "A decision-quality system that treats markets as a real-time system of risk, latency, and feedback.",
    details: "Market Systems treats trading as a real-time decision problem: noisy, adversarial, and latency-bound. It spans market-structure research (liquidity, ICT and Smart Money Concepts, regime classification on MNQ and MES futures), Pine Script tooling, a decision journal, and risk rules enforced by the system, with a dashboard that scores execution quality over raw PnL.",
    overview: {
      headline: "System Intent",
      content: "Instead of simply displaying PnL, this dashboard quantifies decision quality, risk exposure, and behavioral patterns to enforce disciplined systems thinking in a stochastic environment."
    },
    narrative: {
      context: "Financial outcomes are noisy. Without a structured way to separate good decisions from lucky outcomes, performance plateaus.",
      decision: "I built a tracking infrastructure that transforms raw execution logs into visual behavioral insights, categorizing trades by setup, conviction, and error rate.",
      outcome: "It shifted the focus from absolute returns to execution discipline, creating a tight feedback loop that penalizes process deviations and rewards systematic thinking.",
      impact: "Proves that robust interfaces can bring clarity to high-stress, probabilistic environments."
    },
    techStack: [
      {
        name: "Market structure research",
        description: "Liquidity, ICT and Smart Money Concepts, regime classification across MNQ and MES futures",
        icon: "globe"
      },
      {
        name: "Execution analytics",
        description: "Trades categorized by setup, conviction, and error rate, not just PnL",
        icon: "brain"
      },
      {
        name: "Risk architecture",
        description: "Position and risk constraints enforced as system rules, not willpower",
        icon: "receipt"
      },
      {
        name: "Pine Script systems",
        description: "Indicators and alerts for setup detection and process tracking",
        icon: "cloud"
      },
      {
        name: "Decision journal",
        description: "Structured logging of context, thesis, and outcome for every trade",
        icon: "brain"
      },
      {
        name: "Performance interface",
        description: "Dashboards that prioritize decision quality and feedback over raw PnL",
        icon: "globe"
      }
    ],
    philosophical: "A system is only as good as the feedback loop it generates.",
    metrics: [
      { value: "MNQ · MES", label: "futures studied" },
      { value: "Decisions", label: "scored over PnL", accent: true },
      { value: "Rules", label: "enforced by the system" },
    ],
    featured: true
  }
];
