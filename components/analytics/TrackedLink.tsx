"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  createConversionEvent,
  dispatchConversionEvent,
  type ConversionEventName,
} from "./conversionEvents";

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  event: ConversionEventName;
  source: string;
}

export default function TrackedLink({
  event,
  source,
  onClick,
  children,
  ...linkProps
}: TrackedLinkProps) {
  return (
    <Link
      {...linkProps}
      onClick={(clickEvent) => {
        try {
          dispatchConversionEvent(createConversionEvent(event, { source }));
        } catch {
          // Analytics must never break navigation.
        }
        onClick?.(clickEvent);
      }}
    >
      {children}
    </Link>
  );
}
