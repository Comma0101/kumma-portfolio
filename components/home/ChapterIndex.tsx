"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import SectionHeader from "@/components/system/SectionHeader";
import SystemViz from "@/components/system/SystemViz";
import { chapters } from "./chapters";
import styles from "./ChapterIndex.module.css";

export default function ChapterIndex() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add(styles.shown));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.shown);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="work" className={styles.section}>
      <SectionHeader eyebrow="Selected work" title="The systems I am building." />
      <div className={styles.rows}>
        {chapters.map((c) => (
          <article
            key={c.no}
            data-reveal
            className={`${styles.row} ${styles[c.layout]}`}
          >
            <div className={styles.copy}>
              <span className={styles.no}>{c.no}</span>
              <h3 className={styles.title}>{c.title}</h3>
              <p className={styles.blurb}>{c.blurb}</p>
              <ul className={styles.tags}>
                {c.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <Link href={c.href} className={styles.link}>
                {c.layout === "strip" ? "View studies →" : "Enter chapter →"}
              </Link>
            </div>

            {c.layout !== "strip" ? (
              <SystemViz
                label={`${c.no} / ${c.title}`}
                live={c.no === "01"}
                className={styles.viz}
              >
                <div className={styles.vizField} aria-hidden="true" />
              </SystemViz>
            ) : (
              <div className={styles.strip} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.thumb} />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
