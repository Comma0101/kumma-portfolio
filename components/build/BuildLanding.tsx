"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Button from "@/components/system/Button";
import styles from "@/styles/build.module.css";
import {
  contactEmail,
  empathy,
  faqHeading,
  faqs,
  formHeading,
  formLead,
  heroCtaLabel,
  heroEyebrow,
  heroSubtitle,
  heroTitle,
  heroTrust,
  proofHeading,
  proofItems,
  riskHeading,
  riskReversal,
  steps,
  stepsHeading,
  useCases,
  useCasesHeading,
  useCasesNote,
} from "./buildContent";

const initialForm = { name: "", business: "", email: "", message: "" };

export default function BuildLanding() {
  const root = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((t) => t.classList.add(styles.revealShown));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.revealShown);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSent(false);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = [
      `Name: ${form.name}`,
      `Business: ${form.business}`,
      `Email: ${form.email}`,
      "",
      form.message,
    ].join("\n");
    const subject = `Free consult request: ${form.business || form.name}`;
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
    window.location.href = mailto;
  };

  return (
    <div ref={root} className={styles.page}>
      <header className={styles.header}>
        <a href="#top" className={styles.wordmark}>
          Kumma
        </a>
        <a href="#consult" className={styles.headerCta}>
          Book a free consult
        </a>
      </header>

      <main id="top">
        {/* Hero */}
        <section className={`${styles.hero} ${styles.shell}`}>
          <p className={styles.eyebrow}>{heroEyebrow}</p>
          <h1 className={styles.title}>{heroTitle}</h1>
          <p className={styles.subtitle}>{heroSubtitle}</p>
          <div className={styles.ctaRow}>
            <Button href="#consult" variant="primary">
              {heroCtaLabel}
            </Button>
          </div>
          <p className={styles.trust}>{heroTrust}</p>
        </section>

        {/* Empathy */}
        <section className={`${styles.section} ${styles.shell}`}>
          <p className={`${styles.empathy} ${styles.reveal}`} data-reveal>
            {empathy}
          </p>
        </section>

        {/* Use cases */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {useCasesHeading}
          </h2>
          <div className={`${styles.grid} ${styles.reveal}`} data-reveal>
            {useCases.map((u) => (
              <div key={u.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{u.title}</h3>
                <p className={styles.cardBody}>{u.body}</p>
              </div>
            ))}
          </div>
          <p className={styles.note}>{useCasesNote}</p>
        </section>

        {/* Proof */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {proofHeading}
          </h2>
          <div className={`${styles.proofRow} ${styles.reveal}`} data-reveal>
            {proofItems.map((p) => (
              <div key={p.name} className={styles.proofItem}>
                <h3 className={styles.proofName}>{p.name}</h3>
                <p className={styles.proofBody}>{p.body}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.proofLink}
                >
                  {p.linkLabel}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {stepsHeading}
          </h2>
          <div className={`${styles.steps} ${styles.reveal}`} data-reveal>
            {steps.map((s) => (
              <div key={s.no}>
                <span className={styles.stepNo}>{s.no}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Risk reversal */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {riskHeading}
          </h2>
          <ul className={`${styles.riskList} ${styles.reveal}`} data-reveal>
            {riskReversal.map((r) => (
              <li key={r} className={styles.riskItem}>
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {faqHeading}
          </h2>
          <div className={`${styles.faqList} ${styles.reveal}`} data-reveal>
            {faqs.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <h3 className={styles.faqQ}>{f.q}</h3>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Consult form */}
        <section
          id="consult"
          className={`${styles.section} ${styles.shell} ${styles.consult}`}
        >
          <h2 className={styles.h2}>{formHeading}</h2>
          <p className={styles.formLead}>{formLead}</p>
          <form className={styles.form} onSubmit={onSubmit}>
            <label>
              Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                required
              />
            </label>
            <label>
              Business
              <input
                type="text"
                name="business"
                value={form.business}
                onChange={onChange}
                placeholder="Your business name"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@business.com"
                required
              />
            </label>
            <label>
              What would you want the agent to handle?
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={5}
                placeholder="e.g. answer the phone and book appointments when we are busy"
                required
              />
            </label>
            <button type="submit" className={styles.submit}>
              Book a free consult
            </button>
            {sent && (
              <p className={styles.status} role="status">
                Your email app is opening. You can also write directly to{" "}
                {contactEmail}.
              </p>
            )}
          </form>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Kumma</span>
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </footer>
    </div>
  );
}
