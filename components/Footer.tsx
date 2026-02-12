"use client";

import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "../styles/footer.module.css";

type FooterVariant = "default" | "blog";

interface FooterProps {
  variant?: FooterVariant;
}

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Contact", href: "/#contact" },
  { label: "Blog", href: "/blog" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Comma0101" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/yang-w-9233a3a8/" },
  { label: "Twitter", href: "https://x.com/Comma_9fie" },
];

const Footer = ({ variant = "default" }: FooterProps) => {
  const isBlog = variant === "blog";
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} ${isBlog ? styles.blogFooter : ""}`}>
      <div className={styles.footerShell}>
        <header className={styles.footerIntro}>
          <p className={`${styles.footerEyebrow} ${spaceGrotesk.className}`}>
            {isBlog ? "Journal Continuum" : "Final Chapter"}
          </p>
          <h3 className={`${styles.footerHeadline} ${cormorant.className}`}>
            {isBlog
              ? "Ideas Should Echo Beyond The Scroll."
              : "Good Work Begins With A Clear Conversation."}
          </h3>
          <p className={`${styles.footerCopy} ${spaceGrotesk.className}`}>
            {isBlog
              ? "Read, reflect, then reach out. The same design philosophy continues from page to page."
              : "If the direction aligns, send a short brief and we can shape the next build with intent."}
          </p>
        </header>

        <div className={styles.footerGrid}>
          <section className={styles.footerColumn}>
            <p className={`${styles.columnTitle} ${spaceGrotesk.className}`}>Studio</p>
            <p className={`${styles.brandMark} ${cormorant.className}`}>KUMMA</p>
            <p className={`${styles.brandLine} ${spaceGrotesk.className}`}>
              Crafting narrative-driven interfaces where typography, motion, and
              systems feel coherent.
            </p>
          </section>

          <section className={styles.footerColumn}>
            <p className={`${styles.columnTitle} ${spaceGrotesk.className}`}>
              Navigate
            </p>
            <ul className={styles.linkList}>
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={`${styles.footerLink} ${spaceGrotesk.className}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.footerColumn}>
            <p className={`${styles.columnTitle} ${spaceGrotesk.className}`}>
              Contact
            </p>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="mailto:dev@kumma.me"
                  className={`${styles.footerLink} ${spaceGrotesk.className}`}
                >
                  dev@kumma.me
                </a>
              </li>
              <li>
                <span className={`${styles.contactItem} ${spaceGrotesk.className}`}>
                  San Francisco, CA
                </span>
              </li>
              <li>
                <span className={`${styles.contactItem} ${spaceGrotesk.className}`}>
                  Mon - Fri / 9AM - 6PM PST
                </span>
              </li>
            </ul>
          </section>

          <section className={styles.footerColumn}>
            <p className={`${styles.columnTitle} ${spaceGrotesk.className}`}>
              Social
            </p>
            <div className={styles.socialCluster}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.socialLink} ${spaceGrotesk.className}`}
                >
                  {social.label} <span aria-hidden="true">-&gt;</span>
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.footerBottom}>
          <p className={`${styles.footerBottomCopy} ${spaceGrotesk.className}`}>
            © {currentYear} KUMMA. All rights reserved.
          </p>
          <p className={`${styles.footerBottomMeta} ${spaceGrotesk.className}`}>
            Built with Next.js, TypeScript, and motion studies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
