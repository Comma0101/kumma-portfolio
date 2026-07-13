import * as THREE from "three";
import type { Vec3 } from "../../types";
import type { FacilityNarrativeSample } from "../types";
import {
  clamp01,
  createSignatureBox,
  createSignatureTube,
  eventProgressFor,
  pointAlongPolyline,
  setZoneBounds,
  type FacilityZoneContext,
} from "./shared";

export type CalibrationSurface =
  | "deck"
  | "instrument-left"
  | "instrument-right";

export interface CalibrationMarkDefinition {
  readonly index: number;
  readonly surface: CalibrationSurface;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rotationY: number;
}

export interface CalibrationMarkState extends CalibrationMarkDefinition {
  readonly reveal: number;
}

export interface CalibrationState {
  readonly marks: readonly CalibrationMarkState[];
  readonly signalPosition: Vec3;
  readonly signalMotion: number;
  readonly settled: boolean;
}

export interface CalibrationFacilityZones {
  readonly calibration: THREE.Group;
  readonly horizon: THREE.Group;
  update(sample: FacilityNarrativeSample): void;
}

const stableSignalPosition: Vec3 = Object.freeze({
  x: 0,
  y: 3.15,
  z: -151.2,
});

const signalRoute: readonly Vec3[] = Object.freeze([
  Object.freeze({ x: 6, y: 6.2, z: -120.5 }),
  Object.freeze({ x: 3.4, y: 2.4, z: -132.2 }),
  stableSignalPosition,
]);

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach((child) => deepFreeze(child));
  return Object.freeze(value);
}

function smoothstep(value: number): number {
  const safe = clamp01(value);
  return safe * safe * (3 - 2 * safe);
}

function markRevealAt(progress: number, index: number, count: number): number {
  const delay = count <= 1 ? 0 : (index / (count - 1)) * 0.54;
  return smoothstep((progress - delay) / 0.34);
}

function pointOnSignalRoute(progress: number): Vec3 {
  const safe = smoothstep(progress);
  const scaled = safe * (signalRoute.length - 1);
  const index = Math.min(Math.floor(scaled), signalRoute.length - 2);
  const local = scaled - index;
  const from = signalRoute[index];
  const to = signalRoute[index + 1];
  return {
    x: from.x + (to.x - from.x) * local,
    y: from.y + (to.y - from.y) * local,
    z: from.z + (to.z - from.z) * local,
  };
}

export function calibrationMarksForBudget(
  budget: number,
): readonly CalibrationMarkDefinition[] {
  if (!Number.isFinite(budget) || budget <= 0) return Object.freeze([]);
  const count = Math.min(48, Math.floor(budget));
  const marks = Array.from({ length: count }, (_, index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    if (column === 4) {
      return Object.freeze({
        index,
        surface: "instrument-left" as const,
        x: -9.44,
        y: 1.45 + row * 0.66,
        z: -133.7 - (row % 2) * 0.56,
        rotationY: Math.PI * 0.5,
      });
    }
    if (column === 5) {
      return Object.freeze({
        index,
        surface: "instrument-right" as const,
        x: 9.44,
        y: 1.45 + row * 0.66,
        z: -133.7 - (row % 2) * 0.56,
        rotationY: Math.PI * 0.5,
      });
    }
    return Object.freeze({
      index,
      surface: "deck" as const,
      x: -7.2 + column * 4.8 + (row % 2) * 0.6,
      y: 0.64,
      z: -128.5 - row * 3.2,
      rotationY: column % 2 === 0 ? -0.08 : 0.08,
    });
  });
  return Object.freeze(marks);
}

export function calibrationStateAt(
  progress: number,
  budget = 36,
): CalibrationState {
  const safe = clamp01(progress);
  const marks = calibrationMarksForBudget(budget).map((mark) =>
    Object.freeze({
      ...mark,
      reveal: markRevealAt(safe, mark.index, Math.max(1, Math.floor(budget))),
    }),
  );
  return deepFreeze({
    marks,
    signalPosition: pointOnSignalRoute(safe),
    signalMotion: safe >= 1 ? 0 : Math.sin(safe * Math.PI),
    settled: safe >= 1,
  });
}

