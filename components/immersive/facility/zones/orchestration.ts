import * as THREE from "three";
import type { Vec3 } from "../../types";
import type { FacilityNarrativeSample } from "../types";
import {
  clamp01,
  createSignatureBox,
  createSignatureTube,
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
  update(sample: FacilityNarrativeSample): void;
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
    { x: 0, y: 9.1, z: -68.2 },
    { x: 1.6, y: 7.8, z: -74.5 },
    { x: 3.8, y: 6.2, z: -79.5 },
  ],
  worker: [
    { x: 3.8, y: 6.2, z: -79.5 },
    { x: 6.7, y: 7.1, z: -83.2 },
    { x: 8.35, y: 5.6, z: -86.7 },
  ],
  recovery: [
    { x: 3.8, y: 6.2, z: -79.5 },
    { x: -0.5, y: 3.8, z: -85.2 },
    { x: 1.8, y: 7.4, z: -91.2 },
    { x: 6.2, y: 5.2, z: -97.2 },
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

function asVectors(points: readonly Vec3[]): THREE.Vector3[] {
  return points.map((point) => new THREE.Vector3(point.x, point.y, point.z));
}

function setTubeProgress(
  tube: THREE.Mesh<THREE.TubeGeometry, THREE.Material>,
  progress: number,
): void {
  const total = tube.geometry.index?.count ?? 0;
  const visible = Math.floor((total * clamp01(progress)) / 6) * 6;
  tube.geometry.setDrawRange(0, visible);
  tube.visible = visible > 0;
}

function createAtriumFrames(context: FacilityZoneContext): THREE.InstancedMesh {
  const frameCount = Math.max(
    3,
    Math.min(5, Math.floor(context.tuning.facilityBudgets.bridges / 4)),
  );
  const frames = new THREE.InstancedMesh(
    context.unitBox,
    context.materials.steel,
    frameCount * 3,
  );
  const transform = new THREE.Object3D();
  let instance = 0;

  for (let index = 0; index < frameCount; index += 1) {
    const progress = frameCount === 1 ? 0 : index / (frameCount - 1);
    const z = THREE.MathUtils.lerp(-73, -98, progress);
    const width = THREE.MathUtils.lerp(28, 32, progress);
    const height = THREE.MathUtils.lerp(11.5, 14.5, progress);
    for (const side of [-1, 1]) {
      transform.position.set(side * width * 0.5, height * 0.5, z);
      transform.scale.set(0.34, height, 0.52);
      transform.updateMatrix();
      frames.setMatrixAt(instance, transform.matrix);
      instance += 1;
    }
    transform.position.set(0, height, z);
    transform.scale.set(width, 0.34, 0.52);
    transform.updateMatrix();
    frames.setMatrixAt(instance, transform.matrix);
    instance += 1;
  }

  frames.name = "facility-orchestration-atrium-frames";
  frames.userData.signature = true;
  frames.instanceMatrix.needsUpdate = true;
  return frames;
}

function createBridgeSpans(context: FacilityZoneContext): THREE.InstancedMesh {
  const bridgeCount = Math.max(
    6,
    Math.min(10, context.tuning.facilityBudgets.bridges),
  );
  const bridges = new THREE.InstancedMesh(
    context.unitBox,
    context.materials.shell,
    bridgeCount,
  );
  const transform = new THREE.Object3D();

  for (let index = 0; index < bridgeCount; index += 1) {
    const column = index % 2;
    const row = Math.floor(index / 2);
    transform.position.set(
      7.7 + column * 4.3,
      2.1 + row * 1.65,
      -77.5 - row * 4.45,
    );
    transform.scale.set(4.1 - row * 0.2, 0.28, 1.2);
    transform.rotation.set(0, column === 0 ? 0.08 : -0.08, 0.02);
    transform.updateMatrix();
    bridges.setMatrixAt(index, transform.matrix);
  }

  bridges.name = "facility-orchestration-bridge-spans";
  bridges.userData.signature = true;
  bridges.instanceMatrix.needsUpdate = true;
  return bridges;
}

export function createOrchestrationFacilityZone(
  context: FacilityZoneContext,
): OrchestrationFacilityZone {
  const root = setZoneBounds(new THREE.Group(), -101, -71);
  root.name = "facility-orchestration-atrium-zone";

  const coreGeometry = context.tracker.track(
    new THREE.CylinderGeometry(
      2.25,
      2.9,
      8.6,
      context.tuning.profile === "desktop" ? 14 : 10,
      1,
      false,
    ),
  );
  const coordinator = new THREE.Mesh(coreGeometry, context.materials.steel);
  coordinator.name = "facility-orchestration-coordinator-core";
  coordinator.position.set(3.8, 5.1, -79.5);
  coordinator.userData.signature = true;

  const coordinatorCrown = new THREE.Mesh(
    context.signalSphere,
    context.materials.signal,
  );
  coordinatorCrown.name = "facility-orchestration-coordinator-signal";
  coordinatorCrown.position.set(3.8, 9.8, -79.5);
  coordinatorCrown.scale.setScalar(1.4);
  coordinatorCrown.userData.signature = true;

  const safetyGate = createSignatureBox(
    context,
    "facility-orchestration-safety-gate",
    context.materials.paper,
    [8.75, 5.3, -87.2],
    [0.42, 9.6, 5.4],
  );
  const safetyLintel = createSignatureBox(
    context,
    "facility-orchestration-safety-lintel",
    context.materials.paper,
    [7.15, 10.1, -87.2],
    [3.6, 0.34, 5.4],
  );

  root.add(
    createSignatureBox(
      context,
      "facility-orchestration-floor",
      context.materials.shell,
      [0, 0.35, -86],
      [25, 0.7, 32],
    ),
    createSignatureBox(
      context,
      "facility-orchestration-tool-wing",
      context.materials.shell,
      [-16.5, 4.1, -84.8],
      [4.6, 6.8, 8.6],
    ),
    createSignatureBox(
      context,
      "facility-orchestration-memory-wing",
      context.materials.shell,
      [7.5, 4.8, -94],
      [7.2, 8.2, 6.4],
    ),
    createAtriumFrames(context),
    createBridgeSpans(context),
    coordinator,
    coordinatorCrown,
    safetyGate,
    safetyLintel,
  );

  const routes = {
    incoming: createSignatureTube(
      context,
      "facility-orchestration-incoming-guide",
      context.materials.guide,
      asVectors(orchestrationRoutePoints.incoming),
      0.13,
    ),
    worker: createSignatureTube(
      context,
      "facility-orchestration-worker-guide",
      context.materials.guide,
      asVectors(orchestrationRoutePoints.worker),
      0.13,
    ),
    recovery: createSignatureTube(
      context,
      "facility-orchestration-recovery-guide",
      context.materials.guide,
      asVectors(orchestrationRoutePoints.recovery),
      0.13,
    ),
  };
  const traces = {
    incoming: createSignatureTube(
      context,
      "facility-orchestration-incoming-trace",
      context.materials.signal,
      asVectors(orchestrationRoutePoints.incoming),
      0.18,
    ),
    worker: createSignatureTube(
      context,
      "facility-orchestration-blocked-trace",
      context.materials.signal,
      asVectors(orchestrationRoutePoints.worker),
      0.18,
    ),
    recovery: createSignatureTube(
      context,
      "facility-orchestration-recovery-trace",
      context.materials.signal,
      asVectors(orchestrationRoutePoints.recovery),
      0.18,
    ),
  };
  root.add(...Object.values(routes), ...Object.values(traces));

  const routeHead = new THREE.Mesh(
    context.signalSphere,
    context.materials.signal,
  );
  routeHead.name = "facility-orchestration-route-head";
  routeHead.scale.setScalar(1.1);
  routeHead.userData.signature = true;
  root.add(routeHead);

  const atriumLight = new THREE.PointLight(0x91c99d, 5.2, 28, 2);
  atriumLight.name = "facility-orchestration-core-light";
  atriumLight.position.set(3.8, 8.6, -80.5);
  root.add(atriumLight);

  const update = (sample: FacilityNarrativeSample) => {
    const progress = eventProgressFor(sample, "recover-route");
    const state = orchestrationStateAt(progress);
    setTubeProgress(traces.incoming, state.incomingProgress);
    setTubeProgress(traces.worker, state.workerProgress);
    setTubeProgress(traces.recovery, state.recoveryProgress);
    routeHead.position.set(
      state.headPosition.x,
      state.headPosition.y,
      state.headPosition.z,
    );
    routeHead.visible = progress > 0;
    coordinatorCrown.scale.setScalar(1.4 + sample.event.intensity * 0.12);
    atriumLight.intensity = 4.2 + sample.event.intensity * 1.4;
    root.userData.eventProgress = progress;
    root.userData.phase = state.phase;
  };

  return { root, update };
}
