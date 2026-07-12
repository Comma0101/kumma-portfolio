"use client";

import { useEffect } from "react";
import {
  CONVERSION_EVENT_CHANNEL,
  forwardConversionDetail,
  type ConversionTrackingTargets,
} from "./conversionEvents";

export default function ConversionListener() {
  useEffect(() => {
    const forward = (raw: Event) => {
      forwardConversionDetail(
        (raw as CustomEvent<unknown>).detail,
        window as Window & ConversionTrackingTargets,
      );
    };

    window.addEventListener(CONVERSION_EVENT_CHANNEL, forward);
    return () => window.removeEventListener(CONVERSION_EVENT_CHANNEL, forward);
  }, []);

  return null;
}
