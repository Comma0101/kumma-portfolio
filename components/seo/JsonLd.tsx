export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kumma",
  alternateName: "Yang Wu",
  url: "https://kumma.me",
  jobTitle: "Independent systems builder",
  address: { "@type": "PostalAddress", addressLocality: "Los Angeles" },
  sameAs: [
    "https://github.com/Comma0101",
    "https://www.linkedin.com/in/yang-w-9233a3a8/",
    "https://x.com/Comma_9fie",
  ],
};
