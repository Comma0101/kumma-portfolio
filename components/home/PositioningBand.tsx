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
