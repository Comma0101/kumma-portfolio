"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  useImmersiveScroll,
  type ImmersiveScrollSnapshot,
} from "./immersive/useImmersiveScroll";
import { getThreeSceneTuning } from "./threeSceneTuning";

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
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

const VERT = (oct: number) => /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying float vH;
  varying vec3 vN;
  varying float vFog;
  ${SNOISE}
  float fbm(vec2 p){
    float s = 0.0, a = 0.5;
    for (int o = 0; o < ${oct}; o++){ s += a * snoise(p); p *= 2.0; a *= 0.5; }
    return s;
  }
  const float FREQ = 0.0019;
  const float AMP = 80.0;
  const float E = 11.0;
  const float FOG_NEAR = 280.0;
  const float FOG_FAR = 1600.0;
  float terrain(vec2 p){ return fbm(p * FREQ + vec2(0.0, uTime * 0.04)); }
  void main(){
    vec2 p = position.xy;
    float h = terrain(p);
    float hx = terrain(p + vec2(E, 0.0));
    float hz = terrain(p + vec2(0.0, E));
    vH = h;
    vec3 disp = vec3(p.x, h * AMP, p.y);
    vN = normalize(vec3((h - hx) * AMP, E, (h - hz) * AMP));
    vec4 mv = modelViewMatrix * vec4(disp, 1.0);
    vFog = clamp((-mv.z - FOG_NEAR) / (FOG_FAR - FOG_NEAR), 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying float vH;
  varying vec3 vN;
  varying float vFog;
  void main(){
    float t = smoothstep(-0.2, 0.65, vH);
    vec3 valley = vec3(0.050, 0.062, 0.058);
    vec3 peak = vec3(0.32, 0.40, 0.36);
    vec3 base = mix(valley, peak, t);
    vec3 L = normalize(vec3(-0.45, 0.82, 0.28));
    float diff = clamp(dot(normalize(vN), L), 0.0, 1.0);
    vec3 shaded = base * (0.40 + 0.70 * diff);
    vec3 mist = vec3(0.075, 0.090, 0.085);
    vec3 col = mix(shaded, mist, vFog);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const immersiveScrollSnapshotRef =
    useRef<ImmersiveScrollSnapshot | null>(null);
  const sceneWakeRef = useRef<(() => void) | null>(null);
  const storeImmersiveSnapshot = useCallback(
    (snapshot: ImmersiveScrollSnapshot) => {
      immersiveScrollSnapshotRef.current = snapshot;
      sceneWakeRef.current?.();
    },
    [],
  );
  useImmersiveScroll(storeImmersiveSnapshot);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const initialTuning = getThreeSceneTuning({
      deviceMemory: nav.deviceMemory,
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      isCoarsePointer,
      reducedMotion,
      viewportWidth: window.innerWidth,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      4000,
    );
    const camBase = new THREE.Vector3(0, 95, 360);
    camera.position.copy(camBase);
    const lookTarget = new THREE.Vector3(0, 20, -600);
    camera.lookAt(lookTarget);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: initialTuning.antialias,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("WebGL background unavailable.", error);
      return;
    }

    renderer.setPixelRatio(initialTuning.pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0b0c, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(
      2600,
      2200,
      initialTuning.segmentX,
      initialTuning.segmentZ,
    );
    const uniforms = { uTime: { value: 5.0 } };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT(initialTuning.noiseOctaves),
      fragmentShader: FRAG,
      side: THREE.DoubleSide,
    });
    const terrain = new THREE.Mesh(geometry, material);
    scene.add(terrain);

    let mx = 0;
    let tx = 0;
    let my = 0;
    let ty = 0;
    const onPointer = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointer);
    }

    const start = performance.now();
    let animationFrame = 0;
    const isSceneInJourney = () =>
      immersiveScrollSnapshotRef.current?.inJourney ?? true;
    const isReducedMotion = () => {
      const profile = immersiveScrollSnapshotRef.current?.profile;
      return profile ? profile === "reduced" : reducedMotion;
    };

    const renderFrame = () => {
      uniforms.uTime.value = (performance.now() - start) / 1000;
      tx += (mx - tx) * 0.04;
      ty += (my - ty) * 0.04;
      camera.position.x = camBase.x + tx * 46;
      camera.position.y = camBase.y + -ty * 18;
      camera.lookAt(lookTarget);
      renderer.render(scene, camera);
    };

    const stopLoop = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const loop = () => {
      animationFrame = 0;
      if (document.hidden || !isSceneInJourney() || isReducedMotion()) return;
      renderFrame();
      animationFrame = window.requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (
        isReducedMotion() ||
        animationFrame ||
        document.hidden ||
        !isSceneInJourney()
      ) {
        return;
      }
      animationFrame = window.requestAnimationFrame(loop);
    };

    const wakeScene = () => {
      if (!isSceneInJourney() || document.hidden) {
        stopLoop();
        return;
      }

      if (isReducedMotion()) {
        stopLoop();
        renderFrame();
      } else {
        startLoop();
      }
    };
    sceneWakeRef.current = wakeScene;
    renderFrame();
    startLoop();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const resizeTuning = getThreeSceneTuning({
        deviceMemory: nav.deviceMemory,
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency,
        isCoarsePointer,
        reducedMotion,
        viewportWidth: window.innerWidth,
      });
      renderer.setPixelRatio(resizeTuning.pixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (!document.hidden && isSceneInJourney()) renderFrame();
    };
    window.addEventListener("resize", handleResize);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        wakeScene();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sceneWakeRef.current = null;
      stopLoop();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
