import * as THREE from "three";
import type { ThreeSceneTuning } from "../../threeSceneTuning";
import { createFacilityMaterials } from "./materials";
import { createResourceTracker } from "./resourceTracker";
import type { FacilityNarrativeSample } from "./types";
import { createDocumentFacilityZone } from "./zones/document";
import { createExteriorFacilityZones } from "./zones/exterior";
import { createOrchestrationFacilityZone } from "./zones/orchestration";
import type { FacilityZoneContext } from "./zones/shared";
import { createVoiceFacilityZone } from "./zones/voice";

export type FacilityGreyboxZoneId =
  | "exterior-ridge"
  | "reliability-spine"
  | "fissure-threshold"
  | "voice-chamber"
  | "document-foundry"
  | "orchestration-atrium";

export interface FacilityWorld {
  readonly root: THREE.Group;
  readonly zones: Readonly<Record<FacilityGreyboxZoneId, THREE.Group>>;
  update(
    sample: FacilityNarrativeSample,
    elapsedSeconds: number,
    motionEnergy: number,
  ): void;
  dispose(): void;
}

export function createFacilityWorld(tuning: ThreeSceneTuning): FacilityWorld {
  const materialResources = createFacilityMaterials();
  const tracker = createResourceTracker();
  const root = new THREE.Group();
  root.name = "carved-systems-facility";
  let disposed = false;

  try {
    const unitBox = tracker.track(new THREE.BoxGeometry(1, 1, 1));
    const signalSphere = tracker.track(
      new THREE.SphereGeometry(
        0.28,
        tuning.profile === "desktop" ? 16 : 10,
        tuning.profile === "desktop" ? 10 : 8,
      ),
    );
    const context: FacilityZoneContext = {
      tuning,
      materials: materialResources.materials,
      tracker,
      unitBox,
      signalSphere,
    };
    const exterior = createExteriorFacilityZones(context);
    const voice = createVoiceFacilityZone(context);
    const document = createDocumentFacilityZone(context);
    const orchestration = createOrchestrationFacilityZone(context);
    const zones: Readonly<Record<FacilityGreyboxZoneId, THREE.Group>> =
      Object.freeze({
        "exterior-ridge": exterior.exterior,
        "reliability-spine": exterior.reliability,
        "fissure-threshold": exterior.threshold,
        "voice-chamber": voice.root,
        "document-foundry": document.root,
        "orchestration-atrium": orchestration.root,
      });

    Object.values(zones).forEach((zone) => root.add(zone));
    const hemisphere = new THREE.HemisphereLight(0x9cae9f, 0x080b0b, 1.35);
    hemisphere.name = "facility-atmospheric-fill";
    const key = new THREE.DirectionalLight(0xd4cfb8, 2.1);
    key.name = "facility-exterior-key";
    key.position.set(-9, 15, 12);
    root.add(hemisphere, key);

    return {
      root,
      zones,
      update(sample, _elapsedSeconds, _motionEnergy) {
        voice.update(sample);
        document.update(sample);
        orchestration.update(sample);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        root.removeFromParent();
        tracker.dispose();
        materialResources.dispose();
      },
    };
  } catch (error) {
    try {
      tracker.dispose();
    } finally {
      materialResources.dispose();
    }
    throw error;
  }
}
