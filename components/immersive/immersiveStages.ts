import type {
  ImmersiveProfile,
  ImmersiveProfileInput,
  ImmersiveSceneSample,
  ImmersiveSpace,
  ImmersiveStageDefinition,
  ImmersiveStageId,
  ImmersiveStageKeyframe,
  SceneGroupKey,
  SceneGroupWeights,
  Vec3,
} from "./types";

const MOBILE_BREAKPOINT = 768;
const MOBILE_TRAVEL_SCALE = 0.55;
const REDUCED_TRAVEL_SCALE = 0.35;

const groupKeys: readonly SceneGroupKey[] = [
  "horizon",
  "signals",
  "voice",
  "document",
  "orchestration",
  "splats",
  "measurement",
];

interface StageSeed {
  readonly id: ImmersiveStageId;
  readonly space: ImmersiveSpace;
  readonly desktop: ImmersiveStageKeyframe;
}

const stageSeeds: readonly StageSeed[] = [
  {
    id: "hero",
    space: "open horizon",
    desktop: {
      camera: {
        position: { x: 0, y: 7.5, z: 18 },
        target: { x: 0, y: 1, z: -4 },
        fov: 58,
      },
      fog: { density: 0.012, color: "#13212a" },
      terrain: { elevation: 0.85, roughness: 0.55, visibility: 1 },
      groups: {
        horizon: 0.62,
        signals: 0.12,
        voice: 0.05,
        document: 0.05,
        orchestration: 0.05,
        splats: 0.04,
        measurement: 0.07,
      },
    },
  },
  {
    id: "proof",
    space: "signal corridor",
    desktop: {
      camera: {
        position: { x: -3, y: 4.2, z: 10.5 },
        target: { x: 0, y: 1.3, z: -8 },
        fov: 48,
      },
      fog: { density: 0.028, color: "#15262c" },
      terrain: { elevation: 0.6, roughness: 0.4, visibility: 0.82 },
      groups: {
        horizon: 0.16,
        signals: 0.55,
        voice: 0.1,
        document: 0.04,
        orchestration: 0.07,
        splats: 0.02,
        measurement: 0.06,
      },
    },
  },
  {
    id: "kota",
    space: "voice tunnel",
    desktop: {
      camera: {
        position: { x: 2.5, y: 2.8, z: 4 },
        target: { x: 0, y: 1, z: -12 },
        fov: 42,
      },
      fog: { density: 0.045, color: "#102832" },
      terrain: { elevation: 0.35, roughness: 0.2, visibility: 0.55 },
      groups: {
        horizon: 0.06,
        signals: 0.16,
        voice: 0.58,
        document: 0.05,
        orchestration: 0.08,
        splats: 0.02,
        measurement: 0.05,
      },
    },
  },
  {
    id: "audiobook",
    space: "document chamber",
    desktop: {
      camera: {
        position: { x: -4, y: 5, z: 7 },
        target: { x: 0, y: 0, z: -18 },
        fov: 46,
      },
      fog: { density: 0.034, color: "#1a2630" },
      terrain: { elevation: 0.3, roughness: 0.12, visibility: 0.45 },
      groups: {
        horizon: 0.06,
        signals: 0.08,
        voice: 0.08,
        document: 0.58,
        orchestration: 0.1,
        splats: 0.02,
        measurement: 0.08,
      },
    },
  },
  {
    id: "archon",
    space: "orchestration constellation",
    desktop: {
      camera: {
        position: { x: 7, y: 8, z: 15 },
        target: { x: 0, y: 2, z: -20 },
        fov: 60,
      },
      fog: { density: 0.015, color: "#101d2b" },
      terrain: { elevation: 0.45, roughness: 0.3, visibility: 0.65 },
      groups: {
        horizon: 0.12,
        signals: 0.08,
        voice: 0.04,
        document: 0.05,
        orchestration: 0.6,
        splats: 0.04,
        measurement: 0.07,
      },
    },
  },
  {
    id: "splash-ink",
    space: "splat landscape",
    desktop: {
      camera: {
        position: { x: -9, y: 4, z: 9 },
        target: { x: 1, y: 1, z: -22 },
        fov: 54,
      },
      fog: { density: 0.022, color: "#281b25" },
      terrain: { elevation: 0.75, roughness: 0.65, visibility: 0.8 },
      groups: {
        horizon: 0.1,
        signals: 0.03,
        voice: 0.03,
        document: 0.04,
        orchestration: 0.08,
        splats: 0.6,
        measurement: 0.12,
      },
    },
  },
  {
    id: "research-labs",
    space: "measurement plane",
    desktop: {
      camera: {
        position: { x: 3, y: 10, z: 14 },
        target: { x: 0, y: 0, z: -26 },
        fov: 38,
      },
      fog: { density: 0.01, color: "#182126" },
      terrain: { elevation: 0.18, roughness: 0.08, visibility: 0.55 },
      groups: {
        horizon: 0.1,
        signals: 0.09,
        voice: 0.03,
        document: 0.04,
        orchestration: 0.05,
        splats: 0.05,
        measurement: 0.64,
      },
    },
  },
  {
    id: "contact",
    space: "quiet horizon",
    desktop: {
      camera: {
        position: { x: 0, y: 6, z: 20 },
        target: { x: 0, y: 0.7, z: -8 },
        fov: 50,
      },
      fog: { density: 0.008, color: "#172025" },
      terrain: { elevation: 0.28, roughness: 0.18, visibility: 0.7 },
      groups: {
        horizon: 0.7,
        signals: 0.04,
        voice: 0.03,
        document: 0.03,
        orchestration: 0.04,
        splats: 0.03,
        measurement: 0.13,
      },
    },
  },
];

