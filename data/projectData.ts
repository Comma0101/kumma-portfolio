export interface TechStack {
  name: string;
  description: string;
  icon: string;
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
  overview?: {
    headline: string;
    content: string;
  };
  narrative?: NarrativeArc;
  techStack?: TechStack[];
  philosophical?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  websiteUrl?: string;
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
    featured: true
  },
  {
    id: 2,
    title: "ARCHON",
    slug: "archon",
    description:
      "A personal AI orchestration layer that coordinates models, tools, memory, and context into one inspectable system.",
    subtitle: "A personal operating intelligence.",
    tagline:
      "Most AI products fail not on the model, but on orchestration.",
    details:
      "Archon is an evolving personal orchestration layer: it routes between local and cloud models, executes tools, keeps persistent memory and context, and stays inspectable under human supervision.",
    overview: {
      headline: "What Archon is",
      content:
        "Archon is active research into a persistent intelligence layer that connects projects, data, tasks, and decisions. It coordinates model routing, tool execution, memory, and personal context rather than wrapping a single chat call."
    },
    narrative: {
      context:
        "Single-prompt chains break under real work. Reliability comes from orchestration, memory, and the ability to inspect what the system did, not from a bigger model.",
      decision:
        "Build a coordination layer: route between local models (Ollama, GGUF) and cloud models (OpenAI, Claude, Gemini) via LiteLLM, execute tools, persist memory and context, and keep every run traceable.",
      outcome:
        "Workflows became composable and debuggable. Tasks flow through defined steps with reasoning traces, cost and token awareness, and human checkpoints.",
      impact:
        "A foundation for autonomous but inspectable personal systems, where the orchestration absorbs complexity instead of leaking it into every app."
    },
    techStack: [
      {
        name: "Model routing",
        description: "LiteLLM across local (Ollama, GGUF) and cloud (OpenAI, Claude, Gemini)",
        icon: "brain"
      },
      {
        name: "Memory and context",
        description: "Persistent state and personal context across runs, with context compression",
        icon: "brain"
      },
      {
        name: "Tool execution",
        description: "Structured tool calls and Google service integrations",
        icon: "receipt"
      },
      {
        name: "Inspectable execution",
        description: "Reasoning traces, cost and token accounting, human checkpoints",
        icon: "cloud"
      },
      {
        name: "Local and cloud",
        description: "Runs open models locally and falls up to cloud when needed",
        icon: "globe"
      }
    ],
    philosophical:
      "Intelligence is not the model. It is the system around it.",
    featured: true
  },
  {
    id: 3,
    title: "Market Systems",
    slug: "market-systems",
    subtitle: "Decision architecture under uncertainty.",
    tagline: "Insight is not enough. A system is only real when it stays executable under pressure.",
    description: "A decision-quality system that treats markets as a real-time system of risk, latency, and feedback.",
    details: "This system aggregates trading logs, behavioral data, and execution outcomes to create a disciplined performance feedback infrastructure. It frames chaotic financial data as a structured behavioral dashboard.",
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
        name: "Data Aggregation",
        description: "Automated ingestion of execution logs and portfolio metrics",
        icon: "cloud"
      },
      {
        name: "Behavioral Analytics",
        description: "Categorization engine for conviction and error tracking",
        icon: "brain"
      },
      {
        name: "Performance Interface",
        description: "Visualization layer prioritizing decision quality over noise",
        icon: "globe"
      }
    ],
    philosophical: "A system is only as good as the feedback loop it generates.",
    featured: true
  }
];
