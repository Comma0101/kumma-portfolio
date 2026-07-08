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
  title: "Latency budgets",
  description:
    "Accounting for the time from when the caller stops speaking to the first audio byte back: budget every pipeline stage, overlap and stream instead of running in sequence, and measure end-to-end at the phone.",
  openGraph: {
    title: "Latency budgets | Patterns | Kumma",
    description:
      "Budget the response latency of a voice agent stage by stage — VAD hangover, final STT, model time-to-first-token, TTS time-to-first-audio, network — then stream and instrument each stage.",
    url: "https://kumma.me/patterns/latency-budgets",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/latency-budgets" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Latency budgets",
  description:
    "Accounting for the time from when the caller stops speaking to the first audio byte back: budget every pipeline stage, overlap and stream instead of running in sequence, and measure end-to-end at the phone.",
  url: "https://kumma.me/patterns/latency-budgets",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const budget = `// Illustrative TARGETS to allocate against and measure, not measured data.
// The point is the shape: a ceiling per stage that sums to a turn-taking goal.
// Pick your own goal, then tune each number against real calls.
type StageBudget = {
  stage: string;
  targetMs: number; // a ceiling to design toward, then verify
  note: string;
};

const responseBudget: StageBudget[] = [
  { stage: "vadHangover",  targetMs: 0,   note: "silence you wait out before calling the turn over" },
  { stage: "finalStt",     targetMs: 0,   note: "flushing the last partial into a final transcript" },
  { stage: "modelTtft",    targetMs: 0,   note: "prompt to the model's first token" },
  { stage: "ttsTtfa",      targetMs: 0,   note: "first tokens to first synthesized audio" },
  { stage: "networkTel",   targetMs: 0,   note: "round trips plus telephony/jitter buffering" },
];
// Fill each targetMs with a ceiling you choose. They are ADDITIVE on the
// critical path, so the sum is your worst case unless stages overlap.`;

const overlap = `// Sequential: every stage waits for the one before it to finish.
const transcript = await stt.final(audio);        // wait
const reply = await model.complete(transcript);    // then wait
const speech = await tts.synthesize(reply);        // then wait
play(speech);                                       // then speak
// Total on the critical path = sum of all four.

// Streamed: hand each stage its input as soon as it is stable, and
// start the next stage on the first useful output instead of the last.
model.on("token", (t) => tts.push(t));  // synthesize as tokens arrive
tts.on("audio", (chunk) => sink.write(chunk)); // play first chunk immediately

// Act on a stable partial rather than blocking on the final transcript;
// begin generation the moment the turn is confidently over. The first
// audio byte can leave while later tokens are still being produced.`;

const instrument = `// One timestamp per stage boundary, all from the SAME clock, so a slow
// turn tells you WHICH stage was slow instead of just that it was slow.
type TurnTrace = {
  callerStoppedAt: number; // VAD decides speech ended
  turnCalledAt: number;    // hangover elapsed, turn declared over
  sttFinalAt: number;      // final transcript ready
  firstTokenAt: number;    // model's first token
  firstAudioAt: number;    // TTS first audio produced
  firstByteToPhoneAt: number; // first byte handed to the carrier
};

function stageDurations(t: TurnTrace) {
  return {
    hangover: t.turnCalledAt - t.callerStoppedAt,
    stt:      t.sttFinalAt - t.turnCalledAt,
    modelTtft:t.firstTokenAt - t.sttFinalAt,
    ttsTtfa:  t.firstAudioAt - t.firstTokenAt,
    egress:   t.firstByteToPhoneAt - t.firstAudioAt,
  };
  // Compare each duration to its target. The stage over budget is the
  // culprit; without these boundaries you are guessing.
}`;

export default function LatencyBudgetsPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 10"
        title="Latency budgets"
        problem={
          <>
            The gap a caller actually feels is the time from when they stop
            speaking to the first audio byte coming back, and that gap is the sum
            of several stages that each take their own time. Treat it as a budget:
            decide how long the whole turn is allowed to take, hand every stage a
            share of it, and instrument each one so a slow turn points at a stage
            rather than a shrug.
          </>
        }
      >
        <PatternSection title="Where the time goes">
          <p>
            Between the caller falling silent and the agent answering, the
            response passes through a fixed set of stages, and each one consumes
            time. Endpoint detection waits out a hangover window before it will
            declare the turn over. The speech-to-text engine flushes its last
            partial into a final transcript. The model spends its{" "}
            <strong>time to first token</strong> reading the prompt before it
            emits anything. Text-to-speech spends its{" "}
            <strong>time to first audio</strong> turning those first tokens into
            sound. And underneath all of it, network round trips and telephony
            jitter buffers add their own delay in both directions.
          </p>
          <p>
            These costs are <strong>additive on the critical path</strong> and
            dominated by the slow ones. Shaving milliseconds off a stage that was
            already fast does nothing a caller can hear; the turn is only as
            responsive as its worst stage plus everything it waits behind. So the
            first move is to write the stages down and give each a ceiling you can
            design toward.
          </p>
          <CodeBlock
            caption="Illustrative: a per-stage budget of targets to allocate against and measure, not measured data"
            code={budget}
          />
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Sequential pipeline",
                detail:
                  "Each stage waits for the previous one to fully finish before it starts, so the caller pays the sum of every stage end to end. The stages never overlap even though most of them can.",
              },
              {
                name: "Hidden hangover",
                detail:
                  "The endpoint detector waits out a silence window before it will call the turn over, and that wait is pure dead air the caller feels but almost nobody budgets. The rest of the pipeline can be fast while the turn still feels slow because it has not even started.",
              },
              {
                name: "Waiting for the full completion",
                detail:
                  "Text-to-speech is not handed anything until the model has produced its entire response, so the first spoken word waits on the last generated token. The agent could have started speaking on the first clause.",
              },
              {
                name: "Server-side stopwatch",
                detail:
                  "Latency is measured inside the service, so it excludes the network round trips and the telephony jitter buffer that the caller actually experiences. The dashboard looks healthy while the call feels sluggish.",
              },
              {
                name: "One opaque number",
                detail:
                  "The pipeline reports a single end-to-end figure with no per-stage timestamps, so when a turn is slow there is no way to tell which stage caused it. Every regression turns into a guessing game.",
              },
            ]}
          />
        </PatternSection>

        <PatternSection title="Overlap instead of sequencing">
          <p>
            The largest wins come from not running the stages in a line. A
            sequential pipeline makes the caller pay for speech-to-text, then the
            model, then text-to-speech, one after another. Streaming collapses
            that: start generation the moment the turn is confidently over, push
            the model&apos;s tokens into text-to-speech as they arrive, and write
            the first synthesized chunk to the caller while later tokens are still
            being produced. The first audio byte leaves long before the response
            is complete.
          </p>
          <CodeBlock
            caption="Illustrative: streaming stages instead of awaiting each in turn"
            code={overlap}
          />
          <p>
            The same idea applies upstream. Acting on a{" "}
            <strong>stable partial</strong> transcript rather than blocking on the
            final one lets the model begin reading the prompt earlier, and a
            well-tuned endpoint decision keeps the hangover window from becoming
            dead air. Overlap does not change what each stage costs; it stops the
            caller from paying for stages back to back.
          </p>
        </PatternSection>

        <PatternSection title="Measure at the phone, then per stage">
          <p>
            Measure end-to-end where the caller is — at the phone — not inside the
            server. The only number that matters is silence-to-first-audio as it
            arrives over the carrier, which includes the round trips and jitter
            buffering a server-side timer never sees. Once you trust that
            end-to-end figure, break it down: stamp one timestamp at every stage
            boundary from a single clock, so a slow turn tells you which stage
            blew its budget instead of merely that the turn was slow.
          </p>
          <CodeBlock
            caption="Illustrative: one timestamp per stage boundary from one clock"
            code={instrument}
          />
          <p>
            With the boundaries in place the loop is mechanical: compare each
            stage&apos;s duration to its target, find the stage over budget, and
            spend your effort there. The budget object is a{" "}
            <strong>starting point to tune against real calls, not a measured
            result</strong>; the instrumentation is what turns those targets into
            something you can hold each stage to.
          </p>
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/patterns/vad-tuning",
              label: "VAD tuning — trimming the hangover window without clipping the caller",
            },
            {
              href: "/patterns/streaming-stt",
              label: "Streaming STT — acting on stable partials instead of waiting for the final transcript",
            },
            {
              href: "/latency",
              label: "Latency — why the response gap is the number that makes a call feel like a conversation",
            },
          ]}
        />
      </PatternLayout>
    </>
  );
}
