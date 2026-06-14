import { projects } from "@/data/projectData";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import KotaDetail from "@/components/projects/KotaDetail";
import ArchonDetail from "@/components/projects/ArchonDetail";
import RobinhoodDetail from "@/components/projects/RobinhoodDetail";

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  if (slug === "kota") {
    return <KotaDetail project={project} />;
  }
  if (slug === "archon") {
    return <ArchonDetail project={project} />;
  }
  if (slug === "robinhood-performance") {
    return <RobinhoodDetail project={project} />;
  }

  return <ProjectDetail project={project} />;
}
