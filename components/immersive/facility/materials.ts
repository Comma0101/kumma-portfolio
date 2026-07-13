import * as THREE from "three";
import { withTrackedResources } from "./resourceTracker";

export interface FacilityMaterials {
  readonly terrain: THREE.MeshStandardMaterial;
  readonly shell: THREE.MeshStandardMaterial;
  readonly steel: THREE.MeshStandardMaterial;
  readonly paper: THREE.MeshStandardMaterial;
  readonly signal: THREE.MeshStandardMaterial;
  readonly ink: THREE.MeshStandardMaterial;
  readonly guide: THREE.MeshStandardMaterial;
}

export interface FacilityMaterialResources {
  readonly materials: FacilityMaterials;
  dispose(): void;
}

export function createFacilityMaterials(): FacilityMaterialResources {
  return withTrackedResources((tracker) => {
    const material = (
      color: THREE.ColorRepresentation,
      roughness: number,
      metalness: number,
      options: Partial<THREE.MeshStandardMaterialParameters> = {},
    ) =>
      tracker.track(
        new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness,
          ...options,
        }),
      );

    const materials: FacilityMaterials = Object.freeze({
      terrain: material(0x111817, 0.96, 0.03),
      shell: material(0x090d0d, 0.88, 0.08, { flatShading: true }),
      steel: material(0x39423f, 0.58, 0.42),
      paper: material(0xcbbf9d, 0.82, 0.04),
      signal: material(0x91c99d, 0.48, 0.12, {
        emissive: 0x477a56,
        emissiveIntensity: 0.42,
      }),
      ink: material(0x4b3745, 0.76, 0.08),
      guide: material(0x65716d, 0.72, 0.2),
    });

    return {
      materials,
      dispose: () => tracker.dispose(),
    };
  });
}
