import type { Metadata } from "next";
import WorkIndex from "@/components/work/WorkIndex";

const title = "Production AI systems — work and case studies";
const description =
  "Production AI work and case studies spanning real-time voice, agent orchestration, production TTS, AI-to-3D research, real-time graphics, and data-correctness systems.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://kumma.me/work" },
  openGraph: {
    title: `${title} | Kumma`,
    description,
    url: "https://kumma.me/work",
    type: "website",
  },
};

export default function WorkPage() {
  return <WorkIndex />;
}
