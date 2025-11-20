export interface TechStack {
  name: string;
  description: string;
  icon: string;
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
    description: "An AI-driven voice ordering system built for restaurants.",
    subtitle: "The voice that understands your customers.",
    tagline: "Where speech becomes structure, and interaction becomes experience.",
    details: "Serviio is a real-time AI voice ordering system that transforms phone conversations into structured restaurant orders. Built with cutting-edge speech recognition and natural language processing.",
    overview: {
      headline: "Technical Breakdown",
      content: "Serviio connects real-time speech recognition, LLM reasoning, and live POS integration into one seamless voice agent — designed for restaurants that want to serve faster without losing the human touch."
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
    philosophical: "Serviio began as an idea: that code could listen. That conversation itself could become an interface. It's not automation — it's empathy, engineered.",
    demoUrl: "#",
    caseStudyUrl: "#",
    websiteUrl: "https://www.serviio.ai/",
    featured: true
  },
  {
    id: 2,
    title: "Project Two",
    slug: "project-two",
    subtitle: "Motion as Language",
    description: "An exploration of motion as a design language — translating user intent into fluid, meaningful interaction.",
    details: "More detailed information about Project Two, including the technologies used, challenges faced, and the outcome.",
  },
  {
    id: 3,
    title: "Project Three",
    slug: "project-three",
    subtitle: "Philosophy in Code",
    description: "Where contemplation meets computation — a space for ideas to breathe between logic and poetry.",
    details: "More detailed information about Project Three, including the technologies used, challenges faced, and the outcome.",
  },
];
