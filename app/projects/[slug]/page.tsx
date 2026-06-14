import type { Metadata } from "next";
import { projects } from "@/data/projectData";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import KotaDetail from "@/components/projects/KotaDetail";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  const title = `${p.title} | Kumma`;
  const og = `/og/projects-${p.slug}.png`;
  return {
    title: p.title,
    description: p.description,
    openGraph: {
      title,
      description: p.description,
      url: `https://kumma.me/projects/${p.slug}`,
      images: [og],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: p.description,
      images: [og],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const ld =
    slug === "kota"
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "KOTA",
          applicationCategory: "BusinessApplication",
          description: project.description,
          url: "https://kumma.me/projects/kota",
        }
      : {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.description,
          url: `https://kumma.me/projects/${slug}`,
        };

  return (
    <>
      <JsonLd data={ld} />
      {slug === "kota" ? (
        <KotaDetail project={project} />
      ) : (
        <ProjectDetail project={project} />
      )}
    </>
  );
}
