"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "../styles/home.module.css";
import galleryStyles from "../styles/GalleryPage.module.css";
import ThreeScene from "../components/ThreeScene";
import HomeGallery from "../components/HomeGallery";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const taoismIconRef = useRef<HTMLImageElement>(null);
  const transitionTriggerRef = useRef<HTMLDivElement>(null);

  // Helper function to split the headline text into individual spans
  const splitTextToSpans = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className={styles.letter}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07,
      smoothWheel: true,
    });

    lenis.on("scroll", (e: { scroll: number }) => {
      ScrollTrigger.update();
      scrollY.current = e.scroll;
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out", duration: 2.5 },
      });

      tl.from(headlineRef.current!.querySelectorAll(`.${styles.letter}`), {
        y: 120,
        opacity: 0,
        stagger: 0.08,
        rotateX: -90,
        transformOrigin: "center top",
      })
        .from(subheadlineRef.current, { y: 60, opacity: 0, duration: 2 }, "-=2")
        .from(linksRef.current, { opacity: 0, y: 30, duration: 1.5 }, "-=1.5");

      // Scroll-triggered animations
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 1.05,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "center center",
          end: "bottom top",
          scrub: 1,
        },
      });

      const aboutSection = document.querySelector("#about");
      const manifestoLines = gsap.utils.toArray<HTMLElement>(
        `.${styles.manifestoText}`
      );
      const aboutEntryTl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: "top center",
          end: "top top",
          scrub: true,
        },
      });

      aboutEntryTl.from(manifestoLines, { y: 50, opacity: 0, stagger: 0.2 });

      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: "bottom center",
          end: "bottom top",
          scrub: true,
        },
      });

      exitTl.to(manifestoLines, { y: -50, opacity: 0, scale: 1.1 });

      // Text stroke animation
      manifestoLines.forEach((line) => {
        gsap.to(line, {
          className: `${styles.manifestoText} ${styles.filled}`,
          scrollTrigger: {
            trigger: line,
            start: "top center+=50",
            end: "bottom center",
            scrub: true,
          },
        });
      });

      // Animate HomeGallery visibility
      const galleryContainer = document.querySelector(
        `.${galleryStyles.webglContainer}`
      );
      if (galleryContainer) {
        gsap.to(galleryContainer, {
          opacity: 1,
          pointerEvents: "auto",
          scrollTrigger: {
            trigger: aboutSection,
            start: "top center",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Full-screen transition
      const projectsSection = document.querySelector(
        `.${styles.projectsSection}`
      );
      gsap.set(projectsSection, { opacity: 0 });

      const transitionTl = gsap.timeline({
        scrollTrigger: {
          trigger: transitionTriggerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      transitionTl
        .to(taoismIconRef.current, {
          top: "50%",
          y: "-50%",
          ease: "power1.inOut",
        })
        .to(
          taoismIconRef.current,
          {
            scale: 50,
            ease: "power1.inOut",
          },
          ">"
        )
        .to(
          aboutSection,
          {
            opacity: 0,
            ease: "power1.inOut",
          },
          "<"
        )
        .to(
          taoismIconRef.current,
          {
            scale: 1,
            ease: "power1.inOut",
          },
          ">"
        )
        .to(
          projectsSection,
          {
            opacity: 1,
            ease: "power1.inOut",
          },
          "<"
        )
        .to(
          taoismIconRef.current,
          {
            top: "auto",
            bottom: "3rem",
            y: "0%",
            ease: "power1.inOut",
          },
          ">"
        );
    },
    { scope: containerRef }
  );

  // Poster-style headline and subheadline texts
  const headlineText = "CREATIVE CODER";
  const subheadlineText = "Art | Code | Innovation";

  return (
    <div ref={containerRef}>
      <div ref={heroRef} className={styles.heroSection}>
        <div className={styles.threeSceneContainer}>
          <ThreeScene scrollY={scrollY} />
        </div>
        <div ref={contentRef} className={styles.content}>
          <h1 ref={headlineRef} className={styles.headline}>
            {splitTextToSpans(headlineText)}
          </h1>
          <h2 ref={subheadlineRef} className={styles.subheadline}>
            {subheadlineText}
          </h2>
          <div ref={linksRef} className={styles.links}>
            <a href="#about" className={styles.interactiveLink}>
              About
            </a>
          </div>
          <div className={styles.scrollIndicator}>Scroll ↓ to Begin</div>
        </div>
      </div>
      <div ref={taoismIconRef} className={styles.taoismIcon}>
        <img src="/images/Taoism.svg" alt="Taoism Symbol" />
      </div>
      <div id="about" className={`${styles.section} ${styles.aboutSection}`}>
        <HomeGallery />
        <div className={styles.aboutContent} style={{ zIndex: 1 }}>
          <p className={styles.manifestoText}>
            Over 20 years helping startups disrupt markets & build value.
          </p>
        </div>
      </div>
      <div ref={transitionTriggerRef} style={{ height: "100vh" }}></div>
      <div className={styles.projectsSection}>
        <h2>Projects</h2>
        <div className={styles.projectGrid}>
          <div className={styles.projectCard}>Project 1</div>
          <div className={styles.projectCard}>Project 2</div>
          <div className={styles.projectCard}>Project 3</div>
          <div className={styles.projectCard}>Project 4</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
