import type { Metadata } from "next";
import ArchonCaseStudy from "@/components/ArchonCaseStudy";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "ARCHON — case study",
  description:
    "How ARCHON orchestrates models, tools, memory, and other coding agents through one inspectable control plane: the architecture, the plan-route-execute-recover loop, and where the system is still rough.",
  alternates: { canonical: "https://kumma.me/work/archon" },
  openGraph: {
    title: "ARCHON — case study | Kumma",
    description:
      "A self-hostable control plane for agents: routes across Claude, GPT, and Gemini, runs tools over MCP, keeps compressed memory, and delegates real work to coding agents through a worker router.",
    url: "https://kumma.me/work/archon",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARCHON — case study | Kumma",
    description:
      "Agent orchestration as a control plane: routing, tools, memory, delegation, and human approval.",
  },
};

const caseStudyLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ARCHON",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  description:
    "A self-aware personal agent that orchestrates models, tools, memory, and other coding agents through one inspectable control plane. It plans, routes, executes, and recovers across providers, with persistent memory, context compression, usage accounting, and human approval built in.",
  url: "https://kumma.me/work/archon",
  codeRepository: "https://github.com/Comma0101/archon",
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
      <ArchonCaseStudy />
    </>
  );
}
