"use client";

import { useEffect, useRef } from "react";
import bs from "@/styles/build.module.css";
import s from "@/styles/benchmark.module.css";

const taxonomy = [
  {
    name: "Acoustic",
    count: 8,
    desc: "Background noise, codec artifacts, and crosstalk — the channel degrades before the words do.",
  },
  {
    name: "Speaker",
    count: 8,
    desc: "Heavy accents, fast talkers, elderly and child voices — one grammar, many mouths.",
  },
  {
    name: "Language",
    count: 6,
    desc: "Mandarin, Spanish, and English↔中文 code-switching mid-sentence.",
  },
  {
    name: "Order complexity",
    count: 10,
    desc: "Multi-item orders, stacked modifiers, ambiguous references, and allergy constraints.",
  },
  {
    name: "Conversational",
    count: 10,
    desc: "Reversals, barge-in, and mid-utterance self-correction.",
  },
  {
    name: "Adversarial",
    count: 8,
    desc: "Prompt injection, profanity, haggling, and “are you a robot”.",
  },
];

const total = taxonomy.reduce((n, t) => n + t.count, 0);

const rubric = [
  {
    name: "Ticket accuracy",
    scale: [
      { p: 0, t: "wrong or missing items" },
      { p: 1, t: "partially correct, one error" },
      { p: 2, t: "exact order, every field right" },
    ],
  },
  {
    name: "Clarification appropriateness",
    scale: [
      { p: 0, t: "guesses or over-asks" },
      { p: 1, t: "asks, but at the wrong moment" },
      { p: 2, t: "asks only when ambiguity is real" },
    ],
  },
  {
    name: "Latency within budget",
    scale: [
      { p: 0, t: "over budget, dead air" },
      { p: 1, t: "borderline or uneven" },
      { p: 2, t: "responds within the turn budget" },
    ],
  },
  {
    name: "Containment (no dead end)",
    scale: [
      { p: 0, t: "loops or strands the caller" },
      { p: 1, t: "recovers, but the caller carries it" },
      { p: 2, t: "keeps a path forward at every turn" },
    ],
  },
  {
    name: "Graceful failure",
    scale: [
      { p: 0, t: "fails silently or falsely confident" },
      { p: 1, t: "fails, hands off without context" },
      { p: 2, t: "names the limit, hands off cleanly" },
    ],
  },
];

const rubricCols = [
  "Ticket accuracy",
  "Clarification",
  "Latency",
  "Containment",
  "Graceful failure",
];

