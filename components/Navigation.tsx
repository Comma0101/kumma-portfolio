"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "../styles/navigation.module.css";
import TransitionLink from "./TransitionLink";

interface NavLink {
  name: string;
  href: string;
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

const navLinks: NavLink[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
  { name: "Gallery", href: "/gallery" },
  { name: "Stories", href: "/stories" },
  { name: "Blog", href: "/blog" },
];

const homeSectionIds = ["home", "about", "projects", "skills", "contact"];

const Navigation = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      setActiveSection("");
      return;
    }

    const updateActiveSection = () => {
      const offset = 120;
      let current = homeSectionIds[0];

      homeSectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;

        const top = element.getBoundingClientRect().top;
        if (top <= offset) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [isHomePage]);

  useEffect(() => {
    setIsNavVisible(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    if (href.startsWith("/")) {
      closeMenu();
      return;
    }

    const targetId = href.substring(1);

    if (isHomePage) {
      const element = document.getElementById(targetId);
      if (element) {
        setActiveSection(targetId);
        const offsetTop =
          element.getBoundingClientRect().top + window.scrollY - 82;
        window.scrollTo({
          top: Math.max(0, offsetTop),
          behavior: "smooth",
        });
      }
    } else {
      router.push(`/${href}`);
    }

    closeMenu();
  };

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      closeMenu();
      return;
    }

    closeMenu();
    router.push("/");
  };

  const isRouteLinkActive = (href: string) => {
    if (!href.startsWith("/")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isAnchorActive = (href: string) => {
    if (!href.startsWith("#") || !isHomePage) return false;
    return activeSection === href.substring(1);
  };

  return (
    <nav
      className={`${styles.navigation} ${
        isScrolled || !isHomePage ? styles.pageNav : ""
      } ${isNavVisible ? styles.navigationVisible : ""}`}
      aria-label="Main navigation"
    >
      <div className={styles.navContainer}>
        <a
          href="#home"
          className={styles.logoWrapper}
          onClick={scrollToTop}
          aria-label="KUMMA - Scroll to top"
        >
          <span className={`${styles.logoWordmark} ${cormorant.className}`}>
            KUMMA
          </span>
          <span className={`${styles.logoMeta} ${spaceGrotesk.className}`}>
            Portfolio / 2026
          </span>
        </a>

        <div className={`${styles.navLinks} ${spaceGrotesk.className}`}>
          {navLinks.map((link) => {
            const isActive = link.href.startsWith("/")
              ? isRouteLinkActive(link.href)
              : isAnchorActive(link.href);

            if (link.href.startsWith("/")) {
              return (
                <TransitionLink
                  key={link.name}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                >
                  {link.name}
                  <span className={styles.underline}></span>
                </TransitionLink>
              );
            }

            return (
              <a
                key={link.name}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                onClick={(e) => scrollToSection(e, link.href)}
                aria-current={isActive ? "page" : undefined}
              >
                {link.name}
                <span className={styles.underline}></span>
              </a>
            );
          })}
        </div>

        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.open : ""}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
        </button>
      </div>

      <div
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
        onClick={closeMenu}
      >
        <div
          className={`${styles.mobileLinksContainer} ${spaceGrotesk.className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <p className={styles.mobileKicker}>Navigation</p>
          {navLinks.map((link) => {
            const isActive = link.href.startsWith("/")
              ? isRouteLinkActive(link.href)
              : isAnchorActive(link.href);

            if (link.href.startsWith("/")) {
              return (
                <TransitionLink
                  key={link.name}
                  href={link.href}
                  onNavigate={closeMenu}
                  className={`${styles.mobileLink} ${isActive ? styles.active : ""}`}
                >
                  {link.name}
                </TransitionLink>
              );
            }

            return (
              <a
                key={link.name}
                href={link.href}
                className={`${styles.mobileLink} ${isActive ? styles.active : ""}`}
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.name}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
