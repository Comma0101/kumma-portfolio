"use client";

import { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { PlaneGeometry, ShaderMaterial, Uniform } from "three";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import gsap from "gsap";
import { menuItems } from "./menuItems";
import styles from "../styles/GalleryPage.module.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface GalleryPageProps {
  collectionId?: string;
}

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

const GalleryPage: FC<GalleryPageProps> = ({ collectionId }) => {
  const [studyLabel, setStudyLabel] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [useStaticGallery, setUseStaticGallery] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const mediasRef = useRef<Media[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const router = useRouter();

  const scrollY = useRef(0);
  const viewport = useRef({ width: 0, height: 0 });
  const galleryHeight = useRef(0);
  const planeSize = useRef({ width: 5, height: 1 });
  const gap = useRef(3.0);

  useEffect(() => {
    if (collectionId) {
      const index = parseInt(collectionId, 10);
      const collection = menuItems[index];
      if (collection && collection.galleryImages) {
        setImageUrls(collection.galleryImages);
        setTitle(collection.title);
        setSubtitle(collection.subtitle);
        setStudyLabel(`Study ${String(index + 1).padStart(2, "0")}`);
      } else {
        router.push("/gallery");
      }
    } else {
      router.push("/gallery");
    }
  }, [collectionId, router]);

  const runEntranceAnimation = () => {
    if (!pageRef.current) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    if (headerRef.current) {
      tl.from(Array.from(headerRef.current.children), {
        y: 24,
        opacity: 0,
        duration: 0.72,
        stagger: 0.08,
      });
    }

    if (mountRef.current) {
      tl.fromTo(
        mountRef.current,
        { opacity: 0.2 },
        {
          opacity: 1,
          duration: 0.92,
        },
        "-=0.38"
      );
    }
  };

  useEffect(() => {
    if (!mountRef.current || !imageUrls.length) return;

    setIsLoading(true);
    setLoadingProgress(0);
    setUseStaticGallery(false);

    const mount = mountRef.current;
    const pageElement = mount.parentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setUseStaticGallery(true);
      setIsLoading(false);
      requestAnimationFrame(runEntranceAnimation);
      return;
    }

    if (pageElement && !pageElement.classList.contains(styles.loaded)) {
      pageElement.classList.add(styles.loaded);
    }

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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (error) {
      console.warn("WebGL gallery unavailable.", error);
      setUseStaticGallery(true);
      setIsLoading(false);
      requestAnimationFrame(runEntranceAnimation);
      return;
    }
    renderer.setClearColor(0x111111, 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    clockRef.current = new THREE.Clock();

    const loadingManager = new THREE.LoadingManager();

    loadingManager.onLoad = () => {
      setIsLoading(false);
      if (pageElement && !pageElement.classList.contains(styles.loaded)) {
        pageElement.classList.add(styles.loaded);
      }
      animate();
      runEntranceAnimation();
    };

    loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      setLoadingProgress(itemsLoaded / itemsTotal);
    };

    const textureLoader = new THREE.TextureLoader(loadingManager);
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
        textureLoader.load(url, (loadedTexture) => {
          const aspectRatio =
            loadedTexture.image.naturalWidth / loadedTexture.image.naturalHeight;
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
          const buffer = 0.1;
          const leftRange = [
            -halfViewportWidth + halfPlaneWidth + buffer,
            -halfPlaneWidth - buffer,
          ];
          const rightRange = [
            halfPlaneWidth + buffer,
            halfViewportWidth - halfPlaneWidth - buffer,
          ];

          let randomX = 0;

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
            initialY,
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
      if (!rendererRef.current || !cameraRef.current || !mountRef.current) return;

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

    const lenis = (window as any).lenis;
    const handleScroll = (e: { scroll: number }) => {
      scrollY.current = e.scroll;
    };

    if (lenis) {
      lenis.on("scroll", handleScroll);
    }

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

      const totalHeight = galleryHeight.current;
      const currentScroll = scrollY.current * 0.1;

      mediasRef.current.forEach((media) => {
        if (!media) return;

        const centeredInitialY = media.initialY + totalHeight / 2;
        let currentY = centeredInitialY - currentScroll;

        currentY = ((currentY % totalHeight) + totalHeight) % totalHeight;
        currentY -= totalHeight / 2;

        media.mesh.position.y = currentY;
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    calculateViewport();
    createMedias();

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      window.removeEventListener("resize", handleResize);

      if (lenis) {
        lenis.off("scroll", handleScroll);
      }

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
      if (mount && rendererRef.current) {
        if (mount.contains(rendererRef.current.domElement)) {
          mount.removeChild(rendererRef.current.domElement);
        }
      }

      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      clockRef.current = null;

      pageElement?.classList.remove(styles.loaded);
    };
  }, [imageUrls, collectionId]);

  return (
    <div ref={pageRef} className={styles.galleryPage}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p className={`${styles.loadingText} ${spaceGrotesk.className}`}>
            Loading Collection: {Math.round(loadingProgress * 100)}%
          </p>
        </div>
      )}

      <header ref={headerRef} className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <Link href="/gallery" className={`${styles.backLink} ${spaceGrotesk.className}`}>
            <span aria-hidden="true">←</span>
            Back to Collections
          </Link>
          {studyLabel && (
            <p className={`${styles.chapterLabel} ${spaceGrotesk.className}`}>
              {studyLabel}
            </p>
          )}
        </div>

        <div className={styles.headerMain}>
          <p className={`${styles.galleryEyebrow} ${spaceGrotesk.className}`}>
            Visual Study
          </p>
          {title && <h1 className={`${styles.pageTitle} ${cormorant.className}`}>{title}</h1>}
          {subtitle && (
            <p className={`${styles.gallerySubtitle} ${spaceGrotesk.className}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className={styles.headerMeta}>
          <p className={`${styles.galleryMeta} ${spaceGrotesk.className}`}>
            {imageUrls.length} frames / continuous visual sequence
          </p>
          <p className={`${styles.galleryGuide} ${spaceGrotesk.className}`}>
            Designed as a continuous visual sentence. Stay with the cadence.
          </p>
        </div>
      </header>

      <div ref={mountRef} className={styles.webglContainer}></div>
      {useStaticGallery && (
        <div className={styles.staticGallery}>
          {imageUrls.map((url, index) => (
            <figure key={url}>
              <Image
                src={url}
                alt={`${title} visual study frame ${index + 1}`}
                fill
                sizes="(max-width: 760px) 92vw, 68vw"
              />
            </figure>
          ))}
        </div>
      )}
      {!useStaticGallery && (
        <>
          <div className={styles.readingScrim} aria-hidden="true"></div>
          <div className={styles.scrollSpacer} aria-hidden="true"></div>
        </>
      )}
    </div>
  );
};

export default GalleryPage;
