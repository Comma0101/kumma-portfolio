"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface AnimationContextType {
  isIntroPlayed: boolean;
  setIsIntroPlayed: (played: boolean) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const [isIntroPlayed, setIsIntroPlayed] = useState(false);

  return (
    <AnimationContext.Provider value={{ isIntroPlayed, setIsIntroPlayed }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};
