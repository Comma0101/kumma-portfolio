import type { Metadata } from "next";
import KotaCaseStudy from "@/components/KotaCaseStudy";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "KOTA — case study",
  description:
    "How KOTA turns restaurant phone calls into menu-verified order tickets in real time: the architecture, the guardrail design behind clarify-before-commit, and where the system broke and how I fixed it.",
  alternates: { canonical: "https://kumma.me/work/kota" },
  openGraph: {
    title: "KOTA — case study | Kumma",
    description:
      "A real-time voice AI system that captures phone calls, resolves intent into menu-verified tickets, and commits them to kitchen workflows. Architecture, guardrails, and failure handling.",
    url: "https://kumma.me/work/kota",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "KOTA — case study | Kumma",
    description:
      "Real-time voice AI: architecture, clarify-before-commit guardrails, and the failures I fixed.",
  },
};

const caseStudyLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KOTA",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A real-time voice AI system that captures restaurant phone calls, resolves intent into menu-verified order tickets with confidence checks, and commits them to kitchen workflows without replacing the point-of-sale system.",
  url: "https://kumma.me/work/kota",
  author: {
    "@type": "Person",
    name: "Kumma",
    alternateName: "Yang Wu",
    url: "https://kumma.me",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={caseStudyLd} />
      <KotaCaseStudy />
    </>
  );
}
