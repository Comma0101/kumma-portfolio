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
