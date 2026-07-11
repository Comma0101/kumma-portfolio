import Link from "next/link";
import styles from "../styles/footer.module.css";

type FooterVariant = "default" | "blog";

interface FooterProps {
  variant?: FooterVariant;
}

const quickLinks = [
  { label: "Work", href: "/work" },
  { label: "Demo", href: "/call" },
  { label: "Benchmark", href: "/benchmark" },
  { label: "Latency", href: "/latency" },
  { label: "Patterns", href: "/patterns" },
  { label: "KOTA", href: "/work/kota" },
  { label: "Audiobook AI", href: "/work/audiobook" },
  { label: "Notes", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Comma0101" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/yang-w-9233a3a8/" },
  { label: "X", href: "https://x.com/Comma_9fie" },
];

export default function Footer({ variant = "default" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${styles.footer} ${
        variant === "blog" ? styles.blogFooter : ""
      }`}
    >
      <div className={styles.footerShell}>
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.wordmark}>
            Kumma
          </Link>
          <p>AI systems made operational.</p>
        </div>

        <div className={styles.footerIndex}>
          <div>
            <p className={styles.groupLabel}>Navigate</p>
            {quickLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <p className={styles.groupLabel}>Connect</p>
            <a href="mailto:dev@kumma.me">Email</a>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
            <a href="/feed.xml">RSS</a>
            <Link href="/agent">Agent protocol</Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {currentYear} KUMMA</p>
          <p>AI Systems / Product Engineering / Visual Practice</p>
        </div>
      </div>
    </footer>
  );
}
