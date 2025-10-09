import { projects } from "@/data/projectData";
import { notFound } from "next/navigation";
import styles from "@/styles/projects.module.css";
import { NextPage } from "next";

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

type Props = {
  params: { slug: string };
};

const ProjectPage: NextPage<Props> = async ({ params }) => {
  const awaitedParams = await params;
  const project = projects.find((p) => p.slug === awaitedParams.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className={styles.projectDetailContainer}>
      <h1>{project.title}</h1>
      <p>{project.details}</p>
    </div>
  );
};

export default ProjectPage;
