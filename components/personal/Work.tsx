import Link from "next/link";
import Shell from "./Shell";
import styles from "./Front.module.css";

// What "Build." means, shown: the systems, each in one line from its own
// write-up. Only finished, public work.
const work = [
  {
    name: "KOTA",
    line: "Restaurant phone calls become menu-verified kitchen tickets, in real time.",
    kind: "Write-up",
    href: "/work/kota",
  },
  {
    name: "ARCHON",
    line: "One inspectable control plane for models, tools, memory and other coding agents.",
    kind: "Write-up",
    href: "/work/archon",
  },
  {
    name: "Audiobook AI",
    line: "Any document, from a PDF to a web page, read as one continuous audiobook.",
    kind: "Write-up",
    href: "/work/audiobook",
  },
  {
    name: "Trade ledger",
    line: "A messy broker export turned into a correct, per-trade profit-and-loss record.",
    kind: "Write-up",
    href: "/work/robinhood-dashboard",
  },
  {
    name: "Voice agent",
    line: "An agent that takes phone orders for a demo diner with a real menu.",
    kind: "Demo",
    href: "/call",
  },
  {
    name: "Stress suite",
    line: "Fifty scenarios, a fixed rubric and a scoring script for real-time voice agents.",
    kind: "Draft",
    href: "/benchmark",
  },
];

export default function Work() {
  return (
    <Shell>
      <h1 className={styles.workTitle}>Build.</h1>
      <svg className={styles.workHorizon} viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 7 C 220 5.6, 460 8.2, 700 6.4 S 930 5.4, 998 6" />
      </svg>
      <p className={styles.workLede}>
        Software as leverage. Each of these takes something messy — a phone call, a task, a document, a ledger — and
        makes it something you can trust.
      </p>

      <ol className={styles.workList}>
        {work.map((item, index) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.workItem}>
              <span className={styles.index}>0{index + 1}</span>
              <span className={styles.workName}>{item.name}</span>
              <span className={styles.workLine}>{item.line}</span>
              <span className={styles.workKind}>{item.kind} →</span>
            </Link>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
