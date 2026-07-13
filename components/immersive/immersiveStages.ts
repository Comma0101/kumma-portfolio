import { facilityChapters } from "./facility/narrative";
import type {
  ImmersiveProfile,
  ImmersiveProfileInput,
  ImmersiveStageId,
} from "./types";

const MOBILE_BREAKPOINT = 768;

export const immersiveStageIds: readonly ImmersiveStageId[] = Object.freeze(
  facilityChapters.map((chapter) => chapter.stageId),
);

export function clamp01(value: number): number {
  if (Number.isNaN(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function getImmersiveProfile({
  reducedMotion,
  width,
}: ImmersiveProfileInput): ImmersiveProfile {
  if (reducedMotion) return "reduced";
  return width < MOBILE_BREAKPOINT ? "mobile" : "desktop";
}
