import * as THREE from "three";
import type { FacilityNarrativeSample } from "../types";
import {
  riverCenterAtDepth,
  sampleLivingWorldMotion,
} from "../shanshuiJourney";
import {
  createBambooGrove,
  createMistPass,
  createMountainCluster,
  createRiverRibbon,
  createStoneCluster,
  type RiverRibbonPoint,
} from "../shanshuiPrimitives";
import { setZoneBounds, type FacilityZoneContext } from "./shared";

export interface ExteriorFacilityZones {
  readonly exterior: THREE.Group;
  readonly reliability: THREE.Group;
  readonly threshold: THREE.Group;
  update(
    sample: FacilityNarrativeSample,
    elapsedSeconds: number,
    motionEnergy: number,
  ): void;
}

function riverPoint(
  z: number,
  width: number,
  x = riverCenterAtDepth(z),
  y = -0.58,
): RiverRibbonPoint {
  return { x, y, z, width };
}

export function createExteriorFacilityZones(
  context: FacilityZoneContext,
): ExteriorFacilityZones {
  const exterior = setZoneBounds(new THREE.Group(), -4, 24);
  exterior.name = "shanshui-mountain-overlook-zone";
  // The terrain shader already carves and colors the foreground watercourse.
  // Keep this authored ribbon as a geometry contract without double-painting
  // an opaque strip over the opening composition.
  const heroRiver = createRiverRibbon(
    context,
    "shanshui-hero-river",
    [4, 0, -4, -8].map((z, index) =>
      riverPoint(z, THREE.MathUtils.lerp(0.95, 1.62, index / 3)),
    ),
  );
  heroRiver.visible = false;
  exterior.add(
    createMountainCluster(context, "shanshui-hero-distant-peaks", "tall", [
      {
        position: [-22.5, -1.42, -14],
        scale: [6.4, 9.6, 6.2],
        rotationY: 0.34,
      },
      {
        position: [22.8, -1.4, -19],
        scale: [6.8, 11.2, 6.4],
        rotationY: -0.26,
      },
      {
        position: [7.5, -1.38, -35],
        scale: [4.2, 7.4, 4.3],
        rotationY: 0.58,
      },
    ]),
    createMountainCluster(context, "shanshui-hero-foothills", "broad", [
      {
        position: [-16.8, -1.15, 1.5],
        scale: [4.8, 3.8, 4.8],
        rotationY: -0.42,
      },
      {
        position: [17.2, -1.2, -2],
        scale: [4.6, 4.2, 4.7],
        rotationY: 0.2,
      },
    ], context.materials.shell),
    createStoneCluster(context, "shanshui-hero-river-stones", [
      { position: [-4.8, -0.72, 12], scale: [1.8, 1.1, 1.5], rotationY: 0.3 },
      { position: [4.1, -0.76, 7], scale: [1.35, 0.8, 1.15], rotationY: -0.5 },
      { position: [-3.2, -0.73, -2], scale: [1.2, 0.65, 1.6], rotationY: 0.8 },
    ]),
    heroRiver,
  );

  const reliability = setZoneBounds(new THREE.Group(), -11, 18);
  reliability.name = "shanshui-river-confluence-zone";
  reliability.add(
    createMountainCluster(context, "shanshui-confluence-banks", "broad", [
      { position: [-17.8, -1.3, 5], scale: [5.5, 5.2, 5.8], rotationY: 0.2 },
      { position: [18.4, -1.25, 2], scale: [5.2, 5.8, 5.5], rotationY: -0.32 },
      { position: [-15.5, -1.18, -8], scale: [4.6, 5.4, 4.8], rotationY: 0.6 },
      { position: [15.8, -1.2, -10], scale: [4.5, 5.8, 4.7], rotationY: -0.55 },
    ], context.materials.shell),
    createRiverRibbon(context, "shanshui-confluence-west", [
      riverPoint(17, 1.2, -11.5),
      riverPoint(10, 1.28, -7.4),
      riverPoint(3, 1.5, -3.5),
      riverPoint(-7, 2.2),
    ], context.materials.guide),
    createRiverRibbon(context, "shanshui-confluence-east", [
      riverPoint(16, 1.15, 11.2),
      riverPoint(9, 1.26, 7.1),
      riverPoint(2, 1.5, 3.4),
      riverPoint(-7, 2.2),
    ], context.materials.guide),
    createRiverRibbon(context, "shanshui-confluence-main-current", [
      riverPoint(18, 2.1),
      riverPoint(10, 2.25),
      riverPoint(2, 2.35),
      riverPoint(-7, 2.4),
      riverPoint(-11, 2.15),
    ]),
  );

  const threshold = setZoneBounds(new THREE.Group(), -27, -8);
  threshold.name = "shanshui-mist-and-bamboo-threshold-zone";
  threshold.add(
    createMountainCluster(context, "shanshui-threshold-gorge", "tall", [
      { position: [-15.8, -1.42, -13], scale: [4.8, 10.2, 5.1], rotationY: 0.24 },
      { position: [16.2, -1.4, -15], scale: [4.9, 11.1, 5.2], rotationY: -0.3 },
      { position: [-17.8, -1.4, -24], scale: [5.2, 11.5, 5.5], rotationY: -0.5 },
      { position: [17.4, -1.38, -25], scale: [5.1, 12.1, 5.5], rotationY: 0.46 },
    ]),
    createStoneCluster(context, "shanshui-threshold-standing-stones", [
      { position: [-3.5, -0.8, -14], scale: [1.05, 2.7, 1.2], rotationY: 0.14 },
      { position: [3.7, -0.8, -15], scale: [1.1, 3.1, 1.25], rotationY: -0.18 },
      { position: [-3.9, -0.78, -24], scale: [1.35, 2.4, 1.45], rotationY: 0.5 },
      { position: [3.6, -0.76, -25], scale: [1.25, 2.2, 1.35], rotationY: -0.44 },
    ]),
    createRiverRibbon(context, "shanshui-threshold-river", [
      riverPoint(-8, 2.25),
      riverPoint(-13, 1.9),
      riverPoint(-19, 1.65),
      riverPoint(-25.5, 1.8),
    ]),
  );
  if (context.tuning.profile === "reduced") {
    const standingStones = threshold.getObjectByName(
      "shanshui-threshold-standing-stones",
    );
    if (standingStones) standingStones.visible = false;
  }

  const bambooCount =
    context.tuning.profile === "desktop"
      ? 28
      : context.tuning.profile === "constrained"
        ? 22
        : context.tuning.profile === "mobile"
          ? 14
          : 10;
  const bamboo = createBambooGrove(context, "shanshui-threshold-bamboo", {
    count: bambooCount,
    leavesPerStalk: context.tuning.profile === "desktop" ? 3 : 2,
    xMin: 3.2,
    xMax: 7.4,
    zStart: -9.5,
    zEnd: -27,
    seed: 811,
  });
  const mist = createMistPass(
    context,
    "shanshui-threshold-mist",
    context.tuning.profile === "mobile" || context.tuning.profile === "reduced"
      ? [-17.8]
      : [-10.5, -17.8, -24.2],
  );
  threshold.add(bamboo.root, mist.root);

  const thresholdLight = new THREE.PointLight(0xd8cfb4, 2.4, 18, 2);
  thresholdLight.name = "shanshui-threshold-paper-light";
  thresholdLight.position.set(0, 4.2, -25.8);
  threshold.add(thresholdLight);

  return {
    exterior,
    reliability,
    threshold,
    update(sample, elapsedSeconds, motionEnergy) {
      const living = sampleLivingWorldMotion(
        sample.journeyProgress,
        elapsedSeconds,
        motionEnergy,
        context.tuning.profile,
      );
      const thresholdIntensity = THREE.MathUtils.clamp(
        1 - Math.abs(sample.journeyProgress - 0.255) / 0.19,
        0,
        1,
      );
      if (threshold.visible) {
        bamboo.update(living.bambooSway);
        mist.update(
          sample.journeyProgress + living.mistDrift * 0.035,
          elapsedSeconds,
          motionEnergy,
          thresholdIntensity,
        );
        thresholdLight.intensity = 1.8 + thresholdIntensity * 1.2;
      }
    },
  };
}
