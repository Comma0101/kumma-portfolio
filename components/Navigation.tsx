"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "../styles/navigation.module.css";

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
    // If it's a page route (starts with /), let the default behavior happen
    if (href.startsWith("/")) {
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      return; // Let the link navigate normally
    }

    e.preventDefault();
    
    // Check if we're on the home page
    const isHomePage = window.location.pathname === "/";
    
    if (isHomePage) {
      // On home page - smooth scroll to section
      const element = document.querySelector(href);
      
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: offsetTop - 80, // Offset for fixed nav height
          behavior: "smooth",
        });
      }
    } else {
      // On other page - navigate to home with hash anchor
      window.location.href = `/${href}`;
    }
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Smart scroll to top - handles both home page and other pages
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const isHomePage = window.location.pathname === "/";
    
    if (isHomePage) {
      // On home page - smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // On other page - navigate to home
      window.location.href = "/";
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
          className={styles.logo}
          onClick={scrollToTop}
          aria-label="KUMMA - Scroll to top"
        >
          KUMMA
        </a>

        {/* Desktop Navigation Links */}
        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`${styles.navLink} ${
                activeSection === link.href.substring(1) ? styles.active : ""
              }`}
              onClick={(e) => scrollToSection(e, link.href)}
              aria-current={activeSection === link.href.substring(1) ? "page" : undefined}
            >
              {link.name}
              <span className={styles.underline}></span>
            </a>
          ))}
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
          {navLinks.map((link) => (
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
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