function createCalibrationMarks(
  context: FacilityZoneContext,
  definitions: readonly CalibrationMarkDefinition[],
): THREE.InstancedMesh {
  const marks = new THREE.InstancedMesh(
    context.unitBox,
    context.materials.guide,
    definitions.length,
  );
  marks.name = "facility-calibration-surface-marks";
  marks.userData.signature = true;
  marks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return marks;
}

export function createCalibrationFacilityZones(
  context: FacilityZoneContext,
): CalibrationFacilityZones {
  const calibration = setZoneBounds(new THREE.Group(), -149, -126);
  calibration.name = "facility-calibration-deck-zone";
  calibration.add(
    createSignatureBox(
      context,
      "facility-calibration-deck",
      context.materials.shell,
      [0, 0.34, -137],
      [28, 0.6, 23],
    ),
    createSignatureBox(
      context,
      "facility-calibration-instrument-left",
      context.materials.steel,
      [-10, 3.25, -134],
      [1.1, 5.8, 3.2],
    ),
    createSignatureBox(
      context,
      "facility-calibration-instrument-right",
      context.materials.steel,
      [10, 3.25, -134],
      [1.1, 5.8, 3.2],
    ),
    createSignatureBox(
      context,
      "facility-calibration-survey-vane",
      context.materials.paper,
      [5.4, 2.7, -141.5],
      [5.8, 0.22, 2.4],
      [0.08, -0.2, -0.28],
    ),
    createSignatureTube(
      context,
      "facility-calibration-arrival-route",
      context.materials.guide,
      signalRoute.map((point) => new THREE.Vector3(point.x, point.y, point.z)),
      0.13,
    ),
  );

  const definitions = calibrationMarksForBudget(
    context.tuning.facilityBudgets.calibrationMarks,
  );
  const marks = createCalibrationMarks(context, definitions);
  calibration.add(marks);

  const horizon = setZoneBounds(new THREE.Group(), -160, -148);
  horizon.name = "facility-quiet-horizon-zone";
  horizon.add(
    createSignatureBox(
      context,
      "facility-quiet-horizon-west",
      context.materials.terrain,
      [-11.5, 0.75, -155],
      [11, 1.5, 8],
      [0, -0.08, 0.02],
    ),
    createSignatureBox(
      context,
      "facility-quiet-horizon-east",
      context.materials.terrain,
      [11.5, 0.75, -155],
      [11, 1.5, 8],
      [0, 0.08, -0.02],
    ),
    createSignatureBox(
      context,
      "facility-quiet-signal-plinth",
      context.materials.steel,
      [0, 1.28, -151.2],
      [1.35, 2.55, 1.1],
    ),
  );

  const stableSignal = new THREE.Mesh(
    context.signalSphere,
    context.materials.signal,
  );
  stableSignal.name = "facility-calibration-stable-signal";
  stableSignal.scale.setScalar(1.08);
  stableSignal.userData.signature = true;
  horizon.add(stableSignal);
  const signalLight = new THREE.PointLight(0x91c99d, 2.8, 15, 2);
  signalLight.name = "facility-quiet-signal-light";
  horizon.add(signalLight);

  const transform = new THREE.Object3D();
  const routeVectors = signalRoute.map(
    (point) => new THREE.Vector3(point.x, point.y, point.z),
  );
  const signalTarget = new THREE.Vector3();
  const update = (sample: FacilityNarrativeSample) => {
    const progress = eventProgressFor(sample, "calibrate");
    for (let index = 0; index < definitions.length; index += 1) {
      const definition = definitions[index];
      const reveal = markRevealAt(progress, index, definitions.length);
      transform.position.set(definition.x, definition.y, definition.z);
      transform.rotation.set(0, definition.rotationY, 0);
      if (definition.surface === "deck") {
        transform.scale.set(0.72 * reveal, 0.045, 0.09);
      } else {
        transform.scale.set(0.045, 0.09 * reveal, 0.68);
      }
      transform.updateMatrix();
      marks.setMatrixAt(index, transform.matrix);
    }
    marks.instanceMatrix.needsUpdate = true;
    pointAlongPolyline(routeVectors, smoothstep(progress), signalTarget);
    stableSignal.position.copy(signalTarget);
    signalLight.position.copy(signalTarget);
    signalLight.intensity = progress >= 1 ? 2.2 : 2.2 + sample.event.intensity;
    calibration.userData.eventProgress = progress;
    horizon.userData.settled = progress >= 1;
  };

  return { calibration, horizon, update };
}
