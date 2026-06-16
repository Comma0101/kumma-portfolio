"use client";

import { useEffect, useState } from "react";
import styles from "./KotaCallDemo.module.css";

const TRANSCRIPT = [
  "uh",
  "yeah,",
  "can I get",
  "like two orange chickens",
  "and...",
  "wait,",
  "do you have",
  "chow mein?",
];

const ORDER = [
  { item: "Orange chicken", qty: "x2" },
  { item: "Chow mein", qty: "x1", note: "confirmed" },
];

const STEPS = TRANSCRIPT.length + 2 + ORDER.length + 1 + 7;

export default function KotaCallDemo() {
  const [tick, setTick] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    const id = setInterval(() => setTick((t) => (t + 1) % STEPS), 330);
    return () => clearInterval(id);
  }, []);

  const tShown = reduced ? TRANSCRIPT.length : Math.min(tick, TRANSCRIPT.length);
  const afterT = tick - (TRANSCRIPT.length + 2);
  const rowsShown = reduced
    ? ORDER.length
    : Math.max(0, Math.min(afterT, ORDER.length));
  const confShown = reduced || afterT > ORDER.length;
  const listening = !reduced && tick >= 1 && tick <= TRANSCRIPT.length;
  const status = reduced
    ? "Order ready"
    : tick < 1
      ? "Connecting"
      : tick <= TRANSCRIPT.length
        ? "Listening"
        : tick <= TRANSCRIPT.length + 2
          ? "Resolving"
          : "Order ready";

  return (
    <div
      className={styles.panel}
      role="img"
      aria-label="A sample of KOTA turning a messy restaurant phone call into a structured order"
    >
      <div className={styles.bar}>
        <span>KOTA · sample call</span>
        <span className={styles.status} data-on={status === "Order ready"}>
          {status}
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          <span className={styles.colLabel}>Caller</span>
          <p className={styles.transcript}>
            {TRANSCRIPT.map((w, i) => (
              <span key={i} className={styles.token} data-on={i < tShown}>
                {w}{" "}
              </span>
            ))}
          </p>
          <div className={styles.wave} data-active={listening} aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <i key={i} style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        </div>
        <div className={styles.right}>
          <span className={styles.colLabel}>Structured order</span>
          <ul className={styles.ticket}>
            {ORDER.map((o, i) => (
              <li key={i} data-on={i < rowsShown}>
                <span>
                  {o.item}
                  {o.note ? <em> ({o.note})</em> : null}
                </span>
                <b>{o.qty}</b>
              </li>
            ))}
            <li className={styles.conf} data-on={confShown}>
              <span>confidence</span>
              <b>high</b>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
