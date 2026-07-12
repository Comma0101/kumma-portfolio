import type { Metadata } from "next";
import SpectralWorldCaseStudy from "@/components/SpectralWorldCaseStudy";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Spectral World Player — audio-reactive Three.js case study",
  description:
    "How a local audio file becomes a living 3D world: Web Audio FFT and onset analysis, deterministic per-song themes, an allocation-free frame loop, and the honest limits of an active research build.",
  alternates: { canonical: "https://kumma.me/work/spectral-world" },
  openGraph: {
    title: "Spectral World Player — audio-reactive Three.js | Kumma",
    description:
      "Web Audio analysis driving terrain, pillars, particles, and flight in the browser — mechanism, architecture, and failure modes documented honestly.",
    url: "https://kumma.me/work/spectral-world",
    type: "article",
    images: ["/og/work-spectral-world.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectral World Player — audio-reactive Three.js | Kumma",
    description:
      "Local audio in, a living 3D world out: FFT interpretation, beat and onset detection, and honest limits of an active R&D build.",
    images: ["/og/work-spectral-world.png"],
  },
};

const caseStudyLd = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Spectral World Player",
  creativeWorkStatus: "Active R&D",
  description:
    "A browser application that transforms one local audio file into an audio-reactive 3D world through Web Audio FFT, beat, and onset analysis, with no backend and no upload.",
  url: "https://kumma.me/work/spectral-world",
  about: [
    "Web Audio API",
    "real-time graphics",
    "Three.js",
    "audio analysis",
  ],
  author: {
    "@type": "Person",
    name: "Kumma",
    alternateName: "Yang Wu",
    url: "https://kumma.me",
  },
};

export default function SpectralWorldPage() {
  return (
    <>
      <JsonLd data={caseStudyLd} />
      <SpectralWorldCaseStudy />
    </>
  );
}
