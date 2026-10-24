import Link from "next/link";
import styles from "./Front.module.css";

const items = [
  { href: "/work", title: "Build" },
  { href: "/notes", title: "Study" },
  { href: "/studies", title: "Draw" },
];

// A quiet row, not a section.
export default function Elsewhere() {
  return (
    <nav className={styles.elsewhere} aria-label="Elsewhere on the site">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <span className={styles.title}>{item.title} →</span>
        </Link>
      ))}
    </nav>
  );
}
