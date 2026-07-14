import type { ImmersiveProfile } from "../types";
import type {
  FacilityChapterDefinition,
  FacilityEventWindow,
  FacilityNarrativeSample,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const facilityChapters: readonly FacilityChapterDefinition[] = deepFreeze([
  {
    stageId: "hero",
    zone: "exterior-ridge",
    journeyProgress: 0,
    routeProgress: 0,
    atmosphere: { fogColor: "#0c1211", fogDensity: 0.0115, exposure: 0.98 },
    camera: { fov: 55, lookAhead: 0.036, roll: 0 },
  },
  {
    stageId: "proof",
    zone: "reliability-spine",
    journeyProgress: 1 / 7,
    routeProgress: 0.12,
    atmosphere: { fogColor: "#101817", fogDensity: 0.0125, exposure: 0.96 },
    camera: { fov: 50, lookAhead: 0.033, roll: -0.006 },
  },
  {
    stageId: "kota",
    zone: "voice-chamber",
    journeyProgress: 2 / 7,
    routeProgress: 0.29,
    atmosphere: { fogColor: "#16211e", fogDensity: 0.026, exposure: 0.88 },
    camera: { fov: 46, lookAhead: 0.027, roll: 0.008 },
  },
  {
    stageId: "audiobook",
    zone: "document-foundry",
    journeyProgress: 3 / 7,
    routeProgress: 0.43,
    atmosphere: { fogColor: "#202219", fogDensity: 0.018, exposure: 0.9 },
    camera: { fov: 47, lookAhead: 0.03, roll: -0.007 },
  },
  {
    stageId: "archon",
    zone: "orchestration-atrium",
    journeyProgress: 4 / 7,
    routeProgress: 0.59,
    atmosphere: { fogColor: "#111b19", fogDensity: 0.013, exposure: 1 },
    camera: { fov: 56, lookAhead: 0.04, roll: 0.016 },
  },
  {
    stageId: "splash-ink",
    zone: "dissolution-observatory",
    journeyProgress: 5 / 7,
    routeProgress: 0.74,
    atmosphere: { fogColor: "#252027", fogDensity: 0.016, exposure: 0.96 },
    camera: { fov: 52, lookAhead: 0.035, roll: -0.014 },
  },
  {
    stageId: "research-labs",
    zone: "calibration-deck",
    journeyProgress: 6 / 7,
    routeProgress: 0.87,
    atmosphere: { fogColor: "#1c2824", fogDensity: 0.009, exposure: 1.03 },
    camera: { fov: 46, lookAhead: 0.042, roll: -0.004 },
  },
  {
    stageId: "contact",
    zone: "quiet-horizon",
    journeyProgress: 1,
    routeProgress: 1,
    atmosphere: { fogColor: "#38443c", fogDensity: 0.0055, exposure: 1.08 },
    camera: { fov: 49, lookAhead: 0.048, roll: 0 },
  },
]);

export const facilityEventWindows: readonly FacilityEventWindow[] = deepFreeze([
  { id: "approach", start: 0, end: 0.11 },
  { id: "converge-inputs", start: 0.11, end: 0.22 },
  { id: "cross-threshold", start: 0.22, end: 0.31 },
  { id: "clarify-route", start: 0.31, end: 0.43 },
  { id: "segment-document", start: 0.43, end: 0.55 },
  { id: "recover-route", start: 0.55, end: 0.67 },
  { id: "reconstruct-depth", start: 0.67, end: 0.79 },
  { id: "calibrate", start: 0.79, end: 0.9 },
  { id: "settle", start: 0.9, end: 1 },
]);

function clamp01(value: number): number {
  if (Number.isNaN(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function smoothstep(value: number): number {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

function interpolateColor(
  from: `#${string}`,
  to: `#${string}`,
  progress: number,
): `#${string}` {
  const parse = (color: string) => [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ];
  const a = parse(from);
  const b = parse(to);
  return `#${a
    .map((channel, index) =>
      Math.round(lerp(channel, b[index], progress))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function chapterInterval(progress: number): {
  readonly from: FacilityChapterDefinition;
  readonly to: FacilityChapterDefinition;
  readonly local: number;
} {
  const lastIndex = facilityChapters.length - 1;
  const scaled = progress * lastIndex;
  const index = Math.min(Math.floor(scaled), lastIndex - 1);
  return {
    from: facilityChapters[index],
    to: facilityChapters[index + 1],
    local: progress === 1 ? 1 : scaled - index,
  };
}

function eventFor(progress: number) {
  const eventWindow =
    facilityEventWindows.find((window, index) =>
      index === facilityEventWindows.length - 1
        ? progress >= window.start && progress <= window.end
        : progress >= window.start && progress < window.end,
    ) ?? facilityEventWindows[0];
  const span = Math.max(Number.EPSILON, eventWindow.end - eventWindow.start);
  const eventProgress = clamp01((progress - eventWindow.start) / span);
  const intensity =
    eventWindow.id === "settle"
      ? 1 - smoothstep(eventProgress)
      : Math.sin(eventProgress * Math.PI);
  return {
    id: eventWindow.id,
    progress: eventProgress,
    intensity: clamp01(intensity),
  } as const;
}

function profileTreatment(
  profile: ImmersiveProfile,
  value: { fov: number; lookAhead: number; roll: number; fogDensity: number; exposure: number },
) {
  if (profile === "desktop") return value;
  const scale = profile === "mobile" ? 0.62 : 0.35;
  return {
    fov: lerp(49, value.fov, scale),
    lookAhead: lerp(0.03, value.lookAhead, scale),
    roll: value.roll * scale,
    fogDensity: lerp(0.014, value.fogDensity, scale),
    exposure: lerp(0.94, value.exposure, scale),
  };
}

export function sampleFacilityNarrative(
  journeyProgress: number,
  profile: ImmersiveProfile,
): FacilityNarrativeSample {
  const clamped = clamp01(journeyProgress);
  const sampleProgress =
    profile === "reduced"
      ? Math.round(clamped * (facilityChapters.length - 1)) /
        (facilityChapters.length - 1)
      : clamped;
  const { from, to, local } = chapterInterval(sampleProgress);
  const eased = profile === "reduced" ? local : smoothstep(local);
  const dominant = eased < 0.5 ? from : to;
  const raw = {
    fov: lerp(from.camera.fov, to.camera.fov, eased),
    lookAhead: lerp(from.camera.lookAhead, to.camera.lookAhead, eased),
    roll: lerp(from.camera.roll, to.camera.roll, eased),
    fogDensity: lerp(
      from.atmosphere.fogDensity,
      to.atmosphere.fogDensity,
      eased,
    ),
    exposure: lerp(from.atmosphere.exposure, to.atmosphere.exposure, eased),
  };
  const treatment = profileTreatment(profile, raw);

  return deepFreeze({
    journeyProgress: sampleProgress,
    routeProgress: lerp(from.routeProgress, to.routeProgress, eased),
    zone: dominant.zone,
    event: eventFor(sampleProgress),
    atmosphere: {
      fogColor: interpolateColor(
        from.atmosphere.fogColor,
        to.atmosphere.fogColor,
        eased,
      ),
      fogDensity: treatment.fogDensity,
      exposure: treatment.exposure,
    },
    camera: {
      fov: treatment.fov,
      lookAhead: treatment.lookAhead,
      roll: treatment.roll,
    },
    profile,
  });
}
