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

const LIVE_URL = "https://listen.kummalabs.com";

const proofCaption =
  "A messy document becomes one continuous, listenable audiobook.";

// The pipeline, grounded in the shipped ingest -> normalize -> chunk ->
// Kokoro TTS -> assemble path.
const pipeline = [
  {
    step: "01",
    label: "Ingest",
    input: "PDF, EPUB, DOCX, a web URL, or pasted text",
    transform:
      "PyMuPDF, EbookLib, and trafilatura with BeautifulSoup extract chapters from each format",
    output: "Clean chapter text",
  },
  {
    step: "02",
    label: "Normalize",
    input: "Raw chapter text",
    transform:
      "Numbers, currency, years, and abbreviations expand into words via num2words; language detection routes Chinese text through cn2an, jieba, and pypinyin",
    output: "Speakable text",
  },
  {
    step: "03",
    label: "Chunk",
    input: "Speakable text",
    transform:
      "Split on sentence boundaries, pack short sentences together, and break over-long spans on safe punctuation",
    output: "Synthesizable segments",
  },
  {
    step: "04",
    label: "Synthesize",
    input: "Segments",
    transform:
      "The open-source Kokoro model on PyTorch generates audio segment by segment, emitting timed cues",
    output: "Audio plus subtitle cues",
  },
  {
    step: "05",
    label: "Assemble",
    input: "Per-chapter audio",
    transform:
      "Stream to WAV, transcode to constant-bitrate MP3 with ffmpeg for accurate seeking, and write an SRT track",
    output: "Continuous chapter files",
  },
  {
    step: "06",
    label: "Deliver",
    input: "Assembled chapters",
    transform: "Stream or download through the web app",
    output: "A listenable audiobook",
  },
];

const leadStyle: CSSProperties = {
  margin: "0 0 1.6rem",
  maxWidth: "62ch",
  fontSize: "clamp(0.98rem, 1.4vw, 1.12rem)",
  lineHeight: 1.7,
  color: "rgba(220, 220, 220, 0.7)",
};

// Static, decorative waveform silhouette for the hero proof panel. No audio is
// loaded or played; this is a visual only.
const waveWrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  width: "100%",
  height: "100%",
  padding: "clamp(1.4rem, 3vw, 2.2rem)",
};

const waveBars = [
  10, 22, 34, 18, 46, 28, 58, 36, 68, 44, 74, 52, 80, 60, 72, 48, 64, 40, 78,
  54, 66, 42, 56, 32, 48, 26, 40, 20, 34, 16, 26, 12,
];

