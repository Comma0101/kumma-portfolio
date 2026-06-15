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

    const ROWS = lowPerf ? 24 : 38;
    const COLS = lowPerf ? 50 : 92;
    const SPREAD = 1000;
    const Z_NEAR = 60;
    const Z_FAR = -660;
    const AMP = 15;

    const noise2D = createNoise2D();
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0b, 130, 640);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1400,
    );
    camera.position.set(0, 38, 150);
    camera.lookAt(0, -4, -200);

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
    renderer.setClearColor(0x0a0a0b, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    // topographic line field: one contour line per row, receding into fog
    const group = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xa3b5a8,
      transparent: true,
      opacity: 0.5,
    });
    const rowZ: number[] = [];
    const lines: { geo: THREE.BufferGeometry; pos: Float32Array }[] = [];
    for (let r = 0; r < ROWS; r += 1) {
      const z = Z_NEAR + (Z_FAR - Z_NEAR) * (r / (ROWS - 1));
      rowZ.push(z);
      const pos = new Float32Array(COLS * 3);
      for (let c = 0; c < COLS; c += 1) {
        pos[c * 3] = (c / (COLS - 1) - 0.5) * SPREAD;
        pos[c * 3 + 1] = 0;
        pos[c * 3 + 2] = z;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      group.add(new THREE.Line(geo, lineMat));
      lines.push({ geo, pos });
    }
    scene.add(group);

    // single muted-red signal that traces across the field occasionally
    const signalMat = new THREE.MeshBasicMaterial({
      color: 0x3f9d7f,
      transparent: true,
    });
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x3f9d7f,
      transparent: true,
      opacity: 0.22,
    });
    const signal = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 12), signalMat);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(6, 12, 12), haloMat);
    signal.visible = false;
    halo.visible = false;
    scene.add(signal);
    scene.add(halo);
    const SIGNAL_ROW = Math.min(4, ROWS - 1);

    const updateField = (flight: number, resolve: number) => {
      for (let r = 0; r < ROWS; r += 1) {
        const { geo, pos } = lines[r];
        const nz = r * 0.16 + flight;
        for (let c = 0; c < COLS; c += 1) {
          pos[c * 3 + 1] = noise2D(c * 0.08, nz) * AMP * resolve;
        }
        geo.attributes.position.needsUpdate = true;
      }
    };

    const placeSignal = (sec: number, flight: number, resolve: number) => {
      const cycle = 15;
      const phase = sec % cycle;
      if (phase > 5) {
        signal.visible = false;
        halo.visible = false;
        return;
      }
      const p = phase / 5;
      const x = (p - 0.5) * SPREAD * 0.92;
      const colCoord = p * (COLS - 1) * 0.08;
      const y = noise2D(colCoord, SIGNAL_ROW * 0.16 + flight) * AMP * resolve + 2;
      const z = rowZ[SIGNAL_ROW];
      const fade = Math.sin(p * Math.PI);
      signal.position.set(x, y, z);
      halo.position.set(x, y, z);
      signalMat.opacity = fade;
      haloMat.opacity = 0.22 * fade;
      signal.visible = true;
      halo.visible = true;
    };

    const start = performance.now();
    let frame = 0;
    let animationFrame = 0;

    const renderStatic = () => {
      updateField(0, 0.6);
      renderer.render(scene, camera);
    };

    const loop = () => {
      if (!document.hidden) {
        const sec = (performance.now() - start) / 1000;
        const flight = sec * 0.16;
        const resolve = 0.62 + 0.38 * Math.sin(sec * 0.13);
        if (frame % 2 === 0) updateField(flight, resolve);
        placeSignal(sec, flight, resolve);
        renderer.render(scene, camera);
      }
      frame += 1;
      animationFrame = window.requestAnimationFrame(loop);
    };

    if (reducedMotion) renderStatic();
    else loop();

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
      if (reducedMotion) renderStatic();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      lenis?.off("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
      lines.forEach((l) => l.geo.dispose());
      lineMat.dispose();
      signal.geometry.dispose();
      signalMat.dispose();
      halo.geometry.dispose();
      haloMat.dispose();
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
