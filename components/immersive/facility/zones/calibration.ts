import * as THREE from "three";
import type { Vec3 } from "../../types";
import {
  createMountainCluster,
  createRiverRibbon,
  createStoneCluster,
} from "../shanshuiPrimitives";
import type { FacilityNarrativeSample } from "../types";
import {
  clamp01,
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
  marks.name = "shanshui-survey-engraved-marks";
  marks.userData.signature = true;
  marks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return marks;
}

export function createCalibrationFacilityZones(
  context: FacilityZoneContext,
): CalibrationFacilityZones {
  const calibration = setZoneBounds(new THREE.Group(), -149, -126);
  calibration.name = "shanshui-scholar-survey-terrace-zone";
  const terraceGeometry = context.tracker.track(
    new THREE.CylinderGeometry(12.6, 14.2, 0.72, 12, 1),
  );
  const terrace = new THREE.Mesh(terraceGeometry, context.materials.shell);
  terrace.name = "shanshui-survey-stone-terrace";
  terrace.position.set(0, 0.18, -137);
  terrace.scale.z = 0.82;
  terrace.userData.signature = true;
  const leftStele = new THREE.Mesh(
    context.shanshuiGeometry.stone,
    context.materials.stone,
  );
  leftStele.name = "shanshui-survey-stele-left";
  leftStele.position.set(-9.44, -0.48, -134);
  leftStele.scale.set(0.82, 3.25, 1.2);
  leftStele.rotation.y = 0.18;
  leftStele.userData.signature = true;
  const rightStele = new THREE.Mesh(
    context.shanshuiGeometry.stone,
    context.materials.stone,
  );
  rightStele.name = "shanshui-survey-stele-right";
  rightStele.position.set(9.44, -0.48, -134);
  rightStele.scale.set(0.86, 3.5, 1.25);
  rightStele.rotation.y = -0.16;
  rightStele.userData.signature = true;
  const surveyRing = new THREE.Mesh(
    context.shanshuiGeometry.ripple,
    context.materials.paper,
  );
  surveyRing.name = "shanshui-survey-paper-ring";
  surveyRing.position.set(5.4, 0.63, -141.5);
  surveyRing.rotation.x = -Math.PI * 0.5;
  surveyRing.scale.set(2.2, 2.2, 2.2);
  surveyRing.userData.signature = true;

  calibration.add(
    createMountainCluster(context, "shanshui-survey-overlook-ridges", "broad", [
      { position: [-15.8, -1.35, -132], scale: [8.4, 7.2, 8.8], rotationY: 0.4 },
      { position: [16.2, -1.35, -135], scale: [8.5, 7.8, 8.9], rotationY: -0.46 },
      { position: [-17.5, -1.32, -146], scale: [7.4, 6.2, 7.8], rotationY: -0.52 },
      { position: [17.2, -1.32, -146], scale: [7.2, 6.6, 7.6], rotationY: 0.48 },
    ], context.materials.shell),
    createStoneCluster(context, "shanshui-survey-boundary-stones", [
      { position: [-6.8, 0.5, -145.2], scale: [1.2, 0.74, 1.5], rotationY: 0.42 },
      { position: [7.4, 0.5, -145.4], scale: [1.35, 0.82, 1.4], rotationY: -0.35 },
    ]),
    createRiverRibbon(context, "shanshui-survey-arrival-current", [
      { x: 5.4, y: -0.5, z: -126, width: 2.1 },
      { x: 3.4, y: -0.5, z: -132, width: 2.35 },
      { x: 1.5, y: -0.5, z: -139, width: 2.7 },
      { x: 0, y: -0.49, z: -147.5, width: 3.4 },
    ]),
    terrace,
    leftStele,
    rightStele,
    surveyRing,
  );

  const definitions = calibrationMarksForBudget(
    context.tuning.facilityBudgets.calibrationMarks,
  );
  const marks = createCalibrationMarks(context, definitions);
  calibration.add(marks);

  const horizon = setZoneBounds(new THREE.Group(), -160, -148);
  horizon.name = "shanshui-level-distance-horizon-zone";
  const lakeGeometry = context.tracker.track(new THREE.CircleGeometry(15.5, 48));
  const lake = new THREE.Mesh(lakeGeometry, context.materials.water);
  lake.name = "shanshui-contact-quiet-lake";
  lake.position.set(0, -0.5, -155);
  lake.rotation.x = -Math.PI * 0.5;
  lake.scale.set(1.75, 1, 1);
  lake.userData.signature = true;
  horizon.add(
    createMountainCluster(context, "shanshui-contact-distant-peaks", "tall", [
      { position: [-18.5, -1.45, -159], scale: [8.5, 11.8, 8.8], rotationY: 0.36 },
      { position: [18.8, -1.45, -160], scale: [8.8, 12.6, 9], rotationY: -0.4 },
      { position: [-8.5, -1.42, -162], scale: [5.4, 7.2, 5.7], rotationY: -0.48 },
      { position: [9.5, -1.42, -163], scale: [5.2, 6.8, 5.6], rotationY: 0.5 },
    ]),
    createStoneCluster(context, "shanshui-contact-river-landing", [
      { position: [-3.5, -0.72, -151], scale: [1.6, 0.92, 1.8], rotationY: 0.28 },
      { position: [3.8, -0.73, -152], scale: [1.35, 0.76, 1.5], rotationY: -0.42 },
    ], context.materials.shell),
    lake,
  );

  const stableSignal = new THREE.Mesh(
    context.signalSphere,
    context.materials.cinnabar,
  );
  stableSignal.name = "shanshui-contact-stable-seal";
  stableSignal.scale.setScalar(0.5);
  stableSignal.userData.signature = true;
  horizon.add(stableSignal);
  const signalLight = new THREE.PointLight(0x9f4435, 1.5, 10, 2);
  signalLight.name = "shanshui-contact-cinnabar-light";
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
    signalLight.intensity = progress >= 1 ? 1.2 : 1.2 + sample.event.intensity * 0.7;
    calibration.userData.eventProgress = progress;
    horizon.userData.settled = progress >= 1;
  };

  return { calibration, horizon, update };
}
