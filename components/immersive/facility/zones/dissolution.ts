import * as THREE from "three";
import { sampleLivingWorldMotion } from "../shanshuiJourney";
import {
  createFishSchool,
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

export interface InkSurfacePoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface DissolutionState {
  readonly apertureProgress: number;
  readonly points: readonly InkSurfacePoint[];
}

export interface DissolutionFacilityZone {
  readonly root: THREE.Group;
  update(
    sample: FacilityNarrativeSample,
    elapsedSeconds?: number,
    motionEnergy?: number,
  ): void;
  deactivate(): void;
}

const SURFACE_ORIGIN = Object.freeze({ x: 6, y: 6.2, z: -109 });

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach((child) => deepFreeze(child));
  return Object.freeze(value);
}

function finiteSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.floor(seed) | 0 : 0;
}

function hash01(seed: number, index: number, salt: number): number {
  let value =
    (finiteSeed(seed) ^ Math.imul(index + 1, 0x9e3779b1) ^ salt) >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 0x1_0000_0000;
}

export function inkDepthAt(x: number, y: number, seed: number): number {
  const phase = ((Math.abs(finiteSeed(seed)) % 997) / 997) * Math.PI * 2;
  const foldedWash = Math.sin(x * 0.62 + phase) * Math.cos(y * 0.52 - phase * 0.4);
  const liftedRidge = Math.exp(
    -((x + 1.45) * (x + 1.45) * 0.07 + (y - 0.45) * (y - 0.45) * 0.13),
  );
  const carvedPool = Math.exp(
    -((x - 2.35) * (x - 2.35) * 0.3 + (y + 1.05) * (y + 1.05) * 0.22),
  );
  return (
    foldedWash * 1.18 +
    liftedRidge * 1.72 -
    carvedPool * 1.12 +
    x * 0.045 +
    y * 0.035
  );
}

export function sampleInkSurface(
  seed: number,
  budget: number,
): readonly InkSurfacePoint[] {
  if (!Number.isFinite(budget) || budget <= 0) return Object.freeze([]);
  const count = Math.max(0, Math.min(480, Math.floor(budget)));
  if (count === 0) return Object.freeze([]);
  const columns = Math.max(1, Math.ceil(Math.sqrt((count * 13) / 8)));
  const rows = Math.max(1, Math.ceil(count / columns));
  const points = Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const jitterX = (hash01(seed, index, 0x68bc21eb) - 0.5) * 0.34;
    const jitterY = (hash01(seed, index, 0x02e5be93) - 0.5) * 0.34;
    const x = ((column + 0.5 + jitterX) / columns - 0.5) * 13;
    const y = ((row + 0.5 + jitterY) / rows - 0.5) * 8;
    return Object.freeze({ x, y, z: inkDepthAt(x, y, seed) });
  });
  return Object.freeze(points);
}

function smoothstep(value: number): number {
  const safe = clamp01(value);
  return safe * safe * (3 - 2 * safe);
}

export function dissolutionStateAt(
  progress: number,
  surface: readonly InkSurfacePoint[],
): DissolutionState {
  const apertureProgress = smoothstep(progress);
  const points = surface.map((point) =>
    Object.freeze({
      x: point.x,
      y: point.y,
      z: point.z * apertureProgress,
    }),
  );
  return deepFreeze({ apertureProgress, points });
}

function writeDissolutionPositions(
  progress: number,
  surface: readonly InkSurfacePoint[],
  positions: Float32Array,
): number {
  const apertureProgress = smoothstep(progress);
  for (let index = 0; index < surface.length; index += 1) {
    const point = surface[index];
    const offset = index * 3;
    positions[offset] = point.x;
    positions[offset + 1] = point.y;
    positions[offset + 2] = point.z * apertureProgress;
  }
  return apertureProgress;
}

function writeSurfaceDepth(
  geometry: THREE.PlaneGeometry,
  progress: number,
  seed: number,
): void {
  const apertureProgress = smoothstep(progress);
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let index = 0; index < positions.count; index += 1) {
    positions.setZ(
      index,
      inkDepthAt(positions.getX(index), positions.getY(index), seed) *
        apertureProgress,
    );
  }
  positions.needsUpdate = true;
}

