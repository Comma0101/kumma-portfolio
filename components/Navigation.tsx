"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "../styles/navigation.module.css";
import TransitionLink from "./TransitionLink";

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: "Work", href: "#work" },
  { name: "Demo", href: "/call" },
  { name: "Benchmark", href: "/benchmark" },
  { name: "Notes", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

// Nav items that get the accent (primary-action) styling.
const accentLinks = new Set(["Demo"]);

const homeSectionIds = ["home", "work", "philosophy", "contact"];

interface LenisInstance {
  scroll: number;
  on: (event: "scroll", callback: (data: { scroll: number }) => void) => void;
  off: (event: "scroll", callback: (data: { scroll: number }) => void) => void;
  scrollTo: (target: number | HTMLElement, options?: { offset?: number }) => void;
}

const Navigation = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setActiveSection("");
      setIsScrolled(true);
      return;
    }

    const updateNavigation = (scroll: number) => {
      setIsScrolled(scroll > 48);
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

    let lenis: LenisInstance | undefined;
    let frame = 0;

    const handleLenisScroll = ({ scroll }: { scroll: number }) => {
      updateNavigation(scroll);
    };
    const handleResize = () => updateNavigation(lenis?.scroll ?? window.scrollY);

    frame = window.requestAnimationFrame(() => {
      lenis = (window as Window & { lenis?: LenisInstance }).lenis;
      updateNavigation(lenis?.scroll ?? window.scrollY);
      lenis?.on("scroll", handleLenisScroll);
    });
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis?.off("scroll", handleLenisScroll);
      window.removeEventListener("resize", handleResize);
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
        const lenis = (window as Window & { lenis?: LenisInstance }).lenis;
        if (lenis) {
          lenis.scrollTo(element, { offset: -82 });
        } else {
          const offsetTop =
            element.getBoundingClientRect().top + window.scrollY - 82;
          window.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
        }
      }
    } else {
      router.push(`/${href}`);
    }

    closeMenu();
  };

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (isHomePage) {
      const lenis = (window as Window & { lenis?: LenisInstance }).lenis;
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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

  if (pathname === "/build" || pathname === "/build/") return null;

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
          aria-label="Kumma - Scroll to top"
        >
          <span className={styles.logoWordmark}>Kumma</span>
          <span className={styles.logoMeta}>Independent systems builder</span>
        </a>

        <div className={styles.navLinks}>
          {navLinks.map((link) => {
            const isActive = link.href.startsWith("/")
              ? isRouteLinkActive(link.href)
              : isAnchorActive(link.href);

            if (link.href.startsWith("/")) {
              return (
                <TransitionLink
                  key={link.name}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""} ${
                  accentLinks.has(link.name) ? styles.contactLink : ""
                }`}
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
                className={`${styles.navLink} ${isActive ? styles.active : ""} ${
                  accentLinks.has(link.name) ? styles.contactLink : ""
                }`}
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
        <div className={styles.mobileLinksContainer} onClick={(e) => e.stopPropagation()}>
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
