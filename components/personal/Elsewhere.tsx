import Link from "next/link";
import styles from "./Front.module.css";

const items = [
  { href: "/notes/on-emotions", title: "On Emotions", kind: "Essay" },
  { href: "/notes/same-light", title: "Same Light", kind: "Essay" },
  { href: "/notes", title: "All notes", kind: "Index" },
];

// A quiet row, not a section.
export default function Elsewhere() {
  return (
    <nav className={styles.elsewhere} aria-label="Writing">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <span className={styles.kind}>{item.kind}</span>
          <span className={styles.title}>{item.title} →</span>
        </Link>
      ))}
    </nav>
  );
}
