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
    description: "A modular agent system designed to coordinate reasoning, memory, and execution across tasks.",
    subtitle: "System intelligence layer.",
    tagline:
      "Most AI products fail not because of models, but because of orchestration.",
    details:
      "Archon is a modular agent system designed to coordinate reasoning, memory, and execution across tasks, enabling reliable production AI behavior.",
    overview: {
      headline: "Architecture Intent",
      content:
        "Archon provides the coordination layer that sits between raw LLM capability and production reliability: structured tool routing, persistent memory, and feedback-driven execution."
    },
    narrative: {
      context:
        "AI products built on single-prompt chains break under real-world complexity. Reliability requires orchestration, not just better models.",
      decision:
        "We designed a multi-agent framework with explicit tool routing, execution graphs, and memory persistence, treating coordination as the core product.",
      outcome:
        "Agent workflows became composable and debuggable: each task flows through a defined execution graph with clear reasoning traces and feedback loops.",
      impact:
        "Production AI systems built on Archon ship faster and fail less because the orchestration layer absorbs complexity that would otherwise leak into application code."
    },
    techStack: [
      {
        name: "Multi-Agent System",
        description: "Composable agent coordination with role-based dispatch",
        icon: "brain"
      },
      {
        name: "Memory Layer",
        description: "Persistent context and state across agent interactions",
        icon: "brain"
      },
      {
        name: "Tool Routing",
        description: "Structured tool selection and execution management",
        icon: "receipt"
      },
      {
        name: "Execution Graph",
        description: "Directed task flows with reasoning traces",
        icon: "cloud"
      },
      {
        name: "Feedback Loop",
        description: "Self-correction and output validation pipeline",
        icon: "microphone"
      }
    ],
    philosophical:
      "Intelligence is not the model. It is the system around it.",
    featured: true
  },
  {
    id: 3,
    title: "Robinhood Performance Dashboard",
    slug: "robinhood-performance",
    subtitle: "Execution Log / Performance System",
    tagline: "Turning messy behavioral outcomes into structured feedback loops.",
    description: "A decision-quality system designed to measure execution quality under uncertainty.",
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
