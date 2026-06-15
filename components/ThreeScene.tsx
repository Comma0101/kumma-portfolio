"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

interface LenisInstance {
  scroll: number;
  on: (event: "scroll", callback: (data: { scroll: number }) => void) => void;
  off: (event: "scroll", callback: (data: { scroll: number }) => void) => void;
}

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
  const pathname = usePathname();
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || pathname !== "/") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowPerf =
      window.matchMedia("(pointer: coarse)").matches ||
      (nav.deviceMemory ?? 8) <= 4 ||
      (navigator.hardwareConcurrency ?? 8) <= 4;

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
        antialias: !lowPerf,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("WebGL background unavailable.", error);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPerf ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0b0c, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const segX = lowPerf ? 120 : 200;
    const segZ = lowPerf ? 100 : 160;
    const geometry = new THREE.PlaneGeometry(2600, 2200, segX, segZ);
    const uniforms = { uTime: { value: 5.0 } };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT(lowPerf ? 3 : 4),
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
    window.addEventListener("pointermove", onPointer);

    const start = performance.now();
    let animationFrame = 0;

    const loop = () => {
      if (!document.hidden) {
        uniforms.uTime.value = (performance.now() - start) / 1000;
        tx += (mx - tx) * 0.04;
        ty += (my - ty) * 0.04;
        camera.position.x = camBase.x + tx * 46;
        camera.position.y = camBase.y + -ty * 18;
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
      }
      animationFrame = window.requestAnimationFrame(loop);
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      loop();
    }

    const lenis = (window as Window & { lenis?: LenisInstance }).lenis;
    const handleScroll = ({ scroll }: { scroll: number }) => {
      const progress = Math.min(1, Math.max(0, scroll / window.innerHeight));
      renderer.domElement.style.opacity = String(1 - progress);
    };
    handleScroll({ scroll: lenis?.scroll ?? window.scrollY });
    lenis?.on("scroll", handleScroll);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, lowPerf ? 1 : 1.5),
      );
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (reducedMotion) renderer.render(scene, camera);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointer);
      lenis?.off("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [pathname]);

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
