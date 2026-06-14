"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "@/styles/kotaCaseStudy.module.css";
import type { Project } from "@/data/projectData";

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

export default function KotaDetail({ project }: { project: Project }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Let layout settle after client-side navigation before measuring
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
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
            }
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
        <p className={`${styles.eyebrow} ${grotesk.className}`}>
          Case Study / Flagship Product
        </p>
        <h1 className={`${styles.title} ${cormorant.className}`}>KOTA</h1>
        <p className={`${styles.subtitle} ${cormorant.className}`}>
          Conversation as infrastructure.
        </p>
        <p className={`${styles.heroDesc} ${grotesk.className}`}>
          A voice-first AI system that captures real customer calls and turns
          them into structured kitchen actions in real time.
        </p>
        <p className={`${styles.heroContext} ${grotesk.className}`}>
          Built for environments where missed calls mean lost revenue, and speed
          matters more than perfect inputs.
        </p>
        <p className={`${styles.stackLine} ${grotesk.className}`}>
          Voice Agent · LLM Orchestration · Menu Intelligence · Real-time
          Streaming · Order Sync
        </p>
        {project.websiteUrl && (
          <div className={styles.actions}>
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionLink} ${grotesk.className}`}
            >
              Visit Live Site &rarr;
            </a>
          </div>
        )}
      </header>

      <div ref={sectionsRef}>
        {/* ── Reality Block ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            What Actually Happens
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
            The Problem
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

        {/* ── System Flow ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            System Flow
          </h2>
          <div className={styles.pipeline}>
            {[
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
                transform:
                  "Validated against live menu data, resolves ambiguity",
                output: "Menu-verified order items",
              },
              {
                step: "05",
                label: "Resolution",
                input: "Verified items",
                transform:
                  "Confidence check, missing-info detection, confirmation loop",
                output: "Complete order ticket",
              },
              {
                step: "06",
                label: "Output",
                input: "Order ticket",
                transform: "Direct integration to kitchen workflow",
                output: "Active order, no staff intervention",
              },
            ].map((s) => (
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

        {/* ── Failure Handling ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Where Systems Break
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
            How KOTA Handles It
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
              <span className={styles.handlingMech}>
                Confidence thresholds
              </span>
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

        {/* ── Interface Thinking ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Interface Principles
          </h2>
          <div className={styles.principlesGrid}>
            <div className={styles.principleItem}>
              <h3
                className={`${styles.principleTitle} ${grotesk.className}`}
              >
                Trust
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                Operators see what the system heard, what it interpreted, and
                what it decided at every step. No black boxes.
              </p>
            </div>
            <div className={styles.principleItem}>
              <h3
                className={`${styles.principleTitle} ${grotesk.className}`}
              >
                Visibility
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                Live transcription, confidence indicators, and order state are
                surfaced in real time. The system is legible while running.
              </p>
            </div>
            <div className={styles.principleItem}>
              <h3
                className={`${styles.principleTitle} ${grotesk.className}`}
              >
                Operator clarity
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                Staff don&apos;t need to learn the system. They see completed
                orders arrive. Intervention is optional, not required.
              </p>
            </div>
          </div>
        </section>

        {/* ── System Impact ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            System Impact
          </h2>
          <div className={styles.impactGrid}>
            <div className={`${styles.impactItem} ${grotesk.className}`}>
              <span className={styles.impactMetric}>Missed calls</span>
              <span className={styles.impactDirection}>reduced</span>
              <span className={styles.impactDetail}>
                Calls answered autonomously during peak hours when staff
                can&apos;t pick up
              </span>
            </div>
            <div className={`${styles.impactItem} ${grotesk.className}`}>
              <span className={styles.impactMetric}>Manual transcription</span>
              <span className={styles.impactDirection}>eliminated</span>
              <span className={styles.impactDetail}>
                No more writing orders on paper or repeating back to confirm
              </span>
            </div>
            <div className={`${styles.impactItem} ${grotesk.className}`}>
              <span className={styles.impactMetric}>Order cycle</span>
              <span className={styles.impactDirection}>shortened</span>
              <span className={styles.impactDetail}>
                Structured ticket hits kitchen workflow in seconds, not minutes
              </span>
            </div>
            <div className={`${styles.impactItem} ${grotesk.className}`}>
              <span className={styles.impactMetric}>Workflow disruption</span>
              <span className={styles.impactDirection}>zero</span>
              <span className={styles.impactDetail}>
                No new hardware, no POS migration, no staff retraining required
              </span>
            </div>
          </div>
        </section>

        {/* ── Stack ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Stack
          </h2>
          <div className={styles.stackGrid}>
            <div className={styles.stackGroup}>
              <p className={`${styles.stackGroupLabel} ${grotesk.className}`}>
                Voice
              </p>
              <p className={`${styles.stackGroupItems} ${grotesk.className}`}>
                Twilio Streaming · Deepgram Nova-2 STT · WebSocket audio
                pipeline
              </p>
            </div>
            <div className={styles.stackGroup}>
              <p className={`${styles.stackGroupLabel} ${grotesk.className}`}>
                Intelligence
              </p>
              <p className={`${styles.stackGroupItems} ${grotesk.className}`}>
                GPT-4 Realtime · Structured JSON extraction · Menu grounding
                engine
              </p>
            </div>
            <div className={styles.stackGroup}>
              <p className={`${styles.stackGroupLabel} ${grotesk.className}`}>
                Execution
              </p>
              <p className={`${styles.stackGroupItems} ${grotesk.className}`}>
                Order resolution pipeline · Confidence scoring · Kitchen
                workflow sync
              </p>
            </div>
            <div className={styles.stackGroup}>
              <p className={`${styles.stackGroupLabel} ${grotesk.className}`}>
                Infrastructure
              </p>
              <p className={`${styles.stackGroupItems} ${grotesk.className}`}>
                GKE · Cloud SQL · S3 logging · Real-time monitoring
              </p>
            </div>
          </div>
        </section>

        {/* ── Philosophical ── */}
        <footer className={styles.philosophical} data-animate>
          <blockquote className={`${styles.quote} ${cormorant.className}`}>
            &ldquo;If software can listen in real time, it can operate in real
            time.&rdquo;
          </blockquote>
          <p className={`${styles.quoteAttrib} ${grotesk.className}`}>
            Notes from the build.
          </p>
        </footer>
      </div>
    </div>
  );
}
