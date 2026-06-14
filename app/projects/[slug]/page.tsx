import { projects } from "@/data/projectData";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import KotaDetail from "@/components/projects/KotaDetail";

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

  return <ProjectDetail project={project} />;
}
