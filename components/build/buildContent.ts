export interface UseCase {
  title: string;
  body: string;
}
export interface Step {
  no: string;
  title: string;
  body: string;
}
export interface Faq {
  q: string;
  a: string;
}
export interface ProofItem {
  name: string;
  body: string;
  href: string;
  linkLabel: string;
}

export const heroEyebrow = "AI agents for small business";
export const heroTitle = "Never miss another call, booking, or lead.";
export const heroSubtitle =
  "I build a custom AI agent that answers your calls, books appointments, follows up with leads, and handles the busywork. Built and run for you, without a tech team or a big budget.";
export const heroCtaLabel = "Book a free consult";
export const heroTrust =
  "You talk to the person who builds it, not a sales team.";

export const empathy =
  "Big companies have engineers building this for them. You have a business to run. That gap is what I close.";

export const useCasesHeading = "What I can build for you";
export const useCases: UseCase[] = [
  {
    title: "AI phone agent",
    body: "Answers every call 24/7, takes orders or books appointments, and never leaves a customer on hold.",
  },
  {
    title: "Customer support agent",
    body: "Replies to common questions on your site or chat instantly, day and night, in your voice.",
  },
  {
    title: "Booking & scheduling",
    body: "Turns calls and messages into confirmed appointments on your calendar, with reminders.",
  },
  {
    title: "Lead capture & follow-up",
    body: "Catches every inquiry and follows up automatically so hot leads never go cold.",
  },
  {
    title: "FAQ / knowledge agent",
    body: "Trained on your menus, policies, and docs, so customers get accurate answers without you.",
  },
  {
    title: "Back-office automation",
    body: "Handles the repetitive admin: data entry, summaries, routing, and reminders.",
  },
];
export const useCasesNote = "Not sure which? That is what the consult is for.";

export const proofHeading = "Real systems, not slideware";
export const proofItems: ProofItem[] = [
  {
    name: "KOTA",
    body: "A live voice AI agent that answers restaurant phone calls and turns them into kitchen-ready orders. Hear it for yourself.",
    href: "https://kota.kummalabs.com",
    linkLabel: "See KOTA live",
  },
  {
    name: "ARCHON",
    body: "An open-source engine that coordinates multiple AI models and agents. The serious systems work behind the agents I build.",
    href: "https://github.com/Comma0101/archon",
    linkLabel: "View ARCHON on GitHub",
  },
];

export const stepsHeading = "How it works";
export const steps: Step[] = [
  {
    no: "01",
    title: "Free consult",
    body: "A short call. Tell me the task that eats your time. I tell you straight whether an agent helps.",
  },
  {
    no: "02",
    title: "I scope and quote",
    body: "A clear, fixed quote built to your budget. No surprises, no jargon.",
  },
  {
    no: "03",
    title: "I build and run it",
    body: "I build it, set it up, and keep it running and improving. You manage nothing technical.",
  },
];

export const riskHeading = "Low risk by design";
export const riskReversal: string[] = [
  "Free consult, no obligation",
  "You own your data and accounts",
  "Your data is never used to train AI models",
  "Always a human (me) behind it",
  "Cancel anytime",
];

export const faqHeading = "Questions owners ask";
export const faqs: Faq[] = [
  {
    q: "Is my business too small for this?",
    a: "If you take calls, bookings, or repeat questions, an agent helps. Small is the point: you get enterprise tools without the enterprise team.",
  },
  {
    q: "How much does it cost?",
    a: "It depends on what you need, which is why the consult is free. I scope it to your budget and quote a fixed price before any work starts.",
  },
  {
    q: "Do I need technical staff?",
    a: "No. I build it, connect it, and maintain it. You keep running your business.",
  },
  {
    q: "What about my customers' data?",
    a: "Your data stays yours and is never used to train AI models. The agent runs inside your own accounts and tools.",
  },
  {
    q: "How long does it take?",
    a: "Most first agents go live in a couple of weeks. The consult gives you a real timeline.",
  },
  {
    q: "Who fixes it if something breaks?",
    a: "I do. A simple monthly care plan keeps it monitored, updated, and improving.",
  },
];

export const formHeading = "Book a free consult";
export const formLead =
  "Tell me what eats your time. I will tell you if an agent can handle it.";
export const contactEmail = "dev@kumma.me";
