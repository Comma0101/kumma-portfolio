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
  // const taoismIconRef = useRef<HTMLImageElement>(null);
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

      // Variable font weight animation for about quote
      const aboutQuote = document.querySelector("#aboutQuote");
      if (aboutQuote) {
        // Split text into words manually
        const text = aboutQuote.textContent || "";
        const words = text.split(" ");
        aboutQuote.innerHTML = words
          .map((word, i) => `<span class="${styles.word}" data-index="${i}">${word}</span>`)
          .join(" ");

        const wordElements = aboutQuote.querySelectorAll(`.${styles.word}`);
        
        // Animate words appearing and changing color on scroll
        gsap.fromTo(wordElements, {
          opacity: 0,
          y: 20,
        }, {
          opacity: 1,
          y: 0,
          fontWeight: 900,
          color: "#fafafa",
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: aboutSection,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 2,
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
          gsap.fromTo(el, {
            y: 0,
            x: 0,
            rotation: 0,
            scale: 1,
          }, {
            y: index % 2 === 0 ? -250 : -300,
            x: index % 2 === 0 ? 150 : -150,
            rotation: index % 2 === 0 ? 90 : -90,
            scale: 1.3,
            ease: "none",
            scrollTrigger: {
              trigger: aboutSection,
              start: "top bottom",
              end: "bottom top",
              scrub: 2 + index * 0.5,
              immediateRender: false,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      // ====== SKILLS SECTION ANIMATIONS ======
      const skillsSection = document.querySelector("#skills");
      
      // Animate skills title
      const skillsTitle = document.querySelector(`.${styles.skillsTitle}`);
      if (skillsTitle) {
        gsap.fromTo(skillsTitle, {
          opacity: 0,
          y: 100,
        }, {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: skillsSection,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          },
        });
      }

      // Scroll-based animation for skill groups
      const skillGroups = gsap.utils.toArray<HTMLElement>(`.${styles.skillGroup}`);
      
      skillGroups.forEach((group) => {
        const titleElement = group.querySelector(`.${styles.skillGroupTitle}`);
        const skillItems = gsap.utils.toArray<HTMLElement>(group.querySelectorAll(`.${styles.skillItem}`));

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: group,
            start: "top 80%",
            end: "top 50%",
            scrub: 1.5,
          },
        });

        if (titleElement) {
          tl.from(titleElement, {
            opacity: 0,
            y: 30,
            ease: "power2.out",
          });
        }

        tl.from(skillItems, {
          opacity: 0,
          y: 20,
          stagger: 0.05,
          ease: "power2.out",
        }, "-=0.3");
      });

      // Scramble text function for hover
      const scrambleText = (element: HTMLElement) => {
        const originalText = element.getAttribute('data-text') || element.textContent || '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
        const textLength = originalText.length;
        let iteration = 0;
        
        const interval = setInterval(() => {
          element.textContent = originalText
            .split('')
            .map((char, index) => {
              if (index < iteration) {
                return originalText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
          
          iteration += 1 / 3;
          
          if (iteration >= textLength) {
            clearInterval(interval);
            element.textContent = originalText;
          }
        }, 30);
      };
      
      // Add hover scramble effect to all skill items
      const allSkillItems = gsap.utils.toArray<HTMLElement>(`.${styles.skillItem}`);
      allSkillItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
          scrambleText(item);
        });
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
        // gsap.set(projectsSection, { opacity: 0 });

        // const transitionTl = gsap.timeline({
        //   scrollTrigger: {
        //     trigger: transitionTriggerRef.current,
        //     start: "top bottom",
        //     end: "bottom top",
        //     scrub: 1,
        //   },
        // });

        // transitionTl
        //   .to(taoismIconRef.current, {
        //     top: "50%",
        //     y: "-50%",
        //     ease: "power1.inOut",
        //   })
        //   .to(
        //     taoismIconRef.current,
        //     {
        //       scale: 50,
        //       ease: "power1.inOut",
        //     },
        //     ">"
        //   )
        //   .to(
        //     aboutSection,
        //     {
        //       opacity: 0,
        //       ease: "power1.inOut",
        //     },
        //     "<"
        //   )
        //   .to(
        //     taoismIconRef.current,
        //     {
        //       scale: 1,
        //       ease: "power1.inOut",
        //     },
        //     ">"
        //   )
        //   .to(
        //     projectsSection,
        //     {
        //       opacity: 1,
        //       ease: "power1.inOut",
        //     },
        //     "<"
        //   )
        //   .to(
        //     taoismIconRef.current,
        //     {
        //       top: "auto",
        //       bottom: "3rem",
        //       y: "0%",
        //       ease: "power1.inOut",
        //     },
        //     ">"
        //   );
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
          </div>
        </div>
        <div className={styles.scrollIndicator}>Scroll ↓ to Begin</div>
      </div>
      <div id="about" className={`${styles.section} ${styles.aboutSection}`}>
        <div className={styles.aboutWrapper}>
          <h2 id="aboutQuote" className={styles.aboutQuote}>
            Building tomorrow's digital experiences with passion, precision, and purpose. Where innovation meets artistry, and code becomes poetry.
          </h2>
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
            <span className={styles.skillsTitleAccent}>{'<'}</span>
            Tech Stack
            <span className={styles.skillsTitleAccent}>{' />'}</span>
          </h2>
          
          <div className={styles.skillsGrid}>
            {/* Frontend */}
            <div className={styles.skillGroup}>
              <h3 className={styles.skillGroupTitle}>
                Frontend
              </h3>
              <div className={styles.skillItems}>
                <span className={`${styles.skillItem} ${styles.skillPrimary}`} data-text="React">React</span>
                <span className={`${styles.skillItem} ${styles.skillPrimary}`} data-text="Next.js">Next.js</span>
                <span className={`${styles.skillItem} ${styles.skillPrimary}`} data-text="TypeScript">TypeScript</span>
                <span className={`${styles.skillItem}`} data-text="JavaScript">JavaScript</span>
                <span className={`${styles.skillItem}`} data-text="HTML5">HTML5</span>
                <span className={`${styles.skillItem}`} data-text="CSS3">CSS3</span>
              </div>
            </div>

            {/* Styling & Animation */}
            <div className={styles.skillGroup}>
              <h3 className={styles.skillGroupTitle}>
                Styling & Animation
              </h3>
              <div className={styles.skillItems}>
                <span className={`${styles.skillItem} ${styles.skillPrimary}`} data-text="GSAP">GSAP</span>
                <span className={`${styles.skillItem}`} data-text="Three.js">Three.js</span>
                <span className={`${styles.skillItem}`} data-text="Tailwind">Tailwind CSS</span>
                <span className={`${styles.skillItem}`} data-text="Framer Motion">Framer Motion</span>
                <span className={`${styles.skillItem}`} data-text="SCSS">SCSS</span>
              </div>
            </div>

            {/* Backend & Database */}
            <div className={styles.skillGroup}>
              <h3 className={styles.skillGroupTitle}>
                Backend & Database
              </h3>
              <div className={styles.skillItems}>
                <span className={`${styles.skillItem} ${styles.skillPrimary}`} data-text="Node.js">Node.js</span>
                <span className={`${styles.skillItem}`} data-text="Express">Express</span>
                <span className={`${styles.skillItem} ${styles.skillPrimary}`} data-text="PostgreSQL">PostgreSQL</span>
                <span className={`${styles.skillItem}`} data-text="MongoDB">MongoDB</span>
                <span className={`${styles.skillItem}`} data-text="REST API">REST API</span>
              </div>
            </div>

            {/* Tools & DevOps */}
            <div className={styles.skillGroup}>
              <h3 className={styles.skillGroupTitle}>
                Tools & DevOps
              </h3>
              <div className={styles.skillItems}>
                <span className={`${styles.skillItem} ${styles.skillPrimary}`} data-text="Git">Git</span>
                <span className={`${styles.skillItem} ${styles.skillPrimary}`} data-text="Docker">Docker</span>
                <span className={`${styles.skillItem}`} data-text="AWS">AWS</span>
                <span className={`${styles.skillItem}`} data-text="Vercel">Vercel</span>
                <span className={`${styles.skillItem}`} data-text="CI/CD">CI/CD</span>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default Home;
