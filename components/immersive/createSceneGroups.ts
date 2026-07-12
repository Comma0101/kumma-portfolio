import * as THREE from "three";
import type {
  SceneGroupBudgets,
  ThreeSceneTuning,
} from "../threeSceneTuning";
import type { SceneGroupKey, SceneGroupWeights } from "./types";

const ATLAS = {
  paper: 0xf0ede8,
  sand: 0xa3b5a8,
  signal: 0x3f9d7f,
  steel: 0xa4a09a,
  voiceAtmosphere: 0x75939a,
  inkAtmosphere: 0xac8f83,
} as const;

const GROUP_KEYS: readonly SceneGroupKey[] = [
  "horizon",
  "signals",
  "voice",
  "document",
  "orchestration",
  "splats",
  "measurement",
];

const MECHANISM_NAMES: Readonly<Record<SceneGroupKey, string>> = {
  horizon: "terrain beacons",
  signals: "converging signal rails",
  voice: "voice tunnel rings and waveform",
  document: "document chunks and queue",
  orchestration: "orchestration nodes and routed trace",
  splats: "sparse ink depth volume",
  measurement: "measurement grid and ledger lines",
};

export type SceneGroupCounts = Readonly<Record<SceneGroupKey, number>>;

export interface ImmersiveSceneGroups {
  readonly root: THREE.Group;
  readonly groups: Readonly<Record<SceneGroupKey, THREE.Group>>;
  readonly counts: SceneGroupCounts;
  update(
    weights: SceneGroupWeights,
    elapsedSeconds: number,
    motionScale: number,
  ): void;
  dispose(): void;
}

interface MaterialState {
  readonly material: THREE.Material;
  readonly baseOpacity: number;
}

interface GroupRuntime {
  readonly group: THREE.Group;
  readonly materials: readonly MaterialState[];
  readonly baseX: number;
  readonly baseY: number;
  readonly baseZ: number;
  readonly baseRotationX: number;
  readonly baseRotationY: number;
  readonly baseRotationZ: number;
  readonly motionAmplitude: number;
  readonly motionPhase: number;
  readonly motionSpeed: number;
}

function deterministicUnit(index: number, salt: number): number {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function materialState(material: THREE.Material): MaterialState {
  return { material, baseOpacity: material.opacity };
}

function addLineSegments(
  group: THREE.Group,
  positions: readonly number[],
  material: THREE.LineBasicMaterial,
  name: string,
): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  const lines = new THREE.LineSegments(geometry, material);
  lines.name = name;
  group.add(lines);
  return lines;
}

function createHorizon(
  group: THREE.Group,
  count: number,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
): readonly MaterialState[] {
  const beaconGeometry = new THREE.CylinderGeometry(0.045, 0.11, 1, 6);
  const beaconMaterial = new THREE.MeshBasicMaterial({
    color: ATLAS.sand,
    depthWrite: false,
    fog: true,
    opacity: 0.58,
    transparent: true,
  });
  const beacons = new THREE.InstancedMesh(
    beaconGeometry,
    beaconMaterial,
    count,
  );
  const matrix = new THREE.Object3D();

  for (let index = 0; index < count; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const depth = -5 - deterministicUnit(index, 2) * 48;
    const height = 0.8 + deterministicUnit(index, 3) * 2.4;
    matrix.position.set(
      side * (5 + deterministicUnit(index, 1) * 14),
      height * 0.5 - 0.15,
      depth,
    );
    matrix.scale.set(1, height, 1);
    matrix.updateMatrix();
    beacons.setMatrixAt(index, matrix.matrix);
  }

  beacons.instanceMatrix.needsUpdate = true;
  beacons.name = "horizon-beacons";
  group.add(beacons);
  geometries.add(beaconGeometry);
  materials.add(beaconMaterial);

  const horizonMaterial = new THREE.LineBasicMaterial({
    color: ATLAS.steel,
    depthWrite: false,
    fog: true,
    opacity: 0.15,
    transparent: true,
  });
  const horizonPositions: number[] = [];
  for (let index = 0; index < 7; index += 1) {
    const z = -8 - index * 7;
    horizonPositions.push(-24, 0, z, 24, 0, z);
  }
  const horizonLines = addLineSegments(
    group,
    horizonPositions,
    horizonMaterial,
    "horizon-depth-lines",
  );
  geometries.add(horizonLines.geometry);
  materials.add(horizonMaterial);

  return [materialState(beaconMaterial), materialState(horizonMaterial)];
}

