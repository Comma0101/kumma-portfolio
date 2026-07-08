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
  title: "Streaming STT selection",
  description:
    "Choosing a streaming speech-to-text path for a phone agent on the properties that matter in real time: partial-transcript stability, time-to-first-partial, endpoint signals, phone-band audio, and formatting for downstream parsing.",
  openGraph: {
    title: "Streaming STT selection | Patterns | Kumma",
    description:
      "Pick a streaming STT model on partial stability, first-partial latency, endpoint signals, and 8 kHz phone-band support — not headline word-error-rate.",
    url: "https://kumma.me/patterns/streaming-stt",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/streaming-stt" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Streaming STT selection",
  description:
    "Choosing a streaming speech-to-text path for a phone agent on the properties that matter in real time: partial-transcript stability, time-to-first-partial, endpoint signals, phone-band audio, and formatting for downstream parsing.",
  url: "https://kumma.me/patterns/streaming-stt",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const streamShape = `// A streaming STT connection emits many events per utterance, not one result.
// Partials arrive as the caller speaks and can be revised; a final is stable.
type SttEvent =
  | { type: "partial"; text: string; stableTo: number } // text so far, may change
  | { type: "final"; text: string }                     // this segment is settled
  | { type: "utterance_end"; at: number };              // STT thinks the caller stopped

// Batch STT gives you one string after the audio is complete. That is fine for
// a voicemail, useless for a live turn: you cannot start thinking until the
// caller has already finished, so the whole call sits on top of that wait.
async function* consume(stream: AsyncIterable<SttEvent>) {
  for await (const event of stream) {
    // Route partials to the turn logic, finals to the transcript of record.
    yield event;
  }
}`;

const debouncePartials = `// Partials flicker: "twelve" -> "twenty" -> "twenty two" as more audio arrives.
// Acting on the first partial that parses means acting on a guess the model
// is about to retract. Wait for the text to hold still before you commit.
const STABLE_MS = 300; // tunable: how long a partial must stay unchanged

function makeDebouncer(onSettled: (text: string) => void) {
  let lastText = "";
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function onPartial(text: string) {
    if (text === lastText) return; // no change, let the existing timer run
    lastText = text;
    if (timer) clearTimeout(timer);
    // Only fire once the partial has been unchanged for STABLE_MS.
    timer = setTimeout(() => onSettled(text), STABLE_MS);
  };
}

// Prefer the STT's own final / utterance_end when it is trustworthy; fall back
// to this debounce when partials are all you get. Never act on a raw partial.`;

export default function StreamingSttPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 04"
        title="Streaming STT selection"
        problem={
          <>
            The instinct when picking speech-to-text is to sort vendors by
            published word-error-rate and take the top of the list. On a live
            phone call that number is close to irrelevant: it is measured on
            clean, wideband audio in a batch setting, and it says nothing about
            how the model behaves while a caller is mid-sentence. Choosing an STT
            path for a real-time agent means weighing the properties that shape a
            turn — how stable partial transcripts are, how fast the first partial
            arrives, what endpoint signals the model emits, and whether it was
            trained on narrowband phone audio at all.
          </>
        }
      >
        <PatternSection title="Streaming, not batch">
          <p>
            A batch model takes an audio file and returns one transcript. That is
            the wrong shape for a phone turn, because you cannot begin reasoning
            until the caller has already stopped talking — the model&apos;s
            latency stacks directly on top of the caller&apos;s own pause. A
            streaming model instead opens a connection and emits a run of events:{" "}
            <strong>partial</strong> transcripts that update as speech arrives,{" "}
            <strong>final</strong> transcripts once a segment settles, and often
            an <strong>utterance-end</strong> or endpoint signal when it believes
            the caller has stopped. The partials are what let the agent think in
            parallel with the caller rather than after them.
          </p>
          <CodeBlock
            caption="Illustrative: the event shape of a streaming connection"
            code={streamShape}
          />
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Chasing the leaderboard",
                detail:
                  "Selecting on a headline word-error-rate measured on clean wideband audio in batch mode. It predicts almost nothing about partial stability, first-partial latency, or behaviour on an 8 kHz phone line, which are the things a live turn actually depends on.",
              },
              {
                name: "Acting on unstable partials",
                detail:
                  "The turn logic reads the first partial that parses and commits to it. Partials get revised as more audio arrives — 'twelve' becomes 'twenty', 'no' becomes 'no thanks' — so the agent acts on a number or intent the model is about to retract.",
              },
              {
                name: "No usable endpoint signal",
                detail:
                  "The chosen model streams partials but never emits a trustworthy utterance-end, so turn detection falls back entirely to a fixed silence timer. You lose a signal the STT already has and pay for it in either clipped turns or dead air.",
              },
              {
                name: "Wideband model on phone audio",
                detail:
                  "A model trained and tuned for 16 kHz wideband input is fed a narrowband 8 kHz phone stream. Upsampling does not restore the missing band, so accuracy on exactly the audio you run in production is worse than the benchmark that sold you on it.",
              },
              {
                name: "Slow first partial",
                detail:
                  "Time-to-first-partial is long, so the transcript lags well behind the caller even though the final is accurate. Every turn inherits that delay, and the agent feels sluggish no matter how fast the rest of the pipeline runs.",
              },
            ]}
          />
        </PatternSection>

        <PatternSection title="What to weigh instead">
          <p>
            <strong>Partial stability.</strong> The value of partials is that they
            arrive early; the cost is that they change. A model whose partials
            churn heavily forces you to wait longer before trusting any of them,
            which erodes the head start streaming was supposed to buy. Judge a
            model on how little its partials revise once the words are out, not
            only on where the final lands. When you must act on a partial, wait
            for it to hold still first — debounce on the text being unchanged, and
            treat the raw partial as a draft.
          </p>
          <CodeBlock
            caption="Illustrative: hold a partial until it stops changing before acting"
            code={debouncePartials}
          />
          <p>
            <strong>Time-to-first-partial.</strong> This is a latency source that
            sits at the very front of the turn. However good the final transcript
            is, a slow first partial means the agent starts every turn behind the
            caller, and that delay is not recoverable downstream. Weigh it as its
            own axis, separate from accuracy.
          </p>
          <p>
            <strong>Endpoint signals.</strong> Many streaming models emit an
            utterance-end or endpoint event when they judge the caller has
            stopped. When that signal is trustworthy, lean on it rather than
            reimplementing turn detection from a raw silence timer — the model has
            acoustic context you do not. When it is noisy or absent, that is a
            real mark against the model for phone use, because you then carry the
            entire endpointing burden yourself.
          </p>
          <p>
            <strong>Phone-band support.</strong> Telephone audio is narrowband,
            typically 8 kHz. A model trained primarily on wideband speech will
            underperform on it, and upsampling cannot add back a band that was
            never transmitted. Confirm the model genuinely supports 8 kHz phone
            audio rather than accepting it and quietly degrading.
          </p>
          <p>
            <strong>Formatting for parsing.</strong> A phone agent usually feeds
            the transcript to something that reads numbers, quantities, and times
            back out. How a model renders those — digits versus words, how it
            punctuates, whether it normalises &quot;two dozen&quot; or leaves it
            literal — decides how much brittle normalisation you write downstream.
            A transcript that is a point lower on word-error-rate but formats
            numbers the way your parser expects is often the better pick.
          </p>
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/patterns/endpointing",
              label: "Endpointing and turn detection — deciding when the caller's turn is actually over",
            },
            {
              href: "/patterns/latency-budgets",
              label: "Latency budgets — where the milliseconds go in a real-time voice turn",
            },
          ]}
        />
      </PatternLayout>
    </>
  );
}
