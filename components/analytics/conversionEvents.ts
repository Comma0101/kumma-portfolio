export const conversionEventNames = [
  "project_start",
  "case_study_open",
  "demo_open",
  "contact_open",
  "mailto_submit",
] as const;

export type ConversionEventName = (typeof conversionEventNames)[number];

export interface ConversionEvent {
  readonly event: ConversionEventName;
  readonly source: string;
}

export const CONVERSION_EVENT_CHANNEL = "kumma:conversion";

export function createConversionEvent(
  name: ConversionEventName,
  payload: { readonly source: string },
): ConversionEvent {
  if (!conversionEventNames.some((allowed) => allowed === name)) {
    throw new Error(`Unknown conversion event "${String(name)}".`);
  }

  const source = payload?.source;
  if (typeof source !== "string" || source.trim().length === 0) {
    throw new Error(`Conversion event "${name}" requires a non-blank source.`);
  }

  return { event: name, source };
}

export interface ConversionTrackingTargets {
  readonly umami?: {
    readonly track?: (event: string, data?: Record<string, string>) => void;
  };
  readonly gtag?: (
    command: "event",
    name: string,
    params?: Record<string, string>,
  ) => void;
}

export function forwardConversionDetail(
  detail: unknown,
  tracking: ConversionTrackingTargets,
): "umami" | "gtag" | null {
  if (detail === null || typeof detail !== "object") return null;

  const candidate = detail as { event?: unknown; source?: unknown };
  if (
    typeof candidate.event !== "string" ||
    typeof candidate.source !== "string" ||
    !conversionEventNames.some((allowed) => allowed === candidate.event)
  ) {
    return null;
  }

  // Rebuild the payload so only the source ever reaches a vendor.
  const payload = { source: candidate.source };
  if (typeof tracking.umami?.track === "function") {
    tracking.umami.track(candidate.event, payload);
    return "umami";
  }
  if (typeof tracking.gtag === "function") {
    tracking.gtag("event", candidate.event, payload);
    return "gtag";
  }
  return null;
}

export function safeTrackConversion(
  name: ConversionEventName,
  source: string,
): boolean {
  try {
    dispatchConversionEvent(createConversionEvent(name, { source }));
    return true;
  } catch {
    // Analytics must never break navigation or the caller.
    return false;
  }
}

export function dispatchConversionEvent(event: ConversionEvent): void {
  if (
    typeof window === "undefined" ||
    typeof window.dispatchEvent !== "function" ||
    typeof CustomEvent !== "function"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ConversionEvent>(CONVERSION_EVENT_CHANNEL, {
      detail: event,
    }),
  );
}
