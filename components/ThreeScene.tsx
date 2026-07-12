"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "../styles/home.module.css";
import { createSceneGroups } from "./immersive/createSceneGroups";
import { sampleImmersiveJourney } from "./immersive/immersiveStages";
import {
  copySceneGroupWeights,
  createMutableSceneGroupWeights,
  dampSceneGroupWeights,
  journeyStateFor,
  motionScaleForTransition,
  shouldAnimateScene,
  shouldRebuildSceneResources,
  shouldRenderScene,
} from "./immersive/sceneLifecycle";
import type {
  ImmersiveProfile,
  ImmersiveSceneSample,
} from "./immersive/types";
import {
  useImmersiveScroll,
  type ImmersiveScrollSnapshot,
} from "./immersive/useImmersiveScroll";
import {
  getThreeSceneTuning,
  type ThreeSceneTuning,
} from "./threeSceneTuning";

function shouldWakeScene(
  previous: ImmersiveScrollSnapshot | null,
  next: ImmersiveScrollSnapshot,
): boolean {
  return (
    previous === null ||
    previous.profile !== next.profile ||
    previous.activeStageId !== next.activeStageId ||
    previous.inJourney !== next.inJourney ||
    previous.anchorsValid !== next.anchorsValid
  );
}

const SNOISE = /* glsl */ `
  vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

const VERT = (octaves: number) => /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uElevation;
  uniform float uRoughness;
  varying float vHeight;
  varying vec3 vNormal;
  varying float vDistance;
  ${SNOISE}
  float fbm(vec2 p){
    float sum = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < ${octaves}; octave++){
      sum += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return sum;
  }
  float terrain(vec2 point){
    float frequency = mix(0.022, 0.058, uRoughness);
    return fbm(point * frequency + vec2(0.0, uTime * 0.018));
  }
  void main(){
    const float epsilon = 0.28;
    vec2 point = position.xy;
    float amplitude = mix(1.2, 5.4, uElevation);
    float height = terrain(point);
    float heightX = terrain(point + vec2(epsilon, 0.0));
    float heightZ = terrain(point + vec2(0.0, epsilon));
    vec3 displaced = vec3(point.x, height * amplitude - 0.6, point.y);
    vHeight = height;
    vNormal = normalize(vec3(
      (height - heightX) * amplitude,
      epsilon,
      (height - heightZ) * amplitude
    ));
    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    vDistance = max(0.0, -viewPosition.z);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uVisibility;
  varying float vHeight;
  varying vec3 vNormal;
  varying float vDistance;
  void main(){
    float terrainMix = smoothstep(-0.28, 0.62, vHeight);
    vec3 valley = vec3(0.038, 0.043, 0.042);
    vec3 peak = vec3(0.32, 0.39, 0.35);
    vec3 base = mix(valley, peak, terrainMix);
    vec3 lightDirection = normalize(vec3(-0.42, 0.84, 0.25));
    float diffuse = clamp(dot(normalize(vNormal), lightDirection), 0.0, 1.0);
    vec3 shaded = base * (0.34 + diffuse * 0.72);
    float fogFactor = 1.0 - exp(
      -uFogDensity * uFogDensity * vDistance * vDistance
    );
    vec3 color = mix(shaded, uFogColor, clamp(fogFactor, 0.0, 1.0));
    gl_FragColor = vec4(color, uVisibility * 0.88);
  }
`;

const CAMERA_DAMPING = 5.8;
const TREATMENT_DAMPING = 5.2;
const POINTER_DAMPING = 7.5;

interface TerrainUniforms {
  readonly [uniform: string]: THREE.IUniform;
  readonly uTime: THREE.IUniform<number>;
  readonly uElevation: THREE.IUniform<number>;
  readonly uRoughness: THREE.IUniform<number>;
  readonly uVisibility: THREE.IUniform<number>;
  readonly uFogColor: THREE.IUniform<THREE.Color>;
  readonly uFogDensity: THREE.IUniform<number>;
}

