import * as THREE from "three";
import { sampleLivingWorldMotion } from "../shanshuiJourney";
import {
  createBambooGrove,
  createMistPass,
  createMountainCluster,
  createRiverRibbon,
  createStoneCluster,
} from "../shanshuiPrimitives";
import type { FacilityNarrativeSample } from "../types";
import {
  clamp01,
  eventProgressFor,
  pointAlongPolyline,
  setZoneBounds,
  type FacilityZoneContext,
} from "./shared";

export interface VoiceClarificationState {
  readonly inputProgress: number;
  readonly unsafeProgress: number;
  readonly unsafeVisible: boolean;
  readonly clarifiedProgress: number;
  readonly clarifiedVisible: boolean;
  readonly orderProgress: number;
}

export interface VoiceFacilityZone {
  readonly root: THREE.Group;
  update(
    sample: FacilityNarrativeSample,
    elapsedSeconds?: number,
    motionEnergy?: number,
  ): void;
}

export function clarificationStateAt(progress: number): VoiceClarificationState {
  const safe = clamp01(progress);
  return {
    inputProgress: clamp01(safe / 0.24),
    unsafeProgress: clamp01((safe - 0.2) / 0.32),
    unsafeVisible: safe >= 0.2 && safe < 0.74,
    clarifiedProgress: clamp01((safe - 0.54) / 0.46),
    clarifiedVisible: safe >= 0.54,
    orderProgress: clamp01((safe - 0.7) / 0.3),
  };
}

