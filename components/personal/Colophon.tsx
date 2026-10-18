import Link from "next/link";
import Elsewhere from "./Elsewhere";
import styles from "./Front.module.css";

// After 道, only the quiet things: how the page was made, where else to
// go, and where it comes from.
export default function Colophon() {
  return (
    <footer className={styles.colophonBlock}>
      <p className={styles.howDrawn}>
        Nothing on this page is a picture: every mark is drawn while you watch, by one red pen in one take.{" "}
        <Link href="/studies">How it is drawn →</Link>
      </p>
      <Elsewhere />
      <p className={styles.colophon}>
        <span>Los Angeles</span>
        <span>© {new Date().getFullYear()} Kumma Wu</span>
      </p>
    </footer>
  );
}
