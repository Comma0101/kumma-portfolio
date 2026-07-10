"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "@/styles/kotaCaseStudy.module.css";
import KotaViz from "@/components/viz/KotaViz";
import AudioSlot from "@/components/AudioSlot";

gsap.registerPlugin(ScrollTrigger);

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const proofCaption =
  "Messy speech becomes a menu-verified ticket with confidence checks.";

// The six-step pipeline, reused verbatim from the flagship KOTA page.
const pipeline = [
  {
    step: "01",
    label: "Call",
    input: "Incoming phone call",
    transform: "Telephony capture via streaming",
    output: "Raw audio stream",
  },
  {
    step: "02",
    label: "Speech",
    input: "Raw audio stream",
    transform: "Deepgram Nova-2 real-time transcription",
    output: "Unstructured text with timestamps",
  },
  {
    step: "03",
    label: "Intent",
    input: "Unstructured transcript",
    transform: "LLM extracts items, quantities, modifiers",
    output: "Structured intent object",
  },
  {
    step: "04",
    label: "Menu Grounding",
    input: "Intent object",
    transform: "Validated against live menu data, resolves ambiguity",
    output: "Menu-verified order items",
  },
  {
    step: "05",
    label: "Resolution",
    input: "Verified items",
    transform: "Confidence check, missing-info detection, confirmation loop",
    output: "Complete order ticket",
  },
  {
    step: "06",
    label: "Output",
    input: "Order ticket",
    transform: "Direct integration to kitchen workflow",
    output: "Active order, no staff intervention",
  },
];

const leadStyle: CSSProperties = {
  margin: "0 0 1.6rem",
  maxWidth: "62ch",
  fontSize: "clamp(0.98rem, 1.4vw, 1.12rem)",
  lineHeight: 1.7,
  color: "rgba(220, 220, 220, 0.7)",
};

// Empty "awaiting measured results" slot. Intentionally holds no numbers.
const awaitingWrap: CSSProperties = {
  border: "1px dashed rgba(255, 255, 255, 0.14)",
  borderRadius: "var(--radius-card, 14px)",
  background: "rgba(8, 8, 8, 0.5)",
  padding: "clamp(1.6rem, 3vw, 2.4rem)",
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
};

const awaitingTag: CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.66rem",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(163, 181, 168, 0.75)",
};

const awaitingBody: CSSProperties = {
  margin: 0,
  maxWidth: "60ch",
  fontSize: "0.9rem",
  lineHeight: 1.7,
  color: "rgba(220, 220, 220, 0.5)",
};

