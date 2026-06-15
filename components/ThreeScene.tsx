"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

interface LenisInstance {
  scroll: number;
  on: (event: "scroll", callback: (data: { scroll: number }) => void) => void;
  off: (event: "scroll", callback: (data: { scroll: number }) => void) => void;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = (layers: number, oct: number) => /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;

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
  float fbm(vec2 p){
    float s = 0.0, a = 0.5;
    for (int o = 0; o < ${oct}; o++){ s += a * snoise(p); p *= 2.0; a *= 0.5; }
    return s;
  }

  void main(){
    vec2 uv = vUv;
    float t = uTime;

    // ink sky: dark ground up top, a faint celadon haze toward the horizon
    vec3 skyTop = vec3(0.035, 0.039, 0.043);
    vec3 skyLow = vec3(0.060, 0.075, 0.070);
    vec3 col = mix(skyLow, skyTop, smoothstep(0.18, 1.0, uv.y));

    vec3 celadon = vec3(0.20, 0.26, 0.23);

    for (int i = 0; i < ${layers}; i++){
      float near = float(i) / float(${layers} - 1);     // 0 far .. 1 near
      float base = mix(0.64, 0.14, near);               // far ranges sit high, near fill the bottom
      float amp  = mix(0.05, 0.27, near);
      float freq = mix(1.2, 2.7, near);
      float drift = 0.008 + 0.022 * near;
      float px = uv.x * uAspect + uMouse.x * (0.03 * (near + 0.3)) + float(i) * 7.1;
      float h = fbm(vec2(px * freq + t * drift, float(i) * 3.3)) * 0.5 + 0.5;
      float ridge = base + amp * h + uMouse.y * 0.02 * near;
      float edge = 0.006 + 0.012 * (1.0 - near);        // distant ridges softer
      float inside = smoothstep(ridge + edge, ridge - edge, uv.y);
      vec3 lc = mix(skyLow, celadon, near);             // atmospheric perspective
      lc *= mix(0.72, 1.12, smoothstep(0.0, ridge, uv.y)); // light catches the crest
      col = mix(col, lc, inside);
    }

    // faint paper grain
    col += snoise(uv * 920.0) * 0.012;
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
    const camera = new THREE.Camera();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("WebGL background unavailable.", error);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPerf ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 8.0 },
      uAspect: { value: window.innerWidth / window.innerHeight },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG(lowPerf ? 5 : 7, lowPerf ? 3 : 4),
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

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
        uniforms.uMouse.value.set(tx, ty);
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
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, lowPerf ? 1 : 1.5),
      );
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uAspect.value = window.innerWidth / window.innerHeight;
      if (reducedMotion) renderer.render(scene, camera);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointer);
      lenis?.off("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
      quad.geometry.dispose();
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
