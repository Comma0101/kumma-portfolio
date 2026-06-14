"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import type { Tier } from "./useQualityTier";

function PointField({ tier }: { tier: Exclude<Tier, "off"> }) {
  const cols = tier === "high" ? 66 : 40;
  const noise = useMemo(() => createNoise2D(), []);
  const ref = useRef<THREE.Points>(null);

  const { positions, base } = useMemo(() => {
    const positions = new Float32Array(cols * cols * 3);
    const base = new Float32Array(cols * cols * 2);
    let p = 0;
    let b = 0;
    for (let y = 0; y < cols; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        positions[p++] = (x / cols - 0.5) * 60;
        positions[p++] = 0;
        positions[p++] = (y / cols - 0.5) * 60;
        base[b++] = x * 0.12;
        base[b++] = y * 0.12;
      }
    }
    return { positions, base };
  }, [cols]);

  useFrame(({ clock }) => {
    const pts = ref.current;
    if (!pts) return;
    const t = clock.getElapsedTime() * 0.12;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0, j = 0; i < arr.length; i += 3, j += 2) {
      arr[i + 1] = noise(base[j] + t, base[j + 1]) * 4.5;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={0xc9b8a0}
        size={0.18}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroScene({ tier }: { tier: Tier }) {
  if (tier === "off") return null;
  return (
    <Canvas
      gl={{ antialias: tier === "high", alpha: true, powerPreference: "low-power" }}
      dpr={tier === "high" ? [1, 1.5] : 1}
      camera={{ position: [0, 14, 34], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PointField tier={tier} />
    </Canvas>
  );
}
