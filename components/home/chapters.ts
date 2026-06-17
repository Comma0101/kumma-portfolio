export interface Chapter {
  no: string;
  title: string;
  href: string;
  blurb: string;
  tags: string[];
  layout: "feature" | "flip" | "band" | "strip";
  secondary?: { label: string; href: string };
  images?: string[];
}

export const chapters: Chapter[] = [
  {
    no: "01",
    title: "KOTA",
    href: "/projects/kota",
    layout: "feature",
    blurb:
      "Turns restaurant phone calls into structured, actionable orders without requiring the restaurant to replace or deeply integrate its POS.",
    tags: ["real-time voice", "LLM orchestration", "menu grounding"],
  },
  {
    no: "02",
    title: "ARCHON",
    href: "/projects/archon",
    layout: "flip",
    blurb:
      "Unifies multiple AI models and coding agents into one orchestration layer for real development workflows.",
    tags: ["orchestration", "coding workers", "active R&D"],
  },
  {
    no: "03",
    title: "Market Systems",
    href: "/projects/market-systems",
    layout: "band",
    blurb:
      "Converts discretionary market reading into a rules-based MNQ/MES execution framework designed to prioritize process, risk control, and repeatability over daily P&L.",
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
    images: [
      "/images/collection1/img1.jpg",
      "/images/home/berlin-study.jpg",
      "/images/collection2/img2.jpg",
      "/images/collection1/img3.jpg",
    ],
  },
];
