import type {
  ImmersiveStageId,
  SceneGroupKey,
  SceneGroupWeights,
} from "./types";

export type SceneRuntimeProfile =
  | "desktop"
  | "constrained"
  | "mobile"
  | "reduced";

export type SceneQuality = "full" | "balanced" | "minimal" | "static";
export type SceneJourneyState = "active" | "inactive";
export type MutableSceneGroupWeights = Record<SceneGroupKey, number>;

const SCENE_GROUP_KEYS: readonly SceneGroupKey[] = [
  "horizon",
  "signals",
  "voice",
  "document",
  "orchestration",
  "splats",
  "measurement",
];

export interface SceneAnimationPolicyInput {
  readonly hidden: boolean;
  readonly inJourney: boolean;
  readonly reducedMotion: boolean;
  readonly webglReady?: boolean;
}

export interface SceneRenderPolicyInput {
  readonly inJourney: boolean;
  readonly webglReady: boolean;
}

export interface SceneQualityInput {
  readonly profile: SceneRuntimeProfile;
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
}

function isLimitedDeviceHint(value: number | undefined): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= 4
  );
}

function clamp01(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function shouldAnimateScene({
  hidden,
  inJourney,
  reducedMotion,
  webglReady = true,
}: SceneAnimationPolicyInput): boolean {
  return webglReady && !hidden && inJourney && !reducedMotion;
}

export function shouldRenderScene({
  inJourney,
  webglReady,
}: SceneRenderPolicyInput): boolean {
  return webglReady && inJourney;
}

export function sceneQualityFor({
  profile,
  deviceMemory,
  hardwareConcurrency,
}: SceneQualityInput): SceneQuality {
  if (profile === "reduced") {
    return "static";
  }

  if (profile === "mobile") {
    return "minimal";
  }

  if (
    profile === "constrained" ||
    isLimitedDeviceHint(deviceMemory) ||
    isLimitedDeviceHint(hardwareConcurrency)
  ) {
    return "balanced";
  }

  return "full";
}

export function journeyStateFor(inJourney: boolean): SceneJourneyState {
  return inJourney ? "active" : "inactive";
}

export function shouldRebuildSceneResources(
  currentProfile: SceneRuntimeProfile,
  nextProfile: SceneRuntimeProfile,
): boolean {
  return currentProfile !== nextProfile;
}

export function motionScaleForTransition(
  toStageId: ImmersiveStageId,
  easedProgress: number,
): number {
  if (toStageId !== "contact") return 1;
  const progress = clamp01(easedProgress);
  if (progress === 1) return 0.02;
  return 1 - progress * 0.98;
}

export function createMutableSceneGroupWeights(
  source: SceneGroupWeights,
): MutableSceneGroupWeights {
  return {
    horizon: source.horizon,
    signals: source.signals,
    voice: source.voice,
    document: source.document,
    orchestration: source.orchestration,
    splats: source.splats,
    measurement: source.measurement,
  };
}

export function copySceneGroupWeights(
  current: MutableSceneGroupWeights,
  source: SceneGroupWeights,
): MutableSceneGroupWeights {
  for (let index = 0; index < SCENE_GROUP_KEYS.length; index += 1) {
    const key = SCENE_GROUP_KEYS[index];
    current[key] = source[key];
  }
  return current;
}

export function dampSceneGroupWeights(
  current: MutableSceneGroupWeights,
  target: SceneGroupWeights,
  damping: number,
  deltaSeconds: number,
): MutableSceneGroupWeights {
  const safeDamping =
    Number.isFinite(damping) && damping > 0 ? damping : 0;
  const safeDelta =
    Number.isFinite(deltaSeconds) && deltaSeconds > 0 ? deltaSeconds : 0;
  const alpha = 1 - Math.exp(-safeDamping * safeDelta);
  let total = 0;

  for (let index = 0; index < SCENE_GROUP_KEYS.length; index += 1) {
    const key = SCENE_GROUP_KEYS[index];
    const next = current[key] + (target[key] - current[key]) * alpha;
    current[key] = Number.isFinite(next) && next > 0 ? next : 0;
    total += current[key];
  }

  if (total > 0) {
    for (let index = 0; index < SCENE_GROUP_KEYS.length; index += 1) {
      const key = SCENE_GROUP_KEYS[index];
      current[key] /= total;
    }
  } else {
    current.horizon = 1;
    for (let index = 0; index < SCENE_GROUP_KEYS.length; index += 1) {
      const key = SCENE_GROUP_KEYS[index];
      if (key !== "horizon") current[key] = 0;
    }
  }

  return current;
}
