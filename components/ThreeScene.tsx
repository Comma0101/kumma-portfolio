"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "../styles/home.module.css";
import {
  FACILITY_CAMERA_FAR_PLANES,
  sampleFacilityCamera,
} from "./immersive/facility/cameraPath";
import {
  createFacilityWorld,
  type FacilityWorld,
} from "./immersive/facility/createFacilityWorld";
import { sampleFacilityNarrative } from "./immersive/facility/narrative";
import {
  nextFrameSettlement,
  nextMotionEnergy,
} from "./immersive/facility/motionEnergy";
import {
  createFacilityTerrain,
  createFacilityTerrainUniforms,
  type FacilityTerrainResources,
  type FacilityTerrainUniforms,
} from "./immersive/facility/terrain";
import type {
  FacilityCameraSample,
  FacilityNarrativeSample,
} from "./immersive/facility/types";
import { swapResourceCandidate } from "./immersive/resourceTransaction";
import {
  journeyStateFor,
  shouldAnimateScene,
  shouldRebuildSceneResources,
  shouldRenderScene,
} from "./immersive/sceneLifecycle";
import type { ImmersiveProfile } from "./immersive/types";
import {
  useImmersiveScroll,
  type ImmersiveScrollSnapshot,
} from "./immersive/useImmersiveScroll";
import {
  getThreeSceneTuning,
  isSoftwareRendererLabel,
  type ThreeSceneTuning,
} from "./threeSceneTuning";

const CAMERA_DAMPING = 7.2;
const TREATMENT_DAMPING = 5.4;
const POINTER_DAMPING = 8.5;
const TERRAIN_ELEVATION = 0.68;
const TERRAIN_ROUGHNESS = 0.72;

interface SceneWorldResources {
  readonly terrain: FacilityTerrainResources;
  readonly facility: FacilityWorld;
  readonly tuning: ThreeSceneTuning;
}

function shouldWakeScene(
  previous: ImmersiveScrollSnapshot | null,
  next: ImmersiveScrollSnapshot,
): boolean {
  return (
    previous === null ||
    previous.profile !== next.profile ||
    previous.routeProgress !== next.routeProgress ||
    previous.activeStageId !== next.activeStageId ||
    previous.inJourney !== next.inJourney ||
    previous.anchorsValid !== next.anchorsValid
  );
}

function createSceneWorldResources(
  tuning: ThreeSceneTuning,
  uniforms: FacilityTerrainUniforms,
): SceneWorldResources {
  const terrain = createFacilityTerrain(tuning, uniforms);

  try {
    return {
      terrain,
      facility: createFacilityWorld(tuning),
      tuning,
    };
  } catch (error) {
    terrain.dispose();
    throw error;
  }
}

function attachSceneWorldResources(
  scene: THREE.Scene,
  resources: SceneWorldResources,
): void {
  scene.add(resources.terrain.mesh, resources.facility.root);
}

function detachSceneWorldResources(resources: SceneWorldResources): void {
  resources.terrain.mesh.removeFromParent();
  resources.facility.root.removeFromParent();
}

function retireContextLostSceneWorld(resources: SceneWorldResources): void {
  // The browser already destroyed these GPU handles. Disposing them against the
  // restored context would target stale handles, so detach and let them be GC'd.
  detachSceneWorldResources(resources);
}

function disposeSceneWorldResources(resources: SceneWorldResources): void {
  detachSceneWorldResources(resources);
  resources.facility.dispose();
  resources.terrain.dispose();
}

function disposeRendererResources(
  renderer: THREE.WebGLRenderer,
  mount: HTMLDivElement,
): void {
  renderer.dispose();
  renderer.forceContextLoss();
  if (mount.contains(renderer.domElement)) {
    mount.removeChild(renderer.domElement);
  }
}

function immersiveProfileForViewport(
  reducedMotion: boolean,
  width: number,
): ImmersiveProfile {
  if (reducedMotion) return "reduced";
  return width < 768 ? "mobile" : "desktop";
}

