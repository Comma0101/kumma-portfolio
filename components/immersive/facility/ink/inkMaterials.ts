import * as THREE from "three";
import { INK } from "./inkLadder";
import { getPaperGrainTexture } from "./paperGrain";
import {
  CUN_FIELD_GLSL,
  CUN_PRESETS,
  type CunPreset,
} from "./strokeFields";

export interface CreateInkMaterialParams {
  readonly inkColor: string;
  readonly valueBias?: number;
  readonly cun?: CunPreset | null;
  readonly cunStrength?: number;
  readonly strataStrength?: number;
  readonly strataFreq?: number;
  /** Multiplies scene fog for this material — hero forms stay dark while distance pales. */
  readonly fogScale?: number;
  readonly fogColor: THREE.Color;
  readonly fogDensity: number;
  readonly opacity?: number;
}

const VERTEX_SHADER = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying float vDistance;
varying float vLocalY;
void main(){
  vec3 transformed = position;
  vec3 objectNormal = normal;
  #ifdef USE_INSTANCING
    transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
    objectNormal = mat3(instanceMatrix) * objectNormal;
  #endif
  vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
  vWorldPos = worldPos.xyz;
  vNormalW = normalize(mat3(modelMatrix) * objectNormal);
  vLocalY = position.y;
  vec4 viewPos = viewMatrix * worldPos;
  vDistance = max(0.0, -viewPos.z);
  gl_Position = projectionMatrix * viewPos;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uValueBias;
uniform float uCunScale;
uniform float uCunDirectionality;
uniform float uCunThreshold;
uniform float uCunStretch;
uniform float uCunStrength;
uniform float uStrataStrength;
uniform float uStrataFreq;
uniform sampler2D uGrain;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uOpacity;
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying float vDistance;
varying float vLocalY;
${CUN_FIELD_GLSL}
void main(){
  vec3 n = normalize(vNormalW);
  float slope = clamp(1.0 - n.y, 0.0, 1.0);
  float aspect = atan(n.x, n.z);
  vec2 p = vWorldPos.xz + vec2(vWorldPos.y * 0.41, vWorldPos.y * 0.23);
  float cun = uCunStrength * cunDeposit(p, slope, aspect, uCunScale, uCunDirectionality, uCunThreshold, uCunStretch);
  float foot = smoothstep(0.35, 0.0, vLocalY) * 0.12;
  float crest = smoothstep(0.72, 1.0, vLocalY) * 0.14;
  // Horizontal strata: ledge lines of darker ink, strongest on steep faces (Fan Kuan cliffs).
  float ledgePhase = fract(vWorldPos.y * uStrataFreq);
  float strata = (1.0 - smoothstep(0.0, 0.22, ledgePhase)) * uStrataStrength * (0.35 + slope * 0.65);
  float deposit = clamp(uValueBias + slope * 0.38 + cun * 0.5 + foot + crest + strata, 0.0, 1.0);
  float band = deposit * 4.0;
  float banded = (floor(band) + smoothstep(0.3, 0.7, fract(band))) / 4.0;
  vec3 color = mix(uPaper, uInk, banded);
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float rim = 1.0 - abs(dot(n, viewDir));
  color = mix(color, uInk, smoothstep(0.66, 0.95, rim) * 0.5);
  float grain = texture2D(uGrain, vWorldPos.xz * 0.045 + vec2(vWorldPos.y * 0.021)).r;
  color *= 0.97 + grain * 0.06;
  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vDistance * vDistance);
  color = mix(color, uFogColor, clamp(fogFactor, 0.0, 1.0));
  gl_FragColor = vec4(color, uOpacity);
}
`;

export function createInkMaterial(
  params: CreateInkMaterialParams,
): THREE.ShaderMaterial {
  const preset = params.cun ? CUN_PRESETS[params.cun] : null;
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uPaper: { value: new THREE.Color(INK.paper) },
      uInk: { value: new THREE.Color(params.inkColor) },
      uValueBias: { value: params.valueBias ?? 0.14 },
      uCunScale: { value: preset?.scale ?? 1 },
      uCunDirectionality: { value: preset?.directionality ?? 0 },
      uCunThreshold: { value: preset?.threshold ?? 0.5 },
      uCunStretch: { value: preset?.stretch ?? 1 },
      uCunStrength: { value: params.cunStrength ?? 0 },
      uStrataStrength: { value: params.strataStrength ?? 0 },
      uStrataFreq: { value: params.strataFreq ?? 0.5 },
      uGrain: { value: getPaperGrainTexture() },
      uFogColor: { value: params.fogColor },
      uFogDensity: { value: params.fogDensity * (params.fogScale ?? 1) },
      uOpacity: { value: params.opacity ?? 1 },
    },
    side: THREE.DoubleSide,
    transparent: false,
    depthWrite: true,
    lights: false,
  });
  material.userData.shanshuiInk = true;
  material.userData.fogScale = params.fogScale ?? 1;
  return material;
}

export function isInkMaterial(material: THREE.Material): boolean {
  return material.userData.shanshuiInk === true;
}

export function syncInkMaterialAtmosphere(
  material: THREE.ShaderMaterial,
  fogColor: THREE.Color,
  fogDensity: number,
): void {
  material.uniforms.uFogColor.value.copy(fogColor);
  material.uniforms.uFogDensity.value =
    fogDensity * (material.userData.fogScale ?? 1);
}