function createSignals(
  group: THREE.Group,
  count: number,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
): readonly MaterialState[] {
  const railCount = Math.max(4, Math.min(8, Math.ceil(count / 12)));
  const railPositions: number[] = [];
  for (let rail = 0; rail < railCount; rail += 1) {
    const spread = (rail / Math.max(1, railCount - 1) - 0.5) * 17;
    railPositions.push(spread, 0.4 + (rail % 3) * 0.42, 4);
    railPositions.push(spread * 0.12, 0.7 + (rail % 3) * 0.16, -32);
  }
  const railMaterial = new THREE.LineBasicMaterial({
    color: ATLAS.signal,
    depthWrite: false,
    fog: true,
    opacity: 0.62,
    transparent: true,
  });
  const rails = addLineSegments(
    group,
    railPositions,
    railMaterial,
    "signal-rails",
  );

  const particlePositions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const depthProgress = deterministicUnit(index, 4);
    const sourceX = (deterministicUnit(index, 5) - 0.5) * 18;
    const convergence = 1 - depthProgress * 0.86;
    particlePositions[index * 3] = sourceX * convergence;
    particlePositions[index * 3 + 1] =
      0.45 + deterministicUnit(index, 6) * 2.2;
    particlePositions[index * 3 + 2] = 4 - depthProgress * 36;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );
  const particleMaterial = new THREE.PointsMaterial({
    color: ATLAS.paper,
    depthWrite: false,
    fog: true,
    opacity: 0.52,
    size: 0.09,
    sizeAttenuation: true,
    transparent: true,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.name = "signal-packets";
  group.add(particles);

  geometries.add(rails.geometry);
  geometries.add(particleGeometry);
  materials.add(railMaterial);
  materials.add(particleMaterial);

  return [materialState(railMaterial), materialState(particleMaterial)];
}

function createVoice(
  group: THREE.Group,
  count: number,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
): readonly MaterialState[] {
  const ringGeometry = new THREE.TorusGeometry(1.8, 0.025, 4, 28);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: ATLAS.voiceAtmosphere,
    depthWrite: false,
    fog: true,
    opacity: 0.5,
    transparent: true,
  });
  const rings = new THREE.InstancedMesh(ringGeometry, ringMaterial, count);
  const matrix = new THREE.Object3D();

  for (let index = 0; index < count; index += 1) {
    const progress = index / Math.max(1, count - 1);
    const scale = 0.72 + progress * 0.62;
    matrix.position.set(0, 1.2, 1 - progress * 34);
    matrix.scale.set(scale, scale, scale);
    matrix.rotation.set(0, 0, index % 2 === 0 ? 0.04 : -0.04);
    matrix.updateMatrix();
    rings.setMatrixAt(index, matrix.matrix);
  }
  rings.instanceMatrix.needsUpdate = true;
  rings.name = "voice-tunnel-rings";
  group.add(rings);

  const waveformPositions: number[] = [];
  const waveformSegments = Math.max(16, count * 2);
  for (let index = 0; index < waveformSegments; index += 1) {
    const z0 = 1 - (index / waveformSegments) * 34;
    const z1 = 1 - ((index + 1) / waveformSegments) * 34;
    waveformPositions.push(
      Math.sin(index * 0.78) * 0.72,
      1.2 + Math.cos(index * 0.46) * 0.28,
      z0,
      Math.sin((index + 1) * 0.78) * 0.72,
      1.2 + Math.cos((index + 1) * 0.46) * 0.28,
      z1,
    );
  }
  const waveformMaterial = new THREE.LineBasicMaterial({
    color: ATLAS.signal,
    depthWrite: false,
    fog: true,
    opacity: 0.72,
    transparent: true,
  });
  const waveform = addLineSegments(
    group,
    waveformPositions,
    waveformMaterial,
    "voice-waveform",
  );

  geometries.add(ringGeometry);
  geometries.add(waveform.geometry);
  materials.add(ringMaterial);
  materials.add(waveformMaterial);

  return [materialState(ringMaterial), materialState(waveformMaterial)];
}

