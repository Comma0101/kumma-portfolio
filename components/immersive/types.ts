export type ImmersiveStageId =
  | "hero"
  | "proof"
  | "kota"
  | "audiobook"
  | "archon"
  | "splash-ink"
  | "research-labs"
  | "contact";

export type ImmersiveProfile = "desktop" | "mobile" | "reduced";

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface ImmersiveProfileInput {
  readonly reducedMotion: boolean;
  readonly width: number;
}
