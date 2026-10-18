import type { Metadata } from "next";
import Work from "@/components/personal/Work";

const description =
  "Systems Kumma builds: real-time voice agents, an agent control plane, document-to-audio, and the tests behind them.";

export const metadata: Metadata = {
  title: "Systems I build",
  description,
  alternates: { canonical: "https://kumma.me/work" },
  openGraph: {
    title: "Systems I build | Kumma",
    description,
    url: "https://kumma.me/work",
    images: ["/og/portrait.png"],
  },
  twitter: { card: "summary_large_image", site: "@Comma_9fie", images: ["/og/portrait.png"] },
};

export default function WorkPage() {
  return <Work />;
}
