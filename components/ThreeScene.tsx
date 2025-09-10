import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const terrainRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flyingRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize noise
    const noise2D = createNoise2D();

    // Terrain configuration
    const width = window.innerWidth * 2;
    const height = window.innerHeight * 3;
    const scl = 20;
    const cols = Math.floor(width / scl);
    const rows = Math.floor(height / scl);

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 400;
    camera.position.y = 100;
    camera.lookAt(0, -100, -490);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    mountRef.current.appendChild(renderer.domElement);

    // Create terrain geometry
    const geometry = new THREE.PlaneGeometry(width, height, cols - 1, rows - 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x800080, 
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const terrain = new THREE.Mesh(geometry, material);
    terrainRef.current = terrain;
    
    // Position and rotate terrain
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, -100, -490);
    
    scene.add(terrain);

    // Terrain animation and update function
    const updateTerrain = () => {
      flyingRef.current -= 0.05;
      let yoff = flyingRef.current;
      
      const positions = geometry.attributes.position.array;
      
      for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
          const index = (y * cols + x) * 3 + 2; // z-coordinate index
          
          // Use mapping function to transform noise to height values
          const noiseValue = noise2D(xoff, yoff);
          positions[index] = mapping(noiseValue, -1, 1, -50, 50);
          
          xoff += 0.05;
        }
        yoff += 0.1;
      }
      
      geometry.attributes.position.needsUpdate = true;
    };

    // Animation loop
    const animate = () => {
      if (!scene || !camera || !renderer) return;
      
      updateTerrain();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Clean up Three.js resources
      if (terrainRef.current) {
        terrainRef.current.geometry.dispose();
        (terrainRef.current.material as THREE.Material).dispose();
        scene.remove(terrainRef.current);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

// Helper function to map values from one range to another
function mapping(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

export default ThreeScene;
