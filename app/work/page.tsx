import type { Metadata } from "next";
import Work from "@/components/personal/Work";

const description =
  "Four systems by Kumma Wu: restaurant voice orders, agent orchestration, document-to-audiobook synthesis, and a trade ledger. Inputs, outputs, and engineering decisions.";

export const metadata: Metadata = {
  title: "Work",
  description,
  alternates: { canonical: "https://kumma.me/work" },
  openGraph: {
    title: "Work | Kumma",
    description,
    url: "https://kumma.me/work",
    images: ["/og/portrait.png"],
  },
  twitter: { card: "summary_large_image", site: "@Comma_9fie", title: "Work | Kumma", description, images: ["/og/portrait.png"] },
};

export default function WorkPage() {
  return <Work />;
}
