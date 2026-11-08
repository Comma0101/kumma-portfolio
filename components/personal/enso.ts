import { anchor, threadX } from "./anchors";
import { ensoPath } from "./brush";
import { fitPoints, type Point } from "./pen";

// Where the open circle sits beside the sutra, in the host's pixels:
// beside the last column if there is room, beneath it on a phone; its
// opening toward the text.
export function ensoRing(host: HTMLElement) {
  const field = anchor(host, "reflection-field");
  if (field) {
    const radius = Math.min(field.width, field.height) * 0.43;
    const cx = field.x + field.width / 2;
    const cy = field.y + field.height / 2;
    const ring: Point[] = fitPoints(
      ensoPath({ seed: 33, facing: -Math.PI / 6 }),
      {
        x: field.x + field.width * 0.07,
        y: field.y + field.height * 0.05,
        width: field.width * 0.86,
        height: field.height * 0.9,
      },
    );
    return { ring, cx, cy, radius, below: field.y + field.height + 10 };
  }

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