const mobilePositionAnchor: Vec3 = { x: 0, y: 4, z: 10 };
const mobileTargetAnchor: Vec3 = { x: 0, y: 1, z: -12 };

function scaleAround(value: number, anchor: number, scale: number): number {
  return anchor + (value - anchor) * scale;
}

function scaleVec3(value: Vec3, anchor: Vec3, scale: number): Vec3 {
  return {
    x: scaleAround(value.x, anchor.x, scale),
    y: scaleAround(value.y, anchor.y, scale),
    z: scaleAround(value.z, anchor.z, scale),
  };
}

function copyGroups(groups: SceneGroupWeights): SceneGroupWeights {
  return {
    horizon: groups.horizon,
    signals: groups.signals,
    voice: groups.voice,
    document: groups.document,
    orchestration: groups.orchestration,
    splats: groups.splats,
    measurement: groups.measurement,
  };
}

function makeMobileKeyframe(
  desktop: ImmersiveStageKeyframe,
): ImmersiveStageKeyframe {
  return {
    camera: {
      position: scaleVec3(
        desktop.camera.position,
        mobilePositionAnchor,
        MOBILE_TRAVEL_SCALE,
      ),
      target: scaleVec3(
        desktop.camera.target,
        mobileTargetAnchor,
        MOBILE_TRAVEL_SCALE,
      ),
      fov: scaleAround(desktop.camera.fov, 48, 0.45),
    },
    fog: {
      density: scaleAround(desktop.fog.density, 0.021, 0.45),
      color: desktop.fog.color,
    },
    terrain: {
      elevation: scaleAround(desktop.terrain.elevation, 0.45, 0.7),
      roughness: scaleAround(desktop.terrain.roughness, 0.25, 0.7),
      visibility: scaleAround(desktop.terrain.visibility, 0.65, 0.7),
    },
    groups: copyGroups(desktop.groups),
  };
}

function makeReducedKeyframe(
  mobile: ImmersiveStageKeyframe,
): ImmersiveStageKeyframe {
  return {
    camera: {
      position: scaleVec3(
        mobile.camera.position,
        mobilePositionAnchor,
        REDUCED_TRAVEL_SCALE,
      ),
      target: scaleVec3(
        mobile.camera.target,
        mobileTargetAnchor,
        REDUCED_TRAVEL_SCALE,
      ),
      fov: scaleAround(mobile.camera.fov, 48, 0.25),
    },
    fog: {
      density: scaleAround(mobile.fog.density, 0.02, 0.25),
      color: mobile.fog.color,
    },
    terrain: {
      elevation: scaleAround(mobile.terrain.elevation, 0.4, 0.5),
      roughness: scaleAround(mobile.terrain.roughness, 0.2, 0.5),
      visibility: scaleAround(mobile.terrain.visibility, 0.6, 0.5),
    },
    groups: copyGroups(mobile.groups),
  };
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}

export const immersiveStageIds: readonly ImmersiveStageId[] = deepFreeze(
  stageSeeds.map((stage) => stage.id),
);

export const immersiveStages: readonly ImmersiveStageDefinition[] = deepFreeze(
  stageSeeds.map((stage) => {
    const mobile = makeMobileKeyframe(stage.desktop);
    const reduced = makeReducedKeyframe(mobile);

    return {
      id: stage.id,
      space: stage.space,
      profiles: {
        desktop: stage.desktop,
        mobile,
        reduced,
      },
    };
  }),
);

export function clamp01(value: number): number {
  if (Number.isNaN(value) || value <= 0) {
    return 0;
  }

  if (value >= 1) {
    return 1;
  }

  return value;
}

