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
    title: "Serviio",
    slug: "serviio",
    description: "A voice ordering system that turns live calls into structured restaurant orders.",
    subtitle: "Conversation as infrastructure.",
    tagline:
      "Where speech becomes structure, and every call moves from noise to clarity.",
    details:
      "Serviio is a real-time voice interface for restaurants: it listens, reasons, and commits orders to the POS without forcing teams to stay glued to the phone.",
    overview: {
      headline: "System Overview",
      content:
        "Serviio unifies telephony streaming, speech-to-text, intent extraction, and POS sync into one production flow designed for peak-hour reliability."
    },
    narrative: {
      context:
        "Independent restaurants were losing orders whenever phone lines spiked and staff had to choose between in-person service and incoming calls.",
      decision:
        "We designed a voice-first pipeline that captures raw speech, resolves intent in structured JSON, and validates menu logic before writing to the POS.",
      outcome:
        "Call handling became consistent: the system can guide customers, confirm modifiers, and hand off complete tickets in seconds rather than minutes.",
      impact:
        "The team spends less effort on repetitive calls and more attention on hospitality where it matters most."
    },
    techStack: [
      {
        name: "Realtime Voice Engine",
        description: "Twilio streaming + Deepgram Nova-2 STT",
        icon: "microphone"
      },
      {
        name: "LLM Integration",
        description: "Structured JSON intent extraction via GPT-4 Realtime",
        icon: "brain"
      },
      {
        name: "Multilingual Support",
        description: "English ↔ Mandarin auto detection",
        icon: "globe"
      },
      {
        name: "Order Sync",
        description: "Square API for live POS orders",
        icon: "receipt"
      },
      {
        name: "Deployment",
        description: "GKE + Cloud SQL + S3 logging pipeline",
        icon: "cloud"
      }
    ],
    philosophical:
      "Serviio began with one belief: if software can listen well, it can serve with more care.",
    websiteUrl: "https://www.serviio.ai/",
    featured: true
  },
  {
    id: 2,
    title: "Pulseboard",
    slug: "project-two",
    subtitle: "Metrics that read like a story.",
    tagline:
      "A decision surface for creative teams that need signal, not noise.",
    description:
      "A narrative analytics workspace that reframes dashboards as sequences of decisions.",
    details:
      "Pulseboard helps product and creative teams move from fragmented charts to clear weekly narratives about what changed, why it changed, and what to ship next.",
    overview: {
      headline: "Product Intent",
      content:
        "Instead of presenting every metric equally, Pulseboard prioritizes trend context and recommended actions through a concise editorial layer."
    },
    narrative: {
      context:
        "Teams were drowning in analytics panels yet still debating the same questions every week because no shared narrative existed.",
      decision:
        "We introduced chapter-based reporting: every data view is tied to an interpretation prompt and a required decision owner.",
      outcome:
        "Review meetings shifted from status recaps to directional calls, with less time spent hunting for relevance across disconnected charts.",
      impact:
        "The product cadence improved because teams could align faster on what to continue, revise, or sunset."
    },
    techStack: [
      {
        name: "Narrative Layer",
        description: "Prompted synthesis for weekly insight summaries",
        icon: "brain"
      },
      {
        name: "Cross-Team Views",
        description: "Shared project rooms with role-scoped perspectives",
        icon: "globe"
      },
      {
        name: "Decision Ledger",
        description: "Structured decision logs with owner and due date",
        icon: "receipt"
      },
      {
        name: "Data Infrastructure",
        description: "Streaming events into cloud-first reporting tables",
        icon: "cloud"
      }
    ],
    philosophical:
      "Good analytics should reduce anxiety, not increase it. Pulseboard turns numbers into shared direction.",
    featured: true
  },
  {
    id: 3,
    title: "Quiet Atlas",
    slug: "project-three",
    subtitle: "An archive designed for contemplation.",
    tagline:
      "A reading experience where essays, visuals, and navigation move at human pace.",
    description:
      "An experimental publishing platform for long-form essays and visual fragments.",
    details:
      "Quiet Atlas is a reflective reading environment where content is organized as thematic paths instead of blog feeds, allowing slower and deeper exploration.",
    overview: {
      headline: "Experience Design",
      content:
        "The interface uses restrained motion, strong typography, and guided pathways so readers can stay immersed across text, image, and ambient interaction."
    },
    narrative: {
      context:
        "Traditional content feeds optimize for volume and recency, which made nuanced essays feel disposable after publication.",
      decision:
        "We structured the platform as an atlas of themes, with intentional pacing cues and progressive disclosure rather than infinite scroll.",
      outcome:
        "Readers spend longer with each piece, navigate by curiosity instead of chronology, and revisit essays as connected chapters.",
      impact:
        "The archive functions as a living body of thought instead of a timeline of forgotten posts."
    },
    techStack: [
      {
        name: "Editorial Engine",
        description: "Theme-based content graph for non-linear reading paths",
        icon: "brain"
      },
      {
        name: "Multilingual Publishing",
        description: "Parallel language routes with synchronized slugs",
        icon: "globe"
      },
      {
        name: "Reading Telemetry",
        description: "Session depth, revisit rate, and chapter completion signals",
        icon: "receipt"
      },
      {
        name: "Delivery Stack",
        description: "Static-first deploy strategy with edge-friendly assets",
        icon: "cloud"
      }
    ],
    philosophical:
      "Quiet Atlas treats reading as an encounter, not a transaction."
  },
];
