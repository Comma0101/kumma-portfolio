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
  description: "In the gym most days. Trading options. Builds software, reads old texts, draws.",
  address: { "@type": "PostalAddress", addressLocality: "Los Angeles" },
  knowsAbout: [
    "Real-time voice AI",
    "Agent orchestration",
    "Chinese philosophy",
    "Comparative religion",
    "Options trading",
    "Calligraphy and brush painting",
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
        "The personal site of Kumma Wu: systems he builds, notes from his reading, and drawing studies, in one red line.",
      author: { "@id": "https://kumma.me/#person" },
      publisher: { "@id": "https://kumma.me/#organization" },
    },
  ],
};
