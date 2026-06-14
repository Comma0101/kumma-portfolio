import styles from "./PositioningBand.module.css";

const disciplines = [
  "AI systems",
  "real-time voice",
  "product engineering",
  "agent orchestration",
  "markets",
  "visual practice",
];

export default function PositioningBand() {
  return (
    <section className={styles.band}>
      <p className={styles.statement}>
        Not one label. Across AI systems, real-time voice, product engineering,
        markets, and visual design, the through-line is the same: building
        structure for complex systems.
      </p>
      <ul className={styles.tags}>
        {disciplines.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </section>
  );
}
