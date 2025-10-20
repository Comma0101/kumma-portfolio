"use client";
import { useAnimation } from "../context/AnimationContext";
import { ReactNode } from "react";

const PageWrapper = ({ children }: { children: ReactNode }) => {
  const { isIntroPlayed } = useAnimation();

  if (!isIntroPlayed) {
    return null;
  }

  return <div style={{ position: "relative", zIndex: 1 }}>{children}</div>;
};

export default PageWrapper;
