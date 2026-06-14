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
    const noise2D = createNoise2D();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      68,
      window.innerWidth / window.innerHeight,
      0.1,
      900,
    );
    camera.position.set(0, 46, 145);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !reducedMotion,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("WebGL background unavailable.", error);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0b0b0d, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    scene.fog = new THREE.Fog(0x0b0b0d, 145, 720);

    const columns = 58;
    const rows = 58;
    const geometry = new THREE.PlaneGeometry(
      1050,
      1050,
      columns - 1,
      rows - 1,
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0xc9b8a0,
      wireframe: true,
      transparent: true,
      opacity: 0.075,
    });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -52;
    scene.add(terrain);
    camera.lookAt(terrain.position);

    let flight = 0;
    let frame = 0;
    let animationFrame = 0;

    const updateTerrain = () => {
      flight -= 0.008;
      let yOffset = flight;
      const positions = geometry.attributes.position.array;

      for (let y = 0; y < rows; y += 1) {
        let xOffset = 0;
        for (let x = 0; x < columns; x += 1) {
          positions[(y * columns + x) * 3 + 2] =
            noise2D(xOffset, yOffset) * 5;
          xOffset += 0.11;
        }
        yOffset += 0.11;
      }

      geometry.attributes.position.needsUpdate = true;
    };

    const render = () => {
      if (!document.hidden && frame % 2 === 0) updateTerrain();
      frame += 1;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    updateTerrain();
    renderer.render(scene, camera);
    if (!reducedMotion) render();

    const lenis = (window as Window & { lenis?: LenisInstance }).lenis;
    const handleScroll = ({ scroll }: { scroll: number }) => {
      const progress = Math.min(1, Math.max(0, scroll / window.innerHeight));
      if (!reducedMotion) {
        camera.position.y = 46 - progress * 18;
        camera.position.z = 145 - progress * 57;
      }
      renderer.domElement.style.opacity = String(1 - progress);
    };

    handleScroll({ scroll: lenis?.scroll ?? window.scrollY });
    lenis?.on("scroll", handleScroll);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (reducedMotion) renderer.render(scene, camera);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      lenis?.off("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
      scene.remove(terrain);
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
