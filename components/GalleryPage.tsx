"use client";

import { FC, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { PlaneGeometry, ShaderMaterial, Uniform } from "three"; // Import necessary types
import { menuItems } from "./menuItems";
import styles from "../styles/GalleryPage.module.css";
import BackButton from "./BackButton";

// Simple Math Lerp function (if not available elsewhere)
// Consider moving to a utils file if used in multiple places
const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

interface GalleryPageProps {
  collectionId?: string;
}

// --- Basic Vertex Shader (No Effects) ---
const imageVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// --- Fragment Shader (Unchanged) ---
const imageFragmentShader = `
  uniform sampler2D uTexture;
  varying vec2 vUv;


  void main() {
    // Simple texture mapping - distortion is now in vertex shader
    vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = color;
    // Optional: Add aspect ratio correction here if needed, like in the reference fragment shader
  }
`;
// --- End Shaders ---

interface Media {
  mesh: THREE.Mesh<PlaneGeometry, ShaderMaterial>; // Use ShaderMaterial
  bounds: DOMRect; // Store original DOM bounds if needed for layout, or calculate based on image aspect
  initialY: number; // Initial Y position in world units
  height: number; // Height in world units
  width: number; // Width in world units
}

const GalleryPage: FC<GalleryPageProps> = ({ collectionId }) => {
  const [title, setTitle] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const mediasRef = useRef<Media[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const isInitialized = useRef(false);
  const router = useRouter();

  // --- State for Interaction and Scrolling ---
  const scroll = useRef({
    current: 0,
    target: 0,
    last: 0,
    ease: 0.1, // Slightly less smoothing
  });
  const isDown = useRef(false);
  const startScroll = useRef(0);
  const startClientY = useRef(0);

  // --- State for Layout ---
  const viewport = useRef({ width: 0, height: 0 });
  const galleryHeight = useRef(0); // Total height of the scrollable content in world units
  const planeSize = useRef({ width: 5, height: 1 }); // Smaller fixed width for grid layout
  const gap = useRef(3.0); // INCREASED gap further for more vertical spacing

  // --- Fetch Image URLs ---
  useEffect(() => {
    if (collectionId) {
      const index = parseInt(collectionId, 10);
      const collection = menuItems[index];
      if (collection && collection.galleryImages) {
        setImageUrls(collection.galleryImages);
        setTitle(collection.title);
      } else {
        console.error("Collection not found or has no images, redirecting.");
        router.push("/");
      }
    } else {
      console.error("No collectionId provided, redirecting.");
      router.push("/");
    }
  }, [collectionId]);

  // --- Initialize Three.js and Medias ---
  useEffect(() => {
    if (!mountRef.current || !imageUrls.length || isInitialized.current) return;

    const mount = mountRef.current;
    // Add 'loaded' class shortly after initialization starts
    // Use a small timeout to ensure styles are applied
    // We add it to the parent (.galleryPage) which has the ::after pseudo-element
    const loadTimer = setTimeout(() => {
      mount.parentElement?.classList.add(styles.loaded);
    }, 100);

    // --- Basic Three.js Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    // Adjust camera Z based on desired plane size and FOV
    // Formula: distance = height / (2 * tan(fov / 2))
    // Example: If desired plane height is ~4 units, and fov is 75:
    // distance = 4 / (2 * tan(75 * PI / 360)) => ~2.68
    camera.position.z = 7; // Move camera back to see the grid
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true }); // Removed alpha: true
    renderer.setClearColor(0x111111, 1); // Set clear color to match CSS background (#111)
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    clockRef.current = new THREE.Clock();

    // --- Texture Loader ---
    const textureLoader = new THREE.TextureLoader();
    const loadedMeshes: THREE.Mesh[] = [];
    let yOffset = 0; // Track Y position for layout

    // --- Calculate Viewport ---
    const calculateViewport = () => {
      const fovInRadians = (camera.fov * Math.PI) / 180;
      const height = 2 * Math.tan(fovInRadians / 2) * camera.position.z;
      const width = height * camera.aspect;
      viewport.current = { width, height };

      // Adjust plane size based on viewport. Use the full calculated width.
      // planeSize.current.width = viewport.current.width; // Reverted: Using fixed size now
      // Height will be set based on aspect ratio later
    };

    // --- Create Media Objects ---
    const createMedias = () => {
      mediasRef.current = []; // Clear existing medias if re-creating
      galleryHeight.current = 0;
      yOffset = 0; // Start layout from top

      imageUrls.forEach((url, index) => {
        const texture = textureLoader.load(url, (loadedTexture) => {
          // Once texture loads, calculate aspect ratio and set plane height
          const aspectRatio =
            loadedTexture.image.naturalWidth /
            loadedTexture.image.naturalHeight;
          const planeHeight = planeSize.current.width / aspectRatio;
          // Add segments for vertex shader distortion
          const geometry = new THREE.PlaneGeometry(
            planeSize.current.width,
            planeHeight,
            10, // Width segments
            10 // Height segments
          );
          // Use ShaderMaterial - Remove unused uniforms
          const material = new THREE.ShaderMaterial({
            uniforms: {
              uTexture: new Uniform(loadedTexture),
              // uStrength: new Uniform(0.0), // REMOVED
              // uViewportSizes: new Uniform( // REMOVED - Not used by basic shader
              //   new THREE.Vector2(
              //     viewport.current.width,
              //     viewport.current.height
              //   )
              // ),
            },
            vertexShader: imageVertexShader, // Using the basic shader now
            fragmentShader: imageFragmentShader,
            transparent: true,
          });
          const mesh = new THREE.Mesh(geometry, material);

          const initialY = yOffset - planeHeight / 2;

          // --- Attempt at non-overlapping random X placement ---
          const halfViewportWidth = viewport.current.width / 2;
          const halfPlaneWidth = planeSize.current.width / 2;
          let randomX = 0;

          // Define possible ranges, leaving some space from center/edges
          const buffer = 0.1; // Small buffer from edge/center
          const leftRange = [
            -halfViewportWidth + halfPlaneWidth + buffer,
            -halfPlaneWidth - buffer,
          ];
          const rightRange = [
            halfPlaneWidth + buffer,
            halfViewportWidth - halfPlaneWidth - buffer,
          ];

          // Randomly choose left or right side, ensuring ranges are valid
          if (rightRange[1] > rightRange[0] && leftRange[1] > leftRange[0]) {
            // Check if ranges are valid
            if (Math.random() > 0.5) {
              // Right side
              randomX =
                Math.random() * (rightRange[1] - rightRange[0]) + rightRange[0];
            } else {
              // Left side
              randomX =
                Math.random() * (leftRange[1] - leftRange[0]) + leftRange[0];
            }
          } else {
            // Fallback if ranges are too small (e.g., very narrow viewport) - place near center
            randomX = (Math.random() - 0.5) * halfPlaneWidth;
          }

          mesh.position.set(randomX, initialY, 0); // Set calculated X

          scene.add(mesh);

          const media: Media = {
            mesh,
            bounds: new DOMRect(), // Placeholder, not strictly needed if layout is programmatic
            initialY: initialY,
            height: planeHeight,
            width: planeSize.current.width,
          };
          mediasRef.current[index] = media; // Place in correct index

          // Update total gallery height and next offset
          galleryHeight.current += planeHeight + gap.current;
          yOffset -= planeHeight + gap.current; // Move down for next image

          // Check if all textures are potentially loaded to finalize gallery height
          if (mediasRef.current.filter(Boolean).length === imageUrls.length) {
            // Adjust gallery height (remove last gap)
            if (galleryHeight.current > 0) {
              galleryHeight.current -= gap.current;
            }
            console.log("Gallery Height (World Units):", galleryHeight.current);
          }
        });
      });
    };

    // --- Resize Handler ---
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !mountRef.current)
        return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      console.log(`Resizing - Mount dimensions: ${width}x${height}`); // Log mount dimensions

      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      cameraRef.current.aspect = width / height;
      console.log(`Resizing - Camera aspect: ${cameraRef.current.aspect}`); // Log aspect ratio
      cameraRef.current.updateProjectionMatrix();

      calculateViewport(); // Recalculate viewport
      console.log(`Resizing - Calculated viewport:`, viewport.current); // Log calculated viewport

      // Update viewport uniform on resize
      const newViewportSize = new THREE.Vector2(
        viewport.current.width,
        viewport.current.height
      );

      // Recalculate layout based on new viewport
      galleryHeight.current = 0;
      yOffset = 0;
      mediasRef.current.forEach((media) => {
        if (!media) return; // Skip if media not ready

        // Update viewport uniform for each material - REMOVED as uniform is removed
        // media.mesh.material.uniforms.uViewportSizes.value = newViewportSize;
        // Access texture via uniforms for ShaderMaterial
        const texture = media.mesh.material.uniforms.uTexture.value;
        if (!texture || !texture.image) return; // Skip if texture/image not ready

        const aspectRatio =
          texture.image.naturalWidth / texture.image.naturalHeight;

        // Update the plane size uniform as well... -> REMOVED uniform

        // Update media dimensions based on the newly calculated planeSize - Not needed if size is fixed
        // media.width = planeSize.current.width;
        // media.height = media.width / aspectRatio;

        // Get the original dimensions the geometry was created with - Not needed if size is fixed and scale isn't changing
        // const originalGeomWidth = media.mesh.geometry.parameters.width;
        // const originalGeomHeight = media.mesh.geometry.parameters.height;

        // Calculate the required scale factor to match the new dimensions - Not needed if size is fixed
        // const scaleX = media.width / originalGeomWidth;
        // const scaleY = media.height / originalGeomHeight;

        // Apply the scale to the mesh - Not needed if size is fixed
        // media.mesh.scale.set(scaleX, scaleY, 1);

        media.initialY = yOffset - media.height / 2;
        // Don't update mesh.position.y here, let the update loop handle it based on scroll

        galleryHeight.current += media.height + gap.current;
        yOffset -= media.height + gap.current;
      });
      // Adjust gallery height (remove last gap)
      if (galleryHeight.current > 0) {
        galleryHeight.current -= gap.current;
      }
    };

    // --- Interaction Handlers ---
    const onTouchDown = (event: TouchEvent | MouseEvent) => {
      isDown.current = true;
      startScroll.current = scroll.current.current; // Store scroll position at touch start
      startClientY.current =
        "touches" in event ? event.touches[0].clientY : event.clientY;
    };

    const onTouchMove = (event: TouchEvent | MouseEvent) => {
      if (!isDown.current) return;
      const currentClientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;
      const deltaY = startClientY.current - currentClientY; // How much the finger/mouse moved
      scroll.current.target = startScroll.current + deltaY * 0.2; // Further reduced scroll speed multiplier
    };

    const onTouchUp = () => {
      isDown.current = false;
    };

    const onWheel = (event: WheelEvent) => {
      // Basic wheel scroll - consider using normalize-wheel for consistency
      scroll.current.target += event.deltaY * 0.05; // Further reduced scroll speed multiplier
    };

    // --- Animation Loop ---
    const animate = () => {
      if (
        !rendererRef.current ||
        !sceneRef.current ||
        !cameraRef.current ||
        !clockRef.current
      ) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      const elapsedTime = clockRef.current.getElapsedTime();

      // Smooth scroll & calculate speed
      const speed = scroll.current.current - scroll.current.last;
      scroll.current.current = lerp(
        scroll.current.current,
        scroll.current.target,
        scroll.current.ease
      );

      // Update media positions and handle wrapping
      const totalHeight = galleryHeight.current;
      const viewportHeight = viewport.current.height;

      mediasRef.current.forEach((media) => {
        if (!media) return; // Skip if media not fully loaded yet

        // REMOVED uStrength calculation and update logic

        // Calculate target Y based on scroll and initial position
        // Adjust initialY to be relative to the center of the gallery space for easier modulo
        const centeredInitialY = media.initialY + totalHeight / 2;
        let currentY = centeredInitialY - scroll.current.current;

        // Wrap using modulo
        // The formula ensures the item wraps correctly around the total gallery height
        currentY = ((currentY % totalHeight) + totalHeight) % totalHeight;
        currentY -= totalHeight / 2; // Re-center

        media.mesh.position.y = currentY;

        // Optional: Add effects based on position (e.g., scaling, rotation)
        // const scaleFactor = 1 - Math.abs(currentY / (viewportHeight / 2)) * 0.1; // Example scale effect
        // media.mesh.scale.set(scaleFactor * media.width, scaleFactor * media.height, 1);
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      scroll.current.last = scroll.current.current;
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // --- Initial Setup Calls ---
    calculateViewport();
    createMedias();
    animate(); // Start the loop

    // --- Add Event Listeners ---
    window.addEventListener("resize", handleResize);
    mount.addEventListener("wheel", onWheel);
    mount.addEventListener("mousedown", onTouchDown);
    mount.addEventListener("mousemove", onTouchMove);
    mount.addEventListener("mouseup", onTouchUp);
    mount.addEventListener("mouseleave", onTouchUp); // Handle mouse leaving the area
    mount.addEventListener("touchstart", onTouchDown, { passive: true });
    mount.addEventListener("touchmove", onTouchMove, { passive: true });
    mount.addEventListener("touchend", onTouchUp);

    isInitialized.current = true;

    // --- Cleanup ---
    return () => {
      isInitialized.current = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("mousedown", onTouchDown);
      mount.removeEventListener("mousemove", onTouchMove);
      mount.removeEventListener("mouseup", onTouchUp);
      mount.removeEventListener("mouseleave", onTouchUp);
      mount.removeEventListener("touchstart", onTouchDown);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("touchend", onTouchUp);

      // Dispose Three.js objects
      mediasRef.current.forEach((media) => {
        if (media) {
          media.mesh.geometry.dispose();
          // Dispose texture via uniforms
          media.mesh.material.uniforms.uTexture.value?.dispose();
          // REMOVED uStrength uniform disposal logic comment
          media.mesh.material.dispose();
          scene.remove(media.mesh);
        }
      });
      mediasRef.current = [];
      rendererRef.current?.dispose();
      if (mountRef.current && rendererRef.current) {
        // Check if child exists before removing
        if (mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      clockRef.current = null;
      console.log("Three.js cleanup complete.");
      // Cleanup: Remove 'loaded' class and clear timer
      mount.parentElement?.classList.remove(styles.loaded);
      clearTimeout(loadTimer);
    };
  }, [imageUrls]); // Re-run effect if imageUrls change

  return (
    <div className={styles.galleryPage}>
      <BackButton />
      {title && <h1 className={styles.pageTitle}>{title}</h1>}
      {/* Container for the Three.js Canvas */}
      <div ref={mountRef} className={styles.webglContainer}>
        {/* Canvas will be appended here by Three.js */}
      </div>
    </div>
  );
};

export default GalleryPage;

// Helper function for lerp (linear interpolation) - place in utils/math.ts ideally
// export const lerp = (v0: number, v1: number, t: number): number => {
//   return v0 * (1 - t) + v1 * t;
// };
// Removed duplicate export, using the one defined within the component scope now.
