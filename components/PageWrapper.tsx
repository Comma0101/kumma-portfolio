"use client";
import { useAnimation } from "../context/AnimationContext";
import { ReactNode } from "react";

const PageWrapper = ({ children }: { children: ReactNode }) => {
  const { isIntroPlayed } = useAnimation();

  if (!isIntroPlayed) {
    return null;
  }

  return <>{children}</>;
};

export default PageWrapper;