function createDocument(
  group: THREE.Group,
  count: number,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
): readonly MaterialState[] {
  const documentGeometry = new THREE.PlaneGeometry(1.05, 1.4, 1, 1);
  const documentMaterial = new THREE.MeshBasicMaterial({
    color: ATLAS.paper,
    depthWrite: false,
    fog: true,
    opacity: 0.36,
    side: THREE.DoubleSide,
    transparent: true,
    wireframe: true,
  });
  const documents = new THREE.InstancedMesh(
    documentGeometry,
    documentMaterial,
    count,
  );
  const matrix = new THREE.Object3D();

  for (let index = 0; index < count; index += 1) {
    const lane = (index % 3) - 1;
    const row = Math.floor(index / 3);
    matrix.position.set(
      lane * 2.15 + (deterministicUnit(index, 7) - 0.5) * 0.28,
      0.8 + (row % 4) * 1.15,
      -10 - row * 2.45,
    );
    matrix.rotation.set(
      -0.08,
      lane * -0.12,
      (deterministicUnit(index, 8) - 0.5) * 0.1,
    );
    matrix.scale.set(
      0.72 + deterministicUnit(index, 9) * 0.34,
      0.72 + deterministicUnit(index, 10) * 0.34,
      1,
    );
    matrix.updateMatrix();
    documents.setMatrixAt(index, matrix.matrix);
  }
  documents.instanceMatrix.needsUpdate = true;
  documents.name = "document-chunks";
  group.add(documents);

  const queueMaterial = new THREE.LineBasicMaterial({
    color: ATLAS.signal,
    depthWrite: false,
    fog: true,
    opacity: 0.54,
    transparent: true,
  });
  const queuePositions = [
    -3.1, 0.35, -8, -3.1, 0.35, -34,
    0, 0.35, -8, 0, 0.35, -34,
    3.1, 0.35, -8, 3.1, 0.35, -34,
    -3.1, 0.35, -34, 3.1, 0.35, -34,
  ];
  const queue = addLineSegments(
    group,
    queuePositions,
    queueMaterial,
    "document-queue",
  );

  geometries.add(documentGeometry);
  geometries.add(queue.geometry);
  materials.add(documentMaterial);
  materials.add(queueMaterial);

  return [materialState(documentMaterial), materialState(queueMaterial)];
}

