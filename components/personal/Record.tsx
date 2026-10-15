"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor, at, threadX } from "./anchors";
import { handLine } from "./pen";
import { draw, ease, reveal, useBeat, useScrub } from "./useBeat";
import { X_URL } from "./links";
import { journal, net, type JournalEntry } from "@/data/journal";
import styles from "./Front.module.css";

// The margin rule of the notebook is the same red line, passing through.
const margin: Trace = ({ height }, host) => ({
  points: handLine([threadX(host), -2], [threadX(host), height + 2], 21, 0.5),
});

// The trade as a decision line, not a price chart: premiums and the share
// price are different units, so there is no y-axis. The pen goes from the
// buy to the two sells; what the plan would have held is left in pencil.
const decision: Trace = (_, host) => {
  const buy = anchor(host, "buy");
  const first = anchor(host, "sell-1");
  const second = anchor(host, "sell-2");
  if (!buy || !first || !second) return { points: [] };
  const start = at(buy, 0.5, 0.5);
  const a = at(first, 0.5, 0.5);
  const b = at(second, 0.5, 0.5);
  return {
    points: [...handLine(start, a, 31, 0.8), ...handLine(a, b, 32, 0.6).slice(1)],
  };
};

const usd = (value: number) => `$${value}`;

function stamp(date: string) {
  const [, month, day] = date.split("-");
  return `${month}.${day}`;
}

function Entry({ entry, index }: { entry: JournalEntry; index: number }) {
  const confession = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const result = net(entry);

  // The edit: the plan is struck, the truth is written in the margin.
  useBeat(confession, (root, tl) => {
    tl.fromTo(
      root.querySelector("[data-strike]"),
      { "--strike": "0%" },
      { "--strike": "100%", duration: 0.7, ease: ease.hand },
      0.1,
    );
    tl.fromTo(
      root.querySelector("[data-write]"),
      { clipPath: "inset(-20% 100% -20% 0%)" },
      { clipPath: "inset(-20% 0% -20% 0%)", duration: 1, ease: ease.hand },
      ">0.05",
    );
  });

  // The reader's scroll draws the trade.
  useScrub(
    line,
    (root, tl) => {
      draw(tl, reveal(root, "decision"), { duration: 1, ease: "none" });
    },
    { start: "top 85%", end: "bottom 45%" },
  );

  return (
    <article className={styles.entry}>
      <p className={styles.stamp}>
        <span>Entry {String(index + 1).padStart(2, "0")}</span>
        <time dateTime={entry.date}>{stamp(entry.date)}</time>
        <span>{entry.contract}</span>
      </p>
      <h3 className={styles.entryTitle}>{entry.title}</h3>

      <div ref={confession} className={styles.confession}>
        <p className={styles.planText}>
          <span className={styles.label}>The plan</span>
          <del className={styles.struck} data-strike>
            {entry.plan}
          </del>
        </p>
        <p className={styles.margin} data-write>
          {entry.fact}
        </p>
        <p className={styles.admission}>{entry.admission}</p>
        <p className={styles.lesson}>{entry.lesson}</p>
      </div>

      <div ref={line} className={styles.decision}>
        <span className={styles.event} style={{ left: "4%" }}>
          <i className={styles.dot} data-anchor="buy" />
          <span>Bought</span>
          <b>−{usd(entry.cost)}</b>
        </span>
        {entry.exits.map((exit, i) => (
          <span
            key={exit}
            className={`${styles.event} ${styles.sell} ${i > 0 ? styles.above : ""}`}
            style={{ left: `${44 + i * 20}%` }}
          >
            <i className={styles.cross} data-anchor={`sell-${i + 1}`}>
              ×
            </i>
            <span>{i === 0 ? "Sold one at the open" : "Sold the other"}</span>
            <b>+{usd(exit)}</b>
          </span>
        ))}
        <span className={styles.ghost} aria-hidden="true" />
        <span className={`${styles.event} ${styles.later}`} style={{ left: "96%" }}>
          <span>The plan would have held.</span>
          <b>{entry.after}</b>
        </span>
        <Ink trace={decision} mark="decision" size={3} seed={31} className={styles.decisionInk} />
      </div>

      <p className={styles.receipt}>
        <span>Net {result >= 0 ? "+" : "−"}{usd(Math.abs(result))}</span>
        <span>A journal, not advice. Options are risky.</span>
        <a href={entry.url ?? X_URL}>Receipt on X ↗</a>
      </p>
    </article>
  );
}

export default function Record() {
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "margin"), { duration: 1.6, position: 0 });
  });

  return (
    <section ref={ref} className={styles.record} aria-labelledby="record">
      <Ink trace={margin} mark="margin" size={2.2} seed={21} className={styles.thread} />
      <header className={styles.recordHead}>
        <h2 id="record">The record.</h2>
        <p>The plan, what I did, and what it cost. Posted on X as it happens.</p>
      </header>

      {journal.map((entry, index) => (
        <Entry key={entry.date + entry.contract} entry={entry} index={index} />
      ))}
    </section>
  );
}
