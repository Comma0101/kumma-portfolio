import Link from "next/link";
import Pen from "./Pen";
import { underline } from "./pen";
import styles from "./Front.module.css";

const items = [
  { href: "/blog/en/On-Emotions", title: "On Emotions", kind: "Essay" },
  { href: "/blog/en/Same-Light", title: "Same Light", kind: "Essay" },
  { href: "/projects", title: "Systems I build", kind: "AI work" },
];

export default function Elsewhere() {
  return (
    <section className={styles.elsewhere} aria-labelledby="elsewhere">
      <h2 id="elsewhere" className={styles.label}>
        Elsewhere
      </h2>
      <ol>
        {items.map((item, index) => (
          <li key={item.href}>
            <Link href={item.href}>
              <span className={styles.index}>0{index + 1}</span>
              <span className={styles.title}>
                {item.title}
                <Pen d={underline({ seed: 60 + index, y: 60 })} className={styles.hoverLine} />
              </span>
              <span className={styles.kind}>{item.kind}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
