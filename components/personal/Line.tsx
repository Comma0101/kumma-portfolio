import styles from "./Front.module.css";

// The sutra stands still. The thread draws the open circle beside it as
// the reader arrives (Thread); nothing touches the characters.
export default function Line() {
  return (
    <section className={styles.line} aria-label="Diamond Sutra" data-thread="reason">
      <p className={styles.label} aria-hidden="true" data-anchor="reason">
        The reason
      </p>
      <p className={styles.sutra} lang="zh-Hant">
        <span className={styles.column}>凡所有相，</span>
        <span className={styles.column}>皆是虛妄；</span>
        <span className={styles.column} data-anchor="not-form">
          若見諸相非相，
        </span>
        <span className={`${styles.column} ${styles.seen}`} data-anchor="seen">
          則見如來
          <span className={styles.stopMark}>
            。
          </span>
        </span>
      </p>
      <div className={styles.gloss}>
        <p>
          All that has form is illusion. See form as no-form, and you see what is
          truly so.
        </p>
        <cite>Diamond Sutra · Kumārajīva</cite>
      </div>
    </section>
  );
}
