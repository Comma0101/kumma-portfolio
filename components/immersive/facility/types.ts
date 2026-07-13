import type { ImmersiveProfile, ImmersiveStageId, Vec3 } from "../types";

export type FacilityZoneId =
  | "exterior-ridge"
  | "reliability-spine"
  | "fissure-threshold"
  | "voice-chamber"
  | "document-foundry"
  | "orchestration-atrium"
  | "dissolution-observatory"
  | "calibration-deck"
  | "quiet-horizon";

export type FacilityEventId =
  | "approach"
  | "converge-inputs"
  | "cross-threshold"
  | "clarify-route"
  | "segment-document"
  | "recover-route"
  | "reconstruct-depth"
  | "calibrate"
  | "settle";

export interface FacilityChapterDefinition {
  readonly stageId: ImmersiveStageId;
  readonly zone: FacilityZoneId;
  readonly journeyProgress: number;
  readonly routeProgress: number;
  readonly atmosphere: {
    readonly fogColor: `#${string}`;
    readonly fogDensity: number;
    readonly exposure: number;
  };
  readonly camera: {
    readonly fov: number;
    readonly lookAhead: number;
    readonly roll: number;
  };
}

export interface FacilityEventWindow {
  readonly id: FacilityEventId;
  readonly start: number;
  readonly end: number;
}

export interface FacilityNarrativeSample {
  readonly journeyProgress: number;
  readonly routeProgress: number;
  readonly zone: FacilityZoneId;
  readonly event: {
    readonly id: FacilityEventId;
    readonly progress: number;
    readonly intensity: number;
  };
  readonly atmosphere: {
    readonly fogColor: `#${string}`;
    readonly fogDensity: number;
    readonly exposure: number;
  };
  readonly camera: {
    readonly fov: number;
    readonly lookAhead: number;
    readonly roll: number;
  };
  readonly profile: ImmersiveProfile;
}

export interface FacilityCameraSample {
  readonly position: Vec3;
  readonly target: Vec3;
  readonly fov: number;
  readonly roll: number;
}
