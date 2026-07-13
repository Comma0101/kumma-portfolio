import {
  sceneQualityFor,
  type SceneQuality,
  type SceneRuntimeProfile,
} from "./immersive/sceneLifecycle";

export type ThreeSceneProfile = SceneRuntimeProfile;

export interface FacilityBudgets {
  readonly terrainSegments: number;
  readonly ribs: number;
  readonly slabs: number;
  readonly bridges: number;
  readonly depthSamples: number;
  readonly calibrationMarks: number;
  readonly drawCallTarget: number;
}

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
  facilityBudgets: FacilityBudgets;
  noiseOctaves: number;
  pixelRatio: number;
  profile: ThreeSceneProfile;
  quality: SceneQuality;
  segmentX: number;
  segmentZ: number;
}

const TUNING_BY_PROFILE: Record<
  ThreeSceneProfile,
  Omit<ThreeSceneTuning, "pixelRatio" | "quality"> & {
    pixelRatioCap: number;
  }
> = {
  desktop: {
    antialias: true,
    facilityBudgets: Object.freeze({
      terrainSegments: 32000,
      ribs: 36,
      slabs: 28,
      bridges: 18,
      depthSamples: 320,
      calibrationMarks: 36,
      drawCallTarget: 45,
    }),
    noiseOctaves: 4,
    pixelRatioCap: 1.5,
    profile: "desktop",
    segmentX: 200,
    segmentZ: 160,
  },
  constrained: {
    antialias: false,
    facilityBudgets: Object.freeze({
      terrainSegments: 11520,
      ribs: 28,
      slabs: 20,
      bridges: 14,
      depthSamples: 220,
      calibrationMarks: 28,
      drawCallTarget: 32,
    }),
    noiseOctaves: 3,
    pixelRatioCap: 1,
    profile: "constrained",
    segmentX: 120,
    segmentZ: 96,
  },
  mobile: {
    antialias: false,
    facilityBudgets: Object.freeze({
      terrainSegments: 4032,
      ribs: 18,
      slabs: 14,
      bridges: 10,
      depthSamples: 120,
      calibrationMarks: 18,
      drawCallTarget: 22,
    }),
    noiseOctaves: 2,
    pixelRatioCap: 1,
    profile: "mobile",
    segmentX: 72,
    segmentZ: 56,
  },
  reduced: {
    antialias: false,
    facilityBudgets: Object.freeze({
      terrainSegments: 2464,
      ribs: 12,
      slabs: 10,
      bridges: 7,
      depthSamples: 72,
      calibrationMarks: 12,
      drawCallTarget: 16,
    }),
    noiseOctaves: 2,
    pixelRatioCap: 1,
    profile: "reduced",
    segmentX: 56,
    segmentZ: 44,
  },
};

export function getThreeSceneTuning(
  input: ThreeSceneTuningInput,
): ThreeSceneTuning {
  const devicePixelRatio =
    Number.isFinite(input.devicePixelRatio) && input.devicePixelRatio > 0
      ? input.devicePixelRatio
      : 1;
  const viewportWidth =
    Number.isFinite(input.viewportWidth) && input.viewportWidth > 0
      ? input.viewportWidth
      : 1024;
  const deviceMemory =
    typeof input.deviceMemory === "number" &&
    Number.isFinite(input.deviceMemory) &&
    input.deviceMemory > 0
      ? input.deviceMemory
      : 8;
  const hardwareConcurrency =
    typeof input.hardwareConcurrency === "number" &&
    Number.isFinite(input.hardwareConcurrency) &&
    input.hardwareConcurrency > 0
      ? input.hardwareConcurrency
      : 8;
  const mobileViewport = viewportWidth <= 767;
  const constrainedHardware =
    deviceMemory <= 4 || hardwareConcurrency <= 4;

  const profile: ThreeSceneProfile =
    input.reducedMotion
      ? "reduced"
      : input.isCoarsePointer || mobileViewport
        ? "mobile"
        : constrainedHardware
          ? "constrained"
          : "desktop";
  const tuning = TUNING_BY_PROFILE[profile];

  return {
    antialias: tuning.antialias,
    facilityBudgets: tuning.facilityBudgets,
    noiseOctaves: tuning.noiseOctaves,
    pixelRatio: Math.min(devicePixelRatio, tuning.pixelRatioCap),
    profile: tuning.profile,
    quality: sceneQualityFor({
      profile,
      deviceMemory,
      hardwareConcurrency,
    }),
    segmentX: tuning.segmentX,
    segmentZ: tuning.segmentZ,
  };
}
