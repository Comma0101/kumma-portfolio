import * as THREE from "three";
import type { ThreeSceneTuning } from "../../threeSceneTuning";
import { withTrackedResources } from "./resourceTracker";

const SNOISE = /* glsl */ `
  vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

const vertexShader = (octaves: number) => /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uElevation;
  uniform float uRoughness;
  uniform float uCarveStrength;
  varying float vHeight;
  varying vec3 vNormal;
  varying float vDistance;
  varying float vRiver;
  varying vec2 vTerrainPoint;
  ${SNOISE}
  float fbm(vec2 p){
    float sum = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < ${octaves}; octave++){
      sum += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return sum;
  }
  float riverChannel(vec2 point){
    float worldDepth = point.y - 54.0;
    float routeCenter = sin((worldDepth + 48.0) * 0.035) * 1.45;
    return 1.0 - smoothstep(1.3, 5.8, abs(point.x - routeCenter));
  }
  float mountainPassMask(vec2 point){
    float worldDepth = point.y - 54.0;
    float enter = smoothstep(-34.0, -13.0, worldDepth);
    float exit = 1.0 - smoothstep(-3.0, 11.0, worldDepth);
    return enter * exit;
  }
  float terrain(vec2 point){
    float frequency = mix(0.022, 0.058, uRoughness);
    float drift = uTime * 0.0015 * (1.0 - uCarveStrength);
    float geology = fbm(point * frequency + vec2(0.0, drift));
    float river = riverChannel(point);
    float pass = mountainPassMask(point) * river;
    float carved = mix(geology, -0.1, river * 0.62);
    return mix(carved, -0.34, pass * 0.74) * uCarveStrength +
      geology * (1.0 - uCarveStrength);
  }
  void main(){
    const float epsilon = 0.28;
    vec2 point = position.xy;
    float amplitude = mix(1.2, 5.4, uElevation);
    float height = terrain(point);
    float heightX = terrain(point + vec2(epsilon, 0.0));
    float heightZ = terrain(point + vec2(0.0, epsilon));
    vec3 displaced = vec3(point.x, height * amplitude - 0.8, point.y);
    vHeight = height;
    vRiver = riverChannel(point) * uCarveStrength;
    vTerrainPoint = point;
    vNormal = normalize(vec3(
      (height - heightX) * amplitude,
      epsilon,
      (height - heightZ) * amplitude
    ));
    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    vDistance = max(0.0, -viewPosition.z);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uVisibility;
  varying float vHeight;
  varying vec3 vNormal;
  varying float vDistance;
  varying float vRiver;
  varying vec2 vTerrainPoint;

  float paperGrain(vec2 point){
    vec2 cell = floor(point * 5.7);
    return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main(){
    float terrainMix = smoothstep(-0.34, 0.62, vHeight);
    vec3 ink = vec3(0.035, 0.047, 0.043);
    vec3 mineralStone = vec3(0.31, 0.36, 0.32);
    vec3 water = vec3(0.20, 0.34, 0.34);
    vec3 base = mix(ink, mineralStone, terrainMix);
    base = mix(base, water, vRiver * 0.58);
    vec3 lightDirection = normalize(vec3(-0.42, 0.84, 0.25));
    float diffuse = clamp(dot(normalize(vNormal), lightDirection), 0.0, 1.0);
    float inkValue = smoothstep(0.0, 1.0, 0.16 + diffuse * 0.84);
    float heightBand = abs(fract((vHeight + 0.42) * 5.5) - 0.5);
    float washEdge = smoothstep(0.38, 0.49, heightBand);
    float grain = paperGrain(vTerrainPoint);
    vec3 shaded = base * (0.4 + inkValue * 0.76);
    shaded *= mix(0.955, 1.0, washEdge);
    shaded *= 0.975 + grain * 0.035;
    float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vDistance * vDistance);
    vec3 color = mix(shaded, uFogColor, clamp(fogFactor, 0.0, 1.0));
    gl_FragColor = vec4(color, uVisibility * 0.94);
  }
`;

export interface FacilityTerrainUniforms {
  readonly [uniform: string]: THREE.IUniform;
  readonly uTime: THREE.IUniform<number>;
  readonly uElevation: THREE.IUniform<number>;
  readonly uRoughness: THREE.IUniform<number>;
  readonly uVisibility: THREE.IUniform<number>;
  readonly uFogColor: THREE.IUniform<THREE.Color>;
  readonly uFogDensity: THREE.IUniform<number>;
  readonly uCarveStrength: THREE.IUniform<number>;
}

export interface FacilityTerrainUniformInput {
  readonly elevation: number;
  readonly roughness: number;
  readonly visibility: number;
  readonly fogColor: THREE.Color;
  readonly fogDensity: number;
  readonly carveStrength?: number;
}

export interface FacilityTerrainResources {
  readonly geometry: THREE.PlaneGeometry;
  readonly material: THREE.ShaderMaterial;
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  dispose(): void;
}

export function createFacilityTerrainUniforms(
  input: FacilityTerrainUniformInput,
): FacilityTerrainUniforms {
  return {
    uTime: { value: 5 },
    uElevation: { value: input.elevation },
    uRoughness: { value: input.roughness },
    uVisibility: { value: input.visibility },
    uFogColor: { value: input.fogColor },
    uFogDensity: { value: input.fogDensity },
    uCarveStrength: { value: input.carveStrength ?? 1 },
  };
}

export function createFacilityTerrain(
  tuning: ThreeSceneTuning,
  uniforms: FacilityTerrainUniforms,
): FacilityTerrainResources {
  return withTrackedResources((tracker) => {
    const geometry = tracker.track(
      new THREE.PlaneGeometry(118, 200, tuning.segmentX, tuning.segmentZ),
    );
    const material = tracker.track(
      new THREE.ShaderMaterial({
        depthWrite: true,
        fragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
        uniforms,
        vertexShader: vertexShader(tuning.noiseOctaves),
      }),
    );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "shanshui-ink-terrain";
    mesh.position.z = -54;
    mesh.renderOrder = -2;

    return {
      geometry,
      material,
      mesh,
      dispose() {
        mesh.removeFromParent();
        tracker.dispose();
      },
    };
  });
}
