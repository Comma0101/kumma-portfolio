"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "../styles/navigation.module.css";
import Logo3D from "./Logo3D";
import TransitionLink from "./TransitionLink";

gsap.registerPlugin(ScrollTrigger);

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Gallery", href: "/gallery" },
  { name: "Skills", href: "#skills" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

const Navigation = () => {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

  // Initial nav animation on page load
  useGSAP(() => {
    if (navRef.current) {
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
      });
    }
  }, []);

  // Handle scroll background change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section detection with ScrollTrigger
  useEffect(() => {
    const sections = ["home", "about", "projects", "skills", "contact"];
    
    sections.forEach((section) => {
      const element = document.querySelector(`#${section}`);
      if (element) {
        ScrollTrigger.create({
          trigger: element,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveSection(section),
          onEnterBack: () => setActiveSection(section),
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Smart scroll to section - handles both home page and other pages
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // If it's a page route (starts with /), let the default behavior happen
    if (href.startsWith("/")) {
      if (isMenuOpen) setIsMenuOpen(false);
      // Note: We let TransitionLink handle the navigation for page routes
      return;
    }
    
    const isHomePage = window.location.pathname === "/";
    const targetId = href.substring(1);

    if (isHomePage) {
      const element = document.getElementById(targetId);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: offsetTop - 80, // Offset for fixed nav height
          behavior: "smooth",
        });
      }
    } else {
      router.push("/");
      // After navigating, wait for the next frame to scroll
      requestAnimationFrame(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    }
    
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Smart scroll to top - handles both home page and other pages
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const isHomePage = window.location.pathname === "/";
    
    if (isHomePage) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      router.push("/");
      // After navigating, wait for the next frame to scroll to top
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }
  };

  // Mobile menu animation
  useEffect(() => {
    if (menuRef.current && linksRef.current) {
      if (isMenuOpen) {
        // Open menu
        gsap.to(menuRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power3.out",
        });

        // Stagger links in
        const links = linksRef.current.querySelectorAll(`.${styles.mobileLink}`);
        gsap.from(links, {
          x: 100,
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        });
      } else {
        // Close menu
        gsap.to(menuRef.current, {
          x: "100%",
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
        });
      }
    }
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  return (
    <nav
      ref={navRef}
      className={`${styles.navigation} ${isScrolled ? styles.scrolled : ""}`}
      aria-label="Main navigation"
    >
      <div className={styles.navContainer}>
        {/* Logo/Brand */}
        <a
          href="#home"
          className={styles.logoWrapper}
          onClick={scrollToTop}
          aria-label="KUMMA - Scroll to top"
        >
          <Logo3D />
        </a>

        {/* Desktop Navigation Links */}
        <div className={styles.navLinks}>
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <TransitionLink
                key={link.name}
                href={link.href}
                className={`${styles.navLink} ${
                  activeSection === link.href.substring(1) ? styles.active : ""
                }`}
              >
                {link.name}
                <span className={styles.underline}></span>
              </TransitionLink>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className={`${styles.navLink} ${
                  activeSection === link.href.substring(1) ? styles.active : ""
                }`}
                onClick={(e) => scrollToSection(e, link.href)}
                aria-current={
                  activeSection === link.href.substring(1) ? "page" : undefined
                }
              >
                {link.name}
                <span className={styles.underline}></span>
              </a>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.open : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        ref={menuRef}
        className={styles.mobileMenu}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          ref={linksRef}
          className={styles.mobileLinksContainer}
          onClick={(e) => e.stopPropagation()}
        >
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <TransitionLink
                key={link.name}
                href={link.href}
                className={`${styles.mobileLink} ${
                  activeSection === link.href.substring(1) ? styles.active : ""
                }`}
              >
                {link.name}
              </TransitionLink>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className={`${styles.mobileLink} ${
                  activeSection === link.href.substring(1) ? styles.active : ""
                }`}
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.name}
              </a>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