function createOrchestration(
  group: THREE.Group,
  count: number,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
): readonly MaterialState[] {
  const nodeGeometry = new THREE.IcosahedronGeometry(0.18, 1);
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: ATLAS.sand,
    depthWrite: false,
    fog: true,
    opacity: 0.72,
    transparent: true,
  });
  const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, count);
  const nodePositions = new Float32Array(count * 3);
  const matrix = new THREE.Object3D();

  for (let index = 0; index < count; index += 1) {
    const angle = index * 2.399963229728653;
    const radius = 2.2 + deterministicUnit(index, 11) * 7.2;
    const x = Math.cos(angle) * radius;
    const y = 1.1 + deterministicUnit(index, 12) * 6.5;
    const z = -20 + Math.sin(angle) * radius * 0.75;
    nodePositions[index * 3] = x;
    nodePositions[index * 3 + 1] = y;
    nodePositions[index * 3 + 2] = z;
    matrix.position.set(x, y, z);
    const scale = index % 7 === 0 ? 1.7 : 0.85 + deterministicUnit(index, 13);
    matrix.scale.setScalar(scale);
    matrix.updateMatrix();
    nodes.setMatrixAt(index, matrix.matrix);
  }
  nodes.instanceMatrix.needsUpdate = true;
  nodes.name = "orchestration-nodes";
  group.add(nodes);

  const edgePositions = new Float32Array(count * 6);
  for (let index = 0; index < count; index += 1) {
    const target = (index * 7 + 3) % count;
    edgePositions[index * 6] = nodePositions[index * 3];
    edgePositions[index * 6 + 1] = nodePositions[index * 3 + 1];
    edgePositions[index * 6 + 2] = nodePositions[index * 3 + 2];
    edgePositions[index * 6 + 3] = nodePositions[target * 3];
    edgePositions[index * 6 + 4] = nodePositions[target * 3 + 1];
    edgePositions[index * 6 + 5] = nodePositions[target * 3 + 2];
  }
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: ATLAS.steel,
    depthWrite: false,
    fog: true,
    opacity: 0.2,
    transparent: true,
  });
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(edgePositions, 3),
  );
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  edges.name = "orchestration-edges";
  group.add(edges);

  const traceMaterial = new THREE.LineBasicMaterial({
    color: ATLAS.signal,
    depthWrite: false,
    fog: true,
    opacity: 0.68,
    transparent: true,
  });
  const tracePositions: number[] = [];
  const traceCount = Math.min(count, 8);
  for (let index = 0; index < traceCount - 1; index += 1) {
    const current = (index * 5) % count;
    const next = ((index + 1) * 5) % count;
    tracePositions.push(
      nodePositions[current * 3],
      nodePositions[current * 3 + 1],
      nodePositions[current * 3 + 2],
      nodePositions[next * 3],
      nodePositions[next * 3 + 1],
      nodePositions[next * 3 + 2],
    );
  }
  const trace = addLineSegments(
    group,
    tracePositions,
    traceMaterial,
    "orchestration-routed-trace",
  );

  geometries.add(nodeGeometry);
  geometries.add(edgeGeometry);
  geometries.add(trace.geometry);
  materials.add(nodeMaterial);
  materials.add(edgeMaterial);
  materials.add(traceMaterial);

  return [
    materialState(nodeMaterial),
    materialState(edgeMaterial),
    materialState(traceMaterial),
  ];
}

