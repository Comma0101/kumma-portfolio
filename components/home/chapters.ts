export interface Chapter {
  no: string;
  title: string;
  href: string;
  blurb: string;
  tags: string[];
  layout: "feature" | "flip" | "band" | "strip";
}

export const chapters: Chapter[] = [
  {
    no: "01",
    title: "KOTA",
    href: "/projects/kota",
    layout: "feature",
    blurb:
      "A voice-first AI system that answers restaurant phone calls and turns them into structured, kitchen-ready orders.",
    tags: ["real-time voice", "LLM orchestration", "production"],
  },
  {
    no: "02",
    title: "ARCHON",
    href: "/systems/archon",
    layout: "flip",
    blurb:
      "A personal AI orchestration layer. Agents, tools, memory, and model routing coordinated into one inspectable system.",
    tags: ["agents", "orchestration", "active R&D"],
  },
  {
    no: "03",
    title: "Market Systems",
    href: "/markets",
    layout: "band",
    blurb:
      "Decision architecture under uncertainty. Treating markets as a real-time system of risk, latency, and feedback.",
    tags: ["research", "risk", "execution"],
  },
  {
    no: "04",
    title: "Experiments & Visual",
    href: "/gallery",
    layout: "strip",
    blurb:
      "Interactive web, 3D, and photography. Visual research that feeds how I design systems and interfaces.",
    tags: ["3D", "photography", "interface"],
  },
];
