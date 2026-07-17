import * as THREE from "three";
import { withTrackedResources } from "./resourceTracker";
import { ACCENTS, EARTHS, INK } from "./ink/inkLadder";
import { createInkMaterial, isInkMaterial, syncInkMaterialAtmosphere } from "./ink/inkMaterials";

export interface FacilityMaterials {
  readonly terrain: THREE.MeshStandardMaterial;
  readonly shell: THREE.MeshStandardMaterial;
  readonly steel: THREE.MeshStandardMaterial;
  readonly paper: THREE.MeshStandardMaterial;
  readonly signal: THREE.MeshStandardMaterial;
  readonly ink: THREE.MeshStandardMaterial;
  readonly guide: THREE.MeshStandardMaterial;
  readonly mountain: THREE.ShaderMaterial;
  readonly stone: THREE.ShaderMaterial;
  readonly bamboo: THREE.MeshToonMaterial;
  readonly water: THREE.MeshStandardMaterial;
  readonly cinnabar: THREE.MeshStandardMaterial;
  readonly mountainNear: THREE.ShaderMaterial;
  readonly mountainFar: THREE.ShaderMaterial;
}

export interface FacilityMaterialResources {
  readonly materials: FacilityMaterials;
  syncAtmosphere(fogColor: THREE.Color, fogDensity: number): void;
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
      mountain: tracker.track(
        createInkMaterial({
          inkColor: INK.zhong,
          valueBias: 0.16,
          cun: "hemp",
          cunStrength: 0.85,
          fogColor: new THREE.Color(INK.paper),
          fogDensity: 0.012,
        }),
      ),
      stone: tracker.track(
        createInkMaterial({
          inkColor: INK.zhong,
          valueBias: 0.22,
          cun: "axe",
          cunStrength: 0.7,
          fogColor: new THREE.Color(INK.paper),
          fogDensity: 0.012,
        }),
      ),
      bamboo: inkValueMaterial(EARTHS.pine, { side: THREE.DoubleSide }),
      water: material(EARTHS.water, 0.9, 0.03, {
        emissive: "#000000",
        emissiveIntensity: 0,
      }),
      cinnabar: material(ACCENTS.cinnabar, 0.78, 0.02, {
        emissive: "#2f0f0a",
        emissiveIntensity: 0.1,
      }),
      mountainNear: tracker.track(
        createInkMaterial({
          inkColor: INK.nong,
          valueBias: 0.24,
          cun: "raindrop",
          cunStrength: 1,
          fogColor: new THREE.Color(INK.paper),
          fogDensity: 0.012,
        }),
      ),
      mountainFar: tracker.track(
        createInkMaterial({
          inkColor: INK.dan,
          valueBias: 0.1,
          cun: "hemp",
          cunStrength: 0.5,
          fogColor: new THREE.Color(INK.paper),
          fogDensity: 0.012,
        }),
      ),
    });

    return {
      materials,
      syncAtmosphere(fogColor, fogDensity) {
        for (const material of Object.values(materials)) {
          if (isInkMaterial(material)) {
            syncInkMaterialAtmosphere(
              material as THREE.ShaderMaterial,
              fogColor,
              fogDensity,
            );
          }
        }
      },
      dispose: () => tracker.dispose(),
    };
  });
}
