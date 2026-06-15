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
        I build systems where intelligence becomes action, not just output.
      </p>
      <ul className={styles.tags}>
        {disciplines.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </section>
  );
}
