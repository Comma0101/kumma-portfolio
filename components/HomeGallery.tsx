"use client";

import { FC, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PlaneGeometry, ShaderMaterial, Uniform } from "three";
import styles from "../styles/GalleryPage.module.css";

const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

const imageVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const imageFragmentShader = `
  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = color;
  }
`;

interface Media {
  mesh: THREE.Mesh<PlaneGeometry, ShaderMaterial>;
  bounds: DOMRect;
  initialY: number;
  height: number;
  width: number;
}

const HomeGallery: FC = () => {
  const imageUrls = [
    "/images/collection1/img1.jpg",
    "/images/collection1/img2.jpg",
    "/images/collection1/img3.jpg",
    "/images/collection2/img1.jpg",
    "/images/collection2/img2.jpg",
    "/images/collection2/img3.jpg",
  ];
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const mediasRef = useRef<Media[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const isInitialized = useRef(false);

  const scroll = useRef({
    current: 0,
    target: 0,
    last: 0,
    ease: 0.1,
  });
  const isDown = useRef(false);
  const startScroll = useRef(0);
  const startClientY = useRef(0);

  const viewport = useRef({ width: 0, height: 0 });
  const galleryHeight = useRef(0);
  const planeSize = useRef({ width: 5, height: 1 });
  const gap = useRef(3.0);

  useEffect(() => {
    if (!mountRef.current || !imageUrls.length || isInitialized.current) return;

    const mount = mountRef.current;
    const loadTimer = setTimeout(() => {
      mount.parentElement?.classList.add(styles.loaded);
    }, 100);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.z = 7;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x111111, 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    clockRef.current = new THREE.Clock();

    const textureLoader = new THREE.TextureLoader();
    let yOffset = 0;

    const calculateViewport = () => {
      const fovInRadians = (camera.fov * Math.PI) / 180;
      const height = 2 * Math.tan(fovInRadians / 2) * camera.position.z;
      const width = height * camera.aspect;
      viewport.current = { width, height };
    };

    const createMedias = () => {
      mediasRef.current = [];
      galleryHeight.current = 0;
      yOffset = 0;

      imageUrls.forEach((url, index) => {
        const texture = textureLoader.load(url, (loadedTexture) => {
          const aspectRatio =
            loadedTexture.image.naturalWidth /
            loadedTexture.image.naturalHeight;
          const planeHeight = planeSize.current.width / aspectRatio;
          const geometry = new THREE.PlaneGeometry(
            planeSize.current.width,
            planeHeight,
            10,
            10
          );
          const material = new THREE.ShaderMaterial({
            uniforms: {
              uTexture: new Uniform(loadedTexture),
            },
            vertexShader: imageVertexShader,
            fragmentShader: imageFragmentShader,
            transparent: true,
          });
          const mesh = new THREE.Mesh(geometry, material);

          const initialY = yOffset - planeHeight / 2;

          const halfViewportWidth = viewport.current.width / 2;
          const halfPlaneWidth = planeSize.current.width / 2;
          let randomX = 0;

          const buffer = 0.1;
          const leftRange = [
            -halfViewportWidth + halfPlaneWidth + buffer,
            -halfPlaneWidth - buffer,
          ];
          const rightRange = [
            halfPlaneWidth + buffer,
            halfViewportWidth - halfPlaneWidth - buffer,
          ];

          if (rightRange[1] > rightRange[0] && leftRange[1] > leftRange[0]) {
            if (Math.random() > 0.5) {
              randomX =
                Math.random() * (rightRange[1] - rightRange[0]) + rightRange[0];
            } else {
              randomX =
                Math.random() * (leftRange[1] - leftRange[0]) + leftRange[0];
            }
          } else {
            randomX = (Math.random() - 0.5) * halfPlaneWidth;
          }

          mesh.position.set(randomX, initialY, 0);

          scene.add(mesh);

          const media: Media = {
            mesh,
            bounds: new DOMRect(),
            initialY: initialY,
            height: planeHeight,
            width: planeSize.current.width,
          };
          mediasRef.current[index] = media;

          galleryHeight.current += planeHeight + gap.current;
          yOffset -= planeHeight + gap.current;

          if (mediasRef.current.filter(Boolean).length === imageUrls.length) {
            if (galleryHeight.current > 0) {
              galleryHeight.current -= gap.current;
            }
          }
        });
      });
    };

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !mountRef.current)
        return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      calculateViewport();

      galleryHeight.current = 0;
      yOffset = 0;
      mediasRef.current.forEach((media) => {
        if (!media) return;

        const texture = media.mesh.material.uniforms.uTexture.value;
        if (!texture || !texture.image) return;

        media.initialY = yOffset - media.height / 2;

        galleryHeight.current += media.height + gap.current;
        yOffset -= media.height + gap.current;
      });
      if (galleryHeight.current > 0) {
        galleryHeight.current -= gap.current;
      }
    };

    const onTouchDown = (event: TouchEvent | MouseEvent) => {
      isDown.current = true;
      startScroll.current = scroll.current.current;
      startClientY.current =
        "touches" in event ? event.touches[0].clientY : event.clientY;
    };

    const onTouchMove = (event: TouchEvent | MouseEvent) => {
      if (!isDown.current) return;
      const currentClientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;
      const deltaY = startClientY.current - currentClientY;
      scroll.current.target = startScroll.current + deltaY * 0.2;
    };

    const onTouchUp = () => {
      isDown.current = false;
    };

    const onWheel = (event: WheelEvent) => {
      scroll.current.target += event.deltaY * 0.05;
    };

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

      scroll.current.current = lerp(
        scroll.current.current,
        scroll.current.target,
        scroll.current.ease
      );

      const totalHeight = galleryHeight.current;

      mediasRef.current.forEach((media) => {
        if (!media) return;

        const centeredInitialY = media.initialY + totalHeight / 2;
        let currentY = centeredInitialY - scroll.current.current;

        currentY = ((currentY % totalHeight) + totalHeight) % totalHeight;
        currentY -= totalHeight / 2;

        media.mesh.position.y = currentY;
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      scroll.current.last = scroll.current.current;
      animationFrameId.current = requestAnimationFrame(animate);
    };

    calculateViewport();
    createMedias();
    animate();

    window.addEventListener("resize", handleResize);
    mount.addEventListener("wheel", onWheel);
    mount.addEventListener("mousedown", onTouchDown);
    mount.addEventListener("mousemove", onTouchMove);
    mount.addEventListener("mouseup", onTouchUp);
    mount.addEventListener("mouseleave", onTouchUp);
    mount.addEventListener("touchstart", onTouchDown, { passive: true });
    mount.addEventListener("touchmove", onTouchMove, { passive: true });
    mount.addEventListener("touchend", onTouchUp);

    isInitialized.current = true;

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

      mediasRef.current.forEach((media) => {
        if (media) {
          media.mesh.geometry.dispose();
          media.mesh.material.uniforms.uTexture.value?.dispose();
          media.mesh.material.dispose();
          scene.remove(media.mesh);
        }
      });
      mediasRef.current = [];
      rendererRef.current?.dispose();
      if (mountRef.current && rendererRef.current) {
        if (mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      clockRef.current = null;
      mount.parentElement?.classList.remove(styles.loaded);
      clearTimeout(loadTimer);
    };
  }, [imageUrls]);

  return (
    <div className={styles.galleryPage}>
      <div ref={mountRef} className={styles.webglContainer}></div>
    </div>
  );
};

export default HomeGallery;
