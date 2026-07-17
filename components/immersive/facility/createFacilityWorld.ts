import * as THREE from "three";
import type { ThreeSceneTuning } from "../../threeSceneTuning";
import { createFacilityMaterials } from "./materials";
import { createResourceTracker } from "./resourceTracker";
import { sampleBoatJourney } from "./shanshuiJourney";
import {
  createShanshuiGeometryKit,
  createTravelerBoat,
} from "./shanshuiPrimitives";
import type { FacilityNarrativeSample } from "./types";
import { createCalibrationFacilityZones } from "./zones/calibration";
import { createDissolutionFacilityZone } from "./zones/dissolution";
import { createDocumentFacilityZone } from "./zones/document";
import { createExteriorFacilityZones } from "./zones/exterior";
import { createOrchestrationFacilityZone } from "./zones/orchestration";
import type { FacilityZoneContext } from "./zones/shared";
import { createVoiceFacilityZone } from "./zones/voice";

export type FacilityWorldZoneId =
  | "exterior-ridge"
  | "reliability-spine"
  | "fissure-threshold"
  | "voice-chamber"
  | "document-foundry"
  | "orchestration-atrium"
  | "dissolution-observatory"
  | "calibration-deck"
  | "quiet-horizon";

export interface FacilityWorld {
  readonly root: THREE.Group;
  readonly zones: Readonly<Record<FacilityWorldZoneId, THREE.Group>>;
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
  root.name = "living-shanshui-handscroll";
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
    const shanshuiGeometry = createShanshuiGeometryKit(tracker);
    const context: FacilityZoneContext = {
      tuning,
      materials: materialResources.materials,
      tracker,
      unitBox,
      signalSphere,
      shanshuiGeometry,
    };
    const exterior = createExteriorFacilityZones(context);
    const voice = createVoiceFacilityZone(context);
    const document = createDocumentFacilityZone(context);
    const orchestration = createOrchestrationFacilityZone(context);
    const dissolution = createDissolutionFacilityZone(context);
    const calibration = createCalibrationFacilityZones(context);
    const travelerBoat = createTravelerBoat(context);
    const zones: Readonly<Record<FacilityWorldZoneId, THREE.Group>> =
      Object.freeze({
        "exterior-ridge": exterior.exterior,
        "reliability-spine": exterior.reliability,
        "fissure-threshold": exterior.threshold,
        "voice-chamber": voice.root,
        "document-foundry": document.root,
        "orchestration-atrium": orchestration.root,
        "dissolution-observatory": dissolution.root,
        "calibration-deck": calibration.calibration,
        "quiet-horizon": calibration.horizon,
      });

    Object.values(zones).forEach((zone) => root.add(zone));
    root.add(travelerBoat.root);

    const setChapterVisibility = (rawProgress: number) => {
      const progress = Number.isFinite(rawProgress)
        ? THREE.MathUtils.clamp(rawProgress, 0, 1)
        : 0;
      exterior.exterior.visible = progress <= 0.135;
      exterior.reliability.visible = progress >= 0.055 && progress <= 0.235;
      exterior.threshold.visible = progress >= 0.115 && progress <= 0.335;
      voice.root.visible = progress >= 0.2 && progress <= 0.42;
      document.root.visible = progress >= 0.405 && progress <= 0.6;
      orchestration.root.visible = progress >= 0.52 && progress <= 0.73;
      dissolution.root.visible = progress >= 0.66 && progress <= 0.84;
      calibration.calibration.visible = progress >= 0.8 && progress <= 0.95;
      calibration.horizon.visible = progress >= 0.925;
    };
    setChapterVisibility(0);
    const hemisphere = new THREE.HemisphereLight(0xf5efe0, 0x8f8a76, 1.45);
    hemisphere.name = "shanshui-atmospheric-fill";
    const key = new THREE.DirectionalLight(0xfff6e2, 1.55);
    key.name = "shanshui-paper-key";
    key.position.set(-11, 18, 14);
    const mineralFill = new THREE.DirectionalLight(0x9db4a8, 0.5);
    mineralFill.name = "shanshui-mineral-fill";
    mineralFill.position.set(13, 8, -28);
    root.add(hemisphere, key, mineralFill);

    return {
      root,
      zones,
      update(sample, elapsedSeconds, motionEnergy) {
        materialResources.syncAtmosphere(
          new THREE.Color(sample.atmosphere.fogColor),
          sample.atmosphere.fogDensity,
        );
        setChapterVisibility(sample.journeyProgress);
        travelerBoat.update(sampleBoatJourney(sample.routeProgress));
        if (
          exterior.exterior.visible ||
          exterior.reliability.visible ||
          exterior.threshold.visible
        ) {
          exterior.update(sample, elapsedSeconds, motionEnergy);
        }
        if (voice.root.visible) {
          voice.update(sample, elapsedSeconds, motionEnergy);
        }
        if (document.root.visible) document.update(sample);
        if (orchestration.root.visible) {
          orchestration.update(sample, elapsedSeconds, motionEnergy);
        } else {
          const birds = orchestration.root.getObjectByName(
            "shanshui-archon-ink-bird-flock",
          );
          if (birds) birds.visible = false;
        }
        if (dissolution.root.visible) {
          dissolution.update(sample, elapsedSeconds, motionEnergy);
        } else {
          dissolution.deactivate();
        }
        if (calibration.calibration.visible || calibration.horizon.visible) {
          calibration.update(sample);
        }
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        root.removeFromParent();
        try {
          tracker.dispose();
        } finally {
          materialResources.dispose();
        }
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
