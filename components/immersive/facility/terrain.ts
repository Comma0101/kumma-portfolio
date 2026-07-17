import * as THREE from "three";
import type { ThreeSceneTuning } from "../../threeSceneTuning";
import { withTrackedResources } from "./resourceTracker";
import { INK } from "./ink/inkLadder";
import { getPaperGrainTexture } from "./ink/paperGrain";
import { CUN_FIELD_GLSL } from "./ink/strokeFields";

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
  uniform vec3 uPaper;
  uniform vec3 uInkFar;
  uniform vec3 uInkNear;
  uniform sampler2D uGrain;
  varying float vHeight;
  varying vec3 vNormal;
  varying float vDistance;
  varying float vRiver;
  varying vec2 vTerrainPoint;
  ${CUN_FIELD_GLSL}

  void main(){
    vec3 n = normalize(vNormal);
    float slope = clamp(1.0 - n.y, 0.0, 1.0);
    float aspect = atan(n.x, n.z);
    float cun = cunDeposit(vTerrainPoint * 0.5, slope, aspect, 3.1, 1.0, 0.52, 2.6);
    float deposit = clamp(
      slope * 0.5 + cun * 0.42 + smoothstep(0.1, 0.75, vHeight) * 0.22,
      0.0,
      1.0
    );
    float band = deposit * 3.0;
    float banded = (floor(band) + smoothstep(0.3, 0.7, fract(band))) / 3.0;
    vec3 color = mix(uPaper, mix(uInkFar, uInkNear, banded), banded * 0.9);
    // River: unpainted paper with broken bank-edge strokes.
    float bankStroke = smoothstep(0.12, 0.42, vRiver) * (1.0 - smoothstep(0.58, 0.92, vRiver));
    float openWater = smoothstep(0.55, 0.95, vRiver);
    color = mix(color, uInkFar, bankStroke * 0.5);
    color = mix(color, uPaper, openWater * 0.85);
    float grain = texture2D(uGrain, vTerrainPoint * 0.045).r;
    color *= 0.97 + grain * 0.06;
    float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vDistance * vDistance);
    color = mix(color, uFogColor, clamp(fogFactor, 0.0, 1.0));
    // Dissolve into paper before the far clip plane: converge color to paper
    // first, then fade alpha — no visible boundary at any angle.
    color = mix(color, uFogColor, smoothstep(40.0, 64.0, vDistance));
    float farFade = 1.0 - smoothstep(52.0, 76.0, vDistance);
    gl_FragColor = vec4(color, uVisibility * 0.94 * farFade);
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
  readonly uPaper: THREE.IUniform<THREE.Color>;
  readonly uInkFar: THREE.IUniform<THREE.Color>;
  readonly uInkNear: THREE.IUniform<THREE.Color>;
  readonly uGrain: THREE.IUniform<THREE.DataTexture>;
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
    uPaper: { value: new THREE.Color(INK.paper) },
    uInkFar: { value: new THREE.Color(INK.dan) },
    uInkNear: { value: new THREE.Color(INK.zhong) },
    uGrain: { value: getPaperGrainTexture() },
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
