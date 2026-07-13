import { clamp01, immersiveStageIds } from "./immersiveStages";
import type { ImmersiveStageId } from "./types";

export const JOURNEY_ENTRY_VIEWPORT_RATIO = 0.82;
export const JOURNEY_SETTLE_VIEWPORT_RATIO = 0.42;
export const JOURNEY_EXIT_VIEWPORT_RATIO = 0.25;
export const FACILITY_ROUTE_VIEWPORT_RATIO = 0.5;

const MAX_GEOMETRY_VALUE = Number.MAX_SAFE_INTEGER / 4;

export interface SectionRect {
  readonly top: number;
  readonly height: number;
}

export interface ImmersiveAnchorRect extends SectionRect {
  readonly id: string;
}

export interface JourneyTransitionWindow {
  readonly start: number;
  readonly end: number;
}

export type JourneyPhase =
  | "invalid"
  | "before"
  | "hold"
  | "transition"
  | "after";

export interface JourneyResolution {
  readonly valid: boolean;
  readonly inJourney: boolean;
  readonly journeyProgress: number;
  readonly localProgress: number;
  readonly intervalIndex: number;
  readonly fromId: ImmersiveStageId;
  readonly toId: ImmersiveStageId;
  readonly activeStageId: ImmersiveStageId;
  readonly phase: JourneyPhase;
}

function normalizeGeometry(value: number): number {
  if (Number.isNaN(value) || value <= 0) {
    return 0;
  }

  if (value === Number.POSITIVE_INFINITY) {
    return MAX_GEOMETRY_VALUE;
  }

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(value, MAX_GEOMETRY_VALUE);
}

function normalizeViewportHeight(value: number): number {
  const normalized = normalizeGeometry(value);
  return normalized > 0 ? normalized : 1;
}

function safeAdd(left: number, right: number): number {
  return Math.min(MAX_GEOMETRY_VALUE, left + right);
}

function progressAcross(value: number, start: number, end: number): number {
  if (value <= start) {
    return 0;
  }

  if (value >= end) {
    return 1;
  }

  const distance = end - start;
  if (!Number.isFinite(distance) || distance <= 0) {
    return value < end ? 0 : 1;
  }

  return clamp01((value - start) / distance);
}

export function transitionWindowForAnchor(
  anchor: SectionRect,
  viewportHeight: number,
): JourneyTransitionWindow {
  const top = normalizeGeometry(anchor.top);
  const viewport = normalizeViewportHeight(viewportHeight);
  const start = Math.max(
    0,
    top - viewport * JOURNEY_ENTRY_VIEWPORT_RATIO,
  );
  const end = Math.max(
    start,
    top - viewport * JOURNEY_SETTLE_VIEWPORT_RATIO,
  );

  return { start, end };
}

export function sectionProgress(
  rect: SectionRect,
  scrollY: number,
  viewportHeight: number,
): number {
  const top = normalizeGeometry(rect.top);
  const height = normalizeGeometry(rect.height);
  const viewport = normalizeViewportHeight(viewportHeight);
  const scroll = normalizeGeometry(scrollY);
  const start = Math.max(
    0,
    top - viewport * JOURNEY_ENTRY_VIEWPORT_RATIO,
  );
  const end = Math.max(
    start,
    safeAdd(top, height) - viewport * JOURNEY_SETTLE_VIEWPORT_RATIO,
  );

  return progressAcross(scroll, start, end);
}

export function validateImmersiveAnchorOrder(
  anchors: readonly ImmersiveAnchorRect[],
): boolean {
  return (
    anchors.length === immersiveStageIds.length &&
    anchors.every((anchor, index) => anchor.id === immersiveStageIds[index])
  );
}

function invalidResolution(): JourneyResolution {
  return {
    valid: false,
    inJourney: false,
    journeyProgress: 0,
    localProgress: 0,
    intervalIndex: 0,
    fromId: immersiveStageIds[0],
    toId: immersiveStageIds[1],
    activeStageId: immersiveStageIds[0],
    phase: "invalid",
  };
}

function makeResolution({
  inJourney,
  intervalIndex,
  localProgress,
  phase,
}: {
  readonly inJourney: boolean;
  readonly intervalIndex: number;
  readonly localProgress: number;
  readonly phase: JourneyPhase;
}): JourneyResolution {
  const lastIntervalIndex = immersiveStageIds.length - 2;
  const safeIntervalIndex = Math.min(
    Math.max(0, intervalIndex),
    lastIntervalIndex,
  );
  const safeLocalProgress = clamp01(localProgress);
  const fromId = immersiveStageIds[safeIntervalIndex];
  const toId = immersiveStageIds[safeIntervalIndex + 1];
  const journeyProgress = clamp01(
    (safeIntervalIndex + safeLocalProgress) /
      (immersiveStageIds.length - 1),
  );

  return {
    valid: true,
    inJourney,
    journeyProgress,
    localProgress: safeLocalProgress,
    intervalIndex: safeIntervalIndex,
    fromId,
    toId,
    activeStageId: safeLocalProgress < 0.5 ? fromId : toId,
    phase,
  };
}

