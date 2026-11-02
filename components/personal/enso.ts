import { anchor, threadX } from "./anchors";
import { ensoPath } from "./brush";
import { fitPoints, type Point } from "./pen";

// Where the open circle sits beside the sutra, in the host's pixels:
// beside the last column if there is room, beneath it on a phone; its
// opening toward the text.
export function ensoRing(host: HTMLElement) {
  const clause = anchor(host, "not-form");
  const seen = anchor(host, "seen");
  if (!clause || !seen) return null;
  const radius = Math.max(seen.width * 1.05, 46);
  const gap = seen.width * 0.45;
  const room = seen.x - gap - radius * 2 > threadX(host) + 24;
  const cx = room ? seen.x - gap - radius : seen.x + seen.width / 2;
  const cy = room ? clause.y + clause.height * 0.5 : seen.y + seen.height + gap + radius;
  const ring: Point[] = fitPoints(
    ensoPath({ seed: 33, facing: room ? 0 : -Math.PI / 2 }),
    { x: cx - radius, y: cy - radius * 1.08, width: radius * 2, height: radius * 2.16 },
  );
  // The line runs along just under it: the circle sits in its corner.
  return { ring, cx, cy, radius, below: cy + radius * 1.1 + 10 };
}
