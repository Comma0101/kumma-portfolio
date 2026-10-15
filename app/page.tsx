import type { Metadata } from "next";
import Front from "@/components/personal/Front";
import { JsonLd, homeLd } from "@/components/seo/JsonLd";

const description =
  "In the gym most days. Trading options. Attention goes where it compounds.";

export const metadata: Metadata = {
  title: { absolute: "Kumma Wu" },
  description: `Kumma Wu. ${description}`,
  alternates: { canonical: "https://kumma.me" },
  openGraph: {
    title: "Kumma Wu",
    description,
    url: "https://kumma.me",
    siteName: "Kumma Wu",
    type: "profile",
    images: ["/og/portrait.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Comma_9fie",
    creator: "@Comma_9fie",
    title: "Kumma Wu",
    description,
    images: ["/og/portrait.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeLd} />
      <Front />
    </>
  );
}
