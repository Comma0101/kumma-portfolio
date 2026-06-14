import type { ComponentType } from "react";
import type { VizProps } from "./types";
import KotaViz from "./KotaViz";
import ArchonViz from "./ArchonViz";
import MarketViz from "./MarketViz";

export const vizBySlug: Record<string, ComponentType<VizProps>> = {
  kota: KotaViz,
  archon: ArchonViz,
  "market-systems": MarketViz,
};
