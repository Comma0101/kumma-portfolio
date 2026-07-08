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
  title: "Barge-in",
  description:
    "Barge-in for voice agents as a state-machine problem: detect the caller talking over TTS, cancel and flush audio output, and resume with conversation context intact.",
  openGraph: {
    title: "Barge-in | Patterns | Kumma",
    description:
      "Handle callers interrupting a voice agent mid-speech: VAD-triggered interruption, cancelling in-flight TTS, and preserving context on resume.",
    url: "https://kumma.me/patterns/barge-in",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/barge-in" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Barge-in",
  description:
    "Barge-in for voice agents as a state-machine problem: detect the caller talking over TTS, cancel and flush audio output, and resume with conversation context intact.",
  url: "https://kumma.me/patterns/barge-in",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const stateMachine = `// The floor is a resource exactly one party holds at a time.
type TurnState = "idle" | "speaking" | "listening" | "interrupted";

// Legal transitions. Anything not listed is a bug, not an edge case.
const transitions: Record<TurnState, TurnState[]> = {
  idle:        ["speaking", "listening"],
  speaking:    ["interrupted", "listening"], // finished, or cut off
  interrupted: ["listening"],                // hand the floor back
  listening:   ["speaking", "idle"],
};

function canGo(from: TurnState, to: TurnState): boolean {
  return transitions[from].includes(to);
}`;

const interruptHandler = `// Called by the VAD when caller speech is detected during playback.
// The guard keeps a single cough or "mm-hmm" from killing the turn.
const MIN_INTERRUPT_MS = 200; // tunable: raise it if backchannels cut you off

function onCallerSpeech(vad: VadEvent, turn: TurnController) {
  if (turn.state !== "speaking") return;          // only interrupts speech
  if (vad.sustainedMs < MIN_INTERRUPT_MS) return; // ignore blips

  turn.to("interrupted");

  // 1. Stop producing more audio: cancel the TTS stream at the source.
  turn.tts.cancel();

  // 2. Flush what is already queued so no stale audio plays after the cut.
  turn.audioSink.stop();       // halt the device / RTP writer now
  turn.audioSink.clearQueue(); // drop buffered chunks that were mid-flight

  // 3. Record what the caller actually heard, then reopen the mic.
  turn.markSpokenPrefix(turn.audioSink.playedCharCount());
  turn.to("listening");
}`;

const resumeContext = `// The model must reason over what was SPOKEN, not what was generated.
// If TTS was cut at "Your total comes to twelve", never assume the caller
// heard the items you were about to read back.
function contextForModel(turn: TurnController): Message[] {
  const spoken = turn.lastResponse.slice(0, turn.spokenPrefix);

  return [
    ...turn.history,
    {
      role: "assistant",
      content: spoken,
      // an explicit marker beats silently truncating the string
      interrupted: turn.spokenPrefix < turn.lastResponse.length,
    },
  ];
}`;

export default function BargeInPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 01"
        title="Barge-in"
        problem={
          <>
            A caller starts talking while the agent is still speaking, and if the
            system keeps playing text-to-speech over them, the two streams
            collide and neither side is understood. Barge-in is the mechanism
            that stops the agent mid-utterance, hands the floor back to the
            caller, and resumes the conversation without losing the thread.
          </>
        }
      >
        <PatternSection title="Frame it as a state machine">
          <p>
            The hard part of barge-in is not detecting speech; it is knowing what
            is <strong>allowed</strong> to happen next. Model the turn as an
            explicit state machine where the floor is a resource exactly one
            party holds at a time. Speech detection during{" "}
            <code>speaking</code> is the only path into <code>interrupted</code>,
            and the only exit from <code>interrupted</code> is back to{" "}
            <code>listening</code>. Once the legal transitions are written down,
            most barge-in bugs turn into &quot;we took a transition that was not
            in the table.&quot;
          </p>
          <CodeBlock caption="Illustrative: the turn state machine" code={stateMachine} />
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Deaf agent",
                detail:
                  "The VAD is not run during playback, so the caller's interruption is queued and only processed after the agent finishes. The agent talks past a caller who is trying to correct it.",
              },
              {
                name: "Self-interruption",
                detail:
                  "The agent's own TTS leaks into the input channel and trips the VAD, so the agent interrupts itself. Without echo cancellation or half-duplex gating on the outbound audio, playback and detection fight each other.",
              },
              {
                name: "Truncation amnesia",
                detail:
                  "TTS is cancelled but the transcript still records the full generated response, so the model later references a price or option the caller never heard. What was spoken and what was generated have drifted apart.",
              },
              {
                name: "Stale-audio race",
                detail:
                  "The interrupt fires but queued audio chunks keep draining to the caller, so a fragment of the old response plays after the caller has already started their new turn.",
              },
              {
                name: "Hair-trigger",
                detail:
                  "A cough, a backchannel 'mm-hmm', or a burst of line noise cancels the whole response. Interruption that is too sensitive leaves the agent unable to complete a sentence.",
              },
            ]}
          />
        </PatternSection>

        <PatternSection title="Implementation notes">
          <p>
            Keep a lightweight VAD running on the inbound stream{" "}
            <strong>while TTS is playing</strong>. When it reports sustained
            caller speech, the interrupt does three things in order: stop
            generating audio, flush what is already queued, and record how much
            of the utterance actually reached the caller. Ordering matters. If
            you flush the queue before cancelling the source, the stream can
            enqueue another chunk into the gap.
          </p>
          <CodeBlock
            caption="Illustrative: the interrupt handler"
            code={interruptHandler}
          />
          <p>
            Debounce the trigger. A single short blip should not seize the floor,
            so require speech to be sustained for a small, tunable window before
            transitioning to <code>interrupted</code>. The value below is a
            starting point to tune against real calls, not a measured result;
            raise it when backchannels cut the agent off, lower it when
            interruptions feel sluggish.
          </p>
          <p>
            The subtle part is <strong>resume</strong>. Cancelling TTS is easy;
            keeping the model&apos;s view of the conversation honest is not. Track
            a spoken prefix — how many characters of the response were actually
            rendered before the cut — and feed the model that prefix, not the
            full generation. Otherwise the agent confidently continues from
            information the caller never received.
          </p>
          <CodeBlock
            caption="Illustrative: context that reflects what was heard"
            code={resumeContext}
          />
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/patterns/endpointing",
              label: "Endpointing and turn detection — deciding when the caller's turn is actually over",
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
