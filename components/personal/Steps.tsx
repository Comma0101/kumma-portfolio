import styles from "./Front.module.css";

// The words only: the thread walks the staircase under them (Thread).
export default function Steps() {
  return (
    <section className={styles.steps} aria-labelledby="steps" data-thread="steps">
      <h2 id="steps" className={styles.stepsLine} data-anchor="steps">
        Three steps forward, two back.
      </h2>
    </section>
  );
}
