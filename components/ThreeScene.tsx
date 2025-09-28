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
    mountRef.current.appendChild(renderer.domElement);

    const cols = 100;
    const rows = 100;
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
      color: 0x800080,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    materialRef.current = material;

    const terrain = new THREE.Mesh(geometry, material);
    terrainRef.current = terrain;
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -50;
    scene.add(terrain);
    camera.lookAt(terrain.position);

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
      updateTerrain();
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

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
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
