"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "@/styles/kotaCaseStudy.module.css";

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

const REPO_URL = "https://github.com/Comma0101/archon";

const proofCaption =
  "A real multi-step task becomes a planned, routed, and recoverable run.";

// The seven architecture layers, taken verbatim from the ARCHON techStack.
const layers = [
  {
    step: "01",
    label: "Model layer",
    role: "route",
    description:
      "Anthropic Claude, OpenAI, and Google Gemini behind one agent, chosen per task instead of hardwiring a single provider.",
  },
  {
    step: "02",
    label: "Control plane",
    role: "orchestrate",
    description:
      "An orchestrator, policy, sessions, and jobs sit over execution turns, so a task is a defined flow with reasoning traces, not a black box.",
  },
  {
    step: "03",
    label: "Worker delegation",
    role: "delegate",
    description:
      "Heavy work is handed to real coding agents, Claude Code, Codex, and OpenCode, through a worker router that supervises them and validates the result.",
  },
  {
    step: "04",
    label: "Tools and MCP",
    role: "act",
    description:
      "A deep tool layer over the filesystem, web read and search, and content, plus a Model Context Protocol client so external tools plug in cleanly.",
  },
  {
    step: "05",
    label: "Memory and context",
    role: "remember",
    description:
      "Persistent memory with context compression, distillation, and usage accounting, so long-running work does not drown in its own history.",
  },
  {
    step: "06",
    label: "Channels",
    role: "reach",
    description:
      "Terminal REPL, Telegram with human approvals, voice through STT and TTS, and live phone calls over Twilio.",
  },
  {
    step: "07",
    label: "Safety",
    role: "gate",
    description:
      "Redaction, policy guardrails, and human approval gates are first-class, not patched on after the fact.",
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

const ctaStyle: CSSProperties = {
  margin: "1.4rem 0 0",
  fontSize: "0.76rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--signal, rgba(163, 181, 168, 0.9))",
  textDecoration: "none",
  display: "inline-block",
};

export default function ArchonCaseStudy() {
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
          <h1 className={`${styles.title} ${cormorant.className}`}>ARCHON</h1>
          <p className={`${styles.subtitle} ${cormorant.className}`}>
            A self-aware personal agent.
          </p>
          <p className={`${styles.heroDesc} ${grotesk.className}`}>
            A control plane that plans, routes, executes, and recovers across
            models, tools, and other coding agents, with memory and human
            approval built in.
          </p>
          <p className={`${styles.heroContext} ${grotesk.className}`}>
            This is the systems craft underneath the voice work, applied to
            agents. It documents how the orchestration layer is built, and where
            it is still rough.
          </p>
          <p className={`${styles.stackLine} ${grotesk.className}`}>
            Agent Orchestration · Multi-model Routing · Worker Delegation · MCP
            Tools · Persistent Memory
          </p>
          <div className={styles.actions}>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionLink} ${grotesk.className}`}
            >
              View the source →
            </a>
          </div>
        </div>

        <div className={styles.heroProof}>
          <div className={styles.pipeline}>
            {[
              { k: "plan", v: "break the task into sessions, jobs, and turns" },
              { k: "route", v: "choose a model or a worker per step" },
              { k: "execute", v: "run tools and delegate real work" },
              { k: "recover", v: "validate results, re-enter on failure" },
            ].map((r) => (
              <div key={r.k} className={styles.pipelineStep}>
                <div className={styles.pipelineHeader}>
                  <span
                    className={`${styles.pipelineLabel} ${grotesk.className}`}
                  >
                    {r.k}
                  </span>
                </div>
                <div className={`${styles.pipelineBody} ${grotesk.className}`}>
                  <div className={styles.pipelineRow}>
                    <span>{r.v}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className={`${styles.proofCaption} ${grotesk.className}`}>
            {proofCaption}
          </p>
        </div>
      </header>

      <div ref={sectionsRef}>
        {/* ── The problem ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The problem
          </h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Most AI products fail not on the model, but on orchestration.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                A single prompt in a loop demos well and breaks the moment the
                task has more than two steps.
              </p>
            </div>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Complexity leaks into application code.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                Every app re-implements retries, memory, tool selection, and
                whether a step is safe to run.
              </p>
            </div>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Reliability does not come from a bigger model.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                It comes from orchestration, memory, and the ability to inspect
                and approve what the agent actually did.
              </p>
            </div>
          </div>
        </section>

        {/* ── What it is ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            What it is
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            Archon is a control plane, not a chat wrapper. It plans, routes,
            executes, and recovers across providers and tools, with persistent
            memory, context compression, usage accounting, and human approval
            built in. A task flows through sessions and jobs, broken into turns,
            each with a reasoning trace, so the work stays legible while it runs.
          </p>
          <div className={styles.handlingGrid}>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Plans and routes</span>
              <span className={styles.handlingDesc}>
                Work is broken into sessions, jobs, and turns, and routed across
                Claude, GPT, and Gemini per task rather than hardwired to one.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Executes and recovers</span>
              <span className={styles.handlingDesc}>
                Real work is delegated to coding agents through a worker router
                and validated, not trusted blindly.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Remembers</span>
              <span className={styles.handlingDesc}>
                Persistent memory with context compression and distillation,
                plus usage and token accounting on every run.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Asks before it acts</span>
              <span className={styles.handlingDesc}>
                Anything consequential passes a human approval gate over Telegram
                before it runs. Autonomy that stays inspectable.
              </span>
            </div>
          </div>
        </section>

        {/* ── Architecture ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Architecture
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            Seven layers absorb the complexity that would otherwise leak into
            every task, from the model up to the safety gates.
          </p>
          <div className={styles.pipeline}>
            {layers.map((l) => (
              <div key={l.step} className={styles.pipelineStep}>
                <div className={styles.pipelineHeader}>
                  <span
                    className={`${styles.pipelineIndex} ${grotesk.className}`}
                  >
                    {l.step}
                  </span>
                  <span
                    className={`${styles.pipelineLabel} ${grotesk.className}`}
                  >
                    {l.label}
                  </span>
                </div>
                <div className={`${styles.pipelineBody} ${grotesk.className}`}>
                  <div className={styles.pipelineRow}>
                    <span className={styles.pipelineKey}>{l.role}</span>
                    <span>{l.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── What is still rough ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            What is still rough
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            This is active research, not a finished product. What works today is
            the spine: routing, tools, memory, delegation, and approvals, driven
            from a CLI. What still needs work is honest to name.
          </p>
          <div className={styles.failureGrid}>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Worker-router recovery</span>
              <span className={styles.failureExample}>
                Recovery on failed delegations is not yet where I want it.
              </span>
            </div>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>
                Memory-compression heuristics
              </span>
              <span className={styles.failureExample}>
                Deciding what to keep, distill, or drop is still being tuned.
              </span>
            </div>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>
                Multi-session scheduling
              </span>
              <span className={styles.failureExample}>
                Coordinating concurrent long-running sessions is unfinished.
              </span>
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
              Reliability, recovery rate, and cost per task will be published
              here from verified runs. Until that data is instrumented and
              confirmed, this slot stays empty. No estimates.
            </p>
          </div>
        </section>

        {/* ── Close ── */}
        <footer className={styles.philosophical} data-animate>
          <p className={`${styles.quote} ${cormorant.className}`}>
            Intelligence is not the model. It is the system around it.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.actionLink} ${grotesk.className}`}
            style={{ display: "inline-block", marginRight: "2rem" }}
          >
            Read the source on GitHub →
          </a>
          <Link
            href="/contact"
            className={grotesk.className}
            style={ctaStyle}
          >
            Working on agent orchestration? Get in touch →
          </Link>
        </footer>
      </div>
    </div>
  );
}
