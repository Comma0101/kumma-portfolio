"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import styles from "./ContactSection.module.css";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [emailOpened, setEmailOpened] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setEmailOpened(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      "",
      formData.message,
    ].join("\n");
    const mailto = `mailto:dev@kumma.me?subject=${encodeURIComponent(
      formData.subject,
    )}&body=${encodeURIComponent(body)}`;

    setEmailOpened(true);
    window.location.href = mailto;
  };

  return (
    <section
      id="contact"
      ref={containerRef}
      className={`${styles.contactSection} ${
        isVisible ? styles.contactActive : ""
      }`}
    >
      <div className={styles.contactWrapper}>
        <div className={styles.contactIntro}>
          <h2>Building something difficult? Let&apos;s examine the system.</h2>
          <p className={styles.contactDescription}>
            For founders, technical leaders, and collaborators. Tell me the
            problem and the constraint.
          </p>

          <a href="mailto:dev@kumma.me" className={styles.emailLink}>
            <span>Email</span>
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
          <p className={styles.formLead}>A short brief is enough to start.</p>
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <label>
              <span>Name</span>
              <input
                type="text"
                name="name"
                placeholder="Your name"
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
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Subject</span>
              <input
                type="text"
                name="subject"
                placeholder="Project subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Message</span>
              <textarea
                name="message"
                placeholder="Context, constraints, and the outcome you need."
                rows={6}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit">
              Open Email <span aria-hidden="true">→</span>
            </button>

            {emailOpened && (
              <p className={styles.statusMessage} role="status">
                Your email app is opening. You can also write directly to
                dev@kumma.me.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
