export const MAX_MOTION_ENERGY = 0.82;
export const RESTORATION_SPIKE_ENERGY = 0.35;
export const MOTION_SETTLED_EPSILON = 0.001;
export const FRAME_ERROR_EPSILON = 0.003;
export const SETTLED_FRAME_COUNT = 3;

export interface MotionEnergyInput {
  readonly active: boolean;
  readonly hidden: boolean;
  readonly reducedMotion: boolean;
  readonly previousEnergy: number;
  readonly previousProgress: number;
  readonly nextProgress: number;
  readonly deltaSeconds: number;
}

export interface FrameSettlementInput {
  readonly eligible: boolean;
  readonly maxError: number;
  readonly motionEnergy: number;
  readonly stableFrames: number;
}

export interface FrameSettlement {
  readonly settled: boolean;
  readonly shouldContinue: boolean;
  readonly stableFrames: number;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function nextMotionEnergy(input: MotionEnergyInput): number {
  if (!input.active || input.hidden || input.reducedMotion) return 0;

  const previousEnergy = Number.isFinite(input.previousEnergy)
    ? Math.max(0, Math.min(MAX_MOTION_ENERGY, input.previousEnergy))
    : 0;
  const deltaSeconds =
    Number.isFinite(input.deltaSeconds) && input.deltaSeconds > 0
      ? Math.min(0.1, input.deltaSeconds)
      : 1 / 60;
  const progressValid =
    Number.isFinite(input.previousProgress) &&
    Number.isFinite(input.nextProgress);
  const progressDelta = progressValid
    ? Math.abs(clamp01(input.nextProgress) - clamp01(input.previousProgress))
    : 0;
  const impulse =
    progressDelta > 0.18
      ? RESTORATION_SPIKE_ENERGY
      : Math.min(MAX_MOTION_ENERGY, (progressDelta / deltaSeconds) * 0.18);
  const decayed = previousEnergy * Math.exp(-6 * deltaSeconds);
  const next = Math.max(decayed, impulse);
  return next <= MOTION_SETTLED_EPSILON ? 0 : next;
}

export function nextFrameSettlement(
  input: FrameSettlementInput,
): FrameSettlement {
  if (!input.eligible) {
    return Object.freeze({
      settled: true,
      shouldContinue: false,
      stableFrames: 0,
    });
  }

  const stable =
    Number.isFinite(input.maxError) &&
    input.maxError <= FRAME_ERROR_EPSILON &&
    Number.isFinite(input.motionEnergy) &&
    input.motionEnergy <= MOTION_SETTLED_EPSILON;
  const previousStableFrames = Number.isFinite(input.stableFrames)
    ? Math.max(0, Math.floor(input.stableFrames))
    : 0;
  const stableFrames = stable ? previousStableFrames + 1 : 0;
  const settled = stableFrames >= SETTLED_FRAME_COUNT;
  return Object.freeze({
    settled,
    shouldContinue: !settled,
    stableFrames,
  });
}
