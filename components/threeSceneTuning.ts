export type ThreeSceneProfile = "desktop" | "constrained" | "mobile" | "reduced";

export interface ThreeSceneTuningInput {
  deviceMemory?: number;
  devicePixelRatio: number;
  hardwareConcurrency?: number;
  isCoarsePointer: boolean;
  reducedMotion: boolean;
  viewportWidth: number;
}

export interface ThreeSceneTuning {
  antialias: boolean;
  noiseOctaves: number;
  pixelRatio: number;
  profile: ThreeSceneProfile;
  segmentX: number;
  segmentZ: number;
}

const TUNING_BY_PROFILE: Record<
  ThreeSceneProfile,
  Omit<ThreeSceneTuning, "pixelRatio"> & { pixelRatioCap: number }
> = {
  desktop: {
    antialias: true,
    noiseOctaves: 4,
    pixelRatioCap: 1.5,
    profile: "desktop",
    segmentX: 200,
    segmentZ: 160,
  },
  constrained: {
    antialias: false,
    noiseOctaves: 3,
    pixelRatioCap: 1,
    profile: "constrained",
    segmentX: 120,
    segmentZ: 96,
  },
  mobile: {
    antialias: false,
    noiseOctaves: 2,
    pixelRatioCap: 1,
    profile: "mobile",
    segmentX: 72,
    segmentZ: 56,
  },
  reduced: {
    antialias: false,
    noiseOctaves: 3,
    pixelRatioCap: 1,
    profile: "reduced",
    segmentX: 120,
    segmentZ: 96,
  },
};

export function getThreeSceneTuning(
  input: ThreeSceneTuningInput,
): ThreeSceneTuning {
  const devicePixelRatio =
    Number.isFinite(input.devicePixelRatio) && input.devicePixelRatio > 0
      ? input.devicePixelRatio
      : 1;
  const mobileViewport = input.viewportWidth <= 767;
  const constrainedHardware =
    (input.deviceMemory ?? 8) <= 4 || (input.hardwareConcurrency ?? 8) <= 4;

  const profile: ThreeSceneProfile =
    input.isCoarsePointer || mobileViewport
      ? "mobile"
      : input.reducedMotion
        ? "reduced"
        : constrainedHardware
          ? "constrained"
          : "desktop";
  const tuning = TUNING_BY_PROFILE[profile];

  return {
    antialias: tuning.antialias,
    noiseOctaves: tuning.noiseOctaves,
    pixelRatio: Math.min(devicePixelRatio, tuning.pixelRatioCap),
    profile: tuning.profile,
    segmentX: tuning.segmentX,
    segmentZ: tuning.segmentZ,
  };
}
