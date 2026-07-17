import * as THREE from "three";
import { withTrackedResources } from "./resourceTracker";
import { ACCENTS, EARTHS, INK } from "./ink/inkLadder";

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
      terrain: material(EARTHS.paperStone, 0.98, 0.01),
      shell: material("#bdb6a0", 0.96, 0.01),
      steel: material(INK.zhong, 0.9, 0.03),
      paper: material(INK.paper, 0.94, 0.01),
      signal: material(ACCENTS.mineral, 0.82, 0.02, {
        emissive: "#3d5445",
        emissiveIntensity: 0.12,
      }),
      ink: material(INK.jiao, 0.97, 0.01),
      guide: material(INK.dan, 0.92, 0.01),
      mountain: inkValueMaterial(INK.zhong),
      stone: inkValueMaterial(EARTHS.stone),
      bamboo: inkValueMaterial(EARTHS.pine, { side: THREE.DoubleSide }),
      water: material(EARTHS.water, 0.9, 0.03, {
        emissive: "#000000",
        emissiveIntensity: 0,
      }),
      cinnabar: material(ACCENTS.cinnabar, 0.78, 0.02, {
        emissive: "#2f0f0a",
        emissiveIntensity: 0.1,
      }),
    });

    return {
      materials,
      dispose: () => tracker.dispose(),
    };
  });
}
