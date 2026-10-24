import type { Metadata } from "next";
import Work from "@/components/personal/Work";

const description =
  "What Kumma builds, as software for leverage: each takes something messy — a phone call, a task, a document, a ledger — and makes it something you can trust.";

export const metadata: Metadata = {
  title: "Build",
  description,
  alternates: { canonical: "https://kumma.me/work" },
  openGraph: {
    title: "Build | Kumma",
    description,
    url: "https://kumma.me/work",
    images: ["/og/portrait.png"],
  },
  twitter: { card: "summary_large_image", site: "@Comma_9fie", images: ["/og/portrait.png"] },
};

export default function WorkPage() {
  return <Work />;
}
