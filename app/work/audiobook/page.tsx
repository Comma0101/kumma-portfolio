import type { Metadata } from "next";
import AudiobookCaseStudy from "@/components/AudiobookCaseStudy";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Audiobook AI — case study",
  description:
    "How Audiobook AI turns arbitrary documents — PDF, EPUB, DOCX, web pages, plain text — into a continuous audiobook: the ingest, normalize, chunk, Kokoro TTS, and assemble pipeline, and the API and worker separation that keeps it reliable under load.",
  alternates: { canonical: "https://kumma.me/work/audiobook" },
  openGraph: {
    title: "Audiobook AI — case study | Kumma",
    description:
      "A live text-to-speech product that converts documents into audiobooks with the open-source Kokoro model. The pipeline, the production hardening, and the offline listening experience.",
    url: "https://kumma.me/work/audiobook",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audiobook AI — case study | Kumma",
    description:
      "Documents into audiobooks with Kokoro TTS: the pipeline, the reliability work, and the offline PWA.",
  },
};

const caseStudyLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Audiobook AI",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      description:
        "A live text-to-speech product that converts documents — PDF, EPUB, DOCX, web pages, and plain text — into continuous audiobooks using the open-source Kokoro model on PyTorch, with a FastAPI and worker-process architecture, a persistent job queue, and an offline progressive web app for playback.",
      url: "https://listen.kummalabs.com",
      author: {
        "@type": "Person",
        name: "Kumma",
        alternateName: "Yang Wu",
        url: "https://kumma.me",
      },
    },
    {
      "@type": "Article",
      headline: "Audiobook AI — case study",
      description:
        "The ingest, normalize, chunk, Kokoro TTS, and assemble pipeline behind Audiobook AI, the API and worker separation that keeps it reliable under load, and the offline listening experience.",
      url: "https://kumma.me/work/audiobook",
      author: {
        "@type": "Person",
        name: "Kumma",
        alternateName: "Yang Wu",
        url: "https://kumma.me",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={caseStudyLd} />
      <AudiobookCaseStudy />
    </>
  );
}
