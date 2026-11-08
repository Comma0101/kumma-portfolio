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
  description: "Kumma Wu explores consciousness, self-awareness, and imagination. He believes imagination participates in the making of reality, and seeks to know himself, keep growing, and meet the world with love. Based in Los Angeles, he writes, builds software, reads, trains, and trades.",
  address: { "@type": "PostalAddress", addressLocality: "Los Angeles" },
  knowsAbout: [
    "Consciousness",
    "Self-awareness",
    "Imagination",
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
        "Kumma Wu’s personal inquiry into consciousness, self-awareness, imagination, and living with love, expressed through writing, software, typography, and animation.",
      author: { "@id": "https://kumma.me/#person" },
      publisher: { "@id": "https://kumma.me/#organization" },
    },
  ],
};
