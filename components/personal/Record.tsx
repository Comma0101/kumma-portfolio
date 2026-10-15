"use client";

import { useRef } from "react";
import Pen from "./Pen";
import { loop } from "./pen";
import { count, draw, useBeat } from "./useBeat";
import { X_URL } from "./links";
import { journal, net, type JournalEntry } from "@/data/journal";
import styles from "./Front.module.css";

const ring = loop({ seed: 41, overshoot: 0.18 });

function stamp(date: string) {
  const [, month, day] = date.split("-");
  return `${month}.${day}`;
}

function Entry({ entry }: { entry: JournalEntry }) {
  const receipt = useRef<HTMLDivElement>(null);
  const plan = useRef<HTMLDivElement>(null);
  const result = net(entry);

  // The receipt: numbers land, then get circled.
  useBeat(receipt, (root, tl) => {
    root.querySelectorAll("[data-count]").forEach((number, index) => {
      count(tl, number, 0.9, index * 0.12);
    });
    draw(tl, root.querySelector("[data-pen]"), 0.8, ">-0.1");
  });

  // The edit: the plan gets struck, the truth is written beside it.
  useBeat(plan, (root, tl) => {
    tl.fromTo(
      root.querySelector("[data-strike]"),
      { "--strike": "0%" },
      { "--strike": "100%", duration: 0.7, ease: "power1.inOut" },
      0.15,
    );
    tl.fromTo(
      root.querySelector("[data-write]"),
      { clipPath: "inset(0% 100% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power1.inOut" },
      ">0.05",
    );
    tl.fromTo(
      root.querySelectorAll("[data-fade]"),
      { opacity: 0 },
      { opacity: 1, duration: 0.6, stagger: 0.25 },
      ">0.1",
    );
  });

  return (
    <article className={styles.entry}>
      <p className={styles.stamp}>
        <time dateTime={entry.date}>{stamp(entry.date)}</time>
      </p>
      <h3 className={styles.entryTitle}>{entry.title}</h3>

      <div ref={receipt} className={styles.receipt}>
        <p className={styles.leg}>
          <span>Bought</span>
          <span>{entry.contract}</span>
          <span className={styles.amount}>
            −$<span data-count={entry.cost}>{entry.cost}</span>
          </span>
        </p>
        <p className={styles.leg}>
          <span>Sold at the open</span>
          <span className={styles.exits}>
            {entry.exits.map((exit, index) => (
              <span key={index}>
                {index > 0 && <i> · </i>}+$<span data-count={exit}>{exit}</span>
              </span>
            ))}
            <Pen d={ring} className={styles.exitsRing} />
          </span>
        </p>
        <p className={styles.net}>
          {result >= 0 ? "+" : "−"}$<span data-count={Math.abs(result)}>{Math.abs(result)}</span>
        </p>
      </div>

      <div ref={plan} className={styles.plan}>
        <p className={styles.planText}>
          <span className={styles.label}>Plan</span>
          <del className={styles.struck} data-strike>
            {entry.plan}
          </del>
        </p>
        <p className={styles.margin} data-write>
          {entry.outcome}
        </p>
        <p className={styles.lesson} data-fade>
          {entry.lesson}
        </p>
        {entry.after && (
          <p className={styles.after} data-fade>
            {entry.after}
          </p>
        )}
        <a className={styles.receiptLink} href={entry.url ?? X_URL} data-fade>
          Receipt on X ↗
        </a>
      </div>
    </article>
  );
}

function Chase() {
  const ref = useRef<HTMLParagraphElement>(null);
  // Price runs. The line does not.
  useBeat(ref, (root, tl) => {
    tl.fromTo(
      root.querySelector("[data-price]"),
      { xPercent: -120, left: "0%", opacity: 1 },
      { xPercent: 0, left: "100%", duration: 1.15, ease: "power2.in" },
      0.2,
    ).to(root.querySelector("[data-price]"), { opacity: 0, duration: 0.2 }, ">-0.1");
  });
  return (
    <p ref={ref} className={`${styles.rule} ${styles.chase}`}>
      <span className={styles.price} data-price aria-hidden="true">
        price →
      </span>
      Don’t chase.
    </p>
  );
}

function Small() {
  const ref = useRef<HTMLParagraphElement>(null);
  // Size shrinks; weight holds.
  useBeat(ref, (root, tl) => {
    tl.fromTo(
      root.querySelector("[data-small]"),
      { "--wdth": 125, scale: 1 },
      { "--wdth": 62, scale: 0.58, duration: 1.2, ease: "expo.inOut" },
      0.15,
    );
  });
  return (
    <p ref={ref} className={styles.rule}>
      <span className={styles.small} data-small>
        Stay small.
      </span>
    </p>
  );
}

export default function Record() {
  return (
    <section className={styles.record} aria-labelledby="record">
      <header className={styles.recordHead}>
        <h2 id="record">The record.</h2>
        <p>Trades as posted, receipts on X. Wins, and the rules I broke getting them.</p>
      </header>

      {journal.map((entry) => (
        <Entry key={entry.date + entry.contract} entry={entry} />
      ))}

      <div className={styles.rules} aria-label="Rules">
        <Chase />
        <Small />
        <p className={styles.rule}>
          Stay bored.
          <span className={styles.still}>(nothing moves here.)</span>
        </p>
        <p className={styles.ruleCoda}>
          There’s always another candle. You don’t need to catch all of them, just
          the ones you know.
        </p>
      </div>

      <p className={styles.disclaimer}>A journal, not advice. Options are risky.</p>
    </section>
  );
}
