import { FC } from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Basic Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Creative Fragment Shader (Time-varying colors based on UVs)
const fragmentShader = `
  uniform float u_time;
  varying vec2 vUv;

  // Simple function to create a pseudo-random value
  float random (vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D Noise function (you could replace this with Simplex noise if needed)
  float noise (vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f*f*(3.0-2.0*f); // Smoothstep interpolation
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }


  void main() {
    vec2 centeredUv = vUv * 2.0 - 1.0; // Center UVs around 0,0
    float dist = length(centeredUv);

    // Time-varying color components
    float r = 0.5 + 0.5 * sin(u_time * 0.5 + vUv.x * 5.0 + noise(vUv * 5.0 + u_time * 0.1) * 2.0);
    float g = 0.5 + 0.5 * sin(u_time * 0.7 + vUv.y * 6.0 + noise(vUv * 6.0 - u_time * 0.15) * 2.5);
    float b = 0.5 + 0.5 * cos(u_time * 0.9 + dist * 4.0 + noise(vUv * 7.0 + u_time * 0.2) * 3.0);

    // Mix colors based on distance from center, modulated by time
    vec3 color = vec3(r, g, b);
    color = mix(color, vec3(0.1, 0.05, 0.2), smoothstep(0.8, 1.0, dist * (1.0 + 0.1 * sin(u_time))));

    gl_FragColor = vec4(color, 1.0);
  }
`;

const AnimationTwo: FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 1; // Position camera to see the plane
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    clockRef.current = new THREE.Clock();

    // --- Shader Material ---
    const uniforms = {
      u_time: { value: 0.0 },
      // Add other uniforms here if needed (e.g., resolution)
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    materialRef.current = material;

    // --- Plane Geometry ---
    const geometry = new THREE.PlaneGeometry(2, 2); // Covers the viewport
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // --- Animation Loop ---
    const animate = () => {
      if (
        !rendererRef.current ||
        !sceneRef.current ||
        !cameraRef.current ||
        !materialRef.current ||
        !clockRef.current
      )
        return;

      const elapsedTime = clockRef.current.getElapsedTime();
      materialRef.current.uniforms.u_time.value = elapsedTime;

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      // Dispose Three.js objects
      materialRef.current?.dispose();
      geometry.dispose();
      rendererRef.current?.dispose();
      // Clear refs
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      materialRef.current = null;
      clockRef.current = null;
    };
  }, []); // Run effect only once on mount

  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
};

export default AnimationTwo;
