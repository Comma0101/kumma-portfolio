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

const REPO_URL = "https://github.com/Comma0101/robinhood-performance-dash";

const proofCaption =
  "A messy export becomes a correctly paired, per-trade record.";

// The four-stage pipeline: export in, correct record out.
const pipeline = [
  {
    step: "01",
    label: "Ingest",
    input: "Robinhood CSV export",
    transform: "Parse and normalize rows with Pandas, typed and sorted by time",
    output: "Ordered transaction ledger",
  },
  {
    step: "02",
    label: "Pairing",
    input: "Ordered transaction ledger",
    transform: "FIFO matching for stocks, contract-level matching for options",
    output: "Buy fills bound to the sell fills that close them",
  },
  {
    step: "03",
    label: "Per-trade P/L",
    input: "Matched fills",
    transform: "Compute realized result per closed lot from paired cost basis",
    output: "One inspectable record per closed trade",
  },
  {
    step: "04",
    label: "Analytics",
    input: "Per-trade records",
    transform: "Serve via FastAPI, render with React and D3",
    output: "Per-trade bars, a cumulative line, and a live trades table",
  },
];

const leadStyle: CSSProperties = {
  margin: "0 0 1.6rem",
  maxWidth: "62ch",
  fontSize: "clamp(0.98rem, 1.4vw, 1.12rem)",
  lineHeight: 1.7,
  color: "rgba(220, 220, 220, 0.7)",
};

// Static hero proof: a raw export fragment resolved into one closed trade.
const proofWrap: CSSProperties = {
  border: "1px solid var(--line, rgba(255, 255, 255, 0.08))",
  borderRadius: "var(--radius-card, 14px)",
  background: "var(--raised, rgba(8, 8, 8, 0.6))",
  padding: "clamp(1.2rem, 2.2vw, 1.6rem)",
  display: "flex",
  flexDirection: "column",
  gap: "0.9rem",
  fontFamily: "var(--font-mono, monospace)",
};

const proofTag: CSSProperties = {
  fontSize: "0.62rem",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255, 255, 255, 0.4)",
};

const proofRows: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem",
  fontSize: "0.78rem",
  lineHeight: 1.5,
  color: "rgba(220, 220, 220, 0.62)",
};

const proofDivider: CSSProperties = {
  height: "1px",
  background: "rgba(163, 181, 168, 0.25)",
  margin: "0.2rem 0",
};

const proofResult: CSSProperties = {
  fontSize: "0.78rem",
  lineHeight: 1.6,
  color: "rgba(163, 181, 168, 0.85)",
};

