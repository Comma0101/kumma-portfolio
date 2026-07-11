import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResearchProjectPreview from "@/components/work/ResearchProjectPreview";
import { getWorkProject } from "@/data/workProjects";

export const metadata: Metadata = {
  title: "Spectral World Player — real-time graphics research",
  description:
    "An active R&D system that keeps local audio private while Web Audio FFT, beat, and onset analysis drive an adaptive audio-reactive 3D world.",
  alternates: { canonical: "https://kumma.me/work/spectral-world" },
  openGraph: {
    title: "Spectral World Player — real-time graphics research | Kumma",
    description:
      "A grounded look at the local-audio input, Web Audio analysis, adaptive 3D output, and current browser and device limits.",
    url: "https://kumma.me/work/spectral-world",
    type: "article",
  },
};

export default function SpectralWorldPage() {
  const project = getWorkProject("spectral-world");

  if (!project) {
    notFound();
  }

  return (
    <ResearchProjectPreview
      project={project}
      limits="This is active browser R&D, not a claim of uniform visual fidelity across devices. Audio remains local, while rendering quality adapts to browser and device performance limits; beat and onset interpretation still depends on the recording."
    />
  );
}
