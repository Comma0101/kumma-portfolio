export interface ReducedMotionStateInput {
  hydrated: boolean;
  prefersReducedMotion: boolean | null;
}

export function resolveHydratedReducedMotion({
  hydrated,
  prefersReducedMotion,
}: ReducedMotionStateInput) {
  return !hydrated || prefersReducedMotion !== false;
}
