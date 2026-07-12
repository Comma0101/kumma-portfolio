"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  safeTrackConversion,
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
        safeTrackConversion(event, source);
        onClick?.(clickEvent);
      }}
    >
      {children}
    </Link>
  );
}
