import type { WorkProject } from "./workProjects";

const legacyWorkRoutes = Object.freeze({
  kota: "/work/kota",
  archon: "/work/archon",
  audiobook: "/work/audiobook",
  robinhood: "/work/robinhood-dashboard",
  "robinhood-dashboard": "/work/robinhood-dashboard",
  "splash-ink": "/work/splash-ink",
  "spectral-world": "/work/spectral-world",
} as const satisfies Readonly<Record<string, WorkProject["href"]>>);

type LegacyWorkSlug = keyof typeof legacyWorkRoutes;

export const legacyWorkSlugs = Object.freeze(
  Object.keys(legacyWorkRoutes) as LegacyWorkSlug[],
);

export function resolveLegacyWorkHref(
  slug: string,
): WorkProject["href"] | null {
  if (!Object.prototype.hasOwnProperty.call(legacyWorkRoutes, slug)) {
    return null;
  }

  return legacyWorkRoutes[slug as LegacyWorkSlug];
}
