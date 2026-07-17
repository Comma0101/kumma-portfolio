import * as THREE from "three";
import type { ResourceTracker } from "./resourceTracker";
import type { FacilityZoneContext } from "./zones/shared";

export interface ShanshuiGeometryKit {
  readonly mountainTall: THREE.BufferGeometry;
  readonly mountainBroad: THREE.BufferGeometry;
  readonly stone: THREE.BufferGeometry;
  readonly bambooStalk: THREE.CylinderGeometry;
  readonly bambooLeaf: THREE.BufferGeometry;
  readonly ripple: THREE.RingGeometry;
  readonly fish: THREE.BufferGeometry;
}

export interface MountainPlacement {
  readonly position: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly rotationY?: number;
}

export interface RiverRibbonPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly width: number;
}

export interface BambooGroveOptions {
  readonly count: number;
  readonly leavesPerStalk: number;
  readonly xMin: number;
  readonly xMax: number;
  readonly zStart: number;
  readonly zEnd: number;
  readonly baseY?: number;
  readonly seed?: number;
}

export interface BambooGrove {
  readonly root: THREE.Group;
  readonly stalks: THREE.InstancedMesh;
  readonly leaves: THREE.InstancedMesh;
  update(sway: number): void;
}

export interface MistPass {
  readonly root: THREE.Group;
  update(
    journeyProgress: number,
    elapsedSeconds: number,
    motionEnergy: number,
    thresholdIntensity: number,
  ): void;
}

export interface BoatPose {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
  readonly wake: number;
  readonly moored: boolean;
}

export interface TravelerBoat {
  readonly root: THREE.Group;
  update(pose: BoatPose): void;
}

export interface FishSchoolOptions {
  readonly count: number;
  readonly center: readonly [number, number, number];
  readonly width: number;
  readonly depth: number;
  readonly seed?: number;
}

export interface FishSchool {
  readonly mesh: THREE.InstancedMesh;
  update(reveal: number, swimPhase: number): void;
}

function finiteSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.floor(seed) | 0 : 0;
}

function hash01(seed: number, index: number, salt = 0): number {
  let value =
    (finiteSeed(seed) ^ Math.imul(index + 1, 0x9e3779b1) ^ salt) >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 0x1_0000_0000;
}

export interface RidgeGeometryOptions {
  readonly seed: number;
  readonly width?: number;
  readonly depth?: number;
  readonly crestSegments?: number;
  readonly rows?: number;
}

function ridgeNoise1(seed: number, x: number, salt: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const t = f * f * (3 - 2 * f);
  const a = hash01(seed, i, salt);
  const b = hash01(seed, i + 1, salt);
  return a + (b - a) * t;
}

/**
 * Silhouette-first ridge: an authored jagged crest line with two facet sheets
 * falling to the base. Flat facets + sharp crest replace smooth noise domes.
 * Normalized: y 0..1, x ±width/2, z ±depth/2; crest ends collapse to height 0.
 */
