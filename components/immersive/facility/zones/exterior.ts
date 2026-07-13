import * as THREE from "three";
import {
  createArchRibs,
  createSignatureBox,
  createSignatureTube,
  setZoneBounds,
  type FacilityZoneContext,
} from "./shared";

export interface ExteriorFacilityZones {
  readonly exterior: THREE.Group;
  readonly reliability: THREE.Group;
  readonly threshold: THREE.Group;
}

export function createExteriorFacilityZones(
  context: FacilityZoneContext,
): ExteriorFacilityZones {
  const exterior = setZoneBounds(
    new THREE.Group(),
    -4,
    24,
  );
  exterior.name = "facility-exterior-ridge-zone";

  exterior.add(
    createSignatureBox(
      context,
      "facility-ridge-west",
      context.materials.shell,
      [-12, 1.2, 3],
      [16, 3.8, 22],
      [0.06, -0.18, -0.04],
    ),
    createSignatureBox(
      context,
      "facility-ridge-east",
      context.materials.shell,
      [12, 0.5, 0],
      [14, 3.2, 20],
      [-0.04, 0.2, 0.06],
    ),
    createSignatureBox(
      context,
      "facility-entrance-west",
      context.materials.shell,
      [-4.4, 3.8, -10],
      [3.4, 7.6, 2.4],
    ),
    createSignatureBox(
      context,
      "facility-entrance-east",
      context.materials.shell,
      [4.4, 3.8, -10],
      [3.4, 7.6, 2.4],
    ),
    createSignatureBox(
      context,
      "facility-distant-entrance",
      context.materials.steel,
      [0, 7.3, -10],
      [10.4, 1.1, 2.6],
    ),
    createSignatureBox(
      context,
      "facility-wayfinding-slit",
      context.materials.signal,
      [0, 3.4, -8.7],
      [0.22, 4.8, 0.16],
    ),
  );

  const reliability = setZoneBounds(new THREE.Group(), -11, 18);
  reliability.name = "facility-reliability-spine-zone";
  const starts = [-11, 0, 11] as const;
  starts.forEach((x, index) => {
    reliability.add(
      createSignatureTube(
        context,
        index === 1
          ? "facility-reliability-spine"
          : `facility-reliability-feeder-${index}`,
        index === 1 ? context.materials.signal : context.materials.steel,
        [
          new THREE.Vector3(x, 0.25, 18),
          new THREE.Vector3(x * 0.6, 0.18, 8),
          new THREE.Vector3(x * 0.22, 0.12, -2),
          new THREE.Vector3(0, 0.08, -11),
        ],
        index === 1 ? 0.18 : 0.12,
      ),
    );
  });

  const threshold = setZoneBounds(new THREE.Group(), -27, -8);
  threshold.name = "facility-fissure-threshold-zone";
  threshold.add(
    createSignatureBox(
      context,
      "facility-fissure-west",
      context.materials.shell,
      [-5.8, 2.5, -18],
      [4.6, 7, 16],
      [0, 0, -0.08],
    ),
    createSignatureBox(
      context,
      "facility-fissure-east",
      context.materials.shell,
      [5.8, 2.5, -18],
      [4.6, 7, 16],
      [0, 0, 0.08],
    ),
    createSignatureBox(
      context,
      "facility-threshold-occluder",
      context.materials.shell,
      [0, 6, -17],
      [10, 2.5, 9],
    ),
    createArchRibs(context, "facility-threshold-ribs", -10, -27, 7.2, 5.4),
    createSignatureTube(
      context,
      "facility-threshold-route",
      context.materials.signal,
      [
        new THREE.Vector3(0, 0.12, -10),
        new THREE.Vector3(0.3, 0.1, -18),
        new THREE.Vector3(0, 0.15, -27),
      ],
      0.14,
    ),
  );
  const practical = new THREE.PointLight(0xd6bf8b, 10, 22, 2);
  practical.name = "facility-threshold-practical";
  practical.position.set(0, 3.4, -22);
  threshold.add(practical);

  return { exterior, reliability, threshold };
}
