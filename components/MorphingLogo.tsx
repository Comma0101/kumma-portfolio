"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

const MorphingLogo = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 8;

    const fontLoader = new FontLoader();
    fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font: Font) => {
      // Generate 2D shapes from text (no depth/bevel - front face only)
      const shapes = font.generateShapes("KUMMA", 2.5);

      // Create flat 2D geometry from shapes
      const textGeometry = new THREE.ShapeGeometry(shapes);
      textGeometry.center();

      // Create a mesh from text geometry for surface sampling
      const textMaterial = new THREE.MeshBasicMaterial();
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.03,
      });

      // Use MeshSurfaceSampler to sample particles from text surface
      const sampler = new MeshSurfaceSampler(textMesh).build();

      // Define particle count (adjust this number for density)
      const particleCount = 20000;

      const startPositions = new Float32Array(particleCount * 3);
      const endPositions = new Float32Array(particleCount * 3);

      // Generate random positions within a box volume for starting positions
      const boxSize = 2;
      const tempPosition = new THREE.Vector3();

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Random position within box volume for start
        startPositions[i3] = (Math.random() - 0.5) * boxSize;
        startPositions[i3 + 1] = (Math.random() - 0.5) * boxSize;
        startPositions[i3 + 2] = (Math.random() - 0.5) * boxSize;

        // Sample position from text surface for end
        sampler.sample(tempPosition);
        endPositions[i3] = tempPosition.x;
        endPositions[i3 + 1] = tempPosition.y;
        endPositions[i3 + 2] = tempPosition.z;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(startPositions, 3)
      );

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      const tl = gsap.timeline({
        onComplete: () => {
          console.log("Timeline complete");
        },
      });

      const morph = { progress: 0 };

      // Debug: Log initial positions
      console.log("Particle count:", particleCount);
      console.log(
        "Sample start position:",
        startPositions[0],
        startPositions[1],
        startPositions[2]
      );
      console.log(
        "Sample end position:",
        endPositions[0],
        endPositions[1],
        endPositions[2]
      );

      // First rotate the cube
      tl.to(particles.rotation, {
        y: Math.PI * 2,
        duration: 2,
        ease: "power2.inOut",
      })
        // Reset rotation to 0 before morphing (critical for proper positioning)
        .to(particles.rotation, {
          y: 0,
          duration: 0,
        })
        // Then morph to text (sequential, not overlapping)
        .to(morph, {
          progress: 1,
          duration: 2,
          ease: "power2.inOut",
          onStart: () => {
            console.log("Morph animation started");
          },
          onUpdate: () => {
            console.log("Morph progress:", morph.progress);
            const positionAttribute = particles.geometry.attributes
              .position as THREE.BufferAttribute;
            for (let i = 0; i < particleCount; i++) {
              const i3 = i * 3;
              const newX =
                startPositions[i3] +
                (endPositions[i3] - startPositions[i3]) * morph.progress;
              const newY =
                startPositions[i3 + 1] +
                (endPositions[i3 + 1] - startPositions[i3 + 1]) *
                  morph.progress;
              const newZ =
                startPositions[i3 + 2] +
                (endPositions[i3 + 2] - startPositions[i3 + 2]) *
                  morph.progress;

              positionAttribute.setXYZ(i, newX, newY, newZ);
            }
            positionAttribute.needsUpdate = true;
          },
          onComplete: () => {
            console.log("Morph animation complete, locking positions");
            const positionAttribute = particles.geometry.attributes
              .position as THREE.BufferAttribute;
            for (let i = 0; i < particleCount; i++) {
              const i3 = i * 3;
              positionAttribute.setXYZ(
                i,
                endPositions[i3],
                endPositions[i3 + 1],
                endPositions[i3 + 2]
              );
            }
            positionAttribute.needsUpdate = true;
          },
        })
        // Hold the final text shape for 1 second
        .to({}, { duration: 1 });
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default MorphingLogo;
