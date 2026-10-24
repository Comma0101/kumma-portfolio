"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/styles/build.module.css";
import contact from "@/styles/contact.module.css";

const address = "dev@kumma.me";

const initialForm = {
  name: "",
  email: "",
  message: "",
  company: "", // honeypot
};

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

    const body = [form.message, "", `— ${form.name}`, form.email].join("\n");
    const subject = `A note from ${form.name.trim() || "kumma.me"}`;
    const mailto = `mailto:${address}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    // A sent note, counted (no-op when analytics is off).
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
          <p className={styles.eyebrow}>Write</p>
          <h1 className={styles.title}>Write to me.</h1>
          <p className={styles.subtitle}>
            About an idea, a text worth reading slowly, or something you are
            making. I read everything, and answer what I can.
          </p>
        </section>

        {/* The letter */}
        <section className={`${styles.section} ${styles.shell}`}>
          <form className={styles.form} onSubmit={onSubmit}>
            <label>
              Name
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={onChange}
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
                required
              />
            </label>
            <label>
              Message
              <textarea name="message" value={form.message} onChange={onChange} rows={8} required />
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
              Send by email →
            </button>
            {sent && (
              <p className={styles.status} role="status">
                Your email app is opening. You can also write directly to{" "}
                {address}.
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
