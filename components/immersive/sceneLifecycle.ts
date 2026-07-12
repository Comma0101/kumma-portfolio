export type SceneRuntimeProfile =
  | "desktop"
  | "constrained"
  | "mobile"
  | "reduced";

export type SceneQuality = "full" | "balanced" | "minimal" | "static";

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
