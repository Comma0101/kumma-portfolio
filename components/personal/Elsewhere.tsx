import Link from "next/link";
import styles from "./Front.module.css";

const items = [
  { href: "/blog/en/On-Emotions", title: "On Emotions", kind: "Essay" },
  { href: "/blog/en/Same-Light", title: "Same Light", kind: "Essay" },
  { href: "/blog", title: "All writing", kind: "Index" },
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