export function resolveJourneyState(
  anchors: readonly ImmersiveAnchorRect[],
  scrollY: number,
  viewportHeight: number,
): JourneyResolution {
  if (!validateImmersiveAnchorOrder(anchors)) {
    return invalidResolution();
  }

  const viewport = normalizeViewportHeight(viewportHeight);
  const scroll = normalizeGeometry(scrollY);
  const normalizedAnchors = anchors.reduce<SectionRect[]>((result, anchor) => {
    const previousTop = result.at(-1)?.top ?? 0;
    result.push({
      top: Math.max(previousTop, normalizeGeometry(anchor.top)),
      height: normalizeGeometry(anchor.height),
    });
    return result;
  }, []);
  const firstAnchor = normalizedAnchors[0];
  const lastAnchor = normalizedAnchors.at(-1) ?? firstAnchor;
  const journeyStart = Math.max(0, firstAnchor.top - viewport);
  let finalTransitionEnd = 0;
  for (
    let intervalIndex = 0;
    intervalIndex < immersiveStageIds.length - 1;
    intervalIndex += 1
  ) {
    const desiredWindow = transitionWindowForAnchor(
      normalizedAnchors[intervalIndex + 1],
      viewport,
    );
    const start = Math.max(finalTransitionEnd, desiredWindow.start);
    finalTransitionEnd = Math.max(start, desiredWindow.end);
  }
  const finalAnchorBottom = safeAdd(lastAnchor.top, lastAnchor.height);
  const footerTopExitLine =
    viewport * (1 - JOURNEY_EXIT_VIEWPORT_RATIO);
  const journeyEnd = Math.max(
    finalTransitionEnd,
    finalAnchorBottom - footerTopExitLine,
  );
  const inJourney = scroll >= journeyStart && scroll <= journeyEnd;

  let previousTransitionEnd = 0;

  for (let intervalIndex = 0; intervalIndex < immersiveStageIds.length - 1; intervalIndex += 1) {
    const desiredWindow = transitionWindowForAnchor(
      normalizedAnchors[intervalIndex + 1],
      viewport,
    );
    const start = Math.max(previousTransitionEnd, desiredWindow.start);
    const end = Math.max(start, desiredWindow.end);

    if (scroll < start) {
      return makeResolution({
        inJourney,
        intervalIndex: Math.max(0, intervalIndex - 1),
        localProgress: intervalIndex === 0 ? 0 : 1,
        phase: scroll < journeyStart ? "before" : "hold",
      });
    }

    if (scroll < end) {
      return makeResolution({
        inJourney,
        intervalIndex,
        localProgress: progressAcross(scroll, start, end),
        phase: "transition",
      });
    }

    previousTransitionEnd = end;
  }

  return makeResolution({
    inJourney,
    intervalIndex: immersiveStageIds.length - 2,
    localProgress: 1,
    phase: scroll > journeyEnd ? "after" : "hold",
  });
}

export function resolveJourneyProgress(
  anchors: readonly ImmersiveAnchorRect[],
  scrollY: number,
  viewportHeight: number,
): number {
  return resolveJourneyState(anchors, scrollY, viewportHeight).journeyProgress;
}

export function resolveFacilityRouteProgress(
  anchors: readonly ImmersiveAnchorRect[],
  scrollY: number,
  viewportHeight: number,
): number {
  if (!validateImmersiveAnchorOrder(anchors)) return 0;

  const viewport = normalizeViewportHeight(viewportHeight);
  const scroll = normalizeGeometry(scrollY);
  const triggerLines = anchors.reduce<number[]>((result, anchor) => {
    const previous = result.at(-1) ?? 0;
    const desired = Math.max(
      0,
      normalizeGeometry(anchor.top) -
        viewport * FACILITY_ROUTE_VIEWPORT_RATIO,
    );
    result.push(Math.max(previous, desired));
    return result;
  }, []);

  if (scroll <= triggerLines[0]) return 0;

  const intervalCount = triggerLines.length - 1;
  for (let index = 0; index < intervalCount; index += 1) {
    const start = triggerLines[index];
    const end = Math.max(start, triggerLines[index + 1]);
    if (scroll < end) {
      return clamp01((index + progressAcross(scroll, start, end)) / intervalCount);
    }
  }

  return 1;
}
