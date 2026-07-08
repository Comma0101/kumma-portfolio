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
  title: "VAD tuning",
  description:
    "Tuning voice-activity detection for phone agents: separating speech from background noise frame by frame, choosing energy-threshold versus model-based VAD, and setting the detection threshold and hangover window so soft talkers are not dropped.",
  openGraph: {
    title: "VAD tuning | Patterns | Kumma",
    description:
      "Tune voice-activity detection so background noise does not register as speech and soft or slow talkers are not clipped: detection threshold, hangover window, and phone-band audio.",
    url: "https://kumma.me/patterns/vad-tuning",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/vad-tuning" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "VAD tuning",
  description:
    "Tuning voice-activity detection for phone agents: separating speech from background noise frame by frame, choosing energy-threshold versus model-based VAD, and setting the detection threshold and hangover window so soft talkers are not dropped.",
  url: "https://kumma.me/patterns/vad-tuning",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const frameDecision = `// A VAD makes one small decision per frame: speech, or not speech.
// Frames are short and fixed — commonly 10, 20, or 30 ms of audio.
// Everything downstream (endpointing, barge-in) is built on this label.
type Frame = Int16Array;        // one 20 ms slice of 8 kHz phone audio
type VadLabel = "speech" | "silence";

interface Vad {
  // Pure per-frame classification. No memory of turns, no timers here.
  classify(frame: Frame): VadLabel;
}

// The label stream is noisy by nature: a real utterance produces
// short dips (stop consonants, breaths) that flip a frame to "silence".
// Turn logic must smooth this, not trust each frame on its own.`;

const energyConfig = `// Energy-threshold VAD: cheap, fast, and easily fooled.
// It labels a frame as speech when its short-term energy clears a line.
interface EnergyVadConfig {
  // The line itself. Too low and the room's noise floor reads as speech;
  // too high and a soft talker never clears it.
  energyThresholdDb: number;      // e.g. -45 dBFS, tuned per deployment

  // Track the noise floor instead of hard-coding it, so a quiet caller
  // on a quiet line and a loud caller on a busy line both work.
  adaptiveFloor: boolean;         // follow the ambient level slowly
  floorAdaptRateMs: number;       // how fast the floor is allowed to move
}

// Model-based VAD swaps the single energy line for a small classifier
// trained on speech vs non-speech. It costs more per frame but holds up
// against steady noise (fans, engines, hold music) that energy alone
// mislabels as speech. Same knobs still sit on top of its output.`;

const smoothingConfig = `// The two knobs that matter most sit ABOVE the frame classifier:
// how eager it is to call speech, and how long it waits before
// calling the turn over.
interface VadTuning {
  // Aggressiveness / sensitivity. Higher = stricter about what counts
  // as speech (rejects more noise, risks clipping soft onsets).
  aggressiveness: 0 | 1 | 2 | 3;

  // Onset debounce: require this many consecutive speech frames before
  // declaring speech has started. Filters single-frame noise spikes.
  speechStartFrames: number;      // e.g. 3 frames (~60 ms at 20 ms)

  // Hangover / trailing-silence window: keep treating the turn as
  // ongoing for this long after the last speech frame, so a mid-sentence
  // pause is not mistaken for the end of the turn.
  hangoverMs: number;             // e.g. 600 ms — the dead-air lever
}

// These numbers are a starting point to tune against real calls, not a
// measured result. Widen hangoverMs when slow talkers get cut off;
// shorten it when the agent feels laggy to respond. Raise aggressiveness
// when a noisy line self-triggers; lower it when soft speech is dropped.
const defaults: VadTuning = {
  aggressiveness: 2,
  speechStartFrames: 3,
  hangoverMs: 600,
};`;

export default function VadTuningPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 03"
        title="VAD tuning"
        problem={
          <>
            Voice-activity detection decides, moment to moment, whether the caller
            is speaking, and every later stage of the pipeline trusts that label.
            Tune it too aggressively and soft or slow talkers get clipped and their
            turns truncated; tune it too permissively and a fan, a passing car, or
            the caller&apos;s own hold music registers as speech and drags latency
            into every turn.
          </>
        }
      >
        <PatternSection title="What the VAD actually decides">
          <p>
            A VAD does one small thing: for each short frame of audio it emits a
            single label, <code>speech</code> or <code>silence</code>. Frames are
            fixed and short — commonly 10, 20, or 30 milliseconds — so the detector
            is a stream of yes/no decisions, not a turn-level judgement. That
            distinction matters, because a real utterance is full of brief dips:
            the closure before a stop consonant, a breath, the gap between words.
            Trust each frame on its own and the turn shatters into fragments. The
            frame label is raw material; the turn logic above it has to smooth the
            stream rather than react to every flip.
          </p>
          <CodeBlock
            caption="Illustrative: the per-frame decision the VAD makes"
            code={frameDecision}
          />
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Clipped soft speaker",
                detail:
                  "A quiet or distant caller never clears the detection threshold, so their speech reads as silence and the turn either never starts or is cut short. The transcript arrives with the first word or two missing.",
              },
              {
                name: "Noise false-trigger",
                detail:
                  "A steady fan, engine hum, or background TV pushes frame energy over the line, so the VAD reports speech that is not there. The agent waits on a turn that never resolves, or starts responding to noise.",
              },
              {
                name: "Dead air from long hangover",
                detail:
                  "The trailing-silence window is set wide to protect slow talkers, so after the caller genuinely finishes the agent sits silent for the full hangover before responding. Safety against truncation is paid for in latency on every turn.",
              },
              {
                name: "Self-trigger from TTS bleed",
                detail:
                  "The agent's own text-to-speech leaks into the input channel and the VAD labels it as caller speech. Without echo cancellation or gating on the outbound path, the agent detects itself talking and derails the turn.",
              },
              {
                name: "Noise-floor drift",
                detail:
                  "A caller walks from a quiet room into a kitchen or onto a street and the ambient level climbs mid-call. A threshold fixed at connect time was tuned for the quiet room, so the same speech that read cleanly a minute ago now sits under a wall of noise.",
              },
            ]}
          />
        </PatternSection>

        <PatternSection title="Choosing the detector">
          <p>
            The cheapest VAD is an <strong>energy threshold</strong>: label a frame
            as speech when its short-term energy clears a line. It is fast and
            trivial to run, but it cannot tell a raised voice from a raised noise
            floor, so a single fixed line either lets steady noise through or
            starves a soft talker. The first improvement is to stop hard-coding the
            line and let it track the ambient level, so a quiet caller on a quiet
            line and a loud caller on a busy line both clear their own local floor.
          </p>
          <CodeBlock
            caption="Illustrative: an energy-threshold VAD with an adaptive floor"
            code={energyConfig}
          />
          <p>
            A <strong>model-based</strong> VAD replaces the single energy line with
            a small classifier trained to separate speech from non-speech. It costs
            more per frame, but it holds up against the steady, speech-shaped noise
            — fans, engines, hold music — that defeats energy alone. It is not a
            different problem, though: the same turn-level knobs still sit on top of
            its output, and they are where most of the tuning happens.
          </p>
        </PatternSection>

        <PatternSection title="The knobs that matter">
          <p>
            Two controls do most of the work, and both live above the frame
            classifier. The first is <strong>aggressiveness</strong> — how strict
            the detector is about what counts as speech. Turn it up and it rejects
            more noise at the cost of clipping soft onsets; turn it down and it
            catches every quiet talker but lets more noise through. Pair it with a
            short onset debounce so a single noisy frame cannot start a turn.
          </p>
          <p>
            The second, and the one that shapes how the call feels, is the{" "}
            <strong>hangover</strong>: the trailing-silence window the VAD keeps
            treating as part of the turn after the last speech frame. Set it too
            short and a mid-sentence pause looks like the end of the turn, so the
            agent interrupts a caller who was only drawing breath. Set it too long
            and the agent waits out that full window as dead air after every
            genuine ending. This is the direct trade the pattern is named for, and
            there is no value that is correct in the abstract.
          </p>
          <CodeBlock
            caption="Illustrative: the tuning surface above the classifier"
            code={smoothingConfig}
          />
          <p>
            Tune against real calls, not a quiet office. Telephone audio is narrow —
            roughly 300 to 3400 Hz, sampled at 8 kHz — and lossy codecs add their
            own hiss and artefacts that a detector tuned on clean wideband audio
            reads as speech. Because the noise floor drifts as callers move, prefer
            an adaptive floor over a fixed threshold, and treat the numbers here as
            a place to start: widen the hangover when slow talkers get cut off,
            shorten it when responses feel laggy, and raise aggressiveness when a
            noisy line trips the detector on its own.
          </p>
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/patterns/endpointing",
              label:
                "Endpointing and turn detection — turning the VAD's frame labels into a decision that the caller's turn is over",
            },
            {
              href: "/patterns/barge-in",
              label:
                "Barge-in — running the VAD during playback so the caller can interrupt the agent mid-utterance",
            },
          ]}
        />
      </PatternLayout>
    </>
  );
}