export default function AudiobookCaseStudy() {
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
            Audiobook AI
          </h1>
          <p className={`${styles.subtitle} ${cormorant.className}`}>
            Any document, read aloud.
          </p>
          <p className={`${styles.heroDesc} ${grotesk.className}`}>
            Turns a PDF, EPUB, DOCX, web page, or pasted text into a continuous
            audiobook, synthesized with the open-source Kokoro text-to-speech
            model on PyTorch.
          </p>
          <p className={`${styles.heroContext} ${grotesk.className}`}>
            Turning arbitrary documents into listenable audio is a pipeline
            problem, not a single API call. This page documents the pipeline and
            the hardening that keeps it running under load.
          </p>
          <p className={`${styles.stackLine} ${grotesk.className}`}>
            Kokoro TTS · PyTorch · FastAPI · Worker Queue · PWA · Cloudflare
            Tunnel
          </p>
          <div className={styles.actions}>
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionLink} ${grotesk.className}`}
            >
              Open the live product ↗
            </a>
          </div>
        </div>

        <div className={styles.heroProof}>
          <section className={styles.vizSection} aria-hidden="true">
            <div style={waveWrap}>
              {waveBars.map((h, i) => (
                <span
                  key={i}
                  style={{
                    flex: 1,
                    maxWidth: "6px",
                    height: `${h}%`,
                    background: "var(--sand, #a3b5a8)",
                    opacity: 0.5,
                    borderRadius: "1px",
                  }}
                />
              ))}
            </div>
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
                What goes in
              </p>
              <blockquote
                className={`${styles.realityQuote} ${cormorant.className}`}
              >
                A 300-page PDF with headers, footnote markers, &ldquo;$4.2M in
                2019&rdquo;, and a paragraph of Chinese.
              </blockquote>
              <div className={`${styles.realitySignals} ${grotesk.className}`}>
                <span className={styles.signal}>messy layout</span>
                <span className={styles.signal}>footnote noise</span>
                <span className={styles.signal}>numbers and currency</span>
                <span className={styles.signal}>mixed languages</span>
              </div>
            </div>
            <div className={styles.realityArrow} aria-hidden="true">
              <span className={styles.arrowLine} />
              <span className={`${styles.arrowLabel} ${grotesk.className}`}>
                synthesized
              </span>
            </div>
            <div className={styles.realityOutput}>
              <p className={`${styles.realityTag} ${grotesk.className}`}>
                What comes out
              </p>
              <div className={`${styles.outputBlock} ${grotesk.className}`}>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>reads</span>
                  <span className={styles.outputVal}>
                    &ldquo;four point two million dollars in twenty nineteen&rdquo;
                  </span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>chinese</span>
                  <span className={styles.outputVal}>
                    routed to a Chinese voice{" "}
                    <span className={styles.outputNote}>(auto-detected)</span>
                  </span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>output</span>
                  <span className={styles.outputVal}>MP3 chapters plus SRT</span>
                </div>
                <div className={styles.outputRow}>
                  <span className={styles.outputKey}>playback</span>
                  <span className={styles.outputConfidence}>continuous</span>
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
                Real documents are messy.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                PDFs, EPUBs, and web pages carry headers, footnote markers, and
                broken layout that a model would read aloud verbatim.
              </p>
            </div>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Numbers and other scripts do not read themselves.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                &ldquo;$4.2M&rdquo;, &ldquo;2019&rdquo;, and a line of Chinese
                each need to become the words a listener expects to hear.
              </p>
            </div>
            <div className={styles.problemItem}>
              <p className={`${styles.problemLine} ${grotesk.className}`}>
                Long books cannot be synthesized in one pass.
              </p>
              <p className={`${styles.problemResult} ${grotesk.className}`}>
                Text has to be chunked into segments and the audio stitched back
                into one continuous track, without seams the ear can catch.
              </p>
            </div>
          </div>
        </section>

        {/* ── What it reads ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            What it reads
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            One ingest layer resolves each format down to the same clean chapter
            text, so the rest of the pipeline never has to know where the
            document came from.
          </p>
          <div className={styles.handlingGrid}>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>PDF</span>
              <span className={styles.handlingDesc}>
                Parsed with PyMuPDF, with runaway whitespace collapsed.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>EPUB</span>
              <span className={styles.handlingDesc}>
                Chapters extracted with EbookLib and cleaned with BeautifulSoup.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>DOCX</span>
              <span className={styles.handlingDesc}>
                Paragraph text read straight from the document XML.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Web URL</span>
              <span className={styles.handlingDesc}>
                Main content isolated with trafilatura, behind URL-fetch safety
                checks.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Plain text</span>
              <span className={styles.handlingDesc}>
                Pasted or uploaded text, taken as a single chapter.
              </span>
            </div>
          </div>
        </section>

        {/* ── The system ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The system
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            Ingest, normalize, chunk, synthesize with Kokoro, then assemble.
            Each stage hands a single clean shape to the next.
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

        {/* ── Reliability under load ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            Reliability under load
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            Synthesis is slow and heavy, so it is kept off the request path. A
            FastAPI server accepts jobs and a separate worker process does the
            work, with the guardrails below drawn from the production
            environment flags.
          </p>
          <div className={styles.handlingGrid}>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>API and worker split</span>
              <span className={styles.handlingDesc}>
                The web server never runs TTS itself, so heavy synthesis cannot
                freeze it. A separate worker process pulls jobs and does the
                work.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Persistent job queue</span>
              <span className={styles.handlingDesc}>
                Jobs live in a SQLite store, so queue state survives a restart
                and the worker resumes where it left off.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Stale-job recovery</span>
              <span className={styles.handlingDesc}>
                A recovery loop requeues jobs stuck in processing past a
                threshold, up to a maximum number of attempts.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Queue and rate limits</span>
              <span className={styles.handlingDesc}>
                Per-user active-job and global queue caps, plus a minimum
                interval between creates, keep any one caller from starving the
                rest.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Input caps</span>
              <span className={styles.handlingDesc}>
                Upload and text size limits bound each job; URL fetches enforce
                byte and redirect caps and reject non-public hosts.
              </span>
            </div>
            <div className={`${styles.handlingItem} ${grotesk.className}`}>
              <span className={styles.handlingMech}>Disk-pressure cleanup</span>
              <span className={styles.handlingDesc}>
                Expired copies and orphan uploads are swept, and disk-pressure
                cleanup keeps the output directory from filling the disk.
              </span>
            </div>
          </div>
        </section>

        {/* ── The listening experience ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The listening experience
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            The front end is a progressive web app served over HTTPS through a
            Cloudflare Tunnel, so a finished audiobook behaves like a native one.
          </p>
          <div className={styles.principlesGrid}>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Offline retention
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                A service worker caches finished audio per user, so a downloaded
                book keeps playing with no connection, including range requests
                for seeking.
              </p>
            </div>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Lock-screen playback
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                Audio plays from the phone lock screen with native transport
                controls, which is why HTTPS is required rather than optional.
              </p>
            </div>
            <div className={styles.principleItem}>
              <h3 className={`${styles.principleTitle} ${grotesk.className}`}>
                Install and preview
              </h3>
              <p className={`${styles.principleDesc} ${grotesk.className}`}>
                A web app manifest lets the site install to the home screen, and
                a voice-samples page lets a listener hear a voice before
                committing a whole book to it.
              </p>
            </div>
          </div>
        </section>

        {/* ── The through-line ── */}
        <section className={styles.section} data-animate>
          <h2 className={`${styles.sectionLabel} ${grotesk.className}`}>
            The through-line
          </h2>
          <p className={grotesk.className} style={leadStyle}>
            This is the text-to-speech side of the same voice craft as KOTA.
            KOTA takes messy speech and resolves it into a clean, verified
            result; Audiobook AI takes messy documents and resolves them into
            clean, continuous audio. Same shape, run in the other direction:
            messy input, a hardened pipeline, an output you can trust.
          </p>
          <p className={grotesk.className} style={leadStyle}>
            Audiobook AI is live. You can open it and run a document through the
            pipeline yourself.
          </p>
          <div className={styles.actions}>
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionLink} ${grotesk.className}`}
            >
              Open the live product ↗
            </a>
          </div>
        </section>

        {/* ── Close ── */}
        <footer className={styles.philosophical} data-animate>
          <Link
            href="/contact"
            className={`${styles.quote} ${cormorant.className}`}
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Have a document, a stream, or a voice problem? Let&apos;s talk.
          </Link>
        </footer>
      </div>
    </div>
  );
}
