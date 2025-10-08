import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ThreeScene = ({ scrollY }: { scrollY: React.MutableRefObject<number> }) => {
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

  useEffect(() => {
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
    // Ensure canvas is properly styled for transparency
    if (renderer.domElement.style) {
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.pointerEvents = 'none';
    }
    mountRef.current.appendChild(renderer.domElement);

    const cols = 50; // Reduced from 100 for better performance
    const rows = 50; // Reduced from 100 for better performance
    const terrainWidth = 400;
    const terrainHeight = 400;

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
      opacity: 0.7,
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
      // Update terrain every 2 frames for better performance
      if (frameCountRef.current % 2 === 0) {
        updateTerrain();
      }
      frameCountRef.current++;

      // Update colors based on energy decay
      const colorAttribute = geometry.attributes.color as THREE.BufferAttribute;
      const energyAttribute = geometry.attributes.energy as THREE.BufferAttribute;
      const accentColor = new THREE.Color("#39FF14");
      const baseColor = new THREE.Color(0xffffff);
      let needsUpdate = false;

      for (let i = 0; i < energyAttribute.count; i++) {
        let energy = energyAttribute.getX(i);
        if (energy > 0.001) { // Performance threshold
          const currentColor = new THREE.Color().lerpColors(baseColor, accentColor, energy);
          colorAttribute.setXYZ(i, currentColor.r, currentColor.g, currentColor.b);
          
          // Decay energy
          energyAttribute.setX(i, energy * 0.96); // Adjust for desired fade speed
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        colorAttribute.needsUpdate = true;
        energyAttribute.needsUpdate = true;
      }
      
      camera.position.y = 50 - scrollY.current * 0.2;
      camera.rotation.z = -scrollY.current * 0.0001;
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    gsap.to(material.color, {
      r: 0.5,
      g: 0.0,
      b: 0.5,
      scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "top center",
        scrub: true,
      },
    });

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
          // Transform vertex to world space to compare with intersection point
          vertex.applyMatrix4(terrain.matrixWorld);
          const distance = vertex.distanceTo(intersectionPoint);

          if (distance < radius) {
            // Set energy to max
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
    };
  }, [key]);

  return (
    <div
      key={key}
      ref={mountRef}
    />
  );
};

export default ThreeScene;
