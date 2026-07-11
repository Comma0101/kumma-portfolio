"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import styles from "./ContactSection.module.css";

const initialForm = {
  name: "",
  email: "",
  problem: "",
  constraint: "",
  stack: "",
  timeline: "Not sure yet",
  budget: "Need help scoping",
};

export default function ContactSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [emailOpened, setEmailOpened] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    let observer: IntersectionObserver | null = null;

    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer?.disconnect();
          }
        },
        { threshold: 0.18 },
      );

      observer.observe(container);
      setIsEnhanced(true);
    } catch {
      observer?.disconnect();
      return;
    }

    return () => observer?.disconnect();
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setEmailOpened(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = `Production AI project — ${formData.name}`;
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Problem: ${formData.problem}`,
      `Constraint: ${formData.constraint}`,
      `Current stack: ${formData.stack || "Not provided"}`,
      `Timeline: ${formData.timeline}`,
      `Budget: ${formData.budget}`,
    ].join("\n\n");
    const mailto = `mailto:dev@kumma.me?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setEmailOpened(true);
    window.location.href = mailto;
  };

  return (
    <section
      id="contact"
      ref={containerRef}
      data-immersive-stage="contact"
      data-immersive-anchor="contact"
      className={`${styles.contactSection} ${
        isEnhanced ? styles.contactEnhanced : ""
      } ${
        isVisible ? styles.contactActive : ""
      }`}
    >
      <div className={styles.contactWrapper}>
        <div className={styles.contactIntro}>
          <p className={styles.eyebrow}>Start a project</p>
          <h2>Bring the production-AI problem and the constraint.</h2>
          <p className={styles.contactDescription}>
            A focused audit, scoped build, or advisory relationship starts with
            the system boundary that is blocking production. A short brief is
            enough for an initial reply.
          </p>

          <a href="mailto:dev@kumma.me" className={styles.emailLink}>
            <span>Direct email</span>
            <strong>dev@kumma.me</strong>
          </a>

          <div className={styles.socialLinks}>
            <a
              href="https://github.com/Comma0101"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <span aria-hidden="true">→</span>
            </a>
            <a
              href="https://www.linkedin.com/in/yang-w-9233a3a8/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <span aria-hidden="true">→</span>
            </a>
            <a
              href="https://x.com/Comma_9fie"
              target="_blank"
              rel="noopener noreferrer"
            >
              X <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className={styles.contactPanel}>
          <p className={styles.formLead}>Project brief</p>
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.fieldPair}>
              <label>
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              <span>Problem</span>
              <textarea
                name="problem"
                rows={5}
                value={formData.problem}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Constraint</span>
              <textarea
                name="constraint"
                rows={4}
                value={formData.constraint}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Current stack (optional)</span>
              <input
                type="text"
                name="stack"
                value={formData.stack}
                onChange={handleChange}
              />
            </label>

            <div className={styles.fieldPair}>
              <label>
                <span>Timeline</span>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  required
                >
                  <option>Not sure yet</option>
                  <option>2–4 weeks</option>
                  <option>1–3 months</option>
                  <option>Ongoing advisory</option>
                </select>
              </label>

              <label>
                <span>Budget</span>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                >
                  <option>Need help scoping</option>
                  <option>Under $10k</option>
                  <option>$10k–$25k</option>
                  <option>$25k–$50k</option>
                  <option>$50k+</option>
                </select>
              </label>
            </div>

            <button type="submit">
              Open project email <span aria-hidden="true">→</span>
            </button>

            {emailOpened && (
              <p className={styles.statusMessage} role="status">
                Your email app is opening. You can also write directly to dev@kumma.me.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
