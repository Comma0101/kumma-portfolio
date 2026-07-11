import { featuredWork } from "../../data/workProjects";

export interface Chapter {
  readonly no: string;
  readonly title: string;
  readonly href: string;
  readonly blurb: string;
  readonly tags: readonly string[];
  readonly layout: "feature" | "flip" | "band" | "strip";
  readonly secondary?: { readonly label: string; readonly href: string };
  readonly images?: readonly string[];
  readonly evidence?: {
    readonly input: string;
    readonly transform: string;
    readonly output: string;
    readonly guardrail: string;
  };
  readonly artifact?: string;
}

export const chapters: readonly Chapter[] = featuredWork.map((project) => ({
  no: project.no,
  title: project.title,
  href: project.href,
  blurb: project.summary,
  tags: project.tags,
  layout: project.layout,
  evidence: project.evidence,
  artifact: project.artifact,
  ...(project.primaryAction ? { secondary: project.primaryAction } : {}),
}));
