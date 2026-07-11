import styles from "./PositioningBand.module.css";

const disciplines = [
  "real-time voice",
  "model and agent orchestration",
  "production TTS",
  "evaluation",
  "workflow integration",
  "data correctness",
] as const;

export default function PositioningBand() {
  return (
    <section className={styles.band} data-immersive-stage="bridge">
      <h2 className={styles.statement}>
        Real-time voice is the most visible stress test of production AI:
        latency, ambiguity, guardrails, and recovery surface in one interaction.
        The same systems discipline carries into model and agent orchestration,
        production TTS, evaluation, workflow integration, and data correctness.
      </h2>
      <ul className={styles.tags}>
        {disciplines.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </section>
  );
}
