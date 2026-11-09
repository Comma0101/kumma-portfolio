import type { Metadata } from "next";
import Work from "@/components/personal/Work";

const description =
  "Software and visual experiments by Kumma Wu. Map Art explores belonging through places, alongside voice AI, agent orchestration, audiobooks, and a trade ledger.";

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