function createSplats(
  group: THREE.Group,
  count: number,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
): readonly MaterialState[] {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sand = new THREE.Color(ATLAS.sand);
  const ink = new THREE.Color(ATLAS.inkAtmosphere);

  for (let index = 0; index < count; index += 1) {
    const angle = deterministicUnit(index, 14) * Math.PI * 2;
    const radius = Math.sqrt(deterministicUnit(index, 15));
    const depth = (deterministicUnit(index, 16) - 0.5) * 16;
    positions[index * 3] = Math.cos(angle) * radius * 11;
    positions[index * 3 + 1] =
      0.35 + Math.pow(deterministicUnit(index, 17), 1.8) * 6;
    positions[index * 3 + 2] = -23 + depth;
    const color = index % 5 === 0 ? ink : sand;
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const splatGeometry = new THREE.BufferGeometry();
  splatGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  splatGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const splatMaterial = new THREE.PointsMaterial({
    depthWrite: false,
    fog: true,
    opacity: 0.58,
    size: 0.18,
    sizeAttenuation: true,
    transparent: true,
    vertexColors: true,
  });
  const splats = new THREE.Points(splatGeometry, splatMaterial);
  splats.name = "ink-depth-points";
  group.add(splats);

  geometries.add(splatGeometry);
  materials.add(splatMaterial);

  return [materialState(splatMaterial)];
}

function createMeasurement(
  group: THREE.Group,
  count: number,
  geometries: Set<THREE.BufferGeometry>,
  materials: Set<THREE.Material>,
): readonly MaterialState[] {
  const gridPositions: number[] = [];
  const acrossCount = Math.max(2, Math.floor(count * 0.44));
  const depthCount = Math.max(2, count - acrossCount);

  for (let index = 0; index < acrossCount; index += 1) {
    const x = -18 + (index / Math.max(1, acrossCount - 1)) * 36;
    gridPositions.push(x, 0.12, -8, x, 0.12, -54);
  }
  for (let index = 0; index < depthCount; index += 1) {
    const z = -8 - (index / Math.max(1, depthCount - 1)) * 46;
    gridPositions.push(-18, 0.12, z, 18, 0.12, z);
  }

  const gridMaterial = new THREE.LineBasicMaterial({
    color: ATLAS.steel,
    depthWrite: false,
    fog: true,
    opacity: 0.2,
    transparent: true,
  });
  const grid = addLineSegments(
    group,
    gridPositions,
    gridMaterial,
    "measurement-coordinate-grid",
  );

  const ledgerPositions: number[] = [];
  const railCount = Math.max(4, Math.min(12, Math.floor(count / 4)));
  for (let index = 0; index < railCount; index += 1) {
    const x = -8 + (index / Math.max(1, railCount - 1)) * 16;
    const latency = 0.4 + deterministicUnit(index, 18) * 2.2;
    ledgerPositions.push(x, 0.22, -12, x, latency, -40);
    ledgerPositions.push(x, latency, -40, x + 0.8, latency, -45);
  }
  const ledgerMaterial = new THREE.LineBasicMaterial({
    color: ATLAS.signal,
    depthWrite: false,
    fog: true,
    opacity: 0.62,
    transparent: true,
  });
  const ledger = addLineSegments(
    group,
    ledgerPositions,
    ledgerMaterial,
    "measurement-latency-ledger",
  );

  geometries.add(grid.geometry);
  geometries.add(ledger.geometry);
  materials.add(gridMaterial);
  materials.add(ledgerMaterial);

  return [materialState(gridMaterial), materialState(ledgerMaterial)];
}

function countsFromBudgets(budgets: SceneGroupBudgets): SceneGroupCounts {
  return Object.freeze({
    horizon: budgets.beacons,
    signals: budgets.signals,
    voice: budgets.voice,
    document: budgets.document,
    orchestration: budgets.orchestration,
    splats: budgets.splats,
    measurement: budgets.measurement,
  });
}

export function createSceneGroups(
  tuning: ThreeSceneTuning,
): ImmersiveSceneGroups {
  const root = new THREE.Group();
  root.name = "atlas-immersive-world";
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const counts = countsFromBudgets(tuning.groupBudgets);

  const groups: Record<SceneGroupKey, THREE.Group> = {
    horizon: new THREE.Group(),
    signals: new THREE.Group(),
    voice: new THREE.Group(),
    document: new THREE.Group(),
    orchestration: new THREE.Group(),
    splats: new THREE.Group(),
    measurement: new THREE.Group(),
  };

  for (const key of GROUP_KEYS) {
    const group = groups[key];
    group.name = `immersive-${key}`;
    group.userData.mechanism = MECHANISM_NAMES[key];
    group.userData.budget = counts[key];
    group.userData.motionActive = false;
    root.add(group);
  }

  const runtimes: Record<SceneGroupKey, GroupRuntime> = {
    horizon: {
      group: groups.horizon,
      materials: createHorizon(
        groups.horizon,
        counts.horizon,
        geometries,
        materials,
      ),
      baseX: 0,
      baseY: 0,
      baseZ: 0,
      baseRotationX: 0,
      baseRotationY: 0,
      baseRotationZ: 0,
      motionAmplitude: 0.035,
      motionPhase: 0.3,
      motionSpeed: 0.22,
    },
    signals: {
      group: groups.signals,
      materials: createSignals(
        groups.signals,
        counts.signals,
        geometries,
        materials,
      ),
      baseX: 0,
      baseY: 0,
      baseZ: 0,
      baseRotationX: 0,
      baseRotationY: 0,
      baseRotationZ: 0,
      motionAmplitude: 0.14,
      motionPhase: 1.1,
      motionSpeed: 0.55,
    },
    voice: {
      group: groups.voice,
      materials: createVoice(
        groups.voice,
        counts.voice,
        geometries,
        materials,
      ),
      baseX: 0,
      baseY: 0,
      baseZ: 0,
      baseRotationX: 0,
      baseRotationY: 0,
      baseRotationZ: 0,
      motionAmplitude: 0.11,
      motionPhase: 2.4,
      motionSpeed: 0.7,
    },
    document: {
      group: groups.document,
      materials: createDocument(
        groups.document,
        counts.document,
        geometries,
        materials,
      ),
      baseX: 0,
      baseY: 0,
      baseZ: 0,
      baseRotationX: 0,
      baseRotationY: 0,
      baseRotationZ: 0,
      motionAmplitude: 0.09,
      motionPhase: 3.2,
      motionSpeed: 0.38,
    },
    orchestration: {
      group: groups.orchestration,
      materials: createOrchestration(
        groups.orchestration,
        counts.orchestration,
        geometries,
        materials,
      ),
      baseX: 0,
      baseY: 0,
      baseZ: 0,
      baseRotationX: 0,
      baseRotationY: 0,
      baseRotationZ: 0,
      motionAmplitude: 0.075,
      motionPhase: 4.4,
      motionSpeed: 0.24,
    },
    splats: {
      group: groups.splats,
      materials: createSplats(
        groups.splats,
        counts.splats,
        geometries,
        materials,
      ),
      baseX: 0,
      baseY: 0,
      baseZ: 0,
      baseRotationX: 0,
      baseRotationY: 0,
      baseRotationZ: 0,
      motionAmplitude: 0.12,
      motionPhase: 5.1,
      motionSpeed: 0.2,
    },
    measurement: {
      group: groups.measurement,
      materials: createMeasurement(
        groups.measurement,
        counts.measurement,
        geometries,
        materials,
      ),
      baseX: 0,
      baseY: 0,
      baseZ: 0,
      baseRotationX: 0,
      baseRotationY: 0,
      baseRotationZ: 0,
      motionAmplitude: 0.025,
      motionPhase: 5.8,
      motionSpeed: 0.16,
    },
  };

  let disposed = false;

  return {
    root,
    groups,
    counts,
    update(weights, elapsedSeconds, motionScale) {
      const elapsed = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
      const motion = clamp01(motionScale);
      let strongest: SceneGroupKey = "horizon";
      let secondStrongest: SceneGroupKey = "signals";
      let strongestWeight = -1;
      let secondWeight = -1;

      for (const key of GROUP_KEYS) {
        const weight = clamp01(weights[key]);
        if (weight > strongestWeight) {
          secondStrongest = strongest;
          secondWeight = strongestWeight;
          strongest = key;
          strongestWeight = weight;
        } else if (weight > secondWeight) {
          secondStrongest = key;
          secondWeight = weight;
        }
      }

      for (const key of GROUP_KEYS) {
        const runtime = runtimes[key];
        const weight = clamp01(weights[key]);
        const opacity = clamp01(weight * 1.55);
        const motionActive =
          motion > 0 &&
          weight >= 0.1 &&
          (key === strongest || key === secondStrongest);
        const pulse = motionActive
          ? Math.sin(elapsed * runtime.motionSpeed + runtime.motionPhase) *
            runtime.motionAmplitude *
            motion
          : 0;

        runtime.group.visible = weight > 0.012;
        runtime.group.userData.motionActive = motionActive;
        runtime.group.position.set(
          runtime.baseX,
          runtime.baseY + pulse,
          runtime.baseZ,
        );
        runtime.group.rotation.set(
          runtime.baseRotationX,
          runtime.baseRotationY + pulse * 0.08,
          runtime.baseRotationZ + pulse * 0.12,
        );
        runtime.group.scale.setScalar(0.94 + weight * 0.06);

        for (const state of runtime.materials) {
          state.material.opacity = state.baseOpacity * opacity;
        }
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;

      for (const geometry of geometries) {
        geometry.dispose();
      }
      for (const material of materials) {
        material.dispose();
      }
    },
  };
}
