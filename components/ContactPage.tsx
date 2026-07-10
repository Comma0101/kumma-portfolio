"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/styles/build.module.css";
import contact from "@/styles/contact.module.css";

const engagementEmail = "dev@kumma.me";

const initialForm = {
  name: "",
  email: "",
  problem: "",
  constraint: "",
  stack: "",
  timeline: "",
  budget: "",
  company: "", // honeypot
};

const shapes = [
  {
    title: "Voice agent audit",
    body: "Entry offer, fixed scope: I run your agent against the stress suite and a latency profile. You get a failure report and a fix roadmap.",
  },
  {
    title: "Build engagement",
    body: "A scoped voice agent taken to production: streaming speech, grounding, guardrails, and the eval harness to keep it honest.",
  },
  {
    title: "Advisory",
    body: "Ongoing input on an in-house effort: architecture, latency budgets, eval design, and where it will break.",
  },
];

const budgetOptions = [
  "Under $5k",
  "$5k–15k",
  "$15k–50k",
  "$50k+",
  "Not sure yet",
];

export default function ContactPage() {
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSent(false);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Honeypot: a real person never fills this. If it is set, drop silently.
    if (form.company.trim() !== "") return;

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      "",
      "Problem:",
      form.problem,
      "",
      `Constraint: ${form.constraint}`,
      `Current stack: ${form.stack}`,
      `Timeline: ${form.timeline}`,
      `Budget range: ${form.budget}`,
    ].join("\n");
    const shortProblem = form.problem.replace(/\s+/g, " ").trim().slice(0, 60);
    const subject = `Voice AI engagement: ${shortProblem}`;
    const mailto = `mailto:${engagementEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    // Conversion signal for a submitted engagement request.
    // No-ops safely when analytics is off (Umami not loaded).
    (
      window as unknown as { umami?: { track?: (e: string) => void } }
    ).umami?.track?.("contact_submit");
    setSent(true);
    window.location.href = mailto;
  };

  return (
    <div ref={root} className={`${styles.page} ${contact.top}`}>
      <div>
        {/* Intro */}
        <section className={`${styles.hero} ${styles.shell}`}>
          <p className={styles.eyebrow}>Contact</p>
          <h1 className={styles.title}>
            This is where a voice AI engagement starts.
          </h1>
          <p className={styles.subtitle}>
            Tell me the problem and the constraint. I reply within a day.
          </p>
        </section>

        {/* Engagement shapes */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            Engagement shapes
          </h2>
          <div className={`${styles.grid} ${styles.reveal}`} data-reveal>
            {shapes.map((s) => (
              <div key={s.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qualification form */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            Tell me about the problem
          </h2>
          <p className={styles.formLead}>
            The more concrete the problem and the constraint, the sharper my
            first reply.
          </p>
          <form className={styles.form} onSubmit={onSubmit}>
            <label>
              Name
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@company.com"
                required
              />
            </label>
            <label>
              What is the problem?
              <textarea
                name="problem"
                value={form.problem}
                onChange={onChange}
                rows={5}
                placeholder="What should the voice agent do, and what is going wrong today?"
                required
              />
            </label>
            <label>
              What is the constraint?
              <textarea
                name="constraint"
                value={form.constraint}
                onChange={onChange}
                rows={3}
                placeholder="e.g. sub-second response, on-prem, a specific telephony stack, a launch date"
              />
            </label>
            <label>
              Current stack
              <input
                type="text"
                name="stack"
                value={form.stack}
                onChange={onChange}
                placeholder="Models, telephony, framework, anything already in place"
              />
            </label>
            <label>
              Timeline
              <input
                type="text"
                name="timeline"
                value={form.timeline}
                onChange={onChange}
                placeholder="When do you need this working?"
              />
            </label>
            <label>
              Budget range
              <select
                name="budget"
                value={form.budget}
                onChange={onChange}
                className={contact.budget}
                required
              >
                <option value="" disabled>
                  Select a range
                </option>
                {budgetOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            {/* Honeypot: hidden from users, ignored by them, tempting to bots. */}
            <div className={contact.honeypot} aria-hidden="true">
              <label>
                Company
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={onChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <button type="submit" className={styles.submit}>
              Open Email
            </button>
            {sent && (
              <p className={styles.status} role="status">
                Your email app is opening. You can also write directly to{" "}
                {engagementEmail}.
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
