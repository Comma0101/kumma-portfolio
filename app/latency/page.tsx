import type { Metadata } from "next";
import LatencyPage from "@/components/LatencyPage";

export const metadata: Metadata = {
  title: "Voice stack latency report",
  description:
    "A monthly measurement of turn latency across the major hosted voice stacks. Same prompt set, 30 calls per stack, raw CSV with every report. First report coming soon.",
  openGraph: {
    title: "Voice stack latency report | Kumma",
    description:
      "Monthly turn latency across the major hosted voice stacks, measured from when the user stops speaking to the first audio byte back. Raw CSV with every report.",
    url: "https://kumma.me/latency",
    type: "website",
  },
  alternates: { canonical: "https://kumma.me/latency" },
};

export default function Page() {
  return <LatencyPage />;
}
