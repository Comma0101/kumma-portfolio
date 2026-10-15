import type { Metadata } from "next";
import Portrait from "@/components/personal/Portrait";
import { JsonLd } from "@/components/seo/JsonLd";

const portraitLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kumma Wu",
  alternateName: "Kumma",
  url: "https://kumma.me",
  description:
    "In the gym most days. Trading options. Attention goes where it compounds.",
  sameAs: [
    "https://x.com/Comma_9fie",
    "https://github.com/Comma0101",
  ],
};

export const metadata: Metadata = {
  title: { absolute: "Kumma Wu" },
  description:
    "Kumma Wu. In the gym most days. Trading options. Attention goes where it compounds.",
  openGraph: {
    title: "Kumma Wu",
    description:
      "Kumma Wu. In the gym most days. Trading options. Attention goes where it compounds.",
    url: "https://kumma.me",
    siteName: "Kumma Wu",
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "Kumma Wu",
    description:
      "In the gym most days. Trading options. Attention goes where it compounds.",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={portraitLd} />
      <Portrait />
    </>
  );
}
