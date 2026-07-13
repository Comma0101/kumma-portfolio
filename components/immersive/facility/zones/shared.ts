import * as THREE from "three";
import type { ThreeSceneTuning } from "../../../threeSceneTuning";
import type { FacilityMaterials } from "../materials";
import type { ResourceTracker } from "../resourceTracker";
import type {
  FacilityEventId,
  FacilityNarrativeSample,
} from "../types";

export interface FacilityZoneContext {
  readonly tuning: ThreeSceneTuning;
  readonly materials: FacilityMaterials;
  readonly tracker: ResourceTracker;
  readonly unitBox: THREE.BoxGeometry;
  readonly signalSphere: THREE.SphereGeometry;
}

const eventOrder: readonly FacilityEventId[] = [
  "approach",
  "converge-inputs",
  "cross-threshold",
  "clarify-route",
  "segment-document",
  "recover-route",
  "reconstruct-depth",
  "calibrate",
  "settle",
];

export function clamp01(value: number): number {
  if (Number.isNaN(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function eventProgressFor(
  sample: FacilityNarrativeSample,
  eventId: FacilityEventId,
): number {
  const current = eventOrder.indexOf(sample.event.id);
  const target = eventOrder.indexOf(eventId);
  if (current < target) return 0;
  if (current > target) return 1;
  return clamp01(sample.event.progress);
}

export function setZoneBounds(
  zone: THREE.Group,
  zMin: number,
  zMax: number,
): THREE.Group {
  zone.userData.bounds = Object.freeze({ zMin, zMax });
  return zone;
}

export function createSignatureBox(
  context: FacilityZoneContext,
  name: string,
  material: THREE.Material,
  position: readonly [number, number, number],
  scale: readonly [number, number, number],
  rotation: readonly [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(context.unitBox, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.userData.signature = true;
  return mesh;
}

export function createSignatureTube(
  context: FacilityZoneContext,
  name: string,
  material: THREE.Material,
  points: readonly THREE.Vector3[],
  radius = 0.13,
): THREE.Mesh<THREE.TubeGeometry, THREE.Material> {
  const curve = new THREE.CatmullRomCurve3([...points], false, "centripetal");
  const geometry = context.tracker.track(
    new THREE.TubeGeometry(
      curve,
      Math.max(12, Math.min(48, points.length * 12)),
      radius,
      context.tuning.profile === "desktop" ? 8 : 6,
      false,
    ),
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.userData.signature = true;
  return mesh;
}

export function createArchRibs(
  context: FacilityZoneContext,
  name: string,
  zStart: number,
  zEnd: number,
  width: number,
  height: number,
): THREE.InstancedMesh {
  const ribCount = Math.max(
    4,
    Math.floor(context.tuning.facilityBudgets.ribs / 3),
  );
  const mesh = new THREE.InstancedMesh(
    context.unitBox,
    context.materials.steel,
    ribCount * 3,
  );
  const transform = new THREE.Object3D();
  let instance = 0;

  for (let index = 0; index < ribCount; index += 1) {
    const progress = ribCount === 1 ? 0 : index / (ribCount - 1);
    const z = THREE.MathUtils.lerp(zStart, zEnd, progress);
    for (const side of [-1, 1]) {
      transform.position.set(side * width * 0.5, height * 0.5, z);
      transform.scale.set(0.2, height, 0.28);
      transform.rotation.set(0, 0, 0);
      transform.updateMatrix();
      mesh.setMatrixAt(instance, transform.matrix);
      instance += 1;
    }
    transform.position.set(0, height, z);
    transform.scale.set(width, 0.2, 0.28);
    transform.updateMatrix();
    mesh.setMatrixAt(instance, transform.matrix);
    instance += 1;
  }

  mesh.name = name;
  mesh.userData.signature = true;
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function pointAlongPolyline(
  points: readonly THREE.Vector3[],
  progress: number,
  target: THREE.Vector3,
): THREE.Vector3 {
  const safe = clamp01(progress);
  const scaled = safe * (points.length - 1);
  const index = Math.min(Math.floor(scaled), points.length - 2);
  return target.lerpVectors(points[index], points[index + 1], scaled - index);
}
