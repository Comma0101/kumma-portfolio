export type ImmersiveStageId =
  | "hero"
  | "proof"
  | "kota"
  | "audiobook"
  | "archon"
  | "splash-ink"
  | "research-labs"
  | "contact";

export type ImmersiveSpace =
  | "open horizon"
  | "signal corridor"
  | "voice tunnel"
  | "document chamber"
  | "orchestration constellation"
  | "splat landscape"
  | "measurement plane"
  | "quiet horizon";

export type ImmersiveProfile = "desktop" | "mobile" | "reduced";

export type SceneGroupKey =
  | "horizon"
  | "signals"
  | "voice"
  | "document"
  | "orchestration"
  | "splats"
  | "measurement";

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface ImmersiveCamera {
  readonly position: Vec3;
  readonly target: Vec3;
  readonly fov: number;
}

export interface ImmersiveFog {
  readonly density: number;
  readonly color: `#${string}`;
}

export interface ImmersiveTerrainTreatment {
  readonly elevation: number;
  readonly roughness: number;
  readonly visibility: number;
}

export type SceneGroupWeights = Readonly<Record<SceneGroupKey, number>>;

export interface ImmersiveStageKeyframe {
  readonly camera: ImmersiveCamera;
  readonly fog: ImmersiveFog;
  readonly terrain: ImmersiveTerrainTreatment;
  readonly groups: SceneGroupWeights;
}

export interface ImmersiveStageDefinition {
  readonly id: ImmersiveStageId;
  readonly space: ImmersiveSpace;
  readonly profiles: Readonly<
    Record<ImmersiveProfile, ImmersiveStageKeyframe>
  >;
}

export interface ImmersiveTransition {
  readonly fromId: ImmersiveStageId;
  readonly toId: ImmersiveStageId;
  readonly dominantStageId: ImmersiveStageId;
  readonly intervalIndex: number;
  readonly localProgress: number;
  readonly easedProgress: number;
  readonly journeyProgress: number;
  readonly isTransitioning: boolean;
}

export interface ImmersiveSceneSample extends ImmersiveStageKeyframe {
  readonly profile: ImmersiveProfile;
  readonly transition: ImmersiveTransition;
}

export interface ImmersiveProfileInput {
  readonly reducedMotion: boolean;
  readonly width: number;
}
