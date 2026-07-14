import * as THREE from "three";
import {
  createMountainCluster,
  createRiverRibbon,
  createStoneCluster,
} from "../shanshuiPrimitives";
import type { FacilityNarrativeSample } from "../types";
import {
  clamp01,
  eventProgressFor,
  setZoneBounds,
  type FacilityZoneContext,
} from "./shared";

export type DocumentSegmentPhase =
  | "source"
  | "segment"
  | "queue"
  | "recovery"
  | "output";

export interface DocumentSegmentState {
  readonly index: number;
  readonly lane: 0 | 1 | 2;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rotationY: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly scaleZ: number;
  readonly recovering: boolean;
  readonly phase: DocumentSegmentPhase;
}

export interface DocumentFoundryState {
  readonly segments: readonly DocumentSegmentState[];
  readonly staleLaneProgress: number;
  readonly outputProgress: number;
}

export interface DocumentFacilityZone {
  readonly root: THREE.Group;
  update(sample: FacilityNarrativeSample): void;
}

interface MutableDocumentSegmentState {
  index: number;
  lane: 0 | 1 | 2;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  recovering: boolean;
  phase: DocumentSegmentPhase;
}

function smoothstep(value: number): number {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

function lerp(from: number, to: number, progress: number): number {
  return THREE.MathUtils.lerp(from, to, progress);
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach((child) => deepFreeze(child));
  return Object.freeze(value);
}

function writeDocumentSegmentState(
  progress: number,
  index: number,
  count: number,
  target: MutableDocumentSegmentState,
): MutableDocumentSegmentState {
  const safe = clamp01(progress);
  const safeCount = Math.max(1, Math.floor(count));
  const lane = (index % 3) as 0 | 1 | 2;
  const row = Math.floor(index / 3);
  const sourceX = -4.1 + index * (8.2 / Math.max(1, safeCount - 1));
  const queueX = [-3.2, 0, 3.2][lane];
  const queueZ = -53.5 - row * 1.42;
  const queueY = 3.4 + row * 0.72;
  const segmentation = smoothstep((safe - 0.08) / 0.38);
  const outputProgress = smoothstep((safe - 0.68) / 0.32);
  const staleOut = smoothstep((safe - 0.46) / 0.11);
  const staleReturn = smoothstep((safe - 0.59) / 0.13);
  const staleOffset = lane === 1 ? 1.15 * staleOut * (1 - staleReturn) : 0;
  const recovering = lane === 1 && safe >= 0.46 && safe < 0.72;
  const outputX = -3.85 + index * (7.7 / Math.max(1, safeCount - 1));

  target.index = index;
  target.lane = lane;
  target.x = lerp(
    lerp(sourceX, queueX + staleOffset, segmentation),
    outputX,
    outputProgress,
  );
  target.y = lerp(lerp(4.15, queueY, segmentation), 9.15, outputProgress);
  target.z = lerp(lerp(-49.5, queueZ, segmentation), -68, outputProgress);
  target.rotationY = lerp((lane - 1) * 0.035, 0, outputProgress);
  target.scaleX = lerp(0.58, 0.62, outputProgress);
  target.scaleY = lerp(2.5, 0.42, segmentation);
  target.scaleY = lerp(target.scaleY, 0.18, outputProgress);
  target.scaleZ = lerp(0.16, 0.34, outputProgress);
  target.recovering = recovering;
  target.phase =
    safe <= 0.08
      ? "source"
      : safe < 0.46
        ? "segment"
        : safe < 0.68
          ? recovering
            ? "recovery"
            : "queue"
          : safe >= 1
            ? "output"
            : "segment";
  return target;
}

export function documentStateAt(
  progress: number,
  count = 12,
): DocumentFoundryState {
  const safe = clamp01(progress);
  const safeCount = Math.max(1, Math.floor(count));
  const segments = Array.from({ length: safeCount }, (_, index) => {
    const target = {} as MutableDocumentSegmentState;
    return { ...writeDocumentSegmentState(safe, index, safeCount, target) };
  });
  return deepFreeze({
    segments,
    staleLaneProgress: smoothstep((safe - 0.59) / 0.13),
    outputProgress: smoothstep((safe - 0.68) / 0.32),
  });
}

function createDeckledPaperGeometry(
  context: FacilityZoneContext,
): THREE.BufferGeometry {
  const outline: readonly (readonly [number, number])[] = [
    [-0.5, -0.43],
    [-0.14, -0.47],
    [0.5, -0.42],
    [0.47, 0.03],
    [0.5, 0.46],
    [0.12, 0.43],
    [-0.5, 0.47],
    [-0.47, -0.02],
  ];
  const positions: number[] = [];
  const indices: number[] = [];

  for (const [x, z] of outline) positions.push(x, 0.5, z);
  for (const [x, z] of outline) positions.push(x, -0.5, z);
  const topCenter = positions.length / 3;
  positions.push(0, 0.5, 0);
  const bottomCenter = positions.length / 3;
  positions.push(0, -0.5, 0);

  for (let index = 0; index < outline.length; index += 1) {
    const next = (index + 1) % outline.length;
    const bottom = index + outline.length;
    const bottomNext = next + outline.length;
    indices.push(topCenter, next, index);
    indices.push(bottomCenter, bottom, bottomNext);
    indices.push(index, next, bottom, next, bottomNext, bottom);
  }

  const geometry = context.tracker.track(new THREE.BufferGeometry());
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createHangingScroll(
  context: FacilityZoneContext,
  material: THREE.Material,
): THREE.Mesh<THREE.BufferGeometry, THREE.Material> {
  const segments = 28;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    const centerX =
      -5.65 + Math.sin(progress * Math.PI * 2.15) * 0.12 + progress * 0.08;
    const centerY = THREE.MathUtils.lerp(4.15, 0.35, progress);
    const centerZ =
      THREE.MathUtils.lerp(-54.85, -58.2, progress) +
      Math.sin(progress * Math.PI * 1.6) * 0.2;
    const width =
      THREE.MathUtils.lerp(1.02, 0.72, progress) *
      (1 + Math.sin(progress * Math.PI * 7) * 0.018);
    const deckle = Math.sin(progress * Math.PI * 11) * 0.018;

    positions.push(
      centerX - width * 0.5,
      centerY + deckle,
      centerZ,
      centerX + width * 0.5,
      centerY - deckle,
      centerZ,
    );
    uvs.push(0, progress, 1, progress);

    if (index < segments) {
      const offset = index * 2;
      indices.push(
        offset,
        offset + 2,
        offset + 1,
        offset + 1,
        offset + 2,
        offset + 3,
      );
    }
  }

  const geometry = context.tracker.track(new THREE.BufferGeometry());
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  const scroll = new THREE.Mesh(geometry, material);
  scroll.name = "shanshui-audiobook-source-scroll";
  scroll.userData.signature = true;
  scroll.renderOrder = 1;
  return scroll;
}

function createPaperChannels(
  context: FacilityZoneContext,
  material: THREE.Material,
): THREE.Mesh<THREE.BufferGeometry, THREE.Material> {
  const lanes = [-7.3, -5.7, -4.1];
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  lanes.forEach((laneX) => {
    const points = [
      { x: -5.7, y: 0.11, z: -58, width: 0.62 },
      { x: laneX, y: 0.08, z: -60, width: 0.78 },
      { x: laneX, y: 0.06, z: -62.5, width: 0.7 },
      {
        x: THREE.MathUtils.lerp(laneX, -5.7, 0.52),
        y: 0.04,
        z: -64.5,
        width: 0.64,
      },
    ];
    const vertexOffset = positions.length / 3;

    points.forEach((point, index) => {
      const previous = points[Math.max(0, index - 1)];
      const next = points[Math.min(points.length - 1, index + 1)];
      const tangentX = next.x - previous.x;
      const tangentZ = next.z - previous.z;
      const tangentLength = Math.max(
        Number.EPSILON,
        Math.hypot(tangentX, tangentZ),
      );
      const halfWidth = point.width * 0.5;
      const normalX = (-tangentZ / tangentLength) * halfWidth;
      const normalZ = (tangentX / tangentLength) * halfWidth;
      positions.push(
        point.x + normalX,
        point.y,
        point.z + normalZ,
        point.x - normalX,
        point.y,
        point.z - normalZ,
      );
      uvs.push(0, index / (points.length - 1), 1, index / (points.length - 1));
      if (index < points.length - 1) {
        const offset = vertexOffset + index * 2;
        indices.push(
          offset,
          offset + 2,
          offset + 1,
          offset + 1,
          offset + 2,
          offset + 3,
        );
      }
    });
  });

  const geometry = context.tracker.track(new THREE.BufferGeometry());
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const channels = new THREE.Mesh(geometry, material);
  channels.name = "shanshui-audiobook-three-paper-channels";
  channels.userData.signature = true;
  channels.renderOrder = 1;
  return channels;
}

export function createDocumentFacilityZone(
  context: FacilityZoneContext,
): DocumentFacilityZone {
  const simplified = context.tuning.profile !== "desktop";
  const root = setZoneBounds(new THREE.Group(), -72, -43);
  root.name = "shanshui-audiobook-paper-terraces-zone";

  root.add(
    createMountainCluster(
      context,
      "shanshui-audiobook-ink-banks",
      "tall",
      [
        { position: [-19.8, -1.4, -49], scale: [5.2, 10.2, 5.5], rotationY: 0.28 },
        { position: [20.4, -1.38, -52], scale: [5.4, 11.1, 5.7], rotationY: -0.34 },
        { position: [-21.2, -1.42, -66], scale: [5.8, 11.8, 6], rotationY: -0.42 },
        { position: [21.4, -1.4, -69], scale: [5.9, 12.4, 6.1], rotationY: 0.38 },
      ],
    ),
    createMountainCluster(
      context,
      "shanshui-audiobook-paper-ridges",
      "broad",
      [
        { position: [-14.8, -1.2, -55], scale: [4.4, 4.8, 4.6], rotationY: 0.52 },
        { position: [15.2, -1.2, -58], scale: [4.6, 5.1, 4.8], rotationY: -0.46 },
        { position: [-15.8, -1.18, -69], scale: [4.8, 4.5, 5], rotationY: -0.3 },
        { position: [15.6, -1.18, -71], scale: [4.6, 4.8, 4.9], rotationY: 0.36 },
      ],
      context.materials.shell,
    ),
    createRiverRibbon(context, "shanshui-audiobook-scroll-river", [
      { x: 0, y: -0.56, z: -43, width: 2.15 },
      { x: -0.7, y: -0.56, z: -48.5, width: 1.75 },
      { x: 0.55, y: -0.55, z: -54, width: 1.6 },
      { x: -0.35, y: -0.54, z: -60, width: 1.85 },
      { x: 0, y: -0.53, z: -67.5, width: 2.5 },
    ]),
  );

  if (!simplified) {
    root.add(
      createStoneCluster(
        context,
        "shanshui-audiobook-river-stones",
        [
          { position: [-3.9, -0.72, -49], scale: [1.2, 0.82, 1.45], rotationY: 0.36 },
          { position: [4.2, -0.74, -53], scale: [1.35, 0.9, 1.2], rotationY: -0.48 },
          { position: [-4.4, -0.72, -61], scale: [1.45, 1.05, 1.6], rotationY: 0.62 },
          { position: [4, -0.73, -65], scale: [1.15, 0.78, 1.38], rotationY: -0.28 },
        ],
      ),
    );
  }

  const deckledPaper = createDeckledPaperGeometry(context);
  const terraceCount = Math.max(
    4,
    Math.min(8, Math.floor(context.tuning.facilityBudgets.slabs * 0.32)),
  );
  const terraces = new THREE.InstancedMesh(
    deckledPaper,
    context.materials.shell,
    terraceCount,
  );
  terraces.name = "shanshui-audiobook-layered-paper-terraces";
  terraces.userData.signature = true;
  terraces.visible = false;
  const terraceTransform = new THREE.Object3D();
  for (let index = 0; index < terraceCount; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const tier = Math.floor(index / 2);
    terraceTransform.position.set(
      side * (7.2 + Math.sin(tier * 1.37) * 0.38),
      -0.42 + tier * 0.16,
      -49.5 - tier * 4.2,
    );
    terraceTransform.rotation.set(
      0,
      side * (0.045 + (tier % 3) * 0.018),
      side * 0.012,
    );
    terraceTransform.scale.set(
      3.2 - tier * 0.08,
      0.06,
      1.7 + (tier % 2) * 0.16,
    );
    terraceTransform.updateMatrix();
    terraces.setMatrixAt(index, terraceTransform.matrix);
  }
  terraces.instanceMatrix.needsUpdate = true;
  root.add(terraces);

  const paperStreamMaterial = context.tracker.track(
    new THREE.MeshBasicMaterial({
      color: 0xd9cfb4,
      depthWrite: false,
      opacity: 0.38,
      side: THREE.DoubleSide,
      transparent: true,
    }),
  );
  const sourceScroll = createHangingScroll(context, paperStreamMaterial);
  const sourceSpindle = new THREE.Mesh(context.unitBox, context.materials.ink);
  sourceSpindle.name = "shanshui-audiobook-source-spindle";
  sourceSpindle.position.set(-5.65, 4.18, -54.84);
  sourceSpindle.scale.set(0.6, 0.028, 0.028);
  sourceSpindle.visible =
    context.tuning.profile !== "mobile" && context.tuning.profile !== "reduced";
  const paperChannels = createPaperChannels(context, paperStreamMaterial);
  const alignedCurrent = createRiverRibbon(
    context,
    "shanshui-audiobook-continuous-pale-current",
    [
      { x: -6.4, y: 0.04, z: -64.3, width: 0.78 },
      { x: -5.7, y: 0.02, z: -66, width: 1.5 },
      { x: -5.45, y: -0.02, z: -69, width: 1.8 },
      { x: -5.7, y: -0.08, z: -72, width: 1.65 },
    ],
    paperStreamMaterial,
  );
  root.add(sourceScroll, sourceSpindle, paperChannels, alignedCurrent);

  const segmentCount = Math.max(
    6,
    Math.min(10, Math.floor(context.tuning.facilityBudgets.slabs * 0.5)),
  );
  const sheets = new THREE.InstancedMesh(
    deckledPaper,
    context.materials.paper,
    segmentCount,
  );
  sheets.name = "shanshui-audiobook-deckled-sheets";
  sheets.userData.signature = true;
  sheets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const recoverySeal = new THREE.Mesh(
    context.unitBox,
    context.materials.cinnabar,
  );
  recoverySeal.name = "shanshui-audiobook-recovery-seal";
  recoverySeal.userData.signature = true;
  recoverySeal.scale.set(0.28, 0.045, 0.28);
  recoverySeal.visible = false;
  root.add(sheets, recoverySeal);

  const transform = new THREE.Object3D();
  const runtimeStates = Array.from({ length: segmentCount }, (_, index) => ({
    index,
    lane: (index % 3) as 0 | 1 | 2,
    x: 0,
    y: 0,
    z: 0,
    rotationY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    recovering: false,
    phase: "source" as DocumentSegmentPhase,
  }));
  const recoveryIndex = Math.min(
    segmentCount - 1,
    1 + 3 * Math.floor(segmentCount / 6),
  );

  const update = (sample: FacilityNarrativeSample) => {
    const progress = eventProgressFor(sample, "segment-document");
    const segmentation = smoothstep((progress - 0.08) / 0.38);
    const outputProgress = smoothstep((progress - 0.68) / 0.32);
    for (let index = 0; index < segmentCount; index += 1) {
      const state = writeDocumentSegmentState(
        progress,
        index,
        segmentCount,
        runtimeStates[index],
      );
      const sourceFraction = index / Math.max(1, segmentCount - 1);
      const sourceX = -5.7 + Math.sin(sourceFraction * Math.PI * 2) * 0.2;
      const sourceY = 5.35 - sourceFraction * 4.85;
      const sourceZ = -53.4 - sourceFraction * 5;
      const queueX = [-7.3, -5.7, -4.1][state.lane];
      const queueZ = -59.2 - Math.floor(index / 3) * 1.45;
      const outputX = -7 + sourceFraction * 2.6;
      transform.position.set(
        lerp(lerp(sourceX, queueX, segmentation), outputX, outputProgress),
        lerp(lerp(sourceY, 0.2, segmentation), 0.12, outputProgress),
        lerp(lerp(sourceZ, queueZ, segmentation), -67.2, outputProgress),
      );
      transform.rotation.set(0, state.rotationY, 0);
      transform.scale.set(state.scaleX * 0.92, 0.055, 0.72);
      transform.updateMatrix();
      sheets.setMatrixAt(index, transform.matrix);
    }
    sheets.instanceMatrix.needsUpdate = true;
    const recoveryState = runtimeStates[recoveryIndex];
    recoverySeal.position.set(
      recoveryState.x,
      -0.26,
      recoveryState.z,
    );
    recoverySeal.rotation.y = recoveryState.rotationY;
    recoverySeal.visible = recoveryState.recovering;
    const recoveryEmphasis = Math.sin(
      smoothstep((progress - 0.46) / 0.26) * Math.PI,
    );
    recoverySeal.scale.set(
      0.28 + recoveryEmphasis * 0.12,
      0.045,
      0.28 + recoveryEmphasis * 0.12,
    );
    paperStreamMaterial.opacity =
      0.38 + progress * 0.12 + outputProgress * 0.06;
    root.userData.eventProgress = progress;
    root.userData.outputProgress = outputProgress;
  };

  return { root, update };
}