function rendererUsesSoftwareRasterizer(
  renderer: THREE.WebGLRenderer,
): boolean {
  const context = renderer.getContext();
  const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
  const rendererLabel = debugInfo
    ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : context.getParameter(context.RENDERER);
  return isSoftwareRendererLabel(rendererLabel);
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
      const mount = mountRef.current;
      if (mount) {
        mount.dataset.activeStage = snapshot.activeStageId;
        mount.dataset.facilityZone = snapshot.sample.zone;
        mount.dataset.facilityEvent = snapshot.sample.event.id;
        mount.dataset.routeProgress = snapshot.routeProgress.toFixed(4);
      }
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
    const initialProfile = immersiveProfileForViewport(
      initialReducedMotion,
      window.innerWidth,
    );
    const requestedTuning = getThreeSceneTuning({
      deviceMemory: nav.deviceMemory,
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      isCoarsePointer: !finePointerQuery.matches,
      reducedMotion: initialReducedMotion,
      viewportWidth: window.innerWidth,
    });
    const initialNarrative = sampleFacilityNarrative(0, initialProfile);
    const initialCamera = sampleFacilityCamera(0, initialProfile);
    const isSceneInJourney = () =>
      immersiveScrollSnapshotRef.current?.inJourney ?? true;
    const isReducedMotion = () => {
      const profile = immersiveScrollSnapshotRef.current?.profile;
      return profile ? profile === "reduced" : initialReducedMotion;
    };
    const currentProfile = () =>
      immersiveScrollSnapshotRef.current?.profile ?? initialProfile;
    const currentRouteProgress = () =>
      immersiveScrollSnapshotRef.current?.routeProgress ?? 0;
    const currentNarrative = () =>
      immersiveScrollSnapshotRef.current?.sample ?? initialNarrative;
    const currentCamera = () =>
      sampleFacilityCamera(currentRouteProgress(), currentProfile());
    const syncJourneyState = () => {
      const nextState = journeyStateFor(isSceneInJourney());
      if (mount.dataset.journeyState !== nextState) {
        mount.dataset.journeyState = nextState;
      }
    };

    mount.dataset.sceneProfile = requestedTuning.profile;
    mount.dataset.drawCallTarget = String(
      requestedTuning.facilityBudgets.drawCallTarget,
    );
    syncJourneyState();
    sceneWakeRef.current = syncJourneyState;

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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: requestedTuning.antialias,
        powerPreference:
          requestedTuning.quality === "full"
            ? "high-performance"
            : "low-power",
      });
    } catch (error) {
      markWebglUnavailable(error);
      return () => {
        if (sceneWakeRef.current === syncJourneyState) {
          sceneWakeRef.current = null;
        }
      };
    }

    const softwareRenderer = rendererUsesSoftwareRasterizer(renderer);
    const initialTuning = getThreeSceneTuning({
      deviceMemory: nav.deviceMemory,
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      isCoarsePointer: !finePointerQuery.matches,
      isSoftwareRenderer: softwareRenderer,
      reducedMotion: initialReducedMotion,
      viewportWidth: window.innerWidth,
    });
    mount.dataset.rendererClass = softwareRenderer ? "software" : "hardware";
    mount.dataset.sceneProfile = initialTuning.profile;
    mount.dataset.drawCallTarget = String(
      initialTuning.facilityBudgets.drawCallTarget,
    );

    renderer.setClearColor(0x0a0a0b, 0);
    renderer.setPixelRatio(initialTuning.pixelRatio);
    renderer.setSize(
      Math.max(1, window.innerWidth),
      Math.max(1, window.innerHeight),
      false,
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = initialNarrative.atmosphere.exposure;
    renderer.domElement.dataset.immersiveCanvas = "true";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const sceneFog = new THREE.FogExp2(
      initialNarrative.atmosphere.fogColor,
      initialNarrative.atmosphere.fogDensity,
    );
    scene.fog = sceneFog;

    const camera = new THREE.PerspectiveCamera(
      initialCamera.fov,
      Math.max(1, window.innerWidth) / Math.max(1, window.innerHeight),
      0.1,
      FACILITY_CAMERA_FAR_PLANES[initialTuning.profile],
    );
    const cameraBasePosition = new THREE.Vector3(
      initialCamera.position.x,
      initialCamera.position.y,
      initialCamera.position.z,
    );
    const lookTarget = new THREE.Vector3(
      initialCamera.target.x,
      initialCamera.target.y,
      initialCamera.target.z,
    );
    const fogTarget = new THREE.Color(initialNarrative.atmosphere.fogColor);
    let cameraRoll = initialCamera.roll;
    camera.position.copy(cameraBasePosition);
    camera.lookAt(lookTarget);
    camera.rotateZ(cameraRoll);

    const uniforms = createFacilityTerrainUniforms({
      elevation: TERRAIN_ELEVATION,
      roughness: TERRAIN_ROUGHNESS,
      visibility: 1,
      fogColor: sceneFog.color,
      fogDensity: initialNarrative.atmosphere.fogDensity,
      carveStrength: 1,
    });

    let initialWorldResources: SceneWorldResources;
    try {
      initialWorldResources = createSceneWorldResources(
        initialTuning,
        uniforms,
      );
    } catch (error) {
      disposeRendererResources(renderer, mount);
      markWebglUnavailable(error);
      return () => {
        if (sceneWakeRef.current === syncJourneyState) {
          sceneWakeRef.current = null;
        }
      };
    }

    let liveWorldResources = initialWorldResources;
    let activeTuning = initialTuning;
    let facilityWorld = liveWorldResources.facility;
    attachSceneWorldResources(scene, liveWorldResources);
    mount.appendChild(renderer.domElement);
    mount.dataset.webglState = "ready";
    webglReady = true;

    let finePointerAvailable = finePointerQuery.matches;
    let pointerListening = false;
    let mx = 0;
    let tx = 0;
    let my = 0;
    let ty = 0;
    const onPointer = (event: PointerEvent) => {
      const sample = currentNarrative();
      const profile = currentProfile();
      if (
        !finePointerAvailable ||
        isReducedMotion() ||
        profile === "mobile" ||
        sample.zone !== "exterior-ridge"
      ) {
        return;
      }
      mx = event.clientX / Math.max(1, window.innerWidth) - 0.5;
      my = event.clientY / Math.max(1, window.innerHeight) - 0.5;
      sceneWakeRef.current?.();
    };

    let elapsedSeconds = 0;
    let lastAppliedRouteProgress = currentRouteProgress();
    let motionEnergy = 0;
    let stableFrameCount = 0;
    let warnedAboutResourceSwap = false;
    const createPreparedSceneWorldResources = (
      nextTuning: ThreeSceneTuning,
    ): SceneWorldResources => {
      const candidate = createSceneWorldResources(nextTuning, uniforms);
      try {
        candidate.facility.update(currentNarrative(), elapsedSeconds, 0);
        return candidate;
      } catch (error) {
        disposeSceneWorldResources(candidate);
        throw error;
      }
    };
    const warnAboutResourceSwap = (error: unknown) => {
      if (warnedAboutResourceSwap) return;
      warnedAboutResourceSwap = true;
      console.warn(
        "Immersive scene quality change failed; keeping the current world.",
        error,
      );
    };

    const adoptWorldResources = (
      resources: SceneWorldResources,
      nextTuning: ThreeSceneTuning,
    ) => {
      liveWorldResources = resources;
      facilityWorld = resources.facility;
      activeTuning = nextTuning;
      mount.dataset.sceneProfile = nextTuning.profile;
      camera.far = FACILITY_CAMERA_FAR_PLANES[nextTuning.profile];
      camera.updateProjectionMatrix();
      mount.dataset.drawCallTarget = String(
        nextTuning.facilityBudgets.drawCallTarget,
      );
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

      const swapResult = swapResourceCandidate(liveWorldResources, {
        createCandidate: () => createPreparedSceneWorldResources(nextTuning),
        attachCandidate: (candidate) =>
          attachSceneWorldResources(scene, candidate),
        detachCurrent: detachSceneWorldResources,
        disposeResource: disposeSceneWorldResources,
      });

      if (!swapResult.replaced) {
        warnAboutResourceSwap(swapResult.error);
        return false;
      }

      adoptWorldResources(swapResult.current, nextTuning);
      return true;
    };

    const rebuildSceneResourcesAfterContextRestore = (
      nextTuning: ThreeSceneTuning,
    ): boolean => {
      const swapResult = swapResourceCandidate(liveWorldResources, {
        createCandidate: () => createPreparedSceneWorldResources(nextTuning),
        attachCandidate: (candidate) =>
          attachSceneWorldResources(scene, candidate),
        detachCurrent: detachSceneWorldResources,
        disposeResource: disposeSceneWorldResources,
        retireCurrent: retireContextLostSceneWorld,
      });

      if (!swapResult.replaced) {
        warnAboutResourceSwap(swapResult.error);
        return false;
      }

      adoptWorldResources(swapResult.current, nextTuning);
      return true;
    };

    const syncSceneQualityForViewport = (): boolean => {
      const nextTuning = getThreeSceneTuning({
        deviceMemory: nav.deviceMemory,
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency,
        isCoarsePointer: !finePointerAvailable,
        isSoftwareRenderer: softwareRenderer,
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
        const renderInfo = renderer.info.render;
        mount.dataset.renderCalls = String(renderInfo.calls);
        mount.dataset.renderTriangles = String(renderInfo.triangles);
        mount.dataset.renderPoints = String(renderInfo.points);
        mount.dataset.renderLines = String(renderInfo.lines);
      }
    };

    const applyFacilitySample = (
      narrative: FacilityNarrativeSample,
      cameraSample: FacilityCameraSample,
      deltaSeconds: number,
      immediate: boolean,
    ): { readonly maxError: number; readonly motionEnergy: number } => {
      if (immediate) {
        cameraBasePosition.set(
          cameraSample.position.x,
          cameraSample.position.y,
          cameraSample.position.z,
        );
        lookTarget.set(
          cameraSample.target.x,
          cameraSample.target.y,
          cameraSample.target.z,
        );
        camera.fov = cameraSample.fov;
        cameraRoll = cameraSample.roll;
        sceneFog.density = narrative.atmosphere.fogDensity;
        sceneFog.color.set(narrative.atmosphere.fogColor);
        uniforms.uFogDensity.value = narrative.atmosphere.fogDensity;
        renderer.toneMappingExposure = narrative.atmosphere.exposure;
      } else {
        cameraBasePosition.x = THREE.MathUtils.damp(
          cameraBasePosition.x,
          cameraSample.position.x,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        cameraBasePosition.y = THREE.MathUtils.damp(
          cameraBasePosition.y,
          cameraSample.position.y,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        cameraBasePosition.z = THREE.MathUtils.damp(
          cameraBasePosition.z,
          cameraSample.position.z,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        lookTarget.x = THREE.MathUtils.damp(
          lookTarget.x,
          cameraSample.target.x,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        lookTarget.y = THREE.MathUtils.damp(
          lookTarget.y,
          cameraSample.target.y,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        lookTarget.z = THREE.MathUtils.damp(
          lookTarget.z,
          cameraSample.target.z,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        camera.fov = THREE.MathUtils.damp(
          camera.fov,
          cameraSample.fov,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        cameraRoll = THREE.MathUtils.damp(
          cameraRoll,
          cameraSample.roll,
          CAMERA_DAMPING,
          deltaSeconds,
        );
        sceneFog.density = THREE.MathUtils.damp(
          sceneFog.density,
          narrative.atmosphere.fogDensity,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
        fogTarget.set(narrative.atmosphere.fogColor);
        sceneFog.color.lerp(
          fogTarget,
          1 - Math.exp(-TREATMENT_DAMPING * deltaSeconds),
        );
        uniforms.uFogDensity.value = THREE.MathUtils.damp(
          uniforms.uFogDensity.value,
          narrative.atmosphere.fogDensity,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
        renderer.toneMappingExposure = THREE.MathUtils.damp(
          renderer.toneMappingExposure,
          narrative.atmosphere.exposure,
          TREATMENT_DAMPING,
          deltaSeconds,
        );
      }

      motionEnergy = immediate
        ? 0
        : nextMotionEnergy({
            active: isSceneInJourney() && webglReady,
            hidden: document.hidden,
            reducedMotion: isReducedMotion(),
            previousEnergy: motionEnergy,
            previousProgress: lastAppliedRouteProgress,
            nextProgress: narrative.routeProgress,
            deltaSeconds,
          });
      const pointerScale =
        !immediate &&
        finePointerAvailable &&
        narrative.profile === "desktop" &&
        narrative.zone === "exterior-ridge"
          ? 1 - Math.min(1, narrative.routeProgress / 0.16)
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
        cameraBasePosition.x + tx * 0.55,
        cameraBasePosition.y - ty * 0.22,
        cameraBasePosition.z,
      );
      camera.lookAt(lookTarget);
      camera.rotateZ(cameraRoll);
      camera.updateProjectionMatrix();
      facilityWorld.update(
        narrative,
        elapsedSeconds,
        motionEnergy,
      );
      lastAppliedRouteProgress = narrative.routeProgress;
      const maxError = immediate
        ? 0
        : Math.max(
            Math.hypot(
              cameraSample.position.x - cameraBasePosition.x,
              cameraSample.position.y - cameraBasePosition.y,
              cameraSample.position.z - cameraBasePosition.z,
            ),
            Math.hypot(
              cameraSample.target.x - lookTarget.x,
              cameraSample.target.y - lookTarget.y,
              cameraSample.target.z - lookTarget.z,
            ),
            Math.abs(cameraSample.fov - camera.fov) * 0.05,
            Math.abs(cameraSample.roll - cameraRoll) * 8,
            Math.abs(
              narrative.atmosphere.fogDensity - sceneFog.density,
            ) * 24,
            Math.hypot(
              sceneFog.color.r - fogTarget.r,
              sceneFog.color.g - fogTarget.g,
              sceneFog.color.b - fogTarget.b,
            ),
            Math.abs(
              narrative.atmosphere.exposure - renderer.toneMappingExposure,
            ),
            Math.abs(tx - mx * pointerScale),
            Math.abs(ty - my * pointerScale),
          );
      return { maxError, motionEnergy };
    };

    let animationFrame = 0;
    let previousFrameTime: number | null = null;

    const renderStaticFrame = () => {
      const narrative = currentNarrative();
      const cameraSample = currentCamera();
      mx = 0;
      my = 0;
      tx = 0;
      ty = 0;
      previousFrameTime = null;
      applyFacilitySample(narrative, cameraSample, 0, true);
      renderScene();
      mount.dataset.frameState = "static";
    };

    const renderAnimatedFrame = (frameTime: number) => {
      const deltaSeconds =
        previousFrameTime === null
          ? 1 / 60
          : Math.min(Math.max((frameTime - previousFrameTime) / 1000, 0), 0.1);
      previousFrameTime = frameTime;
      elapsedSeconds += deltaSeconds;
      const narrative = currentNarrative();
      const cameraSample = currentCamera();
      const frameState = applyFacilitySample(narrative, cameraSample, deltaSeconds, false);
      renderScene();
      return frameState;
    };

    const stopLoop = (frameState: "settled" | "suspended" = "suspended") => {
      previousFrameTime = null;
      motionEnergy = 0;
      stableFrameCount = 0;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      mount.dataset.frameState = frameState;
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
        stopLoop("suspended");
        return;
      }
      const frameState = renderAnimatedFrame(frameTime);
      const settlement = nextFrameSettlement({
        eligible: true,
        maxError: frameState.maxError,
        motionEnergy: frameState.motionEnergy,
        stableFrames: stableFrameCount,
      });
      stableFrameCount = settlement.stableFrames;
      if (settlement.shouldContinue) {
        animationFrame = window.requestAnimationFrame(loop);
      } else {
        renderStaticFrame();
        stopLoop("settled");
      }
    };

    const startLoop = () => {
      stableFrameCount = 0;
      mount.dataset.frameState = "running";
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
        isSoftwareRenderer: softwareRenderer,
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
          startLoop();
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
    const handleContextRestored = () => {
      const restoredTuning = getThreeSceneTuning({
        deviceMemory: nav.deviceMemory,
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency,
        isCoarsePointer: !finePointerAvailable,
        isSoftwareRenderer: softwareRenderer,
        reducedMotion: isReducedMotion(),
        viewportWidth: window.innerWidth,
      });
      if (!rebuildSceneResourcesAfterContextRestore(restoredTuning)) {
        markWebglUnavailable("WebGL restoration resource rebuild failed");
        return;
      }

      webglReady = true;
      mount.dataset.webglState = "ready";
      syncSceneQualityForViewport();

      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderStaticFrame();
      wakeScene();
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
    );

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
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        handleContextRestored,
      );
      sceneWakeRef.current = null;
      webglReady = false;
      stopLoop();
      disposeSceneWorldResources(liveWorldResources);
      disposeRendererResources(renderer, mount);
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
