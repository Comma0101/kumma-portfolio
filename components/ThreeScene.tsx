"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

interface LenisInstance {
  scroll: number;
  on: (event: "scroll", callback: (data: { scroll: number }) => void) => void;
  off: (event: "scroll", callback: (data: { scroll: number }) => void) => void;
}

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

    const cols = lowPerf ? 56 : 92;
    const spread = 900;

    const noise2D = createNoise2D();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );
    camera.position.set(0, 42, 165);
    camera.lookAt(0, -12, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !lowPerf && !reducedMotion,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("WebGL background unavailable.", error);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPerf ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0b, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    scene.fog = new THREE.Fog(0x0a0a0b, 220, 900);

    const total = cols * cols;
    const positions = new Float32Array(total * 3);
    const base = new Float32Array(total * 2);
    let p = 0;
    let b = 0;
    for (let y = 0; y < cols; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        positions[p++] = (x / (cols - 1) - 0.5) * spread;
        positions[p++] = 0;
        positions[p++] = (y / (cols - 1) - 0.5) * spread;
        base[b++] = x * 0.14;
        base[b++] = y * 0.14;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xc9b8a0,
      size: lowPerf ? 2.4 : 1.9,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });

    const field = new THREE.Points(geometry, material);
    field.position.y = -20;
    scene.add(field);

    let flight = 0;
    let frame = 0;
    let animationFrame = 0;

    const updateField = () => {
      flight += 0.006;
      const arr = geometry.attributes.position.array as Float32Array;
      for (let i = 0, j = 0; i < arr.length; i += 3, j += 2) {
        arr[i + 1] = noise2D(base[j] + flight, base[j + 1]) * 22;
      }
      geometry.attributes.position.needsUpdate = true;
    };

    const render = () => {
      if (!document.hidden && frame % 2 === 0) updateField();
      frame += 1;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    updateField();
    renderer.render(scene, camera);
    if (!reducedMotion) render();

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
      lenis?.off("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
      scene.remove(field);
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
