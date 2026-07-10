"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "../styles/navigation.module.css";
import TransitionLink from "./TransitionLink";
import { nextFocusIndex } from "./navigationBehavior";

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: "Work", href: "#work" },
  { name: "Call the agent", href: "/call" },
  { name: "Benchmark", href: "/benchmark" },
  { name: "Notes", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

// Nav items that get the accent (primary-action) styling.
const accentLinks = new Set(["Call the agent"]);

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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
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
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const background = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#main-content, footer, [data-agent-awareness]",
      ),
    ).map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));

    background.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const frame = window.requestAnimationFrame(() => {
      overlayRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      background.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [isMenuOpen]);

  const closeMenu = (restoreFocus = false) => {
    setIsMenuOpen(false);
    if (restoreFocus) {
      const previousFocus = previousFocusRef.current;
      previousFocusRef.current = null;
      window.requestAnimationFrame(() => previousFocus?.focus());
    }
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu(true);
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : menuButtonRef.current;
    setIsMenuOpen(true);
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu(true);
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = Array.from(
      overlayRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [],
    );
    const next = nextFocusIndex(
      focusable.indexOf(document.activeElement as HTMLElement),
      focusable.length,
      e.shiftKey,
    );

    if (next !== -1) {
      e.preventDefault();
      focusable[next].focus();
    }
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
                  ariaCurrent={isActive ? "page" : undefined}
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
          ref={menuButtonRef}
          className={`${styles.menuButton} ${isMenuOpen ? styles.open : ""}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
        </button>
      </div>

      <div
        ref={overlayRef}
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        onKeyDown={handleMenuKeyDown}
        onClick={() => closeMenu(true)}
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
                  ariaCurrent={isActive ? "page" : undefined}
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
