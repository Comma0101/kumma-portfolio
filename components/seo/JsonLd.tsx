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
  "https://x.com/Comma_9fie",
];

export const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://kumma.me/#person",
  name: "Kumma Wu",
  alternateName: "Kumma",
  url: "https://kumma.me",
  description: "Kumma Wu explores consciousness and self-awareness: the nature of experience, how we understand ourselves, and how understanding enters choices and ordinary life. Based in Los Angeles, he writes, builds software, reads philosophy, religion, and history, trains, and trades.",
  address: { "@type": "PostalAddress", addressLocality: "Los Angeles" },
  knowsAbout: [
    "Consciousness",
    "Self-awareness",
    "Chinese philosophy",
    "Comparative religion",
    "History",
    "Real-time voice AI",
    "Agent orchestration",
    "Trading",
  ],
  sameAs,
};

export const homeLd = {
  "@context": "https://schema.org",
  "@graph": [
    personLd,
    {
      "@type": "Organization",
      "@id": "https://kumma.me/#organization",
      name: "Kumma Wu",
      alternateName: "Kumma",
      url: "https://kumma.me",
      founder: { "@id": "https://kumma.me/#person" },
      sameAs,
    },
    {
      "@type": "WebSite",
      "@id": "https://kumma.me/#website",
      name: "Kumma Wu",
      url: "https://kumma.me",
      description:
        "Kumma Wu’s personal inquiry into consciousness, self-awareness, and how to live, expressed through writing, software, typography, and animation.",
      author: { "@id": "https://kumma.me/#person" },
      publisher: { "@id": "https://kumma.me/#organization" },
    },
  ],
};