interface TerrainResources {
  readonly geometry: THREE.PlaneGeometry;
  readonly material: THREE.ShaderMaterial;
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
}

function createTerrainResources(
  tuning: ThreeSceneTuning,
  uniforms: TerrainUniforms,
): TerrainResources {
  const geometry = new THREE.PlaneGeometry(
    96,
    126,
    tuning.segmentX,
    tuning.segmentZ,
  );
  const material = new THREE.ShaderMaterial({
    depthWrite: true,
    fragmentShader: FRAG,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms,
    vertexShader: VERT(tuning.noiseOctaves),
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "atlas-shared-terrain";
  mesh.renderOrder = -1;

  return { geometry, material, mesh };
}

function disposeTerrainResources(resources: TerrainResources): void {
  resources.mesh.removeFromParent();
  resources.geometry.dispose();
  resources.material.dispose();
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const immersiveScrollSnapshotRef =
    useRef<ImmersiveScrollSnapshot | null>(null);
  const sceneWakeRef = useRef<(() => void) | null>(null);
  const storeImmersiveSnapshot = useCallback(
    (snapshot: ImmersiveScrollSnapshot) => {
      const previousSnapshot = immersiveScrollSnapshotRef.current;
      const shouldWake = shouldWakeScene(previousSnapshot, snapshot);
      immersiveScrollSnapshotRef.current = snapshot;
      if (shouldWake) {
        sceneWakeRef.current?.();
      }
    },
    [],
  );
  useImmersiveScroll(storeImmersiveSnapshot);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const nav = navigator as Navigator & { deviceMemory?: number };
    const initialReducedMotion = reducedMotionQuery.matches;
    const initialTuning = getThreeSceneTuning({
      deviceMemory: nav.deviceMemory,
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      isCoarsePointer: !finePointerQuery.matches,
      reducedMotion: initialReducedMotion,
      viewportWidth: window.innerWidth,
    });
    const initialProfile: ImmersiveProfile = initialReducedMotion
      ? "reduced"
      : window.innerWidth < 768
        ? "mobile"
        : "desktop";
    const initialSample = sampleImmersiveJourney(0, initialProfile);
    const isSceneInJourney = () =>
      immersiveScrollSnapshotRef.current?.inJourney ?? true;
    const isReducedMotion = () => {
      const profile = immersiveScrollSnapshotRef.current?.profile;
      return profile ? profile === "reduced" : initialReducedMotion;
    };
    const currentSample = () =>
      immersiveScrollSnapshotRef.current?.sample ?? initialSample;
    const syncJourneyState = () => {
      const nextState = journeyStateFor(isSceneInJourney());
      if (mount.dataset.journeyState !== nextState) {
        mount.dataset.journeyState = nextState;
      }
    };

    mount.dataset.sceneProfile = initialTuning.profile;
    syncJourneyState();
    sceneWakeRef.current = syncJourneyState;

    let renderer: THREE.WebGLRenderer | null = null;
    let webglReady = false;
    let warnedAboutWebgl = false;
    const markWebglUnavailable = (reason: unknown) => {
      webglReady = false;
      mount.dataset.webglState = "unavailable";
      if (!warnedAboutWebgl) {
        warnedAboutWebgl = true;
        console.warn(
          "WebGL background unavailable; using the static Atlas field.",
          reason,
        );
      }
    };

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: initialTuning.antialias,
        powerPreference:
          initialTuning.quality === "full" ? "high-performance" : "low-power",
      });
    } catch (error) {
      markWebglUnavailable(error);
      return () => {
        if (sceneWakeRef.current === syncJourneyState) {
          sceneWakeRef.current = null;
        }
      };
    }

    renderer.setClearColor(0x0a0a0b, 0);
    renderer.setPixelRatio(initialTuning.pixelRatio);
    renderer.setSize(
      Math.max(1, window.innerWidth),
      Math.max(1, window.innerHeight),
      false,
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.dataset.immersiveCanvas = "true";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);
    mount.dataset.webglState = "ready";
    webglReady = true;

    const scene = new THREE.Scene();
    const sceneFog = new THREE.FogExp2(
      initialSample.fog.color,
      initialSample.fog.density,
    );
    scene.fog = sceneFog;

    const camera = new THREE.PerspectiveCamera(
      initialSample.camera.fov,
      Math.max(1, window.innerWidth) / Math.max(1, window.innerHeight),
      0.1,
      220,
    );
    const cameraBasePosition = new THREE.Vector3(
      initialSample.camera.position.x,
      initialSample.camera.position.y,
      initialSample.camera.position.z,
    );
    const lookTarget = new THREE.Vector3(
      initialSample.camera.target.x,
      initialSample.camera.target.y,
      initialSample.camera.target.z,
    );
    const fogTarget = new THREE.Color(initialSample.fog.color);
    camera.position.copy(cameraBasePosition);
    camera.lookAt(lookTarget);

    const uniforms: TerrainUniforms = {
      uTime: { value: 5 },
      uElevation: { value: initialSample.terrain.elevation },
      uRoughness: { value: initialSample.terrain.roughness },
      uVisibility: { value: initialSample.terrain.visibility },
      uFogColor: { value: sceneFog.color },
      uFogDensity: { value: initialSample.fog.density },
    };
    let activeTuning = initialTuning;
    let terrainResources = createTerrainResources(initialTuning, uniforms);
    scene.add(terrainResources.mesh);

    let sceneGroups = createSceneGroups(initialTuning);
    scene.add(sceneGroups.root);
    const currentGroupWeights = createMutableSceneGroupWeights(
      initialSample.groups,
    );

    let finePointerAvailable = finePointerQuery.matches;
    let pointerListening = false;
    let mx = 0;
    let tx = 0;
    let my = 0;
    let ty = 0;
    const onPointer = (event: PointerEvent) => {
      const profile =
        immersiveScrollSnapshotRef.current?.profile ?? initialProfile;
      if (
        !finePointerAvailable ||
        isReducedMotion() ||
        profile === "mobile"
      ) {
        return;
      }
      mx = event.clientX / Math.max(1, window.innerWidth) - 0.5;
      my = event.clientY / Math.max(1, window.innerHeight) - 0.5;
    };

    const syncSceneResources = (nextTuning: ThreeSceneTuning): boolean => {
      if (
        !shouldRebuildSceneResources(
          activeTuning.profile,
          nextTuning.profile,
        )
      ) {
        return false;
      }

      sceneGroups.root.removeFromParent();
      sceneGroups.dispose();
      disposeTerrainResources(terrainResources);

      terrainResources = createTerrainResources(nextTuning, uniforms);
      scene.add(terrainResources.mesh);
      sceneGroups = createSceneGroups(nextTuning);
      scene.add(sceneGroups.root);
      activeTuning = nextTuning;
      mount.dataset.sceneProfile = nextTuning.profile;

      const sample = currentSample();
      sceneGroups.update(
        currentGroupWeights,
        uniforms.uTime.value,
        isReducedMotion()
          ? 0
          : motionScaleForTransition(
              sample.transition.toId,
              sample.transition.easedProgress,
            ),
      );
      return true;
    };

    const syncSceneQualityForViewport = (): boolean => {
      const nextTuning = getThreeSceneTuning({
        deviceMemory: nav.deviceMemory,
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency,
        isCoarsePointer: !finePointerAvailable,
        reducedMotion: isReducedMotion(),
        viewportWidth: window.innerWidth,
      });
      renderer.setPixelRatio(nextTuning.pixelRatio);
      return syncSceneResources(nextTuning);
    };

    const renderScene = () => {
      if (
        shouldRenderScene({
          inJourney: isSceneInJourney(),
          webglReady,
        })
      ) {
        renderer.render(scene, camera);
      }
    };

    const applySceneSample = (
      sample: ImmersiveSceneSample,
      deltaSeconds: number,
      immediate: boolean,
    ) => {
      if (immediate) {
        cameraBasePosition.set(
          sample.camera.position.x,
          sample.camera.position.y,
          sample.camera.position.z,
        );
        lookTarget.set(
          sample.camera.target.x,
          sample.camera.target.y,
          sample.camera.target.z,
        );
        camera.fov = sample.camera.fov;
        sceneFog.density = sample.fog.density;
        sceneFog.color.set(sample.fog.color);
        uniforms.uElevation.value = sample.terrain.elevation;
        uniforms.uRoughness.value = sample.terrain.roughness;
        uniforms.uVisibility.value = sample.terrain.visibility;
        uniforms.uFogDensity.value = sample.fog.density;
        copySceneGroupWeights(currentGroupWeights, sample.groups);
      } else {
        cameraBasePosition.x = THREE.MathUtils.damp(
          cameraBasePosition.x,
          sample.camera.position.x,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        cameraBasePosition.y = THREE.MathUtils.damp(
          cameraBasePosition.y,
          sample.camera.position.y,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        cameraBasePosition.z = THREE.MathUtils.damp(
          cameraBasePosition.z,
          sample.camera.position.z,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        lookTarget.x = THREE.MathUtils.damp(
          lookTarget.x,
          sample.camera.target.x,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        lookTarget.y = THREE.MathUtils.damp(
          lookTarget.y,
          sample.camera.target.y,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        lookTarget.z = THREE.MathUtils.damp(
          lookTarget.z,
          sample.camera.target.z,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        camera.fov = THREE.MathUtils.damp(
          camera.fov,
          sample.camera.fov,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        sceneFog.density = THREE.MathUtils.damp(
          sceneFog.density,
          sample.fog.density,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
        fogTarget.set(sample.fog.color);
        sceneFog.color.lerp(
          fogTarget,
          1 - Math.exp(-TREATMENT_DAMPING * deltaSeconds),
        );
        uniforms.uElevation.value = THREE.MathUtils.damp(
          uniforms.uElevation.value,
          sample.terrain.elevation,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
        uniforms.uRoughness.value = THREE.MathUtils.damp(
          uniforms.uRoughness.value,
          sample.terrain.roughness,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
        uniforms.uVisibility.value = THREE.MathUtils.damp(
          uniforms.uVisibility.value,
          sample.terrain.visibility,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
        uniforms.uFogDensity.value = THREE.MathUtils.damp(
          uniforms.uFogDensity.value,
          sample.fog.density,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
        dampSceneGroupWeights(
          currentGroupWeights,
          sample.groups,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
      }

      const motionScale = motionScaleForTransition(
        sample.transition.toId,
        sample.transition.easedProgress,
      );
      const pointerScale =
        !immediate && finePointerAvailable && sample.profile === "desktop"
          ? motionScale
          : 0;
      tx = immediate
        ? 0
        : THREE.MathUtils.damp(
            tx,
            mx * pointerScale,
            POINTER_DAMPING,
            deltaSeconds,
          );
      ty = immediate
        ? 0
        : THREE.MathUtils.damp(
            ty,
            my * pointerScale,
            POINTER_DAMPING,
            deltaSeconds,
          );
      camera.position.set(
        cameraBasePosition.x + tx * 0.9,
        cameraBasePosition.y - ty * 0.34,
        cameraBasePosition.z,
      );
      camera.lookAt(lookTarget);
      camera.updateProjectionMatrix();
      sceneGroups.update(
        currentGroupWeights,
        uniforms.uTime.value,
        immediate ? 0 : motionScale,
      );
    };

    let animationFrame = 0;
    let previousFrameTime: number | null = null;

    const renderStaticFrame = () => {
      const sample = currentSample();
      mx = 0;
      my = 0;
      tx = 0;
      ty = 0;
      previousFrameTime = null;
      applySceneSample(sample, 0, true);
      renderScene();
    };

    const renderAnimatedFrame = (frameTime: number) => {
      const deltaSeconds =
        previousFrameTime === null
          ? 1 / 60
          : Math.min(Math.max((frameTime - previousFrameTime) / 1000, 0), 0.1);
      previousFrameTime = frameTime;
      const sample = currentSample();
      uniforms.uTime.value +=
        deltaSeconds *
        motionScaleForTransition(
          sample.transition.toId,
          sample.transition.easedProgress,
        );
      applySceneSample(sample, deltaSeconds, false);
      renderScene();
    };

    const stopLoop = () => {
      previousFrameTime = null;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const loop = (frameTime: number) => {
      animationFrame = 0;
      if (
        !shouldAnimateScene({
          hidden: document.hidden,
          inJourney: isSceneInJourney(),
          reducedMotion: isReducedMotion(),
          webglReady,
        })
      ) {
        previousFrameTime = null;
        return;
      }
      renderAnimatedFrame(frameTime);
      animationFrame = window.requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (
        animationFrame ||
        !shouldAnimateScene({
          hidden: document.hidden,
          inJourney: isSceneInJourney(),
          reducedMotion: isReducedMotion(),
          webglReady,
        })
      ) {
        return;
      }
      animationFrame = window.requestAnimationFrame(loop);
    };

    const wakeScene = () => {
      syncJourneyState();
      syncSceneQualityForViewport();
      if (
        shouldAnimateScene({
          hidden: document.hidden,
          inJourney: isSceneInJourney(),
          reducedMotion: isReducedMotion(),
          webglReady,
        })
      ) {
        startLoop();
        return;
      }

      stopLoop();
      if (
        !document.hidden &&
        isReducedMotion() &&
        shouldRenderScene({ inJourney: isSceneInJourney(), webglReady })
      ) {
        renderStaticFrame();
      }
    };
    sceneWakeRef.current = wakeScene;

    const syncPointerListener = () => {
      finePointerAvailable = finePointerQuery.matches;
      if (finePointerAvailable && !pointerListening) {
        window.addEventListener("pointermove", onPointer, { passive: true });
        pointerListening = true;
      } else if (!finePointerAvailable && pointerListening) {
        window.removeEventListener("pointermove", onPointer);
        pointerListening = false;
        mx = 0;
        my = 0;
      }
    };
    const handleFinePointerChange = () => {
      finePointerAvailable = finePointerQuery.matches;
      syncSceneQualityForViewport();
      syncPointerListener();
    };
    syncPointerListener();
    finePointerQuery.addEventListener?.("change", handleFinePointerChange);

    const handleResize = () => {
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      const resizeTuning = getThreeSceneTuning({
        deviceMemory: nav.deviceMemory,
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency,
        isCoarsePointer: !finePointerAvailable,
        reducedMotion: isReducedMotion(),
        viewportWidth: width,
      });
      syncSceneResources(resizeTuning);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(resizeTuning.pixelRatio);
      renderer.setSize(width, height, false);

      if (!document.hidden && isSceneInJourney()) {
        if (isReducedMotion()) {
          renderStaticFrame();
        } else {
          renderScene();
        }
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        wakeScene();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      stopLoop();
      markWebglUnavailable("WebGL context lost");
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    renderStaticFrame();
    startLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (pointerListening) {
        window.removeEventListener("pointermove", onPointer);
      }
      finePointerQuery.removeEventListener?.("change", handleFinePointerChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        handleContextLost,
      );
      sceneWakeRef.current = null;
      webglReady = false;
      stopLoop();
      sceneGroups.root.removeFromParent();
      sceneGroups.dispose();
      disposeTerrainResources(terrainResources);
      renderer.dispose();
      renderer.forceContextLoss();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={styles.immersiveScene}
      data-journey-state="active"
      data-scene-profile="pending"
      data-webgl-state="pending"
    />
  );
}
