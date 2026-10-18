import Link from "next/link";
import styles from "./Front.module.css";

const items = [
  { href: "/work", title: "Systems I build", kind: "Work" },
  { href: "/notes", title: "Notes", kind: "Writing" },
  { href: "/studies", title: "Studies", kind: "Drawing" },
];

// A quiet row, not a section.
export default function Elsewhere() {
  return (
    <nav className={styles.elsewhere} aria-label="Elsewhere on the site">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <span className={styles.kind}>{item.kind}</span>
          <span className={styles.title}>{item.title} →</span>
        </Link>
      ))}
    </nav>
  );
}
