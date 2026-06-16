"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/system/SectionHeader";
import SystemViz from "@/components/system/SystemViz";
import { vizBySlug } from "@/components/viz/registry";
import { projects } from "@/data/projectData";
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
        {chapters.map((c) => {
          const slug = c.href.split("/").pop() ?? "";
          const Viz = vizBySlug[slug];
          const metrics = projects.find((p) => p.slug === slug)?.metrics;
          return (
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
              {metrics && metrics.length > 0 && (
                <dl className={styles.stats}>
                  {metrics.map((m) => (
                    <div key={m.label} className={styles.stat}>
                      <dt
                        className={`${styles.statValue} ${m.accent ? styles.statAccent : ""}`}
                      >
                        {m.value}
                      </dt>
                      <dd className={styles.statLabel}>{m.label}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className={styles.links}>
                <Link href={c.href} className={styles.link}>
                  {c.layout === "strip" ? "View studies →" : "Enter chapter →"}
                </Link>
                {c.secondary && (
                  <Link href={c.secondary.href} className={styles.linkSecondary}>
                    {c.secondary.label}
                  </Link>
                )}
              </div>
            </div>

            {c.layout !== "strip" ? (
              <SystemViz
                label={`${c.no} / ${c.title}`}
                live={c.no === "01"}
                className={styles.viz}
              >
                {Viz ? (
                  <Viz size="teaser" />
                ) : (
                  <div className={styles.vizField} aria-hidden="true" />
                )}
              </SystemViz>
            ) : (
              <div className={styles.gallery} aria-hidden="true">
                {(c.images ?? []).map((src, i) => (
                  <div key={i} className={styles.thumb}>
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 860px) 45vw, 22vw"
                      className={styles.thumbImg}
                    />
                  </div>
                ))}
              </div>
            )}
          </article>
          );
        })}
      </div>
    </section>
  );
}
