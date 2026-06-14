export interface Chapter {
  no: string;
  title: string;
  href: string;
  blurb: string;
  tags: string[];
  layout: "feature" | "flip" | "band" | "strip";
  secondary?: { label: string; href: string };
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
      "Interactive web, 3D, photography, and writing. Visual and written research that feeds how I design systems.",
    tags: ["3D", "photography", "essays", "interface"],
    secondary: { label: "Read essays →", href: "/blog" },
  },
];
