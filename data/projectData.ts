export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  details: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Project One",
    slug: "project-one",
    description: "A brief description of the first project.",
    details: "More detailed information about Project One, including the technologies used, challenges faced, and the outcome.",
  },
  {
    id: 2,
    title: "Project Two",
    slug: "project-two",
    description: "A brief description of the second project.",
    details: "More detailed information about Project Two, including the technologies used, challenges faced, and the outcome.",
  },
  {
    id: 3,
    title: "Project Three",
    slug: "project-three",
    description: "A brief description of the third project.",
    details: "More detailed information about Project Three, including the technologies used, challenges faced, and the outcome.",
  },
];