export function smoothstep(value: number): number {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

export function getImmersiveProfile({
  reducedMotion,
  width,
}: ImmersiveProfileInput): ImmersiveProfile {
  if (reducedMotion) {
    return "reduced";
  }

  return width < MOBILE_BREAKPOINT ? "mobile" : "desktop";
}

export function getImmersiveStage(
  id: ImmersiveStageId,
): ImmersiveStageDefinition {
  const stage = immersiveStages.find((candidate) => candidate.id === id);

  if (!stage) {
    throw new RangeError(`Unknown immersive stage: ${String(id)}`);
  }

  return stage;
}

function getKeyframe(
  stage: ImmersiveStageDefinition,
  profile: ImmersiveProfile,
): ImmersiveStageKeyframe {
  const keyframe = stage.profiles[profile];

  if (!keyframe) {
    throw new RangeError(`Unknown immersive profile: ${String(profile)}`);
  }

  return keyframe;
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function lerpVec3(from: Vec3, to: Vec3, progress: number): Vec3 {
  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
    z: lerp(from.z, to.z, progress),
  };
}

function parseColor(color: `#${string}`): readonly [number, number, number] {
  return [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ];
}

function lerpColor(
  from: `#${string}`,
  to: `#${string}`,
  progress: number,
): `#${string}` {
  if (progress === 0) {
    return from;
  }

  if (progress === 1) {
    return to;
  }

  const fromChannels = parseColor(from);
  const toChannels = parseColor(to);
  const channels = fromChannels.map((channel, index) =>
    Math.round(lerp(channel, toChannels[index], progress)),
  );

  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function lerpGroups(
  from: SceneGroupWeights,
  to: SceneGroupWeights,
  progress: number,
): SceneGroupWeights {
  const interpolated = Object.fromEntries(
    groupKeys.map((key) => [key, lerp(from[key], to[key], progress)]),
  ) as Record<SceneGroupKey, number>;
  const total = groupKeys.reduce((sum, key) => sum + interpolated[key], 0);

  return Object.fromEntries(
    groupKeys.map((key) => [key, interpolated[key] / total]),
  ) as SceneGroupWeights;
}

function interpolateKeyframes(
  from: ImmersiveStageKeyframe,
  to: ImmersiveStageKeyframe,
  progress: number,
): ImmersiveStageKeyframe {
  if (progress === 0) {
    return from;
  }

  if (progress === 1) {
    return to;
  }

  return {
    camera: {
      position: lerpVec3(from.camera.position, to.camera.position, progress),
      target: lerpVec3(from.camera.target, to.camera.target, progress),
      fov: lerp(from.camera.fov, to.camera.fov, progress),
    },
    fog: {
      density: lerp(from.fog.density, to.fog.density, progress),
      color: lerpColor(from.fog.color, to.fog.color, progress),
    },
    terrain: {
      elevation: lerp(
        from.terrain.elevation,
        to.terrain.elevation,
        progress,
      ),
      roughness: lerp(
        from.terrain.roughness,
        to.terrain.roughness,
        progress,
      ),
      visibility: lerp(
        from.terrain.visibility,
        to.terrain.visibility,
        progress,
      ),
    },
    groups: lerpGroups(from.groups, to.groups, progress),
  };
}

export function sampleStagePair(
  fromId: ImmersiveStageId,
  toId: ImmersiveStageId,
  localProgress: number,
  profile: ImmersiveProfile,
): ImmersiveSceneSample {
  const fromStage = getImmersiveStage(fromId);
  const toStage = getImmersiveStage(toId);
  const intervalIndex = immersiveStageIds.indexOf(fromStage.id);
  const toIndex = immersiveStageIds.indexOf(toStage.id);

  if (toIndex !== intervalIndex + 1) {
    throw new RangeError(
      `Immersive stages must be adjacent: ${fromId} -> ${toId}`,
    );
  }

  const progress = clamp01(localProgress);
  const from = getKeyframe(fromStage, profile);
  const to = getKeyframe(toStage, profile);
  const easedProgress =
    profile === "reduced" ? (progress < 0.5 ? 0 : 1) : smoothstep(progress);
  const state = interpolateKeyframes(from, to, easedProgress);
  const dominantStageId = easedProgress < 0.5 ? fromId : toId;

  return {
    ...state,
    profile,
    transition: {
      fromId,
      toId,
      dominantStageId,
      intervalIndex,
      localProgress: progress,
      easedProgress,
      journeyProgress:
        (intervalIndex + progress) / (immersiveStageIds.length - 1),
      isTransitioning:
        profile !== "reduced" && progress > 0 && progress < 1,
    },
  };
}

export function sampleImmersiveJourney(
  journeyProgress: number,
  profile: ImmersiveProfile,
): ImmersiveSceneSample {
  const progress = clamp01(journeyProgress);
  const intervalCount = immersiveStageIds.length - 1;
  const scaledProgress = progress * intervalCount;
  const nearestBoundary = Math.round(scaledProgress);
  const snappedProgress =
    Math.abs(scaledProgress - nearestBoundary) < Number.EPSILON * intervalCount
      ? nearestBoundary
      : scaledProgress;
  const intervalIndex = Math.min(Math.floor(snappedProgress), intervalCount - 1);
  const localProgress =
    progress === 1 ? 1 : snappedProgress - intervalIndex;

  return sampleStagePair(
    immersiveStageIds[intervalIndex],
    immersiveStageIds[intervalIndex + 1],
    localProgress,
    profile,
  );
}