export function createDissolutionFacilityZone(
  context: FacilityZoneContext,
): DissolutionFacilityZone {
  const root = setZoneBounds(new THREE.Group(), -127, -101);
  root.name = "shanshui-splash-inkfall-zone";

  const surfaceSegmentsX = Math.max(
    12,
    Math.min(
      28,
      Math.round(Math.sqrt(context.tuning.facilityBudgets.depthSamples) * 1.55),
    ),
  );
  const surfaceSegmentsY = Math.max(8, Math.round(surfaceSegmentsX * 0.62));
  const sourceGeometry = context.tracker.track(
    new THREE.PlaneGeometry(13.7, 8.7, surfaceSegmentsX, surfaceSegmentsY),
  );
  (sourceGeometry.getAttribute("position") as THREE.BufferAttribute).setUsage(
    THREE.DynamicDrawUsage,
  );
  const sourceMaterial = context.tracker.track(
    new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.44 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float edge = smoothstep(0.0, 0.1, vUv.x) *
            smoothstep(0.0, 0.1, vUv.y) *
            smoothstep(0.0, 0.1, 1.0 - vUv.x) *
            smoothstep(0.0, 0.1, 1.0 - vUv.y);
          vec2 cell = floor(vUv * vec2(17.0, 11.0));
          float grain = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
          float wash = 0.78 + sin(vUv.x * 9.0 + vUv.y * 5.0) * 0.08;
          vec3 ink = mix(vec3(0.075, 0.055, 0.066), vec3(0.17, 0.11, 0.14), grain * 0.28);
          gl_FragColor = vec4(ink, edge * wash * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const sourcePlane = new THREE.Mesh(sourceGeometry, sourceMaterial);
  sourcePlane.name = "shanshui-splash-flat-ink-plane";
  sourcePlane.position.set(
    SURFACE_ORIGIN.x,
    SURFACE_ORIGIN.y,
    SURFACE_ORIGIN.z + 0.14,
  );
  sourcePlane.userData.signature = true;

  const basinGeometry = context.tracker.track(new THREE.CircleGeometry(7.2, 48));
  const basin = new THREE.Mesh(basinGeometry, context.materials.water);
  basin.name = "shanshui-splash-ink-basin";
  basin.position.set(4.2, -0.5, -117);
  basin.rotation.x = -Math.PI * 0.5;
  basin.scale.set(1.35, 1, 1);
  basin.userData.signature = true;

  root.add(
    createMountainCluster(context, "shanshui-splash-inkfall-peaks", "tall", [
      { position: [-19.4, -1.45, -109], scale: [5.1, 13.4, 5.4], rotationY: 0.32 },
      { position: [22.7, -1.42, -112], scale: [5.4, 14.2, 5.7], rotationY: -0.38 },
      { position: [-21.8, -1.38, -121], scale: [5.8, 10.8, 6.1], rotationY: -0.5 },
      { position: [23.8, -1.38, -124], scale: [5.9, 11.4, 6.2], rotationY: 0.56 },
    ]),
    createMountainCluster(
      context,
      "shanshui-splash-basin-ridges",
      "broad",
      [
        { position: [-16.5, -1.3, -116], scale: [6.2, 5.2, 6.6], rotationY: 0.44 },
        { position: [18.5, -1.3, -119], scale: [6.5, 5.5, 6.7], rotationY: -0.42 },
      ],
      context.materials.shell,
    ),
    createStoneCluster(context, "shanshui-splash-water-stones", [
      { position: [-1.8, -0.72, -114], scale: [1.5, 1.15, 1.7], rotationY: 0.36 },
      { position: [9.8, -0.72, -119], scale: [1.8, 1.25, 1.6], rotationY: -0.48 },
      { position: [0.4, -0.7, -123], scale: [1.1, 0.75, 1.35], rotationY: 0.72 },
    ]),
    createRiverRibbon(context, "shanshui-splash-arrival-current", [
      { x: -5.5, y: -0.53, z: -101.5, width: 1.7 },
      { x: -1, y: -0.52, z: -106, width: 1.9 },
      { x: 3.4, y: -0.51, z: -111, width: 2.2 },
      { x: 4.2, y: -0.5, z: -116, width: 3.1 },
    ]),
    basin,
    sourcePlane,
  );

  const pointCount = Math.max(
    48,
    Math.min(320, context.tuning.facilityBudgets.depthSamples),
  );
  const surface = sampleInkSurface(1979, pointCount);
  const positionValues = new Float32Array(pointCount * 3);
  writeDissolutionPositions(0, surface, positionValues);
  const pointGeometry = context.tracker.track(new THREE.BufferGeometry());
  const positionAttribute = new THREE.BufferAttribute(positionValues, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  pointGeometry.setAttribute("position", positionAttribute);
  const pointMaterial = context.tracker.track(
    new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.2 },
        uPixelRatio: { value: context.tuning.pixelRatio },
        uPointSize: {
          value: context.tuning.profile === "desktop" ? 0.62 : 0.7,
        },
      },
      vertexShader: `
        uniform float uPixelRatio;
        uniform float uPointSize;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = max(1.5, uPointSize * uPixelRatio * (120.0 / max(1.0, -viewPosition.z)));
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        void main() {
          vec2 centered = gl_PointCoord - vec2(0.5);
          float radius = dot(centered, centered);
          if (radius > 0.25) discard;
          float edge = 1.0 - smoothstep(0.12, 0.25, radius);
          gl_FragColor = vec4(vec3(0.52, 0.60, 0.52), edge * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
    }),
  );
  const points = new THREE.Points(pointGeometry, pointMaterial);
  points.name = "shanshui-splash-spatial-ink-surface";
  points.position.set(SURFACE_ORIGIN.x, SURFACE_ORIGIN.y, SURFACE_ORIGIN.z);
  points.userData.signature = true;

  const depthProbe = new THREE.Mesh(
    context.signalSphere,
    context.materials.cinnabar,
  );
  depthProbe.name = "shanshui-splash-depth-seal";
  depthProbe.scale.setScalar(0.46);
  depthProbe.userData.signature = true;
  root.add(points, depthProbe);

  const fish = createFishSchool(context, "shanshui-splash-fish-shadows", {
    count: context.tuning.profile === "desktop" ? 9 : 5,
    center: [4.2, -0.42, -117],
    width: 9.8,
    depth: 10.5,
    seed: 1979,
  });
  root.add(fish.mesh);

  const observatoryLight = new THREE.PointLight(0x9db6a5, 3.2, 25, 2);
  observatoryLight.name = "shanshui-splash-inkfall-light";
  observatoryLight.position.set(1.5, 11, -101.5);
  root.add(observatoryLight);

  const probePoint = surface[Math.floor(surface.length * 0.72)];
  const update = (
    sample: FacilityNarrativeSample,
    elapsedSeconds = 0,
    motionEnergy = 0,
  ) => {
    const progress = eventProgressFor(sample, "reconstruct-depth");
    const apertureProgress = writeDissolutionPositions(
      progress,
      surface,
      positionValues,
    );
    writeSurfaceDepth(sourceGeometry, progress, 1979);
    positionAttribute.needsUpdate = true;
    sourceMaterial.uniforms.uOpacity.value = 0.44 - apertureProgress * 0.2;
    pointMaterial.uniforms.uOpacity.value = 0.2 + apertureProgress * 0.7;
    const living = sampleLivingWorldMotion(
      sample.journeyProgress,
      elapsedSeconds,
      motionEnergy,
      context.tuning.profile,
    );
    fish.mesh.visible = living.fishReveal > 0.015;
    fish.update(
      living.fishReveal,
      sample.journeyProgress * Math.PI * 2 + elapsedSeconds * motionEnergy * 0.16,
    );
    depthProbe.position.set(
      SURFACE_ORIGIN.x + probePoint.x,
      SURFACE_ORIGIN.y + probePoint.y,
      SURFACE_ORIGIN.z + probePoint.z * apertureProgress,
    );
    depthProbe.visible = progress > 0.16;
    root.userData.eventProgress = progress;
  };

  return {
    root,
    update,
    deactivate() {
      if (!fish.mesh.visible) return;
      fish.update(0, 0);
      fish.mesh.visible = false;
    },
  };
}
