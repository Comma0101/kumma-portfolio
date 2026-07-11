import type { ComponentType } from "react";
import type { WorkVisualKey } from "../../data/workProjects";
import type { VizProps } from "./types";
import ArchonViz from "./ArchonViz";
import AudiobookViz from "./AudiobookViz";
import KotaViz from "./KotaViz";
import LedgerViz from "./LedgerViz";
import MarketViz from "./MarketViz";
import SpectralViz from "./SpectralViz";
import SplashInkViz from "./SplashInkViz";

const catalogVisuals = {
  kota: KotaViz,
  audiobook: AudiobookViz,
  archon: ArchonViz,
  "splash-ink": SplashInkViz,
  "spectral-world": SpectralViz,
  ledger: LedgerViz,
} satisfies Record<WorkVisualKey, ComponentType<VizProps>>;

const legacyVisuals = {
  "market-systems": MarketViz,
} satisfies Record<"market-systems", ComponentType<VizProps>>;

type VisualMap = typeof catalogVisuals &
  typeof legacyVisuals &
  Readonly<Partial<Record<string, ComponentType<VizProps>>>>;

export const vizBySlug: VisualMap = {
  ...catalogVisuals,
  ...legacyVisuals,
};
