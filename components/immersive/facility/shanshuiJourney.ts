import type { ThreeSceneProfile } from "../../threeSceneTuning";
import type { ImmersiveStageId } from "../types";

export type ShanshuiMotif = "boat" | "bamboo" | "birds" | "fish" | "mist";

export type ShanshuiPerspective =
  | "high-distance"
  | "deep-distance"
  | "level-distance";

export interface ShanshuiMotifChapter {
  readonly stageId: ImmersiveStageId;
  readonly perspective: ShanshuiPerspective;
  readonly landscape: string;
  readonly boatId: "traveller-boat";
  readonly motifs: readonly ShanshuiMotif[];
}

export interface BoatJourneySample {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
  readonly wake: number;
  readonly moored: boolean;
}

export interface LivingWorldMotionSample {
  /** Signed sway amount. Consumers choose the final rotation amplitude. */
  readonly bambooSway: number;
  /** Normalized authored flight offset for the ARCHON flock. */
  readonly birdFlight: number;
  /** Normalized semantic reveal; it remains visible as a still reduced-motion pose. */
  readonly fishReveal: number;
  /** Normalized mist translation phase across the proof/KOTA threshold. */
  readonly mistDrift: number;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

/**
 * The living handscroll's semantic contract. Decorative life is deliberately
 * sparse: the same boat provides continuity and scale while every other motif
 * belongs to exactly one narrative territory.
 */
export const shanshuiMotifChapters: readonly ShanshuiMotifChapter[] = deepFreeze([
  {
    stageId: "hero",
    perspective: "high-distance",
    landscape: "monumental-peak-overlook",
    boatId: "traveller-boat",
    motifs: ["boat"],
  },
  {
    stageId: "proof",
    perspective: "deep-distance",
    landscape: "converging-river-and-mist-gate",
    boatId: "traveller-boat",
    motifs: ["boat", "bamboo", "mist"],
  },
  {
    stageId: "kota",
    perspective: "deep-distance",
    landscape: "bamboo-gorge-and-clarified-channel",
    boatId: "traveller-boat",
    motifs: ["boat", "bamboo", "mist"],
  },
  {
    stageId: "audiobook",
    perspective: "level-distance",
    landscape: "layered-paper-stone-river",
    boatId: "traveller-boat",
    motifs: ["boat"],
  },
  {
    stageId: "archon",
    perspective: "high-distance",
    landscape: "bridged-mountain-pass",
    boatId: "traveller-boat",
    motifs: ["boat", "birds"],
  },
  {
    stageId: "splash-ink",
    perspective: "deep-distance",
    landscape: "ink-water-depth-observatory",
    boatId: "traveller-boat",
    motifs: ["boat", "fish"],
  },
  {
    stageId: "research-labs",
    perspective: "high-distance",
    landscape: "quiet-survey-terrace",
    boatId: "traveller-boat",
    motifs: ["boat"],
  },
  {
    stageId: "contact",
    perspective: "level-distance",
    landscape: "open-lake-and-distant-shore",
    boatId: "traveller-boat",
    motifs: ["boat"],
  },
]);

// The boat begins beyond the first river bend so it establishes human scale
// without becoming a foreground illustration over the hero copy.
const HERO_BOAT_Z = -2;
const CONTACT_BOAT_Z = -154;
const MOORING_PROGRESS = 0.965;

function clamp01(value: number): number {
  if (Number.isNaN(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function smoothstep(value: number): number {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

function phase01(value: number): number {
  const remainder = value % 1;
  return remainder < 0 ? remainder + 1 : remainder;
}

function windowPresence(
  progress: number,
  start: number,
  plateauStart: number,
  plateauEnd: number,
  end: number,
): number {
  if (progress <= start || progress >= end) return 0;
  if (progress < plateauStart) {
    return smoothstep((progress - start) / (plateauStart - start));
  }
  if (progress <= plateauEnd) return 1;
  return 1 - smoothstep((progress - plateauEnd) / (end - plateauEnd));
}

/** Matches the terrain shader's authored river/route centerline. */
export function riverCenterAtDepth(worldZ: number): number {
  const finiteDepth = finiteOr(worldZ, 0);
  return Math.sin((finiteDepth + 48) * 0.035) * 1.45;
}

/**
 * Samples the single traveller boat from the hero river to the contact shore.
 * Its depth is strictly ordered by scroll progress and its lateral position is
 * always derived from the same centerline used to carve the terrain.
 */
export function sampleBoatJourney(progress: number): BoatJourneySample {
  const clamped = clamp01(progress);
  const z = lerp(HERO_BOAT_Z, CONTACT_BOAT_Z, clamped);
  const x = riverCenterAtDepth(z);
  const routeDerivative =
    Math.cos((z + 48) * 0.035) * 1.45 * 0.035;
  const travelZ = CONTACT_BOAT_Z - HERO_BOAT_Z;
  // The hull's authored bow points down its local -Z axis. Rotating by the
  // river tangent (rather than its opposite) keeps it facing downstream.
  const heading = Math.atan2(routeDerivative, 1);
  const moored = clamped >= MOORING_PROGRESS;
  const departure = smoothstep(clamped / 0.04);
  const arrival = smoothstep((MOORING_PROGRESS - clamped) / 0.12);

  return deepFreeze({
    x,
    y: -0.34 + Math.sin(clamped * Math.PI) * 0.02,
    z,
    heading,
    wake: moored ? 0 : clamp01(departure * arrival),
    moored,
  });
}

function profileMotionScale(profile: ThreeSceneProfile): number {
  if (profile === "desktop") return 1;
  if (profile === "constrained") return 0.78;
  if (profile === "mobile") return 0.58;
  return 0;
}

/**
 * Pure, deterministic motion state for the four living-world motifs. Time only
 * influences a motif inside its authored territory and while motion energy is
 * available. Reduced motion keeps the Splash Ink fish as a still composition.
 */
export function sampleLivingWorldMotion(
  journeyProgress: number,
  elapsedSeconds: number,
  motionEnergy: number,
  profile: ThreeSceneProfile,
): LivingWorldMotionSample {
  const progress = clamp01(journeyProgress);
  const elapsed = Math.max(0, finiteOr(elapsedSeconds, 0));
  const energy = clamp01(motionEnergy);
  const profileScale = profileMotionScale(profile);

  const bambooPresence = windowPresence(progress, 0.105, 0.14, 0.34, 0.43);
  const birdPresence = windowPresence(progress, 0.5, 0.55, 0.62, 0.665);
  const fishPresence = windowPresence(progress, 0.665, 0.7, 0.77, 0.8);
  const mistPresence = bambooPresence;

  if (profile === "reduced") {
    return deepFreeze({
      bambooSway: 0,
      birdFlight: 0,
      fishReveal: fishPresence,
      mistDrift: 0,
    });
  }

  const bambooSway =
    Math.sin(elapsed * 0.55 + progress * Math.PI * 4) *
    0.72 *
    bambooPresence *
    energy *
    profileScale;
  const birdFlight =
    birdPresence *
    energy *
    profileScale *
    (0.18 + 0.82 * phase01(elapsed * 0.08 + progress * 0.35));
  const fishPulse =
    0.82 +
    0.18 *
      profileScale *
      energy *
      (0.5 + 0.5 * Math.sin(elapsed * 0.42 + progress * Math.PI * 2));
  const mistDrift =
    mistPresence *
    energy *
    profileScale *
    phase01(elapsed * 0.025 + progress * 0.4);

  return deepFreeze({
    bambooSway: Math.max(-1, Math.min(1, bambooSway)),
    birdFlight: clamp01(birdFlight),
    fishReveal: clamp01(fishPresence * fishPulse),
    mistDrift: clamp01(mistDrift),
  });
}
