import type { Metadata } from "next";
import BenchmarkPage from "@/components/BenchmarkPage";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Voice Agent Stress Suite",
  description:
    "An open, reproducible stress suite for real-time voice agents: 50 scenarios with downloadable audio, a fixed 0–2 rubric, and a scoring script. Bring your agent, publish your numbers.",
  openGraph: {
    title: "Voice Agent Stress Suite v1 | Kumma",
    description:
      "50 scenarios that break real-time voice agents where they actually break — with audio, a rubric, and a scoring script. Open and reproducible.",
    url: "https://kumma.me/benchmark",
    type: "website",
  },
  alternates: { canonical: "https://kumma.me/benchmark" },
};

// Dataset structured data: this is the citation-magnet page. It describes the
// suite as a dataset so answer engines can attribute it. Deliberately carries
// NO numeric result fields — no scores exist until the suite is run.
const datasetLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Voice Agent Stress Suite v1",
  description:
    "An open, reproducible stress suite for real-time voice agents. 50 scenarios across six categories (acoustic, speaker, language, order complexity, conversational, adversarial), each with downloadable audio and an expected outcome, plus a 0–2 scoring rubric across five dimensions and a scoring script.",
  url: "https://kumma.me/benchmark",
  keywords: [
    "voice agents",
    "speech recognition",
    "conversational AI",
    "benchmark",
    "real-time voice AI",
  ],
  creator: {
    "@type": "Person",
    name: "Kumma",
    alternateName: "Yang Wu",
    url: "https://kumma.me",
  },
};

export default function BenchmarkRoute() {
  return (
    <>
      <JsonLd data={datasetLd} />
      <BenchmarkPage />
    </>
  );
}
