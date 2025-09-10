// projectsData.ts
import AnimationOne from "./Animations/AnimationOne";
import AnimationTwo from "./Animations/AnimationTwo";
import AnimationThree from "./Animations/AnimationThree";
import { FC } from "react";
export interface Project {
  id: number;
  title: string;
  canvasComponent: FC;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Animation One",
    canvasComponent: AnimationOne,
  },
  {
    id: 2,
    title: "Animation Two",
    canvasComponent: AnimationTwo,
  },
  // Add more animations as needed
  {
    id: 3,
    title: "Animation Three",
    canvasComponent: AnimationThree,
  },
];
