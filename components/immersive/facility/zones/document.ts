import * as THREE from "three";
import type { FacilityNarrativeSample } from "../types";
import {
  clamp01,
  createArchRibs,
  createSignatureBox,
  createSignatureTube,
  eventProgressFor,
  setZoneBounds,
  type FacilityZoneContext,
} from "./shared";

export type DocumentSegmentPhase =
  | "source"
  | "segment"
  | "queue"
  | "recovery"
  | "output";

export interface DocumentSegmentState {
  readonly index: number;
  readonly lane: 0 | 1 | 2;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rotationY: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly scaleZ: number;
  readonly recovering: boolean;
  readonly phase: DocumentSegmentPhase;
}

export interface DocumentFoundryState {
  readonly segments: readonly DocumentSegmentState[];
  readonly staleLaneProgress: number;
  readonly outputProgress: number;
}

export interface DocumentFacilityZone {
  readonly root: THREE.Group;
  update(sample: FacilityNarrativeSample): void;
}

interface MutableDocumentSegmentState {
  index: number;
  lane: 0 | 1 | 2;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  recovering: boolean;
  phase: DocumentSegmentPhase;
}

function smoothstep(value: number): number {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

function lerp(from: number, to: number, progress: number): number {
  return THREE.MathUtils.lerp(from, to, progress);
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach((child) => deepFreeze(child));
  return Object.freeze(value);
}

function writeDocumentSegmentState(
  progress: number,
  index: number,
  count: number,
  target: MutableDocumentSegmentState,
): MutableDocumentSegmentState {
  const safe = clamp01(progress);
  const safeCount = Math.max(1, Math.floor(count));
  const lane = (index % 3) as 0 | 1 | 2;
  const row = Math.floor(index / 3);
  const sourceX = -4.1 + index * (8.2 / Math.max(1, safeCount - 1));
  const queueX = [-3.2, 0, 3.2][lane];
  const queueZ = -53.5 - row * 1.42;
  const queueY = 3.4 + row * 0.72;
  const segmentation = smoothstep((safe - 0.08) / 0.38);
  const outputProgress = smoothstep((safe - 0.68) / 0.32);
  const staleOut = smoothstep((safe - 0.46) / 0.11);
  const staleReturn = smoothstep((safe - 0.59) / 0.13);
  const staleOffset = lane === 1 ? 1.15 * staleOut * (1 - staleReturn) : 0;
  const recovering = lane === 1 && safe >= 0.46 && safe < 0.72;
  const outputX = -3.85 + index * (7.7 / Math.max(1, safeCount - 1));

  target.index = index;
  target.lane = lane;
  target.x = lerp(
    lerp(sourceX, queueX + staleOffset, segmentation),
    outputX,
    outputProgress,
  );
  target.y = lerp(lerp(4.15, queueY, segmentation), 9.15, outputProgress);
  target.z = lerp(lerp(-49.5, queueZ, segmentation), -68, outputProgress);
  target.rotationY = lerp((lane - 1) * 0.035, 0, outputProgress);
  target.scaleX = lerp(0.58, 0.62, outputProgress);
  target.scaleY = lerp(2.5, 0.42, segmentation);
  target.scaleY = lerp(target.scaleY, 0.18, outputProgress);
  target.scaleZ = lerp(0.16, 0.34, outputProgress);
  target.recovering = recovering;
  target.phase =
    safe <= 0.08
      ? "source"
      : safe < 0.46
        ? "segment"
        : safe < 0.68
          ? recovering
            ? "recovery"
            : "queue"
          : safe >= 1
            ? "output"
            : "segment";
  return target;
}

export function documentStateAt(
  progress: number,
  count = 12,
): DocumentFoundryState {
  const safe = clamp01(progress);
  const safeCount = Math.max(1, Math.floor(count));
  const segments = Array.from({ length: safeCount }, (_, index) => {
    const target = {} as MutableDocumentSegmentState;
    return { ...writeDocumentSegmentState(safe, index, safeCount, target) };
  });
  return deepFreeze({
    segments,
    staleLaneProgress: smoothstep((safe - 0.59) / 0.13),
    outputProgress: smoothstep((safe - 0.68) / 0.32),
  });
}

export function createDocumentFacilityZone(
  context: FacilityZoneContext,
): DocumentFacilityZone {
  const root = setZoneBounds(new THREE.Group(), -72, -43);
  root.name = "facility-document-foundry-zone";
  root.add(
    createArchRibs(context, "facility-document-foundry-ribs", -46, -70, 11, 7),
    createSignatureBox(
      context,
      "facility-document-source-frame",
      context.materials.steel,
      [0, 6.8, -50],
      [9.4, 0.26, 0.34],
    ),
    createSignatureBox(
      context,
      "facility-document-source-frame-left",
      context.materials.steel,
      [-4.7, 4.25, -50],
      [0.24, 5.3, 0.34],
    ),
    createSignatureBox(
      context,
      "facility-document-source-frame-right",
      context.materials.steel,
      [4.7, 4.25, -50],
      [0.24, 5.3, 0.34],
    ),
    createSignatureBox(
      context,
      "facility-document-segmentation-bed",
      context.materials.shell,
      [0, 3.05, -59],
      [9.6, 0.26, 15],
    ),
    createSignatureBox(
      context,
      "facility-document-output-plinth",
      context.materials.steel,
      [0, 8.85, -68],
      [9, 0.28, 1.25],
    ),
  );

  for (const [index, x] of [-3.2, 0, 3.2].entries()) {
    root.add(
      createSignatureTube(
        context,
        `facility-document-queue-lane-${index}`,
        index === 1 ? context.materials.guide : context.materials.steel,
        [
          new THREE.Vector3(x, 3.2, -52),
          new THREE.Vector3(x, 5.8, -63.5),
          new THREE.Vector3(x * 0.35, 8.75, -67),
        ],
        0.055,
      ),
    );
  }

  const segmentCount = Math.max(
    7,
    Math.min(12, context.tuning.facilityBudgets.slabs),
  );
  const slabs = new THREE.InstancedMesh(
    context.unitBox,
    context.materials.paper,
    segmentCount,
  );
  slabs.name = "facility-document-segments";
  slabs.userData.signature = true;
  slabs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const recoverySignal = new THREE.Mesh(
    context.signalSphere,
    context.materials.signal,
  );
  recoverySignal.name = "facility-document-recovery-signal";
  recoverySignal.userData.signature = true;
  recoverySignal.scale.setScalar(0.72);
  root.add(slabs, recoverySignal);

  const transform = new THREE.Object3D();
  const runtimeStates = Array.from({ length: segmentCount }, (_, index) => ({
    index,
    lane: (index % 3) as 0 | 1 | 2,
    x: 0,
    y: 0,
    z: 0,
    rotationY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    recovering: false,
    phase: "source" as DocumentSegmentPhase,
  }));

  const update = (sample: FacilityNarrativeSample) => {
    const progress = eventProgressFor(sample, "segment-document");
    for (let index = 0; index < segmentCount; index += 1) {
      const state = writeDocumentSegmentState(
        progress,
        index,
        segmentCount,
        runtimeStates[index],
      );
      transform.position.set(state.x, state.y, state.z);
      transform.rotation.set(0, state.rotationY, 0);
      transform.scale.set(state.scaleX, state.scaleY, state.scaleZ);
      transform.updateMatrix();
      slabs.setMatrixAt(index, transform.matrix);
    }
    slabs.instanceMatrix.needsUpdate = true;
    const signalState = runtimeStates[Math.floor((segmentCount - 1) * 0.5)];
    recoverySignal.position.set(signalState.x, signalState.y + 0.45, signalState.z);
    recoverySignal.visible = progress > 0.42 && progress < 0.84;
    root.userData.eventProgress = progress;
  };

  return { root, update };
}
