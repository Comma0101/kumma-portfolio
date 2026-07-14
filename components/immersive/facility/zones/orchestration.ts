import * as THREE from "three";
import type { Vec3 } from "../../types";
import { sampleLivingWorldMotion } from "../shanshuiJourney";
import {
  createMountainCluster,
  createStoneCluster,
  type MountainPlacement,
} from "../shanshuiPrimitives";
import type { FacilityNarrativeSample } from "../types";
import {
  clamp01,
  eventProgressFor,
  setZoneBounds,
  type FacilityZoneContext,
} from "./shared";

export type OrchestrationPhase =
  | "receiving"
  | "attempting"
  | "blocked"
  | "recovering"
  | "resolved";

export type MovingRouteHead = "incoming" | "worker" | "recovery" | null;

export interface OrchestrationState {
  readonly phase: OrchestrationPhase;
  readonly incomingProgress: number;
  readonly workerProgress: number;
  readonly recoveryProgress: number;
  readonly blocked: boolean;
  readonly movingHead: MovingRouteHead;
  readonly headPosition: Vec3;
}

export interface OrchestrationFacilityZone {
  readonly root: THREE.Group;
  update(
    sample: FacilityNarrativeSample,
    elapsedSeconds?: number,
    motionEnergy?: number,
  ): void;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach((child) => deepFreeze(child));
  return Object.freeze(value);
}

export const orchestrationRoutePoints: Readonly<{
  incoming: readonly Vec3[];
  worker: readonly Vec3[];
  recovery: readonly Vec3[];
}> = deepFreeze({
  incoming: [
    { x: 0, y: 0.9, z: -68.2 },
    { x: 1.6, y: 1.35, z: -74.5 },
    { x: 3.8, y: 2.15, z: -79.5 },
  ],
  worker: [
    { x: 3.8, y: 2.15, z: -79.5 },
    { x: 6.7, y: 1.75, z: -83.2 },
    { x: 8.35, y: 1.2, z: -86.7 },
  ],
  recovery: [
    { x: 3.8, y: 2.15, z: -79.5 },
    { x: -0.5, y: 0.72, z: -85.2 },
    { x: 1.8, y: 1.45, z: -91.2 },
    { x: 6.2, y: 0.92, z: -97.2 },
  ],
});

function smoothstep(value: number): number {
  const safe = clamp01(value);
  return safe * safe * (3 - 2 * safe);
}

function routeProgress(progress: number, start: number, end: number): number {
  return smoothstep((progress - start) / Math.max(Number.EPSILON, end - start));
}

function pointOnRoute(points: readonly Vec3[], progress: number): Vec3 {
  const safe = clamp01(progress);
  const scaled = safe * (points.length - 1);
  const index = Math.min(Math.floor(scaled), points.length - 2);
  const local = scaled - index;
  const from = points[index];
  const to = points[index + 1];
  return {
    x: from.x + (to.x - from.x) * local,
    y: from.y + (to.y - from.y) * local,
    z: from.z + (to.z - from.z) * local,
  };
}

export function orchestrationStateAt(progress: number): OrchestrationState {
  const safe = clamp01(progress);
  const incomingProgress = routeProgress(safe, 0, 0.22);
  const workerProgress = routeProgress(safe, 0.22, 0.52);
  const recoveryProgress = routeProgress(safe, 0.64, 0.92);
  const blocked = safe >= 0.52;

  let phase: OrchestrationPhase;
  let movingHead: MovingRouteHead;
  let headPosition: Vec3;

  if (safe < 0.22) {
    phase = "receiving";
    movingHead = safe === 0 ? null : "incoming";
    headPosition = pointOnRoute(orchestrationRoutePoints.incoming, incomingProgress);
  } else if (safe < 0.52) {
    phase = "attempting";
    movingHead = "worker";
    headPosition = pointOnRoute(orchestrationRoutePoints.worker, workerProgress);
  } else if (safe < 0.64) {
    phase = "blocked";
    movingHead = null;
    headPosition = orchestrationRoutePoints.worker.at(-1)!;
  } else if (safe < 0.92) {
    phase = "recovering";
    movingHead = "recovery";
    headPosition = pointOnRoute(orchestrationRoutePoints.recovery, recoveryProgress);
  } else {
    phase = "resolved";
    movingHead = null;
    headPosition = orchestrationRoutePoints.recovery.at(-1)!;
  }

  return deepFreeze({
    phase,
    incomingProgress,
    workerProgress,
    recoveryProgress,
    blocked,
    movingHead,
    headPosition: { ...headPosition },
  });
}

function bridgePlacements(
  points: readonly Vec3[],
  count: number,
  start: number,
  end: number,
): MountainPlacement[] {
  return Array.from({ length: count }, (_, index) => {
    const fraction = count === 1 ? 0 : index / (count - 1);
    const progress = THREE.MathUtils.lerp(start, end, fraction);
    const point = pointOnRoute(points, progress);
    const ahead = pointOnRoute(points, Math.min(1, progress + 0.015));
    return {
      position: [point.x, point.y - 0.2, point.z],
      scale: [0.48, 0.12, 0.66],
      rotationY: Math.atan2(ahead.x - point.x, ahead.z - point.z),
    };
  });
}

function createInkBirdGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        0, 0, 0, -0.92, 0.16, 0.02, -0.18, 0.34, 0.06, 0, 0, 0, 0.18,
        0.34, 0.06, 0.92, 0.16, 0.02,
      ],
      3,
    ),
  );
  geometry.setIndex([0, 2, 1, 3, 5, 4]);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

interface BirdDefinition {
  readonly offset: readonly [number, number, number];
  readonly scale: number;
  readonly tilt: number;
}

const authoredBirds: readonly BirdDefinition[] = Object.freeze([
  { offset: [0, 0, 0], scale: 0.9, tilt: -0.06 },
  { offset: [-1.7, 0.82, 1.15], scale: 0.68, tilt: 0.08 },
  { offset: [1.55, 0.48, 2.3], scale: 0.74, tilt: -0.12 },
  { offset: [-3.1, 1.42, 3.4], scale: 0.58, tilt: 0.14 },
  { offset: [3, 1.12, 4.2], scale: 0.62, tilt: -0.04 },
  { offset: [-4.35, 2.05, 5.25], scale: 0.48, tilt: 0.1 },
  { offset: [4.2, 1.78, 6.1], scale: 0.52, tilt: -0.09 },
]);

function birdCountFor(context: FacilityZoneContext): number {
  if (context.tuning.profile === "desktop") return authoredBirds.length;
  if (context.tuning.profile === "constrained") return 5;
  if (context.tuning.profile === "mobile") return 4;
  return 3;
}

function createInkBirdFlock(context: FacilityZoneContext): THREE.InstancedMesh {
  const flock = new THREE.InstancedMesh(
    context.tracker.track(createInkBirdGeometry()),
    context.materials.guide,
    birdCountFor(context),
  );
  flock.name = "shanshui-archon-ink-bird-flock";
  flock.userData.signature = true;
  flock.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return flock;
}

function updateInkBirdFlock(
  flock: THREE.InstancedMesh,
  rawFlight: number,
): void {
  const flight = clamp01(rawFlight);
  const transform = new THREE.Object3D();
  for (let index = 0; index < flock.count; index += 1) {
    const bird = authoredBirds[index];
    transform.position.set(
      THREE.MathUtils.lerp(8, -5, flight) + bird.offset[0],
      6.7 + Math.sin(flight * Math.PI) * 1.6 + bird.offset[1],
      THREE.MathUtils.lerp(-84, -94, flight) + bird.offset[2],
    );
    transform.scale.setScalar(bird.scale * 0.92);
    transform.rotation.set(
      -0.08 + Math.sin(flight * Math.PI) * 0.06,
      0,
      bird.tilt + Math.sin(flight * Math.PI * 2 + index * 0.7) * 0.035,
    );
    transform.updateMatrix();
    flock.setMatrixAt(index, transform.matrix);
  }
  flock.instanceMatrix.needsUpdate = true;
  flock.userData.flight = flight;
}

