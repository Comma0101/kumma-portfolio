"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "./ContactSection.module.css";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

type FormStatus = "idle" | "loading" | "success" | "error";

const ContactSection = () => {
    const containerRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<FormStatus>("idle");

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: [0.15, 0.25, 0.4],
            }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
                setTimeout(() => setStatus("idle"), 5000);
                return;
            }

            setStatus("error");
            setTimeout(() => setStatus("idle"), 5000);
        } catch (error) {
            console.error("Form submission error:", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 5000);
        }
    };

    return (
        <section
            id="contact"
            ref={containerRef}
            className={`${styles.contactSection} ${isVisible ? styles.contactActive : ""}`}
        >
            <div className={styles.contactWrapper}>
                <div className={styles.contactIntro}>
                    <p className={`${styles.contactEyebrow} ${spaceGrotesk.className}`}>
                        Conversation
                    </p>
                    <h2 className={`${styles.contactTitle} ${cormorant.className}`}>
                        Let&apos;s Shape What Comes Next.
                    </h2>
                    <p className={`${styles.contactDescription} ${spaceGrotesk.className}`}>
                        If you are building a product, a digital brand story, or a
                        high-impact interface, share the context and goals. I will answer
                        with a clear direction and execution plan.
                    </p>

                    <div className={styles.contactMeta}>
                        <a
                            href="mailto:dev@kumma.me"
                            className={`${styles.metaItem} ${spaceGrotesk.className}`}
                        >
                            <span className={styles.metaLabel}>Email</span>
                            <span className={styles.metaValue}>dev@kumma.me</span>
                        </a>
                        <div className={`${styles.metaItem} ${spaceGrotesk.className}`}>
                            <span className={styles.metaLabel}>Location</span>
                            <span className={styles.metaValue}>San Francisco, CA</span>
                        </div>
                    </div>

                    <div className={styles.socialLinks}>
                        <a
                            href="https://github.com/Comma0101"
                            className={`${styles.socialLink} ${spaceGrotesk.className}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub <span aria-hidden="true">-&gt;</span>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/yang-w-9233a3a8/"
                            className={`${styles.socialLink} ${spaceGrotesk.className}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LinkedIn <span aria-hidden="true">-&gt;</span>
                        </a>
                        <a
                            href="https://x.com/Comma_9fie"
                            className={`${styles.socialLink} ${spaceGrotesk.className}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Twitter <span aria-hidden="true">-&gt;</span>
                        </a>
                    </div>
                </div>

                <div className={styles.contactPanel}>
                    <p className={`${styles.formLead} ${spaceGrotesk.className}`}>
                        Share a short brief and I will follow up within 24 hours.
                    </p>

                    <form className={styles.contactForm} onSubmit={handleSubmit}>
                        <label className={styles.formGroup}>
                            <span className={`${styles.formLabel} ${spaceGrotesk.className}`}>
                                Name
                            </span>
                            <input
                                type="text"
                                name="name"
                                className={`${styles.formInput} ${spaceGrotesk.className}`}
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className={styles.formGroup}>
                            <span className={`${styles.formLabel} ${spaceGrotesk.className}`}>
                                Email
                            </span>
                            <input
                                type="email"
                                name="email"
                                className={`${styles.formInput} ${spaceGrotesk.className}`}
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className={styles.formGroup}>
                            <span className={`${styles.formLabel} ${spaceGrotesk.className}`}>
                                Subject
                            </span>
                            <input
                                type="text"
                                name="subject"
                                className={`${styles.formInput} ${spaceGrotesk.className}`}
                                placeholder="Project subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className={styles.formGroup}>
                            <span className={`${styles.formLabel} ${spaceGrotesk.className}`}>
                                Message
                            </span>
                            <textarea
                                name="message"
                                className={`${styles.formInput} ${styles.formTextarea} ${spaceGrotesk.className}`}
                                placeholder="Tell me what you are building and what success looks like."
                                rows={6}
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className={`${styles.formButton} ${spaceGrotesk.className}`}
                            disabled={status === "loading"}
                        >
                            <span>
                                {status === "loading"
                                    ? "Sending"
                                    : status === "success"
                                      ? "Message Sent"
                                      : status === "error"
                                        ? "Try Again"
                                        : "Send Message"}
                            </span>
                            <span className={styles.buttonArrow} aria-hidden="true">
                                -&gt;
                            </span>
                        </button>

                        {status === "success" && (
                            <p className={`${styles.statusMessage} ${styles.successMessage}`}>
                                Thank you. Your message has been sent.
                            </p>
                        )}
                        {status === "error" && (
                            <p className={`${styles.statusMessage} ${styles.errorMessage}`}>
                                Something went wrong. Please try again later.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