export function createRidgeGeometry(
  options: RidgeGeometryOptions,
): THREE.BufferGeometry {
  const width = options.width ?? 2;
  const depth = options.depth ?? 1.2;
  const crestSegments = options.crestSegments ?? 26;
  const rows = options.rows ?? 8;
  const seed = options.seed;

  const crest: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i <= crestSegments; i += 1) {
    const u = i / crestSegments;
    const envelope = Math.pow(Math.sin(Math.PI * u), 0.7);
    const ridged =
      (1 - Math.abs(2 * ridgeNoise1(seed, u * 3.1, 0x1107) - 1)) * 0.55 +
      (1 - Math.abs(2 * ridgeNoise1(seed, u * 7.3, 0x5a39) - 1)) * 0.3 +
      (1 - Math.abs(2 * ridgeNoise1(seed, u * 14.9, 0x9c41) - 1)) * 0.15;
    crest.push({
      x: (u - 0.5) * width,
      y: envelope * (0.55 + 0.45 * ridged),
      z: (hash01(seed, i, 0x77b1) - 0.5) * 0.08 * depth,
    });
  }

  const positions: number[] = [];
  const indices: number[] = [];
  for (const side of [1, -1]) {
    const sheetStart = positions.length / 3;
    for (let row = 0; row <= rows; row += 1) {
      const t = row / rows;
      for (let i = 0; i <= crestSegments; i += 1) {
        const point = crest[i];
        positions.push(
          point.x * (1 + t * 0.35),
          point.y * (1 - t),
          point.z + side * t * depth * 0.5,
        );
      }
    }
    for (let row = 0; row < rows; row += 1) {
      for (let i = 0; i < crestSegments; i += 1) {
        const a = sheetStart + row * (crestSegments + 1) + i;
        const b = a + 1;
        const c = a + crestSegments + 1;
        const d = c + 1;
        if (side > 0) {
          indices.push(a, c, b, b, c, d);
        } else {
          indices.push(a, b, c, b, d, c);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createRidgeLayer(
  context: FacilityZoneContext,
  name: string,
  options: RidgeGeometryOptions,
  material: THREE.Material,
): THREE.Mesh<THREE.BufferGeometry, THREE.Material> {
  const geometry = context.tracker.track(createRidgeGeometry(options));
  const ridge = new THREE.Mesh(geometry, material);
  ridge.name = name;
  ridge.userData.signature = true;
  return ridge;
}

function createFishGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        0, 0, -0.58,
        0.28, 0, -0.04,
        0, 0, 0.42,
        -0.28, 0, -0.04,
        0, 0, 0.42,
        0.25, 0, 0.72,
        -0.25, 0, 0.72,
      ],
      3,
    ),
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6]);
  geometry.computeVertexNormals();
  return geometry;
}

function createBambooLeafGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.56, 0, 0,
        -0.08, 0.115, 0.018,
        0.56, 0, 0,
        -0.08, -0.115, -0.018,
      ],
      3,
    ),
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createShanshuiGeometryKit(
  tracker: ResourceTracker,
): ShanshuiGeometryKit {
  const stone = new THREE.IcosahedronGeometry(1, 1);
  stone.scale(1, 0.78, 0.92);
  stone.translate(0, 0.78, 0);

  return Object.freeze({
    mountainTall: tracker.track(
      createRidgeGeometry({ seed: 1979, crestSegments: 26, rows: 8 }),
    ),
    mountainBroad: tracker.track(
      createRidgeGeometry({ seed: 2018, width: 2.6, depth: 1.5, crestSegments: 22, rows: 6 }),
    ),
    stone: tracker.track(stone),
    bambooStalk: tracker.track(new THREE.CylinderGeometry(0.045, 0.06, 1, 7, 1)),
    bambooLeaf: tracker.track(createBambooLeafGeometry()),
    ripple: tracker.track(new THREE.RingGeometry(0.72, 1, 32)),
    fish: tracker.track(createFishGeometry()),
  });
}

export function createMountainCluster(
  context: FacilityZoneContext,
  name: string,
  shape: "tall" | "broad",
  placements: readonly MountainPlacement[],
  material: THREE.Material = context.materials.mountain,
): THREE.InstancedMesh {
  const geometry =
    shape === "tall"
      ? context.shanshuiGeometry.mountainTall
      : context.shanshuiGeometry.mountainBroad;
  const mountains = new THREE.InstancedMesh(
    geometry,
    material,
    placements.length,
  );
  const transform = new THREE.Object3D();

  placements.forEach((placement, index) => {
    transform.position.set(...placement.position);
    transform.scale.set(...placement.scale);
    transform.rotation.set(0, placement.rotationY ?? 0, 0);
    transform.updateMatrix();
    mountains.setMatrixAt(index, transform.matrix);
  });

  mountains.name = name;
  mountains.userData.signature = true;
  mountains.instanceMatrix.needsUpdate = true;
  return mountains;
}

