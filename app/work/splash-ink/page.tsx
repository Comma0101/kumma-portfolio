import type { Metadata } from "next";
import SplashInkCaseStudy from "@/components/SplashInkCaseStudy";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Splash Ink — single-image 3D Gaussian Splatting case study",
  description:
    "How one classical ink painting becomes an explorable 3D scene: depth and point initialization, single-image 3D Gaussian Splatting, authored camera paths, and the honest limits of an active research prototype.",
  alternates: { canonical: "https://kumma.me/work/splash-ink" },
  openGraph: {
    title: "Splash Ink — single-image 3D Gaussian Splatting | Kumma",
    description:
      "A research pipeline lifting classical ink paintings into explorable Gaussian-splat scenes, with the mechanism, architecture, and failure modes documented honestly.",
    url: "https://kumma.me/work/splash-ink",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Splash Ink — single-image 3D Gaussian Splatting | Kumma",
    description:
      "One painting in, an explorable splat scene out: mechanism, architecture, and honest limits of an active R&D prototype.",
  },
};

const caseStudyLd = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Splash Ink",
  creativeWorkStatus: "Active R&D",
  description:
    "A research pipeline that lifts a single classical ink painting into an explorable spatial scene through depth and point initialization and single-image 3D Gaussian Splatting, presented in a scroll-driven web viewer.",
  url: "https://kumma.me/work/splash-ink",
  about: [
    "3D Gaussian Splatting",
    "single-image reconstruction",
    "computer vision",
    "Three.js",
  ],
  author: {
    "@type": "Person",
    name: "Kumma",
    alternateName: "Yang Wu",
    url: "https://kumma.me",
  },
};

export default function SplashInkPage() {
  return (
    <>
      <JsonLd data={caseStudyLd} />
      <SplashInkCaseStudy />
    </>
  );
}
