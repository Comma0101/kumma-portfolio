"use client";

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { Contribution } from "./contribution";

type ContributionState = {
  contribution: Contribution | null;
  setContribution: Dispatch<SetStateAction<Contribution | null>>;
};

const ContributionContext = createContext<ContributionState | null>(null);

// A fresh homepage mount starts with the authored composition. Completed
// gestures stay in document memory for this visit.
export function ContributionProvider({ children }: { children: ReactNode }) {
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const value = useMemo(() => ({ contribution, setContribution }), [contribution]);

  return <ContributionContext.Provider value={value}>{children}</ContributionContext.Provider>;
}

export function useContribution() {
  const context = useContext(ContributionContext);
  if (!context) throw new Error("ContributionProvider must surround the personal experience.");
  return context;
}

export type { Contribution } from "./contribution";
