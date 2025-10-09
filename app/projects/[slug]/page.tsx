import { projects } from "@/data/projectData";
import { notFound } from "next/navigation";
import styles from "@/styles/projects.module.css";

type Props = {
  params: { slug: string };
};

export default function ProjectPage({ params }: Props) {
  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className={styles.projectDetailContainer}>
      <h1>{project.title}</h1>
      <p>{project.details}</p>
    </div>
  );
}
