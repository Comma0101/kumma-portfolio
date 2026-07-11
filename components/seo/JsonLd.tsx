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
