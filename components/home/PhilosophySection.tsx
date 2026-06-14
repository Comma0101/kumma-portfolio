import styles from "./PhilosophySection.module.css";

const principles = [
  {
    k: "Structure over willpower.",
    v: "Reliable outcomes come from architecture and feedback loops, not motivation.",
  },
  {
    k: "Autonomy.",
    v: "Building toward control over what I work on and how.",
  },
  {
    k: "Systems before labels.",
    v: "The work is studying complex systems and building tools to operate inside them.",
  },
];

export default function PhilosophySection() {
  return (
    <section id="philosophy" className={styles.section}>
      <ul className={styles.list}>
        {principles.map((p) => (
          <li key={p.k}>
            <em className={styles.k}>{p.k}</em>
            <span className={styles.v}>{p.v}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