export default function BenchmarkPage() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((t) => t.classList.add(bs.revealShown));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(bs.revealShown);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className={bs.page}>
      <header className={bs.header}>
        <a href="#top" className={bs.wordmark}>
          Kumma
        </a>
        <a href="#submit" className={bs.headerCta}>
          Submit scores
        </a>
      </header>

      <main id="top">
        {/* Hero */}
        <section className={`${bs.hero} ${bs.shell}`}>
          <p className={bs.eyebrow}>Voice Agent Stress Suite v1</p>
          <h1 className={bs.title}>An open stress suite for voice agents.</h1>
          <p className={bs.subtitle}>
            Fifty scenarios built to break real-time voice agents where they
            actually break: noisy rooms, code-switching callers, tangled orders,
            and people trying to jailbreak the drive-through. Downloadable audio,
            a fixed rubric, and a scoring script — reproducible, not vibes.
          </p>
          <div className={s.chipRow}>
            <span className={s.chip}>
              <span className={s.chipDot} />
              {total} scenarios
            </span>
            <span className={s.chip}>6 categories</span>
            <span className={s.chip}>0–2 rubric, 5 dimensions</span>
            <span className={`${s.chip} ${s.chipMuted}`}>repo: coming</span>
          </div>
        </section>

        {/* What it is */}
        <section className={`${bs.section} ${bs.shell}`}>
          <h2 className={`${bs.h2} ${bs.reveal}`} data-reveal>
            What it is
          </h2>
          <p className={`${s.lead} ${bs.reveal}`} data-reveal>
            The Voice Agent Stress Suite is an open, reproducible test set for
            real-time voice agents. Each scenario ships as an audio clip with a
            defined caller intent and an expected outcome. You run your agent
            against the clips, score each turn against the rubric with the
            scoring script, and publish the numbers — including the ones that
            look bad. The suite, the rubric, and the script live in one repo so
            anyone can rerun the exact conditions.
          </p>
          <p className={s.meta}>
            Distribution: audio + expected outcomes + scoring script.{" "}
            <span className={s.repoTag}>repo: coming</span>
          </p>
        </section>

        {/* Taxonomy */}
        <section className={`${bs.section} ${bs.shell}`}>
          <h2 className={`${bs.h2} ${bs.reveal}`} data-reveal>
            Scenario taxonomy
          </h2>
          <p className={`${s.lead} ${s.leadTight} ${bs.reveal}`} data-reveal>
            Fifty scenarios, weighted toward the failure modes that lose orders
            and callers. Counts below are the suite&rsquo;s design targets, not
            results.
          </p>
          <div className={`${s.tableFrame} ${bs.reveal}`} data-reveal>
            <div className={s.tableScroll}>
              <table className={s.table}>
                <caption>Suite composition — 6 categories, 50 scenarios</caption>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Count</th>
                    <th scope="col">What it stresses</th>
                  </tr>
                </thead>
                <tbody>
                  {taxonomy.map((t) => (
                    <tr key={t.name}>
                      <th scope="row" className={s.cellName}>
                        {t.name}
                      </th>
                      <td className={s.cellCount}>{t.count}</td>
                      <td className={s.cellDesc}>{t.desc}</td>
                    </tr>
                  ))}
                  <tr className={s.totalRow}>
                    <th scope="row">Total</th>
                    <td className={s.cellCount}>{total}</td>
                    <td className={s.cellDesc}>
                      Full suite, run end to end per agent.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Rubric */}
        <section className={`${bs.section} ${bs.shell}`}>
          <h2 className={`${bs.h2} ${bs.reveal}`} data-reveal>
            Scoring rubric
          </h2>
          <p className={`${s.lead} ${s.leadTight} ${bs.reveal}`} data-reveal>
            Every turn is scored 0, 1, or 2 on five dimensions. Two is the ceiling
            per dimension; the anchors below fix what each point means so two
            scorers land on the same number.
          </p>
          <ul className={`${s.rubric} ${bs.reveal}`} data-reveal>
            {rubric.map((r) => (
              <li key={r.name} className={s.rubricItem}>
                <h3 className={s.rubricName}>{r.name}</h3>
                <ul className={s.rubricScale}>
                  {r.scale.map((x) => (
                    <li key={x.p}>
                      <span className={s.rubricPoint}>{x.p}</span>
                      <span>{x.t}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        {/* Reference baselines — published third-party figures, cited. Not this suite's scores. */}
        <section className={`${bs.section} ${bs.shell}`}>
          <h2 className={`${bs.h2} ${bs.reveal}`} data-reveal>
            Reference baselines
          </h2>
          <p className={`${s.lead} ${bs.reveal}`} data-reveal>
            For context, here is what the components publish on clean, general
            audio. Deepgram Nova-3 reports a median streaming word error rate
            near 6.8% and sub-300ms streaming latency (
            <a
              href="https://deepgram.com/learn/speech-to-text-benchmarks"
              target="_blank"
              rel="noopener noreferrer"
            >
              Deepgram
            </a>
            ); the fast text-to-speech voices publish time-to-first-audio in the
            tens of milliseconds (
            <a
              href="https://gradium.ai/content/tts-latency-benchmark-2026"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gradium
            </a>
            ). Those are the easy conditions.
          </p>
          <p className={`${s.lead} ${bs.reveal}`} data-reveal>
            This suite exists because the hard part is the other twenty percent —
            kitchen noise, code-switching, a caller reversing an order
            mid-sentence, a prompt-injection attempt — where those numbers stop
            describing the call. The figures above are third-party baselines on
            clean audio, not this suite&rsquo;s scores. KOTA&rsquo;s scores
            against the fifty scenarios land in the table below once the run is
            complete.
          </p>
        </section>

        {/* Results — empty state */}
        <section className={`${bs.section} ${bs.shell}`}>
          <h2 className={`${bs.h2} ${bs.reveal}`} data-reveal>
            Results
          </h2>
          <p className={`${s.lead} ${s.leadTight} ${bs.reveal}`} data-reveal>
            KOTA&rsquo;s scores publish here once the suite runs — warts included.
            No results exist yet; the table below shows the structure they land
            in.
          </p>
          <div className={`${s.tableFrame} ${bs.reveal}`} data-reveal>
            <div className={s.awaiting}>
              <span className={s.awaitingDot} />
              Awaiting first run — no scores recorded.
            </div>
            <div className={s.tableScroll}>
              <table className={s.table}>
                <caption>
                  Mean score per category (0–2 per dimension) — awaiting data
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    {rubricCols.map((c) => (
                      <th scope="col" key={c}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taxonomy.map((t) => (
                    <tr key={t.name}>
                      <th scope="row" className={s.cellName}>
                        {t.name}
                      </th>
                      {rubricCols.map((c) => (
                        <td key={c} className={s.pending} aria-label="pending">
                          &mdash;
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Third-party submissions */}
        <section
          id="submit"
          className={`${bs.section} ${bs.shell} ${bs.consult}`}
        >
          <h2 className={`${bs.h2} ${bs.reveal}`} data-reveal>
            Submit your own scores
          </h2>
          <p className={`${s.lead} ${s.leadTight} ${bs.reveal}`} data-reveal>
            Ran your agent against the suite? Add its column to the public
            record. Submissions go in as a pull request so the method is visible
            alongside the numbers.
          </p>
          <ol className={`${s.steps} ${bs.reveal}`} data-reveal>
            <li className={s.stepItem}>
              <p className={s.stepBody}>
                <strong>Clone the repo</strong> and run all {total} clips through
                your agent with the audio and expected outcomes as shipped — no
                edits to the scenarios. <span className={s.repoTag}>repo: coming</span>
              </p>
            </li>
            <li className={s.stepItem}>
              <p className={s.stepBody}>
                <strong>Score with the included script</strong>, 0–2 on each of
                the five rubric dimensions, per category.
              </p>
            </li>
            <li className={s.stepItem}>
              <p className={s.stepBody}>
                <strong>Open a pull request</strong> that adds your results plus a{" "}
                <strong>methodology attestation</strong>: agent and version, model
                and settings, latency budget, date, and anything you changed in
                the run environment.
              </p>
            </li>
            <li className={s.stepItem}>
              <p className={s.stepBody}>
                Reproducible submissions get merged into the public table. If it
                cannot be rerun from your attestation, it does not ship.
              </p>
            </li>
          </ol>
        </section>
      </main>

      <footer className={bs.footer}>
        <span>© {new Date().getFullYear()} Kumma — Los Angeles</span>
        <span className={s.repoTag}>Voice Agent Stress Suite v1 · repo coming</span>
      </footer>
    </div>
  );
}
