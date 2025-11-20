"use client";
import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./ContactSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const ContactSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
                setTimeout(() => setStatus("idle"), 5000); // Reset after 5s
            } else {
                setStatus("error");
                setTimeout(() => setStatus("idle"), 5000); // Reset after 5s
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 5000); // Reset after 5s
        }
    };

    useGSAP(
        () => {
            const contactSection = containerRef.current;
            if (!contactSection) return;

            const revealTimeline = gsap.timeline({
                paused: true,
                defaults: { ease: "power3.out", duration: 0.8 },
            });

            const contactTitleLines =
                contactSection.querySelectorAll<HTMLElement>(
                    `.${styles.contactTitleGradient}, .${styles.contactTitleWhite}`
                );

            if (contactTitleLines.length) {
                revealTimeline.from(
                    contactTitleLines,
                    {
                        x: (index: number) => (index % 2 === 0 ? -200 : 200),
                        opacity: 0,
                        stagger: 0.08,
                        immediateRender: false,
                    },
                    0
                );
            }

            const contactLeft = contactSection.querySelector<HTMLElement>(
                `.${styles.contactLeft}`
            );
            if (contactLeft) {
                revealTimeline.from(
                    contactLeft,
                    {
                        x: -120,
                        opacity: 0,
                        immediateRender: false,
                    },
                    0.1
                );
            }

            const contactRight = contactSection.querySelector<HTMLElement>(
                `.${styles.contactRight}`
            );
            if (contactRight) {
                revealTimeline.from(
                    contactRight,
                    {
                        x: 120,
                        opacity: 0,
                        scale: 0.92,
                        immediateRender: false,
                    },
                    0.2
                );

                const formGroups =
                    contactRight.querySelectorAll<HTMLElement>(
                        `.${styles.formGroup}`
                    );
                if (formGroups.length) {
                    revealTimeline.from(
                        formGroups,
                        {
                            y: 30,
                            opacity: 0,
                            duration: 0.5,
                            stagger: 0.08,
                            immediateRender: false,
                        },
                        "-=0.3"
                    );
                }
            }

            const contactInfoItems =
                contactSection.querySelectorAll<HTMLElement>(
                    `.${styles.contactInfoItem}`
                );
            if (contactInfoItems.length) {
                revealTimeline.from(
                    contactInfoItems,
                    {
                        x: -50,
                        opacity: 0,
                        duration: 0.5,
                        stagger: 0.08,
                        immediateRender: false,
                    },
                    "-=0.4"
                );
            }

            const socialLinks =
                contactSection.querySelectorAll<HTMLElement>(
                    `.${styles.socialLink}`
                );
            if (socialLinks.length) {
                revealTimeline.from(
                    socialLinks,
                    {
                        y: 30,
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.5,
                        stagger: 0.1,
                        immediateRender: false,
                    },
                    "-=0.3"
                );
            }

            ScrollTrigger.create({
                trigger: contactSection,
                start: "top 80%",
                once: true,
                onEnter: () => revealTimeline.play(),
            });

            if (ScrollTrigger.isInViewport(contactSection)) {
                revealTimeline.play(0);
            }

            const contactGlows = [
                contactSection.querySelector(`.${styles.contactGlow1}`),
                contactSection.querySelector(`.${styles.contactGlow2}`),
            ];

            contactGlows.forEach((glow, index) => {
                if (glow) {
                    gsap.to(glow, {
                        y: index % 2 === 0 ? -100 : -150,
                        x: index % 2 === 0 ? 50 : -50,
                        scrollTrigger: {
                            trigger: contactSection,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 4,
                        },
                    });
                }
            });
        },
        { scope: containerRef }
    );

    return (
        <div
            id="contact"
            ref={containerRef}
            className={styles.contactSection}
        >
            <div className={styles.contactWrapper}>
                <div className={styles.contactContent}>
                    <div className={styles.contactLeft}>
                        <h2 className={styles.contactTitle}>
                            <span className={styles.contactTitleGradient}>
                                LET&rsquo;S CREATE
                            </span>
                            <span className={styles.contactTitleWhite}>SOMETHING</span>
                            <span className={styles.contactTitleGradient}>AMAZING</span>
                        </h2>
                        <p className={styles.contactDescription}>
                            Have a project in mind? Let&rsquo;s bring your vision to life with
                            cutting-edge technology and creative design.
                        </p>

                        <div className={styles.contactInfo}>
                            <div className={styles.contactInfoItem}>
                                <span className={styles.contactIcon}>📧</span>
                                <span className={styles.contactText}>dev@kumma.me</span>
                            </div>
                            <div className={styles.contactInfoItem}>
                                <span className={styles.contactIcon}>📍</span>
                                <span className={styles.contactText}>San Francisco, CA</span>
                            </div>
                        </div>

                        <div className={styles.socialLinks}>
                            <a
                                href="https://github.com/Comma0101"
                                className={styles.socialLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className={styles.socialIcon}>GitHub</span>
                            </a>
                            <a
                                href="https://www.linkedin.com/in/yang-w-9233a3a8/"
                                className={styles.socialLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className={styles.socialIcon}>LinkedIn</span>
                            </a>
                            <a
                                href="https://x.com/Comma_9fie"
                                className={styles.socialLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className={styles.socialIcon}>Twitter</span>
                            </a>
                        </div>
                    </div>

                    <div className={styles.contactRight}>
                        <form className={styles.contactForm} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <input
                                    type="text"
                                    name="name"
                                    className={styles.formInput}
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <input
                                    type="email"
                                    name="email"
                                    className={styles.formInput}
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <input
                                    type="text"
                                    name="subject"
                                    className={styles.formInput}
                                    placeholder="Subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <textarea
                                    name="message"
                                    className={`${styles.formInput} ${styles.formTextarea}`}
                                    placeholder="Your Message"
                                    rows={6}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={styles.formButton}
                                disabled={status === "loading"}
                            >
                                <span className={styles.buttonText}>
                                    {status === "loading"
                                        ? "Sending..."
                                        : status === "success"
                                            ? "Message Sent!"
                                            : status === "error"
                                                ? "Try Again"
                                                : "Send Message"}
                                </span>
                                <span className={styles.buttonArrow}>→</span>
                            </button>
                            {status === "success" && (
                                <p className={styles.successMessage}>
                                    Thank you! Your message has been sent.
                                </p>
                            )}
                            {status === "error" && (
                                <p className={styles.errorMessage}>
                                    Something went wrong. Please try again later.
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className={styles.contactGlow1}></div>
                <div className={styles.contactGlow2}></div>
            </div>
        </div>
    );
};

export default ContactSection;
