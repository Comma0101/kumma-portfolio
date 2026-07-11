import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResearchProjectPreview from "@/components/work/ResearchProjectPreview";
import { getWorkProject } from "@/data/workProjects";

export const metadata: Metadata = {
  title: "Splash Ink — AI-to-3D research prototype",
  description:
    "An active R&D prototype exploring how a single classical ink image can become an explorable spatial scene through depth and point initialization and 3D Gaussian Splatting.",
  alternates: { canonical: "https://kumma.me/work/splash-ink" },
  openGraph: {
    title: "Splash Ink — AI-to-3D research prototype | Kumma",
    description:
      "A grounded look at the input, transformation, output, and current limits of an active single-image-to-3D research prototype.",
    url: "https://kumma.me/work/splash-ink",
    type: "article",
  },
};

export default function SplashInkPage() {
  const project = getWorkProject("splash-ink");

  if (!project) {
    notFound();
  }

  return (
    <ResearchProjectPreview
      project={project}
      limits="This is an active research prototype, not a one-click reconstruction product. Spatial quality depends on the source image and on the depth and point initialization; unsuitable inputs can produce incomplete or unstable geometry."
    />
  );
}
