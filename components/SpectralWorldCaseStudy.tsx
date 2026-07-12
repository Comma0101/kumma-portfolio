import { notFound } from "next/navigation";
import SystemViz from "@/components/system/SystemViz";
import { vizBySlug } from "@/components/viz/registry";
import CaseStudyShell from "@/components/work/CaseStudyShell";
import { caseStudies } from "@/data/caseStudyContent";
import { getWorkProject } from "@/data/workProjects";

export default function SpectralWorldCaseStudy() {
  const project = getWorkProject("spectral-world");
  const study = caseStudies["spectral-world"];

  if (!project || !study) {
    notFound();
  }

  const Visualization = vizBySlug[project.visualKey];

  return (
    <CaseStudyShell
      project={project}
      study={study}
      visual={
        <SystemViz
          label={`${study.title} / research mechanism`}
          live={project.status === "live"}
        >
          <Visualization size="detail" />
        </SystemViz>
      }
    />
  );
}
