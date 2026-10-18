import Elsewhere from "./Elsewhere";
import styles from "./Front.module.css";

// After 道, only the quiet things: writing, and where it comes from.
export default function Colophon() {
  return (
    <footer className={styles.colophonBlock}>
      <Elsewhere />
      <p className={styles.colophon}>
        <span>Los Angeles</span>
        <span>© {new Date().getFullYear()} Kumma Wu</span>
      </p>
    </footer>
  );
}
