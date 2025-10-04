"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles/home.module.css";
import ThreeScene from "../components/ThreeScene";
import Projects from "../components/Projects";
import RotatingCuboids from "../components/RotatingCuboids";
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
    // Get global Lenis instance
    const lenis = (window as any).lenis;
    
    if (lenis) {
      const handleScroll = (e: { scroll: number }) => {
        scrollY.current = e.scroll;
      };
      
      lenis.on("scroll", handleScroll);
      
      return () => {
        lenis.off("scroll", handleScroll);
      };
    }
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

      // Animate main headline
      const textLine1 = document.querySelector(`.${styles.textLine1}`);
      const textLine2 = document.querySelector(`.${styles.textLine2}`);
      
      if (textLine1 && textLine2) {
        gsap.from(textLine1, {
          x: -200,
          opacity: 0,
          scale: 0.8,
          rotation: -5,
          scrollTrigger: {
            trigger: aboutSection,
            start: "top 70%",
            end: "top 40%",
            scrub: 1.5,
          },
        });

        gsap.from(textLine2, {
          x: 200,
          opacity: 0,
          scale: 0.8,
          rotation: 5,
          scrollTrigger: {
            trigger: aboutSection,
            start: "top 70%",
            end: "top 40%",
            scrub: 1.5,
          },
        });
      }

      // Animate manifesto blocks
      const manifestoBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.manifestoBlock}`);
      manifestoBlocks.forEach((block, index) => {
        gsap.from(block, {
          y: 100,
          opacity: 0,
          scale: 0.8,
          rotation: index % 2 === 0 ? -10 : 10,
          scrollTrigger: {
            trigger: block,
            start: "top 85%",
            end: "top 60%",
            scrub: 1,
          },
        });

        // Parallax effect
        gsap.to(block, {
          y: index % 2 === 0 ? -50 : -80,
          scrollTrigger: {
            trigger: block,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      });

      // Animate quote section
      const quoteSection = document.querySelector(`.${styles.quoteSection}`);
      if (quoteSection) {
        gsap.from(quoteSection, {
          scale: 0.5,
          opacity: 0,
          rotation: 10,
          scrollTrigger: {
            trigger: quoteSection,
            start: "top 80%",
            end: "top 50%",
            scrub: 1.5,
          },
        });
      }

      // Animate highlight words
      const highlights = gsap.utils.toArray<HTMLElement>(`.${styles.highlight}`);
      highlights.forEach((highlight, index) => {
        gsap.from(highlight, {
          backgroundPosition: "200% center",
          scrollTrigger: {
            trigger: highlight,
            start: "top 75%",
            end: "top 50%",
            scrub: 1,
          },
        });
      });

      // Floating elements animation
      const floatingElements = [
        document.querySelector(`.${styles.floatingElement1}`),
        document.querySelector(`.${styles.floatingElement2}`),
        document.querySelector(`.${styles.floatingElement3}`),
      ];

      floatingElements.forEach((el, index) => {
        if (el) {
          gsap.to(el, {
            y: index % 2 === 0 ? -100 : -150,
            x: index % 2 === 0 ? 50 : -50,
            rotation: 360,
            scrollTrigger: {
              trigger: aboutSection,
              start: "top bottom",
              end: "bottom top",
              scrub: 3 + index,
            },
          });
        }
      });

      // ====== SKILLS SECTION ANIMATIONS ======
      const skillsSection = document.querySelector("#skills");
      
      // Animate skills title
      const skillsTitleLine1 = document.querySelector(`.${styles.skillsTitleLine1}`);
      const skillsTitleLine2 = document.querySelector(`.${styles.skillsTitleLine2}`);
      
      if (skillsTitleLine1 && skillsTitleLine2) {
        gsap.from(skillsTitleLine1, {
          x: -300,
          opacity: 0,
          rotation: -15,
          scrollTrigger: {
            trigger: skillsSection,
            start: "top 75%",
            end: "top 45%",
            scrub: 1.5,
          },
        });

        gsap.from(skillsTitleLine2, {
          x: 300,
          opacity: 0,
          rotation: 15,
          scrollTrigger: {
            trigger: skillsSection,
            start: "top 75%",
            end: "top 45%",
            scrub: 1.5,
          },
        });
      }

      // Animate skill categories
      const skillCategories = gsap.utils.toArray<HTMLElement>(`.${styles.skillCategory}`);
      skillCategories.forEach((category, index) => {
        gsap.from(category, {
          y: 100,
          opacity: 0,
          scale: 0.8,
          rotation: index % 2 === 0 ? -10 : 10,
          scrollTrigger: {
            trigger: category,
            start: "top 85%",
            end: "top 60%",
            scrub: 1,
          },
        });

        // Parallax effect for skill categories
        gsap.to(category, {
          y: -60,
          scrollTrigger: {
            trigger: category,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });

        // Animate skill bars on scroll
        const skillBars = category.querySelectorAll(`.${styles.skillProgress}`);
        skillBars.forEach((bar) => {
          gsap.from(bar, {
            width: "0%",
            scrollTrigger: {
              trigger: bar,
              start: "top 80%",
              end: "top 60%",
              scrub: 1,
            },
          });
        });
      });

      // Animate floating particles
      const skillsParticles = [
        document.querySelector(`.${styles.skillsParticle1}`),
        document.querySelector(`.${styles.skillsParticle2}`),
        document.querySelector(`.${styles.skillsParticle3}`),
      ];

      skillsParticles.forEach((particle, index) => {
        if (particle) {
          gsap.to(particle, {
            y: index % 2 === 0 ? -120 : -180,
            x: index % 2 === 0 ? 60 : -60,
            scrollTrigger: {
              trigger: skillsSection,
              start: "top bottom",
              end: "bottom top",
              scrub: 3 + index,
            },
          });
        }
      });

      // ====== CONTACT SECTION ANIMATIONS ======
      const contactSection = document.querySelector("#contact");
      
      // Animate contact title lines
      const contactTitleLines = gsap.utils.toArray<HTMLElement>(
        `.${styles.contactTitleGradient}, .${styles.contactTitleWhite}`
      );
      
      contactTitleLines.forEach((line, index) => {
        gsap.from(line, {
          x: index % 2 === 0 ? -200 : 200,
          opacity: 0,
          scrollTrigger: {
            trigger: contactSection,
            start: "top 75%",
            end: "top 50%",
            scrub: 1,
          },
        });
      });

      // Animate contact left content
      const contactLeft = document.querySelector(`.${styles.contactLeft}`);
      if (contactLeft) {
        gsap.from(contactLeft, {
          x: -100,
          opacity: 0,
          scrollTrigger: {
            trigger: contactLeft,
            start: "top 80%",
            end: "top 55%",
            scrub: 1.5,
          },
        });
      }

      // Animate contact form
      const contactRight = document.querySelector(`.${styles.contactRight}`);
      if (contactRight) {
        gsap.from(contactRight, {
          x: 100,
          opacity: 0,
          scale: 0.9,
          scrollTrigger: {
            trigger: contactRight,
            start: "top 80%",
            end: "top 55%",
            scrub: 1.5,
          },
        });

        // Animate form inputs
        const formInputs = contactRight.querySelectorAll(`.${styles.formGroup}`);
        formInputs.forEach((input, index) => {
          gsap.from(input, {
            y: 30,
            opacity: 0,
            scrollTrigger: {
              trigger: input,
              start: "top 85%",
              end: "top 70%",
              scrub: 1,
            },
          });
        });
      }

      // Animate contact info items
      const contactInfoItems = gsap.utils.toArray<HTMLElement>(`.${styles.contactInfoItem}`);
      contactInfoItems.forEach((item, index) => {
        gsap.from(item, {
          x: -50,
          opacity: 0,
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            end: "top 70%",
            scrub: 1,
          },
        });
      });

      // Animate social links
      const socialLinks = gsap.utils.toArray<HTMLElement>(`.${styles.socialLink}`);
      socialLinks.forEach((link, index) => {
        gsap.from(link, {
          y: 30,
          opacity: 0,
          scale: 0.8,
          scrollTrigger: {
            trigger: link,
            start: "top 85%",
            end: "top 70%",
            scrub: 1,
          },
        });
      });

      // Animate decorative glows
      const contactGlows = [
        document.querySelector(`.${styles.contactGlow1}`),
        document.querySelector(`.${styles.contactGlow2}`),
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

      // Full-screen transition
      const projectsSection = document.querySelector(
        `.${styles.projectsSection}`
      );
      if (projectsSection) {
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
      }
    },
    { scope: containerRef }
  );

  // Poster-style headline and subheadline texts
  const headlineText = "CREATIVE CODER";
  const subheadlineText = "Art | Code | Innovation";

  return (
    <div ref={containerRef} className={styles.homeContainer}>
      <div id="home" ref={heroRef} className={styles.heroSection}>
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
        <div className={styles.aboutWrapper}>
          {/* Main headline with split animation */}
          <div className={styles.aboutHeadline}>
            <h2 className={styles.aboutMainText}>
              <span className={styles.textLine1}>BUILDING</span>
              <span className={styles.textLine2}>THE FUTURE</span>
            </h2>
          </div>

          {/* Creative manifesto blocks */}
          <div className={styles.manifestoGrid}>
            <div className={styles.manifestoBlock}>
              <span className={styles.blockNumber}>20+</span>
              <p className={styles.blockText}>Years shaping digital experiences</p>
            </div>
            
            <div className={styles.manifestoBlock}>
              <span className={styles.blockHighlight}>DISRUPT</span>
              <p className={styles.blockText}>Markets through innovation</p>
            </div>
            
            <div className={styles.manifestoBlock}>
              <span className={styles.blockHighlight}>CREATE</span>
              <p className={styles.blockText}>Value from bold ideas</p>
            </div>
            
            <div className={styles.manifestoBlock}>
              <span className={styles.blockNumber}>∞</span>
              <p className={styles.blockText}>Possibilities in every line of code</p>
            </div>
          </div>

          {/* Animated quote section */}
          <div className={styles.quoteSection}>
            <p className={styles.quoteText}>
              <span className={styles.quoteMark}>"</span>
              <span className={styles.quoteContent}>
                Where <span className={styles.highlight}>Art</span> meets{" "}
                <span className={styles.highlight}>Technology</span>, magic happens.
              </span>
              <span className={styles.quoteMark}>"</span>
            </p>
          </div>

          {/* Floating decorative elements */}
          <div className={styles.floatingElement1}></div>
          <div className={styles.floatingElement2}></div>
          <div className={styles.floatingElement3}></div>
        </div>
      </div>

      <div id="cuboids" className={styles.cuboidsSection}>
        <RotatingCuboids />
      </div>

      <div id="projects" className={styles.projectsSection}>
        <Projects />
      </div>

      {/* Skills Section */}
      <div id="skills" className={`${styles.section} ${styles.skillsSection}`}>
        <div className={styles.skillsWrapper}>
          <h2 className={styles.skillsTitle}>
            <span className={styles.skillsTitleLine1}>TECH</span>
            <span className={styles.skillsTitleLine2}>ARSENAL</span>
          </h2>

          <div className={styles.skillsGrid}>
            {/* Frontend */}
            <div className={styles.skillCategory}>
              <div className={styles.categoryIcon}>⚡</div>
              <h3 className={styles.categoryTitle}>Frontend</h3>
              <div className={styles.skillsList}>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>React / Next.js</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>TypeScript</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>GSAP / Three.js</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backend */}
            <div className={styles.skillCategory}>
              <div className={styles.categoryIcon}>🔧</div>
              <h3 className={styles.categoryTitle}>Backend</h3>
              <div className={styles.skillsList}>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>Node.js / Express</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>Python / Django</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>PostgreSQL / MongoDB</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tools & Cloud */}
            <div className={styles.skillCategory}>
              <div className={styles.categoryIcon}>☁️</div>
              <h3 className={styles.categoryTitle}>Cloud & DevOps</h3>
              <div className={styles.skillsList}>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>AWS / Vercel</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>Docker / K8s</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>CI/CD Pipelines</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Design */}
            <div className={styles.skillCategory}>
              <div className={styles.categoryIcon}>🎨</div>
              <h3 className={styles.categoryTitle}>Design</h3>
              <div className={styles.skillsList}>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>UI/UX Design</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '93%' }}></div>
                  </div>
                </div>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>Figma / Adobe XD</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '91%' }}></div>
                  </div>
                </div>
                <div className={styles.skillItem}>
                  <span className={styles.skillName}>Motion Design</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillProgress} style={{ width: '86%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating particles */}
          <div className={styles.skillsParticle1}></div>
          <div className={styles.skillsParticle2}></div>
          <div className={styles.skillsParticle3}></div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className={`${styles.section} ${styles.contactSection}`}>
        <div className={styles.contactWrapper}>
          <div className={styles.contactContent}>
            <div className={styles.contactLeft}>
              <h2 className={styles.contactTitle}>
                <span className={styles.contactTitleGradient}>LET'S CREATE</span>
                <span className={styles.contactTitleWhite}>SOMETHING</span>
                <span className={styles.contactTitleGradient}>AMAZING</span>
              </h2>
              <p className={styles.contactDescription}>
                Have a project in mind? Let's bring your vision to life with cutting-edge 
                technology and creative design.
              </p>
              
              <div className={styles.contactInfo}>
                <div className={styles.contactInfoItem}>
                  <span className={styles.contactIcon}>📧</span>
                  <span className={styles.contactText}>contact@kumma.dev</span>
                </div>
                <div className={styles.contactInfoItem}>
                  <span className={styles.contactIcon}>📍</span>
                  <span className={styles.contactText}>San Francisco, CA</span>
                </div>
              </div>

              <div className={styles.socialLinks}>
                <a href="https://github.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                  <span className={styles.socialIcon}>GitHub</span>
                </a>
                <a href="https://linkedin.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                  <span className={styles.socialIcon}>LinkedIn</span>
                </a>
                <a href="https://twitter.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                  <span className={styles.socialIcon}>Twitter</span>
                </a>
              </div>
            </div>

            <div className={styles.contactRight}>
              <form className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="Your Email"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Subject"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <textarea
                    className={`${styles.formInput} ${styles.formTextarea}`}
                    placeholder="Your Message"
                    rows={6}
                    required
                  />
                </div>
                <button type="submit" className={styles.formButton}>
                  <span className={styles.buttonText}>Send Message</span>
                  <span className={styles.buttonArrow}>→</span>
                </button>
              </form>
            </div>
          </div>

          {/* Decorative elements */}
          <div className={styles.contactGlow1}></div>
          <div className={styles.contactGlow2}></div>
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
