"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

const MorphingLogo = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const getProfile = () => {
      const width = window.innerWidth;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        return {
          particleCount: 3600,
          textSize: 2.05,
          pointSize: 0.024,
          radiusMin: 1.6,
          radiusMax: 3.4,
          ySpread: 2.8,
          depthSpread: 2.4,
          pixelRatioCap: 1.2,
        };
      }

      if (width < 540) {
        return {
          particleCount: 5400,
          textSize: 1.95,
          pointSize: 0.022,
          radiusMin: 1.45,
          radiusMax: 3.1,
          ySpread: 2.4,
          depthSpread: 2.1,
          pixelRatioCap: 1.25,
        };
      }

      if (width < 900) {
        return {
          particleCount: 8800,
          textSize: 2.15,
          pointSize: 0.024,
          radiusMin: 1.8,
          radiusMax: 3.6,
          ySpread: 3.0,
          depthSpread: 2.5,
          pixelRatioCap: 1.5,
        };
      }

      return {
        particleCount: 14000,
        textSize: 2.4,
        pointSize: 0.028,
        radiusMin: 2.2,
        radiusMax: 5.1,
        ySpread: 3.8,
        depthSpread: 3.2,
        pixelRatioCap: 1.85,
      };
    };

    const mount = mountRef.current;
    if (!mount) return;
    const profile = getProfile();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const fontLoader = new FontLoader();
    let particleGeometry: THREE.BufferGeometry | null = null;
    let particleMaterial: THREE.PointsMaterial | null = null;
    let particles: THREE.Points | null = null;
    let hasMorphCompleted = false;
    let disposed = false;

    const particleCount = profile.particleCount;
    const startPositions = new Float32Array(particleCount * 3);
    const currentPositions = new Float32Array(particleCount * 3);
    const endPositions = new Float32Array(particleCount * 3);
    const morphState = { progress: 0 };

    const updateParticles = (progress: number) => {
      if (!particleGeometry) return;
      const positionAttribute = particleGeometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        currentPositions[i3] =
          startPositions[i3] + (endPositions[i3] - startPositions[i3]) * progress;
        currentPositions[i3 + 1] =
          startPositions[i3 + 1] +
          (endPositions[i3 + 1] - startPositions[i3 + 1]) * progress;
        currentPositions[i3 + 2] =
          startPositions[i3 + 2] +
          (endPositions[i3 + 2] - startPositions[i3 + 2]) * progress;
      }

      positionAttribute.needsUpdate = true;
    };

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius =
        profile.radiusMin + Math.random() * (profile.radiusMax - profile.radiusMin);
      const ySpread = (Math.random() - 0.5) * profile.ySpread;

      startPositions[i3] = Math.cos(angle) * radius;
      startPositions[i3 + 1] = ySpread;
      startPositions[i3 + 2] = (Math.random() - 0.5) * profile.depthSpread;

      currentPositions[i3] = startPositions[i3];
      currentPositions[i3 + 1] = startPositions[i3 + 1];
      currentPositions[i3 + 2] = startPositions[i3 + 2];
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const resizeProfile = getProfile();
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, resizeProfile.pixelRatioCap)
      );
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (particleMaterial) {
        particleMaterial.size = resizeProfile.pointSize;
        particleMaterial.needsUpdate = true;
      }
    };

    window.addEventListener("resize", handleResize);

    fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font: Font) => {
      if (disposed) return;
      const shapes = font.generateShapes("KUMMA", profile.textSize);
      const shapeGeometry = new THREE.ShapeGeometry(shapes);
      shapeGeometry.center();
      const textMaterial = new THREE.MeshBasicMaterial();
      const textMesh = new THREE.Mesh(shapeGeometry, textMaterial);

      const sampler = new MeshSurfaceSampler(textMesh).build();
      const tempPosition = new THREE.Vector3();

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        sampler.sample(tempPosition);
        endPositions[i3] = tempPosition.x;
        endPositions[i3 + 1] = tempPosition.y;
        endPositions[i3 + 2] = tempPosition.z;
      }

      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(currentPositions, 3)
      );

      particleMaterial = new THREE.PointsMaterial({
        color: 0xf1e8e2,
        size: profile.pointSize,
        transparent: true,
        opacity: 0.94,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.position.z = -0.35;
      scene.add(particles);

      timelineRef.current = gsap.timeline();
      timelineRef.current
        .to(morphState, {
          progress: 1,
          duration: 2.15,
          ease: "power2.inOut",
          onUpdate: () => updateParticles(morphState.progress),
          onComplete: () => {
            hasMorphCompleted = true;
          },
        })
        .to(
          particleMaterial,
          {
            opacity: 0.72,
            duration: 1.2,
            ease: "sine.inOut",
          },
          2.0
        );

      shapeGeometry.dispose();
      textMaterial.dispose();
    });

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      if (particles) {
        particles.rotation.y = Math.sin(elapsed * 0.35) * 0.08;
        particles.rotation.x = Math.cos(elapsed * 0.28) * 0.04;
        if (hasMorphCompleted) {
          particles.position.y = Math.sin(elapsed * 0.8) * 0.04;
        }
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      timelineRef.current?.kill();
      timelineRef.current = null;

      if (particles) {
        scene.remove(particles);
      }
      particleGeometry?.dispose();
      particleMaterial?.dispose();

      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default MorphingLogo;
