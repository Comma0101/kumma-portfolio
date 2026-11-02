import type { Metadata } from "next";
import Front from "@/components/personal/Front";
import { JsonLd, homeLd } from "@/components/seo/JsonLd";

const description =
  "Kumma Wu explores consciousness, self-awareness, and how understanding enters everyday life. A personal site of writing, software, and visual inquiry.";

export const metadata: Metadata = {
  title: { absolute: "Kumma Wu" },
  description,
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