export function createVoiceFacilityZone(
  context: FacilityZoneContext,
): VoiceFacilityZone {
  const simplified = context.tuning.profile !== "desktop";
  const root = setZoneBounds(new THREE.Group(), -46, -23);
  root.name = "shanshui-kota-listening-gorge-zone";

  root.add(
    createMountainCluster(context, "shanshui-kota-gorge-walls", "tall", [
      { position: [-18.5, -1.42, -29], scale: [4.8, 9.8, 5.2], rotationY: 0.26 },
      { position: [19.2, -1.4, -31], scale: [4.9, 10.4, 5.3], rotationY: -0.31 },
      { position: [-20.2, -1.38, -41], scale: [5.2, 10.6, 5.6], rotationY: -0.42 },
      { position: [20.5, -1.4, -42], scale: [5.1, 11.2, 5.7], rotationY: 0.37 },
    ]),
    createMountainCluster(
      context,
      "shanshui-kota-distant-ridges",
      "broad",
      [
        { position: [-24.5, -1.3, -36], scale: [6.1, 5.5, 6.4], rotationY: 0.54 },
        { position: [24.2, -1.3, -38], scale: [5.9, 5.8, 6.2], rotationY: -0.48 },
      ],
      context.materials.shell,
    ),
    createRiverRibbon(context, "shanshui-kota-incoming-current", [
      { x: 0.2, y: -0.56, z: -24, width: 1.75 },
      { x: 0, y: -0.57, z: -28, width: 1.6 },
      { x: 0, y: -0.57, z: -31, width: 1.45 },
    ]),
    createRiverRibbon(
      context,
      "shanshui-kota-blocked-channel",
      [
        { x: 0, y: -0.59, z: -31, width: 1.22 },
        { x: -3.2, y: -0.6, z: -34.5, width: 1.05 },
        { x: -3.2, y: -0.61, z: -37.2, width: 0.72 },
      ],
      context.materials.guide,
    ),
    createRiverRibbon(context, "shanshui-kota-clarified-channel", [
      { x: 0, y: -0.55, z: -31, width: 1.32 },
      { x: 3.1, y: -0.54, z: -35, width: 1.45 },
      { x: 2.2, y: -0.54, z: -39, width: 1.62 },
      { x: 0, y: -0.54, z: -43.8, width: 2.15 },
    ]),
  );

  const bamboo = createBambooGrove(context, "shanshui-kota-listening-bamboo", {
    count: simplified ? 14 : 20,
    leavesPerStalk: simplified ? 3 : 4,
    xMin: 3.3,
    xMax: 7.4,
    zStart: -25,
    zEnd: -39.5,
    seed: 404,
  });
  root.add(bamboo.root);
  const exitMist = createMistPass(context, "shanshui-kota-exit-mist", [-43.6]);
  root.add(exitMist.root);

  const leftGate = new THREE.Mesh(
    context.shanshuiGeometry.stone,
    context.materials.stone,
  );
  leftGate.name = "shanshui-kota-ambiguity-stone-left";
  leftGate.position.set(-7.2, -0.72, -34.2);
  leftGate.scale.set(0.46, 0.98, 0.5);
  leftGate.rotation.y = 0.16;
  leftGate.userData.signature = true;
  const rightGate = new THREE.Mesh(
    context.shanshuiGeometry.stone,
    context.materials.stone,
  );
  rightGate.name = "shanshui-kota-ambiguity-stone-right";
  rightGate.position.set(7.2, -0.72, -34.2);
  rightGate.scale.set(0.48, 1.05, 0.52);
  rightGate.rotation.y = -0.2;
  rightGate.userData.signature = true;
  root.add(leftGate, rightGate);

  if (!simplified) {
    root.add(
      createStoneCluster(context, "shanshui-kota-blocked-channel-stones", [
        { position: [-3.2, -0.7, -37.2], scale: [1.35, 1.5, 1.45], rotationY: 0.2 },
        { position: [-2.45, -0.69, -37.6], scale: [0.72, 0.8, 0.84], rotationY: -0.5 },
        { position: [-3.9, -0.7, -37.8], scale: [0.68, 0.7, 0.76], rotationY: 0.64 },
      ], context.materials.shell),
    );
  }

  const inputPoints = [
    new THREE.Vector3(0.2, -0.39, -24),
    new THREE.Vector3(0, -0.39, -31),
  ];
  const unsafePoints = [
    inputPoints[1],
    new THREE.Vector3(-3.2, -0.4, -34.5),
    new THREE.Vector3(-3.2, -0.4, -37),
  ];
  const clarifiedPoints = [
    inputPoints[1],
    new THREE.Vector3(3.1, -0.37, -35),
    new THREE.Vector3(2.2, -0.37, -39),
    new THREE.Vector3(0, -0.37, -43.2),
  ];

  const rippleMaterial = context.tracker.track(
    new THREE.MeshBasicMaterial({
      color: 0xe0d7bf,
      opacity: 0.42,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const unsafeRipple = new THREE.Mesh(
    context.shanshuiGeometry.ripple,
    rippleMaterial,
  );
  unsafeRipple.name = "shanshui-kota-unsafe-ripple";
  unsafeRipple.rotation.x = -Math.PI * 0.5;
  unsafeRipple.scale.setScalar(0.32);
  unsafeRipple.userData.signature = true;
  const clarifiedRipple = new THREE.Mesh(
    context.shanshuiGeometry.ripple,
    rippleMaterial,
  );
  clarifiedRipple.name = "shanshui-kota-clarified-ripple";
  clarifiedRipple.rotation.x = -Math.PI * 0.5;
  clarifiedRipple.scale.setScalar(0.38);
  clarifiedRipple.userData.signature = true;
  root.add(clarifiedRipple);
  if (!simplified) root.add(unsafeRipple);

  const orderedWaterMaterial = context.tracker.track(
    context.materials.water.clone(),
  );
  orderedWaterMaterial.transparent = true;
  orderedWaterMaterial.opacity = 0.08;
  const orderedCurrent = createRiverRibbon(
    context,
    "shanshui-kota-ordered-current",
    [
      { x: 0, y: -0.53, z: -40.5, width: 1.7 },
      { x: 0, y: -0.52, z: -43.5, width: 2.4 },
      { x: -0.4, y: -0.51, z: -46, width: 5.8 },
    ],
    orderedWaterMaterial,
  );
  root.add(orderedCurrent);

  unsafeRipple.visible = false;
  clarifiedRipple.visible = false;
  unsafeRipple.position.copy(unsafePoints[0]);
  clarifiedRipple.position.copy(clarifiedPoints[0]);

  const update = (
    sample: FacilityNarrativeSample,
    elapsedSeconds = 0,
    motionEnergy = 0,
  ) => {
    const progress = eventProgressFor(sample, "clarify-route");
    const state = clarificationStateAt(progress);
    const living = sampleLivingWorldMotion(
      sample.journeyProgress,
      elapsedSeconds,
      motionEnergy,
      context.tuning.profile,
    );
    const livingGorgeVisible = sample.journeyProgress <= 0.405;
    bamboo.root.visible = livingGorgeVisible;
    exitMist.root.visible = livingGorgeVisible;
    if (livingGorgeVisible) {
      bamboo.update(living.bambooSway);
      exitMist.update(
        sample.journeyProgress + living.mistDrift * 0.025,
        elapsedSeconds,
        motionEnergy,
        THREE.MathUtils.clamp(
          1 - Math.abs(sample.journeyProgress - 0.35) / 0.13,
          0,
          1,
        ),
      );
    }
    unsafeRipple.visible = !simplified && state.unsafeVisible;
    clarifiedRipple.visible = state.clarifiedVisible;
    pointAlongPolyline(unsafePoints, state.unsafeProgress, unsafeRipple.position);
    pointAlongPolyline(
      clarifiedPoints,
      state.clarifiedProgress,
      clarifiedRipple.position,
    );
    const unsafeScale = 0.28 + Math.sin(state.unsafeProgress * Math.PI) * 0.18;
    const clarifiedScale =
      0.34 + Math.sin(state.clarifiedProgress * Math.PI) * 0.24;
    unsafeRipple.scale.setScalar(unsafeScale);
    clarifiedRipple.scale.setScalar(clarifiedScale);
    const gateTravel = state.clarifiedProgress * 0.58;
    leftGate.position.x = -7.2 - gateTravel;
    rightGate.position.x = 7.2 + gateTravel;
    orderedWaterMaterial.opacity = 0.08 + state.orderProgress * 0.78;
    root.userData.eventProgress = progress;
    root.userData.orderProgress = state.orderProgress;
  };

  return { root, update };
}
