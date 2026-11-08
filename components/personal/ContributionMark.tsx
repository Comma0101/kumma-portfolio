"use client";

import { useContribution } from "./Contribution";
import { inkStroke } from "./ink";
import { handLine } from "./pen";
import styles from "./Encounter.module.css";

const authoredLine = inkStroke(handLine([16, 48], [304, 38], 121, 1.7), {
  size: 4.2,
  seed: 121,
  smoothing: 2,
  lift: 9,
});

export default function ContributionMark({ place }: { place: "reflection" | "ending" }) {
  const { contribution } = useContribution();
  const source = contribution?.source ?? "authored";
  const bounds = contribution?.bounds;
  const subject = source === "reader" ? "Your mark" : "The pen’s mark";
  const caption = contribution
    ? `${subject}${place === "reflection" ? ", seen again." : " has a place here."}`
    : place === "reflection" ? "An open line." : "Room for another line.";

  return (
    <figure className={styles.mark} data-contribution-place={place} data-contribution-source={source}>
      <svg
        className={styles.retainedMark}
        viewBox={bounds ? `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}` : "0 0 320 90"}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={contribution?.d ?? authoredLine.outline}
          data-contribution-outline={contribution ? "" : undefined}
          data-authored-outline={contribution ? undefined : ""}
        />
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
