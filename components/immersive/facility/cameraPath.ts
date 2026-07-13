import * as THREE from "three";
import type { ImmersiveProfile, Vec3 } from "../types";
import { sampleFacilityNarrative } from "./narrative";
import type { FacilityCameraSample } from "./types";

export const FACILITY_CAMERA_ROLL_LIMIT = 0.025;
export const FACILITY_CAMERA_FAR_PLANES = Object.freeze({
  desktop: 80,
  constrained: 60,
  mobile: 32,
  reduced: 24,
});

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const facilityCameraControlPoints: readonly Vec3[] = deepFreeze([
  { x: 0, y: 8, z: 24 },
  { x: -1.8, y: 5.2, z: 8 },
  { x: 0.2, y: 1.65, z: -8 },
  { x: 1.2, y: 2, z: -25 },
  { x: -2.2, y: 3.4, z: -45 },
  { x: 4.5, y: 11, z: -68 },
  { x: -12, y: 5.2, z: -92 },
  { x: -2, y: 6.4, z: -116 },
  { x: 0, y: 7, z: -140 },
]);

export const facilityEntrancePosition: Vec3 = deepFreeze({
  x: 0,
  y: 2.1,
  z: -10,
});

const path = new THREE.CatmullRomCurve3(
  facilityCameraControlPoints.map(
    (point) => new THREE.Vector3(point.x, point.y, point.z),
  ),
  false,
  "centripetal",
  0.5,
);

function clamp01(value: number): number {
  if (Number.isNaN(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function smoothstep(value: number): number {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

function asPlain(vector: THREE.Vector3): Vec3 {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function transformForProfile(
  vector: THREE.Vector3,
  profile: ImmersiveProfile,
): THREE.Vector3 {
  if (profile === "desktop") return vector;
  const scale = profile === "mobile" ? 0.91 : 0.86;
  const midpoint = new THREE.Vector3(0, 5.5, -58);
  return midpoint.add(vector.sub(midpoint).multiplyScalar(scale));
}

function routeTarget(
  routeProgress: number,
  lookAhead: number,
): THREE.Vector3 {
  const position = path.getPoint(routeProgress);
  const nextProgress = Math.min(1, routeProgress + lookAhead);
  let target = path.getPoint(nextProgress);

  if (target.distanceTo(position) < 2) {
    const previous = path.getPoint(Math.max(0, routeProgress - lookAhead));
    const tangent = position.clone().sub(previous).normalize();
    target = position.clone().add(tangent.multiplyScalar(8));
  }

  target.y += 0.2;
  if (routeProgress < 0.16) {
    const entrance = new THREE.Vector3(
      facilityEntrancePosition.x,
      facilityEntrancePosition.y,
      facilityEntrancePosition.z,
    );
    const reveal = smoothstep((routeProgress - 0.07) / 0.09);
    target = entrance.lerp(target, reveal);
  }
  if (routeProgress > 0.86) {
    const horizonReveal = smoothstep((routeProgress - 0.86) / 0.14);
    target.lerp(new THREE.Vector3(0, 3.1, -153), horizonReveal);
  }
  return target;
}

export function sampleFacilityCamera(
  journeyProgress: number,
  profile: ImmersiveProfile,
): FacilityCameraSample {
  const narrative = sampleFacilityNarrative(journeyProgress, profile);
  const routeProgress = clamp01(narrative.routeProgress);
  const rawPosition =
    routeProgress === 0
      ? new THREE.Vector3(
          facilityCameraControlPoints[0].x,
          facilityCameraControlPoints[0].y,
          facilityCameraControlPoints[0].z,
        )
      : path.getPoint(routeProgress);
  const rawTarget = routeTarget(routeProgress, narrative.camera.lookAhead);
  const position = transformForProfile(rawPosition, profile);
  const target = transformForProfile(rawTarget, profile);

  return deepFreeze({
    position: asPlain(position),
    target: asPlain(target),
    fov: narrative.camera.fov,
    roll: Math.max(
      -FACILITY_CAMERA_ROLL_LIMIT,
      Math.min(FACILITY_CAMERA_ROLL_LIMIT, narrative.camera.roll),
    ),
  });
}
