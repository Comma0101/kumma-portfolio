export const PAGE_TRANSITION_SECONDS = 0.35;

export const scrollBehaviorForMotion = (prefersReducedMotion: boolean) =>
  prefersReducedMotion ? "auto" : "smooth";

interface NavigationIntent {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  target: string;
  download: boolean;
}

export const shouldAnimateNavigation = ({
  button,
  metaKey,
  ctrlKey,
  shiftKey,
  altKey,
  target,
  download,
}: NavigationIntent) =>
  button === 0 &&
  !metaKey &&
  !ctrlKey &&
  !shiftKey &&
  !altKey &&
  target !== "_blank" &&
  !download;

export const nextFocusIndex = (
  currentIndex: number,
  length: number,
  shiftKey: boolean,
) => {
  if (length === 0) return -1;
  if (currentIndex === -1) return shiftKey ? length - 1 : 0;
  return (currentIndex + (shiftKey ? -1 : 1) + length) % length;
};

const withoutTrailingSlashes = (route: string) =>
  route.startsWith("/") ? route.replace(/\/+$/, "") || "/" : route;

export const shouldRestoreMenuFocus = (pathname: string, href: string) =>
  withoutTrailingSlashes(pathname) === withoutTrailingSlashes(href) ||
  (pathname === "/" && href.startsWith("#"));

// React 18 only forwards this native boolean attribute when given a string.
export const inertAttribute = (enabled: boolean) =>
  enabled ? { inert: "" as never } : {};
