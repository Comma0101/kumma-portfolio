import styles from "./PositioningBand.module.css";

const disciplines = [
  "real-time voice",
  "agent orchestration",
  "streaming speech",
  "eval and benchmarking",
  "latency engineering",
  "production guardrails",
];

export default function PositioningBand() {
  return (
    <section className={styles.band}>
      <p className={styles.statement}>
        Real-time voice is the hardest version of one problem: making AI systems
        reliable in production. The craft underneath runs through everything I
        build.
      </p>
      <ul className={styles.tags}>
        {disciplines.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </section>
  );
}