export function createStoneCluster(
  context: FacilityZoneContext,
  name: string,
  placements: readonly MountainPlacement[],
  material: THREE.Material = context.materials.stone,
): THREE.InstancedMesh {
  const stones = new THREE.InstancedMesh(
    context.shanshuiGeometry.stone,
    material,
    placements.length,
  );
  const transform = new THREE.Object3D();
  placements.forEach((placement, index) => {
    transform.position.set(...placement.position);
    transform.scale.set(...placement.scale);
    transform.rotation.set(0, placement.rotationY ?? 0, 0);
    transform.updateMatrix();
    stones.setMatrixAt(index, transform.matrix);
  });
  stones.name = name;
  stones.userData.signature = true;
  stones.instanceMatrix.needsUpdate = true;
  return stones;
}

export function createRiverRibbon(
  context: FacilityZoneContext,
  name: string,
  points: readonly RiverRibbonPoint[],
  material: THREE.Material = context.materials.water,
): THREE.Mesh<THREE.BufferGeometry, THREE.Material> {
  if (points.length < 2) {
    throw new Error("A river ribbon needs at least two authored points.");
  }

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let travelled = 0;
  const distances = points.map((point, index) => {
    if (index > 0) {
      travelled += Math.hypot(
        point.x - points[index - 1].x,
        point.z - points[index - 1].z,
      );
    }
    return travelled;
  });
  const totalDistance = Math.max(Number.EPSILON, travelled);

  points.forEach((point, index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const tangentX = next.x - previous.x;
    const tangentZ = next.z - previous.z;
    const tangentLength = Math.max(Number.EPSILON, Math.hypot(tangentX, tangentZ));
    const normalX = -tangentZ / tangentLength;
    const normalZ = tangentX / tangentLength;
    const halfWidth = point.width * 0.5;
    positions.push(
      point.x + normalX * halfWidth,
      point.y,
      point.z + normalZ * halfWidth,
      point.x - normalX * halfWidth,
      point.y,
      point.z - normalZ * halfWidth,
    );
    const v = distances[index] / totalDistance;
    uvs.push(0, v, 1, v);
    if (index < points.length - 1) {
      const offset = index * 2;
      indices.push(offset, offset + 2, offset + 1, offset + 1, offset + 2, offset + 3);
    }
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

  const river = new THREE.Mesh(geometry, material);
  river.name = name;
  river.userData.signature = true;
  river.renderOrder = -1;
  return river;
}

interface BambooDefinition {
  readonly x: number;
  readonly z: number;
  readonly height: number;
  readonly leanX: number;
  readonly leanZ: number;
  readonly phase: number;
}

export function createBambooGrove(
  context: FacilityZoneContext,
  name: string,
  options: BambooGroveOptions,
): BambooGrove {
  const count = Math.max(1, Math.floor(options.count));
  const leavesPerStalk = Math.max(1, Math.floor(options.leavesPerStalk));
  const seed = options.seed ?? 1979;
  const baseY = options.baseY ?? -0.72;
  const definitions: BambooDefinition[] = Array.from(
    { length: count },
    (_, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const xMagnitude = THREE.MathUtils.lerp(
        options.xMin,
        options.xMax,
        hash01(seed, index, 0xa201),
      );
      const z = THREE.MathUtils.lerp(
        options.zStart,
        options.zEnd,
        hash01(seed, index, 0x51d7),
      );
      return {
        x: side * xMagnitude,
        z,
        height: THREE.MathUtils.lerp(3.8, 7.2, hash01(seed, index, 0x3f21)),
        leanX: (hash01(seed, index, 0x7189) - 0.5) * 0.055,
        leanZ: (hash01(seed, index, 0x98af) - 0.5) * 0.075,
        phase: hash01(seed, index, 0xf331) * Math.PI * 2,
      };
    },
  );

  const root = new THREE.Group();
  root.name = name;
  const stalks = new THREE.InstancedMesh(
    context.shanshuiGeometry.bambooStalk,
    context.materials.bamboo,
    count,
  );
  stalks.name = `${name}-stalks`;
  stalks.userData.signature = true;
  stalks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const leaves = new THREE.InstancedMesh(
    context.shanshuiGeometry.bambooLeaf,
    context.materials.bamboo,
    count * leavesPerStalk,
  );
  leaves.name = `${name}-leaves`;
  leaves.userData.signature = true;
  leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  root.add(stalks, leaves);

  const transform = new THREE.Object3D();
  const update = (rawSway: number) => {
    const sway = Number.isFinite(rawSway)
      ? THREE.MathUtils.clamp(rawSway, -1, 1) * 0.12
      : 0;
    let leafIndex = 0;
    definitions.forEach((definition, index) => {
      const movement = Math.sin(definition.phase + sway * 9) * sway;
      transform.position.set(
        definition.x,
        baseY + definition.height * 0.5,
        definition.z,
      );
      transform.scale.set(1, definition.height, 1);
      transform.rotation.set(
        definition.leanX + movement * 0.28,
        definition.phase * 0.12,
        definition.leanZ + movement,
      );
      transform.updateMatrix();
      stalks.setMatrixAt(index, transform.matrix);

      for (let leaf = 0; leaf < leavesPerStalk; leaf += 1) {
        const fraction = 0.55 + (leaf / Math.max(1, leavesPerStalk - 1)) * 0.35;
        const side = leaf % 2 === 0 ? -1 : 1;
        const leafPhase = definition.phase + leaf * 1.73;
        transform.position.set(
          definition.x + side * (0.18 + leaf * 0.035) + movement * fraction,
          baseY + definition.height * fraction,
          definition.z + Math.cos(leafPhase) * 0.15,
        );
        transform.scale.set(0.75 + fraction * 0.32, 0.72, 1);
        transform.rotation.set(
          -0.12 + Math.sin(leafPhase) * 0.18,
          leafPhase,
          side * (0.42 + movement * 0.5),
        );
        transform.updateMatrix();
        leaves.setMatrixAt(leafIndex, transform.matrix);
        leafIndex += 1;
      }
    });
    stalks.instanceMatrix.needsUpdate = true;
    leaves.instanceMatrix.needsUpdate = true;
  };

  update(0);
  return { root, stalks, leaves, update };
}

export function createMistPass(
  context: FacilityZoneContext,
  name: string,
  zPositions: readonly number[],
): MistPass {
  const root = new THREE.Group();
  root.name = name;
  const geometry = context.tracker.track(new THREE.PlaneGeometry(1, 1));
  const material = context.tracker.track(
    new THREE.ShaderMaterial({
      uniforms: {
        uDrift: { value: 0 },
        uOpacity: { value: 0.14 },
        uColor: { value: new THREE.Color(0x9eaa9c) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float uDrift;
        uniform float uOpacity;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main(){
          vec2 centered = vUv - vec2(0.5);
          float feather = 1.0 - smoothstep(0.18, 0.54, length(centered));
          float wash = sin((vUv.x * 4.2 + uDrift) * 3.14159265) * 0.5 + 0.5;
          wash *= sin((vUv.y * 2.3 - uDrift * 0.37) * 3.14159265) * 0.18 + 0.82;
          float alpha = feather * mix(0.42, 1.0, wash) * uOpacity;
          if (alpha < 0.006) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );

  zPositions.forEach((z, index) => {
    const veil = new THREE.Mesh(geometry, material);
    veil.name = `${name}-veil-${index + 1}`;
    veil.position.set(index % 2 === 0 ? -0.8 : 0.9, 2.4 + index * 0.22, z);
    veil.scale.set(15 + index * 2.2, 5.6 + index * 0.8, 1);
    veil.rotation.z = index % 2 === 0 ? -0.035 : 0.045;
    if (index === 0) veil.userData.signature = true;
    root.add(veil);
  });

  return {
    root,
    update(journeyProgress, elapsedSeconds, motionEnergy, thresholdIntensity) {
      const progress = Number.isFinite(journeyProgress)
        ? THREE.MathUtils.clamp(journeyProgress, 0, 1)
        : 0;
      const energy = Number.isFinite(motionEnergy)
        ? THREE.MathUtils.clamp(motionEnergy, 0, 1)
        : 0;
      const elapsed = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
      const intensity = Number.isFinite(thresholdIntensity)
        ? THREE.MathUtils.clamp(thresholdIntensity, 0, 1)
        : 0;
      material.uniforms.uDrift.value = progress * 3.4 + elapsed * energy * 0.075;
      material.uniforms.uOpacity.value = 0.105 + intensity * 0.095;
    },
  };
}

function createBoatHullGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array([
    -0.62, 0.02, 0.72,
    0.62, 0.02, 0.72,
    -0.76, 0.02, -0.28,
    0.76, 0.02, -0.28,
    0, 0.02, -1.18,
    -0.4, -0.28, 0.55,
    0.4, -0.28, 0.55,
    -0.46, -0.25, -0.25,
    0.46, -0.25, -0.25,
    0, -0.2, -0.94,
  ]);
  const indices = [
    0, 2, 5, 5, 2, 7,
    1, 6, 3, 6, 8, 3,
    2, 4, 7, 7, 4, 9,
    3, 8, 4, 8, 9, 4,
    0, 5, 1, 1, 5, 6,
    5, 7, 6, 6, 7, 8,
    7, 9, 8,
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createBoatCanopyGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const columns = 4;
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = THREE.MathUtils.lerp(-0.68, 0.68, column / (columns - 1));
      const z = row === 0 ? -0.42 : 0.42;
      const arch = (1 - Math.abs(x) / 0.68) * 0.16;
      positions.push(x, 0.86 + arch, z);
    }
  }
  for (let column = 0; column < columns - 1; column += 1) {
    indices.push(column, columns + column, column + 1);
    indices.push(column + 1, columns + column, columns + column + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createTravelerBoat(
  context: FacilityZoneContext,
  name = "shanshui-traveler-boat",
): TravelerBoat {
  const root = new THREE.Group();
  root.name = name;
  const hull = new THREE.Mesh(
    context.tracker.track(createBoatHullGeometry()),
    context.materials.ink,
  );
  hull.name = `${name}-hull`;
  hull.userData.signature = true;
  const canopy = new THREE.Mesh(
    context.tracker.track(createBoatCanopyGeometry()),
    context.materials.paper,
  );
  canopy.name = `${name}-canopy`;

  const leftPost = new THREE.Mesh(context.unitBox, context.materials.ink);
  leftPost.name = `${name}-post-left`;
  leftPost.position.set(-0.48, 0.48, 0.25);
  leftPost.scale.set(0.035, 0.92, 0.035);
  const rightPost = leftPost.clone();
  rightPost.name = `${name}-post-right`;
  rightPost.position.x = 0.48;
  const seal = new THREE.Mesh(context.unitBox, context.materials.cinnabar);
  seal.name = `${name}-cinnabar-seal`;
  seal.position.set(-0.5, 0.74, 0.36);
  seal.scale.set(0.12, 0.12, 0.025);

  const ferrymanBody = new THREE.Mesh(context.unitBox, context.materials.ink);
  ferrymanBody.name = `${name}-ferryman-body`;
  ferrymanBody.position.set(0.27, 0.3, 0.58);
  ferrymanBody.scale.set(0.12, 0.42, 0.12);
  const ferrymanHead = new THREE.Mesh(
    context.signalSphere,
    context.materials.ink,
  );
  ferrymanHead.name = `${name}-ferryman-head`;
  ferrymanHead.position.set(0.27, 0.6, 0.58);
  ferrymanHead.scale.setScalar(0.46);
  const pole = new THREE.Mesh(context.unitBox, context.materials.bamboo);
  pole.name = `${name}-ferryman-pole`;
  pole.position.set(0.48, 0.58, 0.08);
  pole.scale.set(0.024, 1.45, 0.024);
  pole.rotation.set(0.12, 0, -0.22);

  const wakeMaterial = context.tracker.track(
    new THREE.MeshBasicMaterial({
      color: 0xaab8a8,
      opacity: 0.16,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const wake = new THREE.Mesh(context.shanshuiGeometry.ripple, wakeMaterial);
  wake.name = `${name}-wake`;
  wake.position.set(0, -0.18, 0.78);
  wake.rotation.x = -Math.PI * 0.5;
  root.add(
    hull,
    canopy,
    leftPost,
    rightPost,
    seal,
    ferrymanBody,
    ferrymanHead,
    pole,
    wake,
  );
  root.scale.setScalar(0.62);

  return {
    root,
    update(pose) {
      root.position.set(pose.x, pose.y, pose.z);
      root.rotation.y = pose.heading;
      const wakeScale = 0.52 + THREE.MathUtils.clamp(pose.wake, 0, 1) * 0.88;
      wake.scale.set(wakeScale * 0.72, wakeScale * 1.34, 1);
      wakeMaterial.opacity = pose.moored ? 0.045 : 0.07 + pose.wake * 0.12;
      wake.visible = wakeMaterial.opacity > 0.01;
    },
  };
}

interface FishDefinition {
  readonly x: number;
  readonly z: number;
  readonly scale: number;
  readonly heading: number;
  readonly phase: number;
}

export function createFishSchool(
  context: FacilityZoneContext,
  name: string,
  options: FishSchoolOptions,
): FishSchool {
  const count = Math.max(1, Math.floor(options.count));
  const seed = options.seed ?? 1187;
  const material = context.tracker.track(context.materials.ink.clone());
  material.side = THREE.DoubleSide;
  const mesh = new THREE.InstancedMesh(
    context.shanshuiGeometry.fish,
    material,
    count,
  );
  mesh.name = name;
  mesh.userData.signature = true;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const definitions: FishDefinition[] = Array.from(
    { length: count },
    (_, index) => ({
      x:
        options.center[0] +
        (hash01(seed, index, 0x8c31) - 0.5) * options.width,
      z:
        options.center[2] +
        (hash01(seed, index, 0x31a7) - 0.5) * options.depth,
      scale: THREE.MathUtils.lerp(0.52, 1.05, hash01(seed, index, 0x6ef1)),
      heading: hash01(seed, index, 0x98b1) * Math.PI * 2,
      phase: hash01(seed, index, 0xda73) * Math.PI * 2,
    }),
  );
  const transform = new THREE.Object3D();

  const update = (rawReveal: number, rawSwimPhase: number) => {
    const reveal = Number.isFinite(rawReveal)
      ? THREE.MathUtils.clamp(rawReveal, 0, 1)
      : 0;
    const swimPhase = Number.isFinite(rawSwimPhase) ? rawSwimPhase : 0;
    mesh.visible = reveal > 0.015;
    definitions.forEach((definition, index) => {
      const swim = Math.sin(definition.phase + swimPhase) * 0.22 * reveal;
      transform.position.set(
        definition.x + Math.cos(definition.heading) * swim,
        options.center[1] - 0.035 - (index % 3) * 0.018,
        definition.z + Math.sin(definition.heading) * swim,
      );
      transform.rotation.set(0, definition.heading + swim * 0.18, 0);
      const scale = definition.scale * reveal;
      transform.scale.set(scale, scale, scale);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  update(0, 0);
  return { mesh, update };
}
