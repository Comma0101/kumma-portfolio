import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  PatternLayout,
  PatternSection,
  FailureModes,
  CodeBlock,
  RelatedNotes,
} from "@/components/PatternLayout";

export const metadata: Metadata = {
  title: "Endpointing and turn detection",
  description:
    "Deciding when a caller has finished their turn: silence timers, the interrupt-versus-lag trade-off, short versus long endpoint timeouts, and why fixed timers fail on slow speakers.",
  openGraph: {
    title: "Endpointing and turn detection | Patterns | Kumma",
    description:
      "Turn detection for voice agents: silence timers, dynamic endpoint timeouts driven by transcript completeness, and why a single fixed timer cuts people off.",
    url: "https://kumma.me/patterns/endpointing",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/endpointing" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Endpointing and turn detection",
  description:
    "Deciding when a caller has finished their turn: silence timers, the interrupt-versus-lag trade-off, short versus long endpoint timeouts, and why fixed timers fail on slow speakers.",
  url: "https://kumma.me/patterns/endpointing",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const silenceTimer = `// Baseline: end the turn after a fixed run of silence from the VAD.
// Simple, and wrong for anyone who does not speak at your assumed pace.
const ENDPOINT_MS = 700; // one number for every caller and every utterance

function onVadFrame(frame: VadFrame, turn: TurnController) {
  if (frame.isSpeech) {
    turn.clearSilenceTimer();
    return;
  }
  turn.startSilenceTimer(ENDPOINT_MS, () => turn.endOfTurn());
}`;

const completeness = `// A pause is not the same as "finished". Weight the silence window by
// whether the transcript so far looks like a complete thought.
function looksComplete(transcript: string): boolean {
  const t = transcript.trim().toLowerCase();

  // Trailing conjunctions / fillers signal the caller is mid-thought.
  if (/\\b(and|or|but|so|because|um|uh|like)$/.test(t)) return false;

  // Mid-number or mid-list: a bare digit run rarely ends a turn.
  if (/\\d[\\d\\s-]*$/.test(t) && t.replace(/\\D/g, "").length < 10) return false;

  // Otherwise treat a settled clause as plausibly complete.
  return t.length > 0;
}`;

const dynamicEndpoint = `// Short timeout when the utterance looks done, long when it looks unfinished.
// Fixed timers cannot do this: they cut off the slow speaker to stay snappy
// for the fast one. Let the transcript, not a stopwatch, pick the window.
const SHORT_MS = 550; // utterance parses as complete -> respond promptly
const LONG_MS = 1400; // trailing conjunction or mid-number -> keep waiting

function endpointDelay(turn: TurnController): number {
  const done = looksComplete(turn.partialTranscript);
  const base = done ? SHORT_MS : LONG_MS;

  // Optional: stretch the window toward slower recent speech so a
  // deliberate speaker is not held to a fast talker's rhythm.
  const paceFactor = clamp(turn.recentPauseAvgMs / 400, 1, 2);
  return Math.round(base * paceFactor);
}`;

export default function EndpointingPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 02"
        title="Endpointing and turn detection"
        problem={
          <>
            The agent has to decide the exact moment a caller has finished
            speaking so it can take its turn, but people pause mid-thought — to
            think, to breathe, to read a card number off a table. Endpoint too
            early and you talk over them; endpoint too late and every exchange
            drags with dead air.
          </>
        }
      >
        <PatternSection title="The trade-off is the whole problem">
          <p>
            Endpointing lives on a single dial. Turn it one way and the agent
            responds the instant the line goes quiet, which feels sharp until it
            interrupts a caller who paused to think. Turn it the other way and
            the agent waits patiently through every pause, which feels calm until
            the caller has plainly finished and is now sitting in silence
            wondering if the call dropped. There is no setting that is right for
            both a rushed regular and a first-time caller reading a long address.
          </p>
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Premature cutoff",
                detail:
                  "A short fixed silence window fires while the caller is still mid-sentence — pausing to recall a detail or read digits — and the agent barges in on its own user.",
              },
              {
                name: "Dead air",
                detail:
                  "A long fixed window makes the agent wait well past the point the caller clearly finished. Every turn gains a beat of lag and the conversation stops feeling live.",
              },
              {
                name: "Slow-speaker penalty",
                detail:
                  "Fixed timers assume one speaking rhythm. Deliberate, elderly, or non-native speakers pause longer between words and get cut off on nearly every turn.",
              },
              {
                name: "Digit and list strings",
                detail:
                  "Phone numbers, card numbers, and addresses contain long internal pauses. A single silence threshold cannot tell 'done' from 'about to say the next digit'.",
              },
              {
                name: "Trailing noise holds the floor",
                detail:
                  "A TV, a second voice, or line noise keeps the VAD active, so the endpoint never fires and the agent waits on a caller who already stopped talking.",
              },
            ]}
          />
        </PatternSection>

        <PatternSection title="Implementation notes">
          <p>
            The baseline is a silence timer: when the VAD reports no speech for a
            fixed number of milliseconds, call it end-of-turn. It is easy to ship
            and it is the source of most of the failures above, because a pause
            is a weak proxy for finality.
          </p>
          <CodeBlock
            caption="Illustrative: fixed silence-timer endpointer"
            code={silenceTimer}
          />
          <p>
            Fixed timers fail because speaking rate is not constant across callers
            or even within one utterance. The fix is to stop treating silence as
            the only signal. Ask a cheap question of the partial transcript: does
            it look like a <strong>complete thought</strong>, or does it end on a
            conjunction, a filler, or a half-finished number? That heuristic is
            crude on its own, but it is enough to choose between a short and a
            long window.
          </p>
          <CodeBlock
            caption="Illustrative: a completeness heuristic"
            code={completeness}
          />
          <p>
            Now let the transcript pick the timeout. When the utterance parses as
            complete, respond promptly; when it looks unfinished, keep waiting.
            The same idea extends to pacing: bias the window toward the
            caller&apos;s own recent pause length so a deliberate speaker is not
            held to a fast talker&apos;s rhythm. The constants below are starting
            points to tune against real calls, not measured results.
          </p>
          <CodeBlock
            caption="Illustrative: a transcript-driven dynamic timeout"
            code={dynamicEndpoint}
          />
          <p>
            The general shape is: silence starts the clock, but the length of the
            clock is a function of what was said. A dedicated turn-detection model
            is the next step up from a heuristic, but the structure — silence as
            trigger, completeness as the arbiter of how long to wait — stays the
            same.
          </p>
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/patterns/barge-in",
              label: "Barge-in — handling the caller who talks over the agent mid-response",
            },
            {
              href: "/blog/en/kota-real-time-voice-pipeline",
              label: "How a real-time voice pipeline turns a phone call into a kitchen ticket",
            },
          ]}
        />
      </PatternLayout>
    </>
  );
}
