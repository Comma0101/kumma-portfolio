"use client";

import { useEffect } from "react";
import {
  CONVERSION_EVENT_CHANNEL,
  conversionEventNames,
} from "./conversionEvents";

type TrackingWindow = Window & {
  umami?: {
    track?: (event: string, data?: Record<string, string>) => void;
  };
  gtag?: (
    command: "event",
    name: string,
    params?: Record<string, string>,
  ) => void;
};

export default function ConversionListener() {
  useEffect(() => {
    const forward = (raw: Event) => {
      const detail = (raw as CustomEvent<unknown>).detail as
        | { event?: unknown; source?: unknown }
        | undefined;

      if (
        !detail ||
        typeof detail.event !== "string" ||
        typeof detail.source !== "string" ||
        !conversionEventNames.some((allowed) => allowed === detail.event)
      ) {
        return;
      }

      // Rebuild the payload so only the source ever leaves the page.
      const payload = { source: detail.source };
      const tracking = window as TrackingWindow;

      if (typeof tracking.umami?.track === "function") {
        tracking.umami.track(detail.event, payload);
        return;
      }
      if (typeof tracking.gtag === "function") {
        tracking.gtag("event", detail.event, payload);
      }
    };

    window.addEventListener(CONVERSION_EVENT_CHANNEL, forward);
    return () => window.removeEventListener(CONVERSION_EVENT_CHANNEL, forward);
  }, []);

  return null;
}
