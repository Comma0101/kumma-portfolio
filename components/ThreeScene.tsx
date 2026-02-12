"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ThreeScene = () => {
  const pathname = usePathname();
  const [key, setKey] = useState(0);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const terrainRef = useRef<THREE.Mesh | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flyingRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const cameraTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Only reset if we navigate away from home and back, or if we want to re-init
    // For now, let's keep it persistent across pages if possible, or re-mount
    // If we want it persistent, we might not want to reset on pathname change unless necessary
    // But the current logic resets it. Let's keep it for now to ensure clean state.
    setKey((prevKey) => prevKey + 1);
  }, [pathname]);

  useEffect(() => {
    flyingRef.current = 0;
    if (!mountRef.current) return;

    const noise2D = createNoise2D();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 150;
    camera.position.y = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Add fog for endless illusion
    scene.fog = new THREE.Fog(0x000000, 150, 900);

    // Style for fixed background
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '-1'; // Behind everything
    renderer.domElement.style.pointerEvents = 'none';

    mountRef.current.appendChild(renderer.domElement);

    const cols = 80; // Increased for larger terrain
    const rows = 80;
    const terrainWidth = 1200; // Significantly larger
    const terrainHeight = 1200;

    const geometry = new THREE.PlaneGeometry(
      terrainWidth,
      terrainHeight,
      cols - 1,
      rows - 1
    );
    geometryRef.current = geometry;

    const material = new THREE.MeshBasicMaterial({
      color: 0xfafafa,
      wireframe: true,
      transparent: true,
      opacity: 0.3, // Lower opacity for background
      vertexColors: true,
    });
    materialRef.current = material;

    const terrain = new THREE.Mesh(geometry, material);
    terrainRef.current = terrain;
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -50;
    scene.add(terrain);
    camera.lookAt(terrain.position);

    const initialColors = new Float32Array(cols * rows * 3);
    const energies = new Float32Array(cols * rows);
    for (let i = 0; i < initialColors.length; i += 3) {
      initialColors[i] = 1;
      initialColors[i + 1] = 1;
      initialColors[i + 2] = 1;
    }
    for (let i = 0; i < energies.length; i++) {
      energies[i] = 0;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(initialColors, 3));
    geometry.setAttribute('energy', new THREE.BufferAttribute(energies, 1));

    const updateTerrain = () => {
      flyingRef.current -= 0.01;
      let yoff = flyingRef.current;

      const positions = geometry.attributes.position.array;

      for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 3 + 2;
          const noiseValue = noise2D(xoff, yoff);
          positions[i] = noiseValue * 10;
          xoff += 0.1;
        }
        yoff += 0.1;
      }

      geometry.attributes.position.needsUpdate = true;
    };

    const animate = () => {
      if (frameCountRef.current % 2 === 0) {
        updateTerrain();
      }
      frameCountRef.current++;

      const colorAttribute = geometry.attributes.color as THREE.BufferAttribute;
      const energyAttribute = geometry.attributes.energy as THREE.BufferAttribute;
      const accentColor = new THREE.Color("#39FF14");
      const baseColor = new THREE.Color(0xffffff);
      let needsUpdate = false;

      for (let i = 0; i < energyAttribute.count; i++) {
        let energy = energyAttribute.getX(i);
        if (energy > 0.001) {
          const currentColor = new THREE.Color().lerpColors(baseColor, accentColor, energy);
          colorAttribute.setXYZ(i, currentColor.r, currentColor.g, currentColor.b);
          energyAttribute.setX(i, energy * 0.96);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        colorAttribute.needsUpdate = true;
        energyAttribute.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Scroll Animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body", // Use body as the trigger for the whole page
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
    cameraTimelineRef.current = tl;

    // Continuous forward flight effect
    tl.to(camera.position, {
      z: 50, // Move forward significantly (from 150 to 50)
      y: 30, // Drop slightly lower for immersion
      ease: "none", // Linear movement
    }, 0)
      .to(material, {
        opacity: 0.15, // Fade out slightly as we get closer/lower
        ease: "none",
      }, 0);

    // Color shift can remain but maybe subtler
    tl.to(material.color, {
      r: 0.1,
      g: 0.5,
      b: 1.0,
      ease: "none",
    }, 0);

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(terrain);

      if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        const energyAttribute = geometry.attributes.energy as THREE.BufferAttribute;
        const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
        const radius = 40;

        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
          vertex.applyMatrix4(terrain.matrixWorld);
          const distance = vertex.distanceTo(intersectionPoint);

          if (distance < radius) {
            energyAttribute.setX(i, 1.0);
          }
        }
        energyAttribute.needsUpdate = true;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (
        mountRef.current &&
        rendererRef.current &&
        mountRef.current.contains(rendererRef.current.domElement)
      ) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (sceneRef.current && terrainRef.current) {
        sceneRef.current.remove(terrainRef.current);
      }
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (cameraTimelineRef.current) {
        cameraTimelineRef.current.scrollTrigger?.kill();
        cameraTimelineRef.current.kill();
        cameraTimelineRef.current = null;
      }
    };
  }, [key]);

  return (
    <div
      key={key}
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ThreeScene;