export default function KotaCaseStudy() {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    if (reduceMotion) {
      return () => {
        cancelAnimationFrame(rafId);
      };
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      );

      if (sectionsRef.current) {
        const blocks = sectionsRef.current.querySelectorAll("[data-animate]");
        blocks.forEach((block, i) => {
          gsap.fromTo(
            block,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: i * 0.05,
              ease: "power3.out",
              scrollTrigger: {
                trigger: block,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
        });
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <header ref={heroRef} className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={`${styles.eyebrow} ${grotesk.className}`}>Case study</p>
          <h1 className={`${styles.title} ${cormorant.className}`}>KOTA</h1>
          <p className={`${styles.subtitle} ${cormorant.className}`}>
            Conversation as infrastructure.
          </p>
          <p className={`${styles.heroDesc} ${grotesk.className}`}>
            Turns restaurant phone calls into structured, actionable orders
            without requiring the restaurant to replace or deeply integrate its
            POS.
          </p>
          <p className={`${styles.heroContext} ${grotesk.className}`}>
            Built for environments where missed calls mean lost revenue, and
            speed matters more than perfect inputs. This page documents how the
            system works, and where it does not.
          </p>
          <p className={`${styles.stackLine} ${grotesk.className}`}>
            Voice Agent · LLM Orchestration · Menu Intelligence · Real-time
            Streaming · Order Sync
          </p>
        </div>

        <div className={styles.heroProof}>
          <section className={styles.vizSection} aria-hidden="true">
            <KotaViz size="teaser" />
          </section>
          <p className={`${styles.proofCaption} ${grotesk.className}`}>
            {proofCaption}
          </p>
        </div>
      </header>

      <div ref={sectionsRef}>
        {/* ── What actually happens ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            What actually happens
          </h2>
          <div className={styles.realityBlock}>
            <div className={styles.realityInput}>
              <p className={`${styles.realityTag} ${grotesk.className}`}>
                Customer says
              </p>
              <blockquote
                className={`${styles.realityQuote} ${cormorant.className}`}
              >
                &ldquo;uh yeah can I get like two orange chickens and... wait do
                you guys have chow mein?&rdquo;
              </blockquote>
              <div className={`${styles.realitySignals} ${grotesk.className}`}>
                <span className={styles.signal}>hesitation</span>
                <span className={styles.signal}>filler words</span>
                <span className={styles.signal}>menu ambiguity</span>
                <span className={styles.signal}>mid-sentence correction</span>
              </div>
            </div>
            <div className={styles.realityArrow} aria-hidden="true">
              <span className={styles.arrowLine} />
              <span className={`${styles.arrowLabel} ${grotesk.className}`}>
                processed
              </span>
            </div>
            <div className={styles.realityOutput}>
              <p className={`${styles.realityTag} ${grotesk.className}`}>
                Structured result
              </p>
              <div className={`${styles.outputBlock} ${grotesk.className}`}>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>item</span>
                  <span className={styles.outputVal}>Orange Chicken ×2</span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>item</span>
                  <span className={styles.outputVal}>
                    Chow Mein ×1{" "}
                    <span className={styles.outputNote}>(confirmed)</span>
                  </span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>confidence</span>
                  <span className={styles.outputConfidence}>high</span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>missing info</span>
                  <span className={styles.outputVal}>none</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The problem
          </h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Restaurants miss calls during peak hours.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                Lost orders. Lost revenue. No record of what was missed.
              </p>
            </div>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Staff are forced to choose between phone and counter.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                Inconsistent handling. Customers repeat themselves. Errors
                compound.
              </p>
            </div>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Existing solutions require POS lock-in or workflow rewrites.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                Adoption fails because the cure is more invasive than the
                disease.
              </p>
            </div>
          </div>
        </section>

        {/* ── Constraints ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Constraints
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            The design had to fit into a working kitchen without asking it to
            change. Every constraint below is a line the system does not cross.
          </p>
          <div className={styles.handlingGrid}>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>No POS replacement</span>
              <span className={styles.handlingDesc}>
                Structured tickets reach the kitchen workflow directly, without
                replacing or deeply integrating the point-of-sale system.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>No new hardware</span>
              <span className={styles.handlingDesc}>
                The system answers the existing phone line. There is nothing new
                to install on site.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>No staff retraining</span>
              <span className={styles.handlingDesc}>
                Staff see completed orders arrive. Intervention is optional, not
                required.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Peak-hour first</span>
              <span className={styles.handlingDesc}>
                Designed for the moments when phone volume exceeds staff
                capacity and calls would otherwise go unanswered.
              </span>
            </div>
          </div>
        </section>

        {/* ── Architecture / System flow ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Architecture and system flow
          </h2>
          <div className={styles.pipeline}>
            {pipeline.map((s) => (
              <div key={s.step} className={styles.pipelineStep}>
                <div className={styles.pipelineHeader}>
                  <span
                    className={`${styles.pipelineIndex} ${grotesk.className}`}
                  >
                    {s.step}
                  </span>
                  <span
                    className={`${styles.pipelineLabel} ${grotesk.className}`}
                  >
                    {s.label}
                  </span>
                </div>
                <div className={`${styles.pipelineBody} ${grotesk.className}`}>
                  <div className={styles.pipelineRow}>
                    <span className={styles.pipelineKey}>in</span>
                    <span>{s.input}</span>
                  </div>
                  <div className={styles.pipelineRow}>
                    <span className={styles.pipelineKey}>transform</span>
                    <span>{s.transform}</span>
                  </div>
                  <div className={styles.pipelineRow}>
                    <span className={styles.pipelineKey}>out</span>
                    <span>{s.output}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Guardrail design ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Guardrail design
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            The core rule is clarify before commit. Each item is scored
            independently, missing information is detected, and the system runs
            a confirmation loop before a ticket is committed. Operators can see
            what it heard, what it interpreted, and what it decided at every
            step.
          </p>
          <div className={styles.principlesGrid}>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Trust
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                Operators see what the system heard, what it interpreted, and
                what it decided at every step. No black boxes.
              </p>
            </div>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Visibility
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                Live transcription, confidence indicators, and order state are
                surfaced in real time. The system is legible while running.
              </p>
            </div>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Operator clarity
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                Staff don&apos;t need to learn the system. They see completed
                orders arrive. Intervention is optional, not required.
              </p>
            </div>
          </div>
        </section>

        {/* ── Measured results (intentionally empty) ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Measured results
          </h2>
          <div style={awaitingWrap}>
            <span style={awaitingTag}>Awaiting measured results</span>
            <p className={grotesk.className} style={awaitingBody}>
              Latency, call volume, and accuracy will be published here from
              verified live logs. Until that data is instrumented and confirmed,
              this slot stays empty. No estimates.
            </p>
          </div>
        </section>

        {/* ── Call recordings (empty audio slots) ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Call recordings
          </h2>
          <div className={styles.principlesGrid}>
            <div className={styles.principleItem}>
              <AudioSlot
                label="One clean call"
                caption="A straightforward order, captured and committed end to end."
              />
            </div>
            <div className={styles.principleItem}>
              <AudioSlot
                label="One messy call"
                caption="Hesitation, corrections, and menu ambiguity resolved in real time."
              />
            </div>
            <div className={styles.principleItem}>
              <AudioSlot
                label="One failure and the fix"
                caption="Where the system broke, and the change that handled it."
              />
            </div>
          </div>
        </section>

        {/* ── What broke and how I fixed it ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            What broke and how I fixed it
          </h2>
          <div className={styles.failureGrid}>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Unclear input</span>
              <span className={styles.failureExample}>
                &ldquo;give me the usual&rdquo;: no context, no history
              </span>
            </div>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Overlapping items</span>
              <span className={styles.failureExample}>
                &ldquo;chicken fried rice... no wait, shrimp&rdquo;: item swap
                mid-sentence
              </span>
            </div>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Missing modifiers</span>
              <span className={styles.failureExample}>
                &ldquo;large lo mein&rdquo;: size not on menu, only one size
                exists
              </span>
            </div>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Background noise</span>
              <span className={styles.failureExample}>
                Kitchen clatter, multiple speakers, phone static
              </span>
            </div>
          </div>

          <h3
            className={`${styles.sectionLabel} ${styles.sectionLabelSub} ${grotesk.className}`}
          >
            How KOTA handles it
          </h3>
          <div className={styles.handlingGrid}>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Clarification loop</span>
              <span className={styles.handlingDesc}>
                System asks targeted follow-ups instead of failing silently
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Fallback prompts</span>
              <span className={styles.handlingDesc}>
                When confidence drops below threshold, rephrase and re-confirm
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Confidence thresholds</span>
              <span className={styles.handlingDesc}>
                Each item scored independently, so partial orders can proceed
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Structured retries</span>
              <span className={styles.handlingDesc}>
                Failed extractions re-enter the pipeline with accumulated
                context
              </span>
            </div>
          </div>
        </section>

        {/* ── Close ── */}
        <footer className={styles.philosophical} data-animate>
          <Link
            href="/call"
            className={`${styles.quote} ${cormorant.className}`}
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Hear this system take a real call, or book a live demo.
          </Link>
        </footer>
      </div>
    </div>
  );
}
