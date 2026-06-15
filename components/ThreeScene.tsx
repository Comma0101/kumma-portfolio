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

    // ridgelines (rows) of an ink-wash mountain range, receding into mist
    const ROWS = lowPerf ? 26 : 40;
    const COLS = lowPerf ? 56 : 104;
    const SPREAD = 1100;
    const Z_NEAR = 80;
    const Z_FAR = -720;
    const AMP = 22;

    const noise2D = createNoise2D();
    const scene = new THREE.Scene();
    const CANVAS = new THREE.Color(0x0a0b0c);
    const CELADON = new THREE.Color(0xa3b5a8);
    scene.fog = new THREE.Fog(0x0a0b0c, 180, 760);

    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      1600,
    );
    const camBase = new THREE.Vector3(0, 30, 165);
    camera.position.copy(camBase);
    const lookTarget = new THREE.Vector3(0, 4, -260);
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

    // Each ridgeline bakes its color: atmospheric depth (far rows dissolve to
    // mist) x brush taper (ends feather out). Heights animate; colors stay.
    const lines: {
      geo: THREE.BufferGeometry;
      pos: Float32Array;
      mat: THREE.LineBasicMaterial;
    }[] = [];
    const tmp = new THREE.Color();
    for (let r = 0; r < ROWS; r += 1) {
      const z = Z_NEAR + (Z_FAR - Z_NEAR) * (r / (ROWS - 1));
      const depthT = r / (ROWS - 1);
      const depthFall = THREE.MathUtils.lerp(1, 0.1, Math.pow(depthT, 0.8));
      const pos = new Float32Array(COLS * 3);
      const col = new Float32Array(COLS * 3);
      for (let c = 0; c < COLS; c += 1) {
        pos[c * 3] = (c / (COLS - 1) - 0.5) * SPREAD;
        pos[c * 3 + 1] = 0;
        pos[c * 3 + 2] = z;
        const edge = Math.pow(Math.sin(Math.PI * (c / (COLS - 1))), 0.55);
        const intensity = depthFall * (0.3 + 0.7 * edge);
        tmp.copy(CANVAS).lerp(CELADON, intensity);
        col[c * 3] = tmp.r;
        col[c * 3 + 1] = tmp.g;
        col[c * 3 + 2] = tmp.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
      });
      scene.add(new THREE.Line(geo, mat));
      lines.push({ geo, pos, mat });
    }

    // the lone jade traveler crossing a near ridge
    const signalMat = new THREE.MeshBasicMaterial({
      color: 0x3f9d7f,
      transparent: true,
    });
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x3f9d7f,
      transparent: true,
      opacity: 0.2,
    });
    const signal = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 12), signalMat);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(6, 12, 12), haloMat);
    signal.visible = false;
    halo.visible = false;
    scene.add(signal);
    scene.add(halo);
    const SIGNAL_ROW = Math.min(5, ROWS - 1);
    const rowZ = (r: number) => Z_NEAR + (Z_FAR - Z_NEAR) * (r / (ROWS - 1));

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    const onPointer = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onPointer);

    const updateField = (flight: number, resolve: number) => {
      for (let r = 0; r < ROWS; r += 1) {
        const { geo, pos } = lines[r];
        const nz = r * 0.17 + flight;
        for (let c = 0; c < COLS; c += 1) {
          pos[c * 3 + 1] = noise2D(c * 0.085, nz) * AMP * resolve;
        }
        geo.attributes.position.needsUpdate = true;
      }
    };

    const placeSignal = (sec: number, flight: number, resolve: number) => {
      const cycle = 18;
      const phase = sec % cycle;
      if (phase > 5.5) {
        signal.visible = false;
        halo.visible = false;
        return;
      }
      const p = phase / 5.5;
      const x = (p - 0.5) * SPREAD * 0.9;
      const colCoord = p * (COLS - 1) * 0.085;
      const y =
        noise2D(colCoord, SIGNAL_ROW * 0.17 + flight) * AMP * resolve + 2.5;
      const z = rowZ(SIGNAL_ROW);
      const fade = Math.sin(p * Math.PI);
      signal.position.set(x, y, z);
      halo.position.set(x, y, z);
      signalMat.opacity = fade;
      haloMat.opacity = 0.2 * fade;
      signal.visible = true;
      halo.visible = true;
    };

    const start = performance.now();
    let frame = 0;
    let animationFrame = 0;

    const renderStatic = () => {
      updateField(0, 0.7);
      renderer.render(scene, camera);
    };

    const loop = () => {
      if (!document.hidden) {
        const sec = (performance.now() - start) / 1000;
        const flight = sec * 0.14;
        const resolve = 0.7 + 0.3 * Math.sin(sec * 0.11);
        if (frame % 2 === 0) updateField(flight, resolve);

        // gentle parallax: pointer drift + slow autonomous sway
        tx += (mx - tx) * 0.04;
        ty += (my - ty) * 0.04;
        const sway = Math.sin(sec * 0.08) * 0.35;
        camera.position.x = camBase.x + (tx + sway) * 24;
        camera.position.y = camBase.y + -ty * 10;
        camera.lookAt(lookTarget);

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
      window.removeEventListener("pointermove", onPointer);
      lenis?.off("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
      lines.forEach((l) => {
        l.geo.dispose();
        l.mat.dispose();
      });
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
