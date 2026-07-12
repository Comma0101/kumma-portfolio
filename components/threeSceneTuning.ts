import {
  sceneQualityFor,
  type SceneQuality,
  type SceneRuntimeProfile,
} from "./immersive/sceneLifecycle";

export type ThreeSceneProfile = SceneRuntimeProfile;

export interface SceneGroupBudgets {
  readonly beacons: number;
  readonly signals: number;
  readonly voice: number;
  readonly document: number;
  readonly orchestration: number;
  readonly splats: number;
  readonly measurement: number;
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
  groupBudgets: SceneGroupBudgets;
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
    groupBudgets: Object.freeze({
      beacons: 14,
      signals: 84,
      voice: 18,
      document: 24,
      orchestration: 30,
      splats: 180,
      measurement: 54,
    }),
    noiseOctaves: 4,
    pixelRatioCap: 1.5,
    profile: "desktop",
    segmentX: 200,
    segmentZ: 160,
  },
  constrained: {
    antialias: false,
    groupBudgets: Object.freeze({
      beacons: 9,
      signals: 48,
      voice: 12,
      document: 16,
      orchestration: 20,
      splats: 96,
      measurement: 36,
    }),
    noiseOctaves: 3,
    pixelRatioCap: 1,
    profile: "constrained",
    segmentX: 120,
    segmentZ: 96,
  },
  mobile: {
    antialias: false,
    groupBudgets: Object.freeze({
      beacons: 6,
      signals: 30,
      voice: 9,
      document: 12,
      orchestration: 14,
      splats: 64,
      measurement: 24,
    }),
    noiseOctaves: 2,
    pixelRatioCap: 1,
    profile: "mobile",
    segmentX: 72,
    segmentZ: 56,
  },
  reduced: {
    antialias: false,
    groupBudgets: Object.freeze({
      beacons: 7,
      signals: 36,
      voice: 10,
      document: 14,
      orchestration: 16,
      splats: 72,
      measurement: 30,
    }),
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
    groupBudgets: tuning.groupBudgets,
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
