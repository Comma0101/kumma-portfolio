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
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Servio",
    slug: "servio",
    description: "An AI-driven voice ordering system built for restaurants.",
    subtitle: "The Voice That Takes Your Order",
    tagline: "Where speech becomes structure, and interaction becomes experience.",
    details: "Servio is a real-time AI voice ordering system that transforms phone conversations into structured restaurant orders. Built with cutting-edge speech recognition and natural language processing.",
    overview: {
      headline: "Built to Listen, Learn, and Serve.",
      content: "Servio bridges real-world hospitality with real-time AI. Powered by Twilio, Deepgram, and OpenAI Realtime, it transforms every phone call into structured intent — turning human speech into live restaurant orders."
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
    philosophical: "Servio began as an idea: that code could listen. That conversation itself could become an interface. It's not automation — it's empathy, engineered.",
    demoUrl: "#",
    caseStudyUrl: "#",
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
