import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  PatternLayout,
  PatternSection,
  FailureModes,
  CodeBlock,
  RelatedNotes,
} from "@/components/PatternLayout";

export const metadata: Metadata = {
  title: "Voice eval harness",
  description:
    "Designing a harness that replays recorded calls and synthetic turns through the real pipeline, so a prompt or timer change is measured against a scoring rubric instead of guessed at.",
  openGraph: {
    title: "Voice eval harness | Patterns | Kumma",
    description:
      "A harness that replays fixtures through the full recognition and resolution path, scores the resolved outcome across accuracy, clarification, latency, containment, and failure, and blocks regressions in CI.",
    url: "https://kumma.me/patterns/eval-harness",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/eval-harness" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Voice eval harness",
  description:
    "Designing a harness that replays recorded calls and synthetic turns through the real pipeline, so a prompt or timer change is measured against a scoring rubric instead of guessed at.",
  url: "https://kumma.me/patterns/eval-harness",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const fixtureShape = `// A fixture is one input paired with the structured outcome it should
// produce, plus tags that let you slice results by scenario. It is data,
// not code, so a non-engineer can author and verify one.
interface Fixture {
  id: string;
  source: "recorded" | "synthetic";

  // Exactly one of these drives the run. Audio exercises the whole
  // recognition path; transcript-only isolates intent resolution.
  audio?: string;       // path to a recorded or generated wav
  transcript?: string;  // human-verified reference text

  // What the pipeline should resolve to. Never a wording match.
  expect: {
    intent: string;
    fields: Record<string, unknown>;   // resolved slots
    missing: string[];                 // what the agent should still ask for
    clarifyExpected: boolean;          // should it have asked, given the input
    latencyBudgetMs: number;           // ceiling for turn-to-outcome
  };

  // Scenario categories this fixture belongs to. One fixture can carry
  // several — a noisy line AND a mid-order correction, say.
  tags: Array<
    | "acoustic"      // noise, codec, cross-talk, low bandwidth
    | "speaker"       // accent, age, pace, dysfluency
    | "language"      // code-switching, non-native phrasing
    | "complexity"    // multi-item, nested modifiers, quantities
    | "conversational"// corrections, changes of mind, backchannels
    | "adversarial"   // prompt-injection attempts, out-of-scope asks
  >;
}`;

const scoringFunction = `// Scoring runs over the RESOLVED outcome the pipeline produced, never the
// words it spoke. Each dimension is judged independently so a latency miss
// does not hide an accuracy win, and one report shows which one moved.
type Dimension =
  | "accuracy"        // resolved intent + fields match expect
  | "clarification"   // asked iff the input was genuinely ambiguous
  | "latency"         // turn-to-outcome within the fixture's budget
  | "containment"     // handled without an unwanted human handoff
  | "gracefulFailure";// when it could not resolve, it failed safely

function score(fx: Fixture, actual: Outcome): Record<Dimension, boolean> {
  const e = fx.expect;

  const fieldsMatch = Object.entries(e.fields).every(
    ([k, v]) => deepEqual(actual.fields[k], v),
  );

  return {
    accuracy:
      actual.intent === e.intent &&
      fieldsMatch &&
      sameSet(actual.missing, e.missing),

    // Right behaviour is asking exactly when the input warranted it —
    // not always asking, and not barrelling ahead on a guess.
    clarification: actual.didClarify === e.clarifyExpected,

    latency: actual.latencyMs <= e.latencyBudgetMs,

    containment: actual.handedOff === false,

    // A miss is allowed to exist; it is not allowed to be silent or wrong.
    // Failing safe means it declined or escalated rather than inventing.
    gracefulFailure:
      actual.intent === e.intent || actual.failedSafely === true,
  };
}`;

export default function EvalHarnessPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 09"
        title="Voice eval harness"
        problem={
          <>
            A one-line change to a prompt or a timer can shift behaviour on call
            flows nobody touched, and &quot;I called it and it worked&quot; tests
            one path through a system that has thousands. An eval harness replays
            recorded calls and synthetic turns through the same pipeline
            production runs, so the effect of a change is measured against a
            scoring rubric rather than guessed at.
          </>
        }
      >
        <PatternSection title="The fixture is the unit">
          <p>
            The harness stands on one primitive: a fixture that pairs an input
            with the structured outcome it should produce, plus tags that say
            what kind of input it is. The input is either recorded audio from a
            real caller or a synthetic turn you authored; the expected outcome is
            the resolved intent, the filled fields, and what the agent should
            still be asking for. It is deliberately not a script of what the agent
            should say. Two different sentences can carry the same correct order,
            so a fixture that asserts on wording fails on rephrasing and catches
            nothing.
          </p>
          <CodeBlock caption="Illustrative: the fixture shape" code={fixtureShape} />
          <p>
            Tags are what turn a pile of fixtures into a map. When you slice the
            same run by <code>acoustic</code> versus <code>conversational</code>,
            a change that helps clean speech but hurts noisy lines shows up as two
            columns moving in opposite directions instead of one blended number
            that hides both. The scenario categories below are the axes worth
            covering deliberately.
          </p>
        </PatternSection>

        <PatternSection title="Run audio or transcript, on purpose">
          <p>
            A fixture with audio goes through the full path: recognition, then
            endpointing, then intent resolution. That is the only way to catch a
            regression in the speech model or a silence timer, because those
            stages never run when you inject text. A transcript-only fixture skips
            recognition and tests resolution in isolation, which runs faster and
            will not flake on audio. Audio replays are the integration tests;
            transcript replays are the unit tests. Keep both, and choose per
            fixture based on which stage you are trying to pin down.
          </p>
          <p>
            One rule holds the whole design together: the harness calls the real
            pipeline, not a copy of it. The moment the test path forks from the
            production path, you are measuring a system nobody ships, and a green
            run stops meaning anything. This is the harness design behind the{" "}
            <Link href="/blog/en/regression-testing-a-voice-agent">
              field note on regression-testing a voice agent
            </Link>
            , which walks the same idea through a concrete order flow.
          </p>
        </PatternSection>

        <PatternSection title="Score across dimensions, not as one number">
          <p>
            A single pass/fail per fixture throws away the information you built
            the harness to get. Score each fixture on independent dimensions so
            you can see which one a change moved:
          </p>
          <FailureModes
            items={[
              {
                name: "Accuracy",
                detail:
                  "The resolved intent and fields match the expected outcome, and the set of still-missing fields matches too. This is the core assertion — the ticket, not the words.",
              },
              {
                name: "Clarification appropriateness",
                detail:
                  "The agent asked a clarifying question exactly when the input was genuinely ambiguous, and did not when it was clear. Always-asking and never-asking are both failures of the same dimension.",
              },
              {
                name: "Latency within budget",
                detail:
                  "Turn-to-outcome stayed under the ceiling the fixture declares. The budget is per fixture because a simple order and a ten-item correction do not deserve the same allowance.",
              },
              {
                name: "Containment",
                detail:
                  "The call resolved without an unwanted handoff to a human. A change that quietly raises the escalation rate is a regression even when every resolved ticket is correct.",
              },
              {
                name: "Graceful failure",
                detail:
                  "When the agent could not resolve the turn, it declined or escalated rather than inventing a plausible wrong answer. A safe miss scores differently from a confident one.",
              },
            ]}
          />
          <p>
            Scoring runs over the outcome object the pipeline resolved, so the
            same rephrasing that would break a string match leaves it untouched.
            Where the model legitimately has latitude on a field, loosen the check
            on that field alone rather than dropping the whole outcome to a fuzzy
            compare.
          </p>
          <CodeBlock
            caption="Illustrative: scoring over the resolved outcome"
            code={scoringFunction}
          />
        </PatternSection>

        <PatternSection title="Cover the scenarios that break agents">
          <p>
            A corpus of clean, single-item orders in a quiet room tests the one
            input production never sends. Grow coverage along the axes where voice
            agents actually fail: <strong>acoustic</strong> (line noise, codec
            artefacts, cross-talk), <strong>speaker</strong> (accent, pace,
            dysfluency), <strong>language</strong> (code-switching, non-native
            phrasing), <strong>complexity</strong> (multi-item and nested
            modifiers), <strong>conversational</strong> (corrections, changes of
            mind, backchannels), and <strong>adversarial</strong> (out-of-scope
            asks and prompt-injection attempts through the caller channel).
            Synthetic turns cover what you can foresee; recorded failures cover
            what you could not. Every production miss should come back as a new
            tagged fixture so the exact failure cannot silently return. The public{" "}
            <Link href="/benchmark">/benchmark</Link> is this same idea run at
            scale — a standing stress suite across these categories — but the version every
            team needs first is the small one that runs on every commit.
          </p>
        </PatternSection>

        <PatternSection title="Wire it into CI so regressions block a merge">
          <p>
            A harness whose scores nobody reads is a slower way of guessing. Run
            it on every pull request against a pinned baseline and fail the check
            when a dimension drops below threshold on any category, so a prompt
            edit that trades noisy-line accuracy for clean-speech accuracy cannot
            merge without someone deciding that trade on purpose. Report the score
            per dimension and per tag, not one aggregate, so the failing check
            points at what moved rather than just that something did. The audio
            suite is slower, so it is reasonable to gate merges on the fast
            transcript suite and run the full audio corpus on a schedule — as long
            as both block a release.
          </p>
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Testing wording",
                detail:
                  "The assertion matches the sentence the agent spoke, so a correct answer phrased differently fails and you spend your time updating expected strings instead of catching bugs. Assert on the resolved outcome.",
              },
              {
                name: "Happy-path only",
                detail:
                  "Every fixture is a clean, single-item request, so the suite is green while the agent falls apart on the corrections and ambiguity real callers actually produce. Coverage that omits the hard cases is confidence you did not earn.",
              },
              {
                name: "No adversarial or acoustic coverage",
                detail:
                  "The corpus has no line noise, no accents, and no out-of-scope or injection attempts, so the two categories most likely to break in production are the two the harness never exercises.",
              },
              {
                name: "Forked pipeline",
                detail:
                  "The harness reimplements or stubs part of the pipeline for convenience, so it measures a system that diverges from what ships. A green run against a fork proves nothing about production.",
              },
              {
                name: "Scores nobody looks at",
                detail:
                  "The harness runs but its output is not gated in CI, so scores drift down unnoticed and the suite becomes documentation of a regression rather than a defence against one.",
              },
            ]}
          />
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/benchmark",
              label: "Benchmark — the same replay-and-score idea run at scale as a public voice-agent stress suite",
            },
            {
              href: "/blog/en/regression-testing-a-voice-agent",
              label: "Regression-testing a voice agent like software — the harness design walked through a concrete order flow",
            },
          ]}
        />
      </PatternLayout>
    </>
  );
}
