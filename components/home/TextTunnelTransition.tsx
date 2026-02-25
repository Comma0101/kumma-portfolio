"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { useTransition } from "../../context/TransitionContext";
import styles from "./TextTunnelTransition.module.css";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Space_Grotesk } from "next/font/google";
import AboutSection from "./AboutSection";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["700"],
});

// A custom hook to generate the typography texture on the fly
function useTextTexture() {
    const textureRef = useRef<THREE.CanvasTexture | null>(null);

    useMemo(() => {
        if (typeof window === "undefined") return;

        const canvas = document.createElement("canvas");
        // High resolution for sharp text on the cylinder
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            // Very dark, cool grey background to make warm colors pop
            ctx.fillStyle = "#030204";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Creative Red (Plasma): A glowing gradient from deep crimson to hot neon orange
            const textGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            textGradient.addColorStop(0, "rgba(255, 20, 60, 0.45)"); // Neon Crimson
            textGradient.addColorStop(0.5, "rgba(255, 80, 20, 0.35)"); // Nuclear Orange
            textGradient.addColorStop(1, "rgba(200, 10, 80, 0.45)"); // Deep Magenta/Red

            const strokeGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            strokeGradient.addColorStop(0, "rgba(255, 60, 100, 0.7)");
            strokeGradient.addColorStop(0.5, "rgba(255, 120, 40, 0.6)");
            strokeGradient.addColorStop(1, "rgba(255, 40, 120, 0.7)");

            ctx.fillStyle = textGradient;
            ctx.strokeStyle = strokeGradient;
            ctx.lineWidth = 4;
            ctx.font = `bold 180px 'Space Grotesk', sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const text = "SYSTEMS  THAT  FEEL  SYSTEMS  THAT  FEEL  ";
            // Create a dense, perfectly repeating grid to avoid seams
            for (let y = 100; y <= canvas.height + 200; y += 220) {
                // Offset every other row for a brick-like pattern
                const offset = (y / 220) % 2 === 0 ? 0 : 500;
                for (let x = -500; x <= canvas.width + 1000; x += 3000) {
                    ctx.strokeText(text, x + offset, y);
                    if (y % 440 === 100) {
                        ctx.fillText(text, x + offset, y);
                    }
                }
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            // Repeat values determine how dense the text appears on the cylinder walls
            texture.repeat.set(2, 4);
            textureRef.current = texture;
        }
    }, []);

    return textureRef.current;
}

const WebGLTunnel = ({ isTransitioning }: { isTransitioning: boolean }) => {
    const cylinderRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);
    const texture = useTextTexture();

    // We animate these values via a dummy object with GSAP
    const animState = useRef({ speed: 0.002 });

    useEffect(() => {
        if (!isTransitioning || !texture || !cylinderRef.current) return;

        // Reset base state
        animState.current.speed = 0.01;
        gsap.set(cylinderRef.current.scale, { x: 1, y: 1, z: 1 }); // Reset radius

        const tl = gsap.timeline();

        // 1. Accelerate to Warp Speed (and stay there infinitely)
        tl.to(animState.current, {
            speed: 0.35, // Faster straight-line warp speed
            duration: 2.8,
            ease: "power2.in"
        });

    }, [isTransitioning, texture]);

    useFrame((state, delta) => {
        if (!isTransitioning || !cylinderRef.current || !texture) return;

        // Scroll the texture Y-offset to create infinite forward motion
        texture.offset.y -= animState.current.speed;

        // (Rotation removed per user request)
    });

    if (!texture) return null;

    return (
        <mesh ref={cylinderRef} rotation={[Math.PI / 2, 0, 0]}>
            {/* 
              Radius: 5 (width of tunnel)
              Height: 120 (very long length stretching away from camera to hit fog)
              RadialSegments: 32 (smoothness of the tube)
              HeightSegments: 1 
              OpenEnded: true (a tube, not a closed can)
            */}
            <cylinderGeometry args={[5, 5, 120, 32, 1, true]} />
            <meshBasicMaterial
                ref={materialRef}
                map={texture}
                side={THREE.BackSide} /* Map image to the INSIDE of the tube */
                transparent={true}
                fog={true} /* Allow global scene fog to hit the end of the tunnel */
            />
        </mesh>
    );
};

const TextTunnelTransition = () => {
    const { isTransitioning, setTransitionComplete, closeTransition } = useTransition();
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isTransitioning || !overlayRef.current) return;

        const lenis = (window as any).lenis;
        if (lenis) lenis.stop();
        document.body.style.overflow = "hidden";

        // Show canvas overlay
        gsap.set(overlayRef.current, { autoAlpha: 1 });
        // Hide the Manifesto content initially
        if (contentRef.current) gsap.set(contentRef.current, { autoAlpha: 0 });

        // Once the tunnel reaches warp speed, reveal the Manifesto
        gsap.delayedCall(2.8, () => {
            setTransitionComplete(); // This tells AboutSection to start its text animation natively
            if (contentRef.current) {
                gsap.to(contentRef.current, { autoAlpha: 1, duration: 1.5, ease: "power2.inOut" });
            }
        });

    }, [isTransitioning, setTransitionComplete]);

    const handleExit = () => {
        if (!overlayRef.current) return;

        // Fade out the entire immersive room and return to normal site
        gsap.to(overlayRef.current, {
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                const lenis = (window as any).lenis;
                if (lenis) lenis.start();
                document.body.style.overflow = "";
                closeTransition();
            }
        });
    };

    return (
        <div ref={overlayRef} className={`${styles.transitionOverlay} ${spaceGrotesk.className}`}>
            {isTransitioning && (
                <>
                    <Canvas
                        camera={{ position: [0, 0, 10], fov: 75 }}
                        gl={{ alpha: true }}
                    >
                        {/* We use standard fog for the immersive room, no rollback needed */}
                        <fog attach="fog" args={["#050505", 15, 60]} />
                        <WebGLTunnel isTransitioning={isTransitioning} />
                    </Canvas>

                    <div ref={contentRef} className={styles.manifestoOverlay}>
                        <AboutSection />
                        <button onClick={handleExit} className={styles.closeRoomBtn}>
                            ✕ Exit Room
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TextTunnelTransition;