export default function RobinhoodCaseStudy() {
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
          <h1 className={`${styles.title} ${cormorant.className}`}>
            Robinhood performance dashboard
          </h1>
          <p className={`${styles.subtitle} ${cormorant.className}`}>
            A correct record from a messy export.
          </p>
          <p className={`${styles.heroDesc} ${grotesk.className}`}>
            Takes a raw brokerage CSV and turns it into a correct, per-trade
            profit-and-loss record by pairing every buy fill with the sell fill
            that closes it.
          </p>
          <p className={`${styles.heroContext} ${grotesk.className}`}>
            The work here is data correctness, not trading. The interesting part
            is the transaction-pairing algorithm and the pipeline around it. This
            page documents how the record is built and where naive approaches get
            it wrong.
          </p>
          <p className={`${styles.stackLine} ${grotesk.className}`}>
            CSV Ingest · Transaction Pairing · FIFO · Options Matching · D3
            Analytics
          </p>
          <div className={styles.actions}>
            <a
              className={`${styles.actionLink} ${grotesk.className}`}
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              View the source
            </a>
          </div>
        </div>

        <div className={styles.heroProof}>
          <div style={proofWrap}>
            <span style={proofTag}>Raw export fragment</span>
            <div style={proofRows}>
              <span>buy&nbsp;&nbsp;AAPL&nbsp;&nbsp;×10&nbsp;&nbsp;09:31</span>
              <span>buy&nbsp;&nbsp;AAPL&nbsp;&nbsp;×5&nbsp;&nbsp;&nbsp;10:02</span>
              <span>buy&nbsp;&nbsp;TSLA&nbsp;&nbsp;×2&nbsp;&nbsp;&nbsp;11:14</span>
              <span>sell&nbsp;AAPL&nbsp;&nbsp;×8&nbsp;&nbsp;&nbsp;14:20</span>
            </div>
            <div style={proofDivider} aria-hidden="true" />
            <span style={proofTag}>Resolved</span>
            <div style={proofResult}>
              FIFO closes 8 shares against the 09:31 lot. One closed AAPL trade
              is recorded; 2 shares from that lot and the 10:02 and TSLA lots
              stay open. P/L is computed only on the closed quantity.
            </div>
          </div>
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
                Export gives you
              </p>
              <blockquote
                className={`${styles.realityQuote} ${cormorant.className}`}
              >
                A flat list of fills: buys and sells interleaved across symbols,
                partial quantities, day trades, and options contracts, in the
                order they happened.
              </blockquote>
              <div className={`${styles.realitySignals} ${grotesk.className}`}>
                <span className={styles.signal}>interleaved fills</span>
                <span className={styles.signal}>partial quantities</span>
                <span className={styles.signal}>scaled positions</span>
                <span className={styles.signal}>options contracts</span>
              </div>
            </div>
            <div className={styles.realityArrow} aria-hidden="true">
              <span className={styles.arrowLine} />
              <span className={`${styles.arrowLabel} ${grotesk.className}`}>
                paired
              </span>
            </div>
            <div className={styles.realityOutput}>
              <p className={`${styles.realityTag} ${grotesk.className}`}>
                Correct record
              </p>
              <div className={`${styles.outputBlock} ${grotesk.className}`}>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>trade</span>
                  <span className={styles.outputVal}>
                    AAPL ×8{" "}
                    <span className={styles.outputNote}>(closed)</span>
                  </span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>method</span>
                  <span className={styles.outputVal}>FIFO lot match</span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>cost basis</span>
                  <span className={styles.outputVal}>from the 09:31 lot</span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>open remainder</span>
                  <span className={styles.outputConfidence}>tracked</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── The problem ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The problem
          </h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                The export is a flat log of fills, not a list of trades.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                Nothing in the file says which sell closed which buy. That link
                has to be reconstructed.
              </p>
            </div>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Positions are scaled and day-traded across interleaved rows.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                One symbol can have many open lots at once. Naive pairing matches
                the wrong lot and computes the wrong cost basis.
              </p>
            </div>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Multiple option contracts share the same underlying.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                Matching by symbol alone collapses distinct contracts together
                and produces P/L that never occurred.
              </p>
            </div>
          </div>
        </section>

        {/* ── The system ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The system
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            One direction of data flow: a raw export enters, a correct per-trade
            record leaves. Each stage has a single job and hands a cleaner shape
            to the next.
          </p>
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

        {/* ── The hard part ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The hard part
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            Pairing is where correctness is won or lost. The algorithm has to
            decide, for every closing fill, exactly which open lot it draws from,
            and hold the rest open. These are the cases it has to get right.
          </p>
          <div className={styles.failureGrid}>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Day trading</span>
              <span className={styles.failureExample}>
                Buys and sells of one symbol within a single session, in any
                order
              </span>
            </div>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Position scaling</span>
              <span className={styles.failureExample}>
                Several open lots at different times, closed in parts
              </span>
            </div>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Duplicate underlyings</span>
              <span className={styles.failureExample}>
                Multiple option contracts written on the same stock
              </span>
            </div>
            <div className={`${styles.failureItem} ${grotesk.className}`}>
              <span className={styles.failureType}>Partial closes</span>
              <span className={styles.failureExample}>
                A sell that covers less than a lot, leaving a tracked remainder
              </span>
            </div>
          </div>

          <h3
            className={`${styles.sectionLabel} ${styles.sectionLabelSub} ${grotesk.className}`}
          >
            How the pairing handles it
          </h3>
          <div className={styles.handlingGrid}>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>FIFO for stocks</span>
              <span className={styles.handlingDesc}>
                Closing fills draw from the oldest open lot first, so cost basis
                follows a defined, repeatable rule
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Contract-level keys</span>
              <span className={styles.handlingDesc}>
                Options match on the full contract, not the underlying, so
                distinct contracts never merge
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Per-lot quantity ledger</span>
              <span className={styles.handlingDesc}>
                Every lot carries its own remaining quantity, so partial closes
                and scaling stay accounted for
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Time-ordered replay</span>
              <span className={styles.handlingDesc}>
                Fills are processed in chronological order, so day trades resolve
                the same way every run
              </span>
            </div>
          </div>
        </section>

        {/* ── The interface ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The interface
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            The record is meant to be inspected, not just read. Every view reads
            from the same paired trades, and everything recomputes together when
            the table is sorted or filtered.
          </p>
          <div className={styles.principlesGrid}>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Trades table
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                A sortable, filterable table of closed trades. Changing it drives
                every statistic and chart on the page.
              </p>
            </div>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Per-trade bars
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                One D3 bar per closed trade, so an individual result can be read
                back to the fills that produced it.
              </p>
            </div>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Cumulative line
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                A running line over time, drawn from the same records, so the
                whole and the parts always agree.
              </p>
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
                Backend
              </p>
              <p className={`${styles.stackGroupItems} ${grotesk.className}`}>
                Python, FastAPI, and Pandas: parsing the export, running the
                pairing algorithm, and serving per-trade records.
              </p>
            </div>
            <div className={styles.stackGroup}>
              <p className={`${styles.stackGroupLabel} ${grotesk.className}`}>
                Frontend
              </p>
              <p className={`${styles.stackGroupItems} ${grotesk.className}`}>
                React and D3.js: the trades table, per-trade bars, and cumulative
                line, all recomputing from a single source.
              </p>
            </div>
          </div>
        </section>

        {/* ── Source ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Source
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            The pairing algorithm and the full pipeline are open. Read the code
            that turns the export into the record.
          </p>
          <div className={styles.actions}>
            <a
              className={`${styles.actionLink} ${grotesk.className}`}
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              robinhood-performance-dash on GitHub
            </a>
          </div>
        </section>

        {/* ── Close ── */}
        <footer className={styles.philosophical} data-animate>
          <p className={`${styles.quote} ${cormorant.className}`}>
            Messy input, reliable output — the same discipline as the voice
            work, a different domain.
          </p>
          <Link
            href="/contact"
            className={`${styles.actionLink} ${grotesk.className}`}
            style={{ display: "inline-block" }}
          >
            Build a system like this →
          </Link>
        </footer>
      </div>
    </div>
  );
}
