import * as THREE from "three";
import type { FacilityNarrativeSample } from "../types";
import {
  clamp01,
  createArchRibs,
  createSignatureBox,
  createSignatureTube,
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
  update(sample: FacilityNarrativeSample): void;
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
  root.name = "facility-voice-chamber-zone";
  root.add(createArchRibs(context, "facility-voice-ribs", -25, -44, 9.2, 6.4));

  const incomingPoints = [
    new THREE.Vector3(0, 0.2, -24),
    new THREE.Vector3(0, 0.22, -31),
  ];
  const unsafePoints = [
    incomingPoints[1],
    new THREE.Vector3(-3.2, 0.24, -34.5),
    new THREE.Vector3(-3.2, 0.24, -37),
  ];
  const clarifiedPoints = [
    incomingPoints[1],
    new THREE.Vector3(3.1, 0.34, -35),
    new THREE.Vector3(2.2, 0.3, -39),
    new THREE.Vector3(0, 0.28, -43),
  ];

  const chamberStructure = [
    createSignatureTube(
      context,
      "facility-voice-input-conduit",
      context.materials.signal,
      incomingPoints,
      0.1,
    ),
    createSignatureTube(
      context,
      "facility-voice-unsafe-branch",
      context.materials.guide,
      unsafePoints,
      0.08,
    ),
    createSignatureTube(
      context,
      "facility-voice-clarified-branch",
      context.materials.signal,
      clarifiedPoints,
      0.1,
    ),
    createSignatureBox(
      context,
      "facility-voice-ambiguity-gate",
      context.materials.steel,
      [-3, 2.6, -31.2],
      [2.4, 4.8, 0.55],
    ),
    createSignatureBox(
      context,
      "facility-voice-ambiguity-gate-right",
      context.materials.steel,
      [3, 2.6, -31.2],
      [2.4, 4.8, 0.55],
    ),
  ];
  if (!simplified) {
    chamberStructure.push(
      createSignatureBox(
        context,
        "facility-voice-unsafe-stop",
        context.materials.shell,
        [-3.2, 1.9, -37.4],
        [2.1, 3.8, 0.7],
      ),
    );
  }
  root.add(...chamberStructure);

  const orderPlane = createSignatureBox(
    context,
    "facility-voice-order-plane",
    context.materials.paper,
    [0, 2.1, -43.5],
    [0.8, 3.6, 0.28],
  );
  const unsafeSignal = new THREE.Mesh(
    context.signalSphere,
    context.materials.signal,
  );
  unsafeSignal.name = "facility-voice-unsafe-signal";
  unsafeSignal.userData.signature = true;
  const clarifiedSignal = new THREE.Mesh(
    context.signalSphere,
    context.materials.signal,
  );
  clarifiedSignal.name = "facility-voice-clarified-signal";
  clarifiedSignal.userData.signature = true;
  root.add(orderPlane, clarifiedSignal);
  if (!simplified) root.add(unsafeSignal);

  const leftGate = root.getObjectByName("facility-voice-ambiguity-gate")!;
  const rightGate = root.getObjectByName("facility-voice-ambiguity-gate-right")!;
  unsafeSignal.visible = false;
  clarifiedSignal.visible = false;
  unsafeSignal.position.copy(unsafePoints[0]);
  clarifiedSignal.position.copy(clarifiedPoints[0]);

  const update = (sample: FacilityNarrativeSample) => {
    const state = clarificationStateAt(eventProgressFor(sample, "clarify-route"));
    unsafeSignal.visible = state.unsafeVisible;
    clarifiedSignal.visible = state.clarifiedVisible;
    pointAlongPolyline(unsafePoints, state.unsafeProgress, unsafeSignal.position);
    pointAlongPolyline(
      clarifiedPoints,
      state.clarifiedProgress,
      clarifiedSignal.position,
    );
    const gateTravel = state.clarifiedProgress * 0.72;
    leftGate.position.x = -3 - gateTravel;
    rightGate.position.x = 3 + gateTravel;
    orderPlane.scale.x = THREE.MathUtils.lerp(0.8, 6.4, state.orderProgress);
    orderPlane.userData.progress = state.orderProgress;
    root.userData.eventProgress = eventProgressFor(sample, "clarify-route");
  };

  return { root, update };
}
