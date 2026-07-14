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
  readonly mountain: THREE.MeshToonMaterial;
  readonly stone: THREE.MeshToonMaterial;
  readonly bamboo: THREE.MeshToonMaterial;
  readonly water: THREE.MeshStandardMaterial;
  readonly cinnabar: THREE.MeshStandardMaterial;
}

export interface FacilityMaterialResources {
  readonly materials: FacilityMaterials;
  dispose(): void;
}

export function createFacilityMaterials(): FacilityMaterialResources {
  return withTrackedResources((tracker) => {
    const gradientMap = tracker.track(
      new THREE.DataTexture(
        new Uint8Array([
          32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 196, 220,
        ]),
        12,
        1,
        THREE.RedFormat,
      ),
    );
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;

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

    const inkValueMaterial = (
      color: THREE.ColorRepresentation,
      options: Partial<THREE.MeshToonMaterialParameters> = {},
    ) =>
      tracker.track(
        new THREE.MeshToonMaterial({
          color,
          gradientMap,
          ...options,
        }),
      );

    const materials: FacilityMaterials = Object.freeze({
      terrain: material(0x171f1c, 0.98, 0.01),
      shell: material(0x303a35, 0.96, 0.01),
      steel: material(0x626b64, 0.9, 0.03),
      paper: material(0xd7ccb0, 0.94, 0.01),
      signal: material(0x789681, 0.82, 0.02, {
        emissive: 0x2e4d3c,
        emissiveIntensity: 0.18,
      }),
      ink: material(0x332d31, 0.97, 0.01),
      guide: material(0x6a756d, 0.92, 0.01),
      mountain: inkValueMaterial(0x435149),
      stone: inkValueMaterial(0x77796f),
      bamboo: inkValueMaterial(0x3c6851, { side: THREE.DoubleSide }),
      water: material(0x385a5b, 0.9, 0.03, {
        emissive: 0x1d3635,
        emissiveIntensity: 0.12,
      }),
      cinnabar: material(0x9f4435, 0.78, 0.02, {
        emissive: 0x4f160f,
        emissiveIntensity: 0.2,
      }),
    });

    return {
      materials,
      dispose: () => tracker.dispose(),
    };
  });
}