export function createOrchestrationFacilityZone(
  context: FacilityZoneContext,
): OrchestrationFacilityZone {
  const root = setZoneBounds(new THREE.Group(), -101, -69);
  root.name = "shanshui-archon-mountain-pass-zone";

  const passMountains = createMountainCluster(
    context,
    "shanshui-archon-vertical-pass",
    "tall",
    [
      {
        position: [-21.5, -1.45, -72],
        scale: [5.2, 14.2, 5.4],
        rotationY: 0.28,
      },
      {
        position: [22.2, -1.4, -76],
        scale: [5.4, 16.2, 5.5],
        rotationY: -0.34,
      },
      {
        position: [-24.2, -1.48, -85],
        scale: [5.8, 17.4, 5.8],
        rotationY: -0.42,
      },
      {
        position: [23.7, -1.42, -89.5],
        scale: [5.9, 15.4, 5.9],
        rotationY: 0.48,
      },
      {
        position: [-25.4, -1.5, -97],
        scale: [5.7, 18.2, 5.6],
        rotationY: 0.2,
      },
      {
        position: [24.8, -1.46, -98],
        scale: [5.6, 14.8, 5.4],
        rotationY: -0.54,
      },
    ],
  );
  const distantRidges = createMountainCluster(
    context,
    "shanshui-archon-distant-ridges",
    "broad",
    [
      {
        position: [-31, -1.6, -77],
        scale: [8.5, 9.5, 8.2],
        rotationY: 0.34,
      },
      {
        position: [30, -1.55, -87],
        scale: [8.2, 10.8, 8.1],
        rotationY: -0.27,
      },
      {
        position: [-32, -1.6, -98],
        scale: [8.7, 12.2, 8],
        rotationY: 0.51,
      },
    ],
    context.materials.shell,
  );
  const coordinatorSummit = createMountainCluster(
    context,
    "shanshui-archon-coordinator-summit",
    "broad",
    [
      {
        position: [3.8, -1.3, -79.5],
        scale: [1.7, 2.35, 1.85],
        rotationY: 0.22,
      },
    ],
  );
  const coordinatorStone = createStoneCluster(
    context,
    "shanshui-archon-coordinator-stone",
    [
      {
        position: [3.8, 1.78, -79.5],
        scale: [0.42, 0.54, 0.46],
        rotationY: -0.18,
      },
    ],
    context.materials.shell,
  );
  const coordinatorBeacon = new THREE.Mesh(
    context.shanshuiGeometry.ripple,
    context.materials.signal,
  );
  coordinatorBeacon.name = "shanshui-archon-coordinator-beacon";
  coordinatorBeacon.position.set(3.8, 2.72, -79.5);
  coordinatorBeacon.rotation.x = -Math.PI * 0.5;
  coordinatorBeacon.scale.setScalar(0.32);
  coordinatorBeacon.userData.signature = true;
  coordinatorBeacon.visible = false;

  const bridgeSteps = Math.max(
    3,
    Math.min(5, Math.floor(context.tuning.facilityBudgets.bridges / 3)),
  );
  const stoneBridges = createStoneCluster(
    context,
    "shanshui-archon-stone-bridge-network",
    [
      ...bridgePlacements(
        orchestrationRoutePoints.incoming,
        bridgeSteps,
        0,
        1,
      ),
      ...bridgePlacements(
        orchestrationRoutePoints.worker,
        bridgeSteps,
        0.12,
        0.82,
      ),
      ...bridgePlacements(
        orchestrationRoutePoints.recovery,
        bridgeSteps,
        0.08,
        1,
      ),
    ],
    context.materials.stone,
  );
  stoneBridges.visible = false;
  const blockedRouteCairn = createStoneCluster(
    context,
    "shanshui-archon-blocked-route-cairn",
    [
      {
        position: [8.35, 0.82, -86.7],
        scale: [0.72, 0.85, 0.76],
        rotationY: 0.15,
      },
      {
        position: [8.05, 1.52, -86.68],
        scale: [0.5, 0.58, 0.54],
        rotationY: -0.38,
      },
      {
        position: [8.55, 2.02, -86.72],
        scale: [0.32, 0.42, 0.36],
        rotationY: 0.5,
      },
    ],
    context.materials.shell,
  );
  const blockedSeal = new THREE.Mesh(
    context.signalSphere,
    context.materials.cinnabar,
  );
  blockedSeal.name = "shanshui-archon-blocked-route-seal";
  blockedSeal.position.set(8.35, 2.72, -86.7);
  blockedSeal.scale.setScalar(0.42);
  blockedSeal.userData.signature = true;
  blockedSeal.visible = false;

  root.add(
    passMountains,
    distantRidges,
    coordinatorSummit,
    coordinatorStone,
    coordinatorBeacon,
    stoneBridges,
    blockedRouteCairn,
    blockedSeal,
  );

  const routeHead = new THREE.Mesh(
    context.signalSphere,
    context.materials.signal,
  );
  routeHead.name = "shanshui-archon-traveling-route-mark";
  routeHead.scale.setScalar(0.2);
  routeHead.userData.signature = true;
  root.add(routeHead);

  const summitLight = new THREE.PointLight(0xd8cfb4, 2.1, 24, 2);
  summitLight.name = "shanshui-archon-summit-paper-light";
  summitLight.position.set(3.8, 4.8, -80.2);
  root.add(summitLight);

  const birds = createInkBirdFlock(context);
  updateInkBirdFlock(birds, 0);
  birds.visible = false;
  root.add(birds);

  const update = (
    sample: FacilityNarrativeSample,
    elapsedSeconds = 0,
    motionEnergy = 0,
  ) => {
    const progress = eventProgressFor(sample, "recover-route");
    const state = orchestrationStateAt(progress);
    const living = sampleLivingWorldMotion(
      sample.journeyProgress,
      elapsedSeconds,
      motionEnergy,
      context.tuning.profile,
    );
    const incomingBridges = Math.ceil(state.incomingProgress * bridgeSteps);
    const workerBridges =
      state.incomingProgress >= 1
        ? Math.ceil(state.workerProgress * bridgeSteps)
        : 0;
    const recoveryBridges =
      state.workerProgress >= 1
        ? Math.ceil(state.recoveryProgress * bridgeSteps)
        : 0;
    stoneBridges.count = incomingBridges + workerBridges + recoveryBridges;
    stoneBridges.visible = stoneBridges.count > 0;
    routeHead.position.set(
      state.headPosition.x,
      state.headPosition.y,
      state.headPosition.z,
    );
    routeHead.visible = progress > 0;
    summitLight.intensity = 1.7 + sample.event.intensity * 0.75;
    blockedSeal.visible = state.blocked;
    birds.visible = sample.zone === "orchestration-atrium";
    updateInkBirdFlock(birds, living.birdFlight);
    root.userData.eventProgress = progress;
    root.userData.phase = state.phase;
    root.userData.birdFlight = living.birdFlight;
  };

  return { root, update };
}
