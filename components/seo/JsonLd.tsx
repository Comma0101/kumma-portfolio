import { workProjects } from "@/data/workProjects";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const sameAs = [
  "https://github.com/Comma0101",
  "https://www.linkedin.com/in/yang-w-9233a3a8/",
  "https://x.com/Comma_9fie",
];

export const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://kumma.me/#person",
  name: "Kumma",
  alternateName: "Yang Wu",
  url: "https://kumma.me",
  jobTitle: "Independent AI systems engineer",
  address: { "@type": "PostalAddress", addressLocality: "Los Angeles" },
  knowsAbout: [
    "Real-time voice AI",
    "Agent orchestration",
    "Model Context Protocol",
    "Decision-quality systems",
  ],
  sameAs,
};

export const workCollectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://kumma.me/work#collection",
  name: "Production AI systems — work and case studies",
  url: "https://kumma.me/work",
  description:
    "Production AI work and case studies spanning real-time voice, agent orchestration, production TTS, AI-to-3D research, real-time graphics, and data-correctness systems.",
  author: {
    "@type": "Person",
    "@id": "https://kumma.me/#person",
    name: "Kumma",
    alternateName: "Yang Wu",
    url: "https://kumma.me",
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: workProjects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://kumma.me${project.href}`,
      name: project.title,
      description: project.summary,
    })),
  },
};

export const homeLd = {
  "@context": "https://schema.org",
  "@graph": [
    personLd,
    {
      "@type": "Organization",
      "@id": "https://kumma.me/#organization",
      name: "Kumma",
      alternateName: "Kumma / Yang Wu",
      url: "https://kumma.me",
      founder: { "@id": "https://kumma.me/#person" },
      sameAs,
    },
    {
      "@type": "WebSite",
      "@id": "https://kumma.me/#website",
      name: "Kumma",
      url: "https://kumma.me",
      description:
        "Production AI systems for real-time voice, multi-model agent orchestration, and decision-quality workflows.",
      author: { "@id": "https://kumma.me/#person" },
      publisher: { "@id": "https://kumma.me/#organization" },
    },
  ],
};
