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
  title: "Telephony failure modes",
  description:
    "The failure surface a localhost voice demo never shows: one-way audio, stalled media, DTMF colliding with speech recognition, codec surprises, and leg drops — with the detection and handling move for each.",
  openGraph: {
    title: "Telephony failure modes | Patterns | Kumma",
    description:
      "SIP and Twilio media failures that only appear on a real phone line: one-way audio, silent media stalls, DTMF misread as speech, codec mismatch, and no reconnection on a dropped leg.",
    url: "https://kumma.me/patterns/telephony-failure-modes",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/telephony-failure-modes" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Telephony failure modes",
  description:
    "The failure surface a localhost voice demo never shows: one-way audio, stalled media, DTMF colliding with speech recognition, codec surprises, and leg drops — with the detection and handling move for each.",
  url: "https://kumma.me/patterns/telephony-failure-modes",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const mediaWatchdog = `// ILLUSTRATIVE — a media watchdog keyed on packet arrival, not audio energy.
// The distinction it must make: NO inbound packets (dead leg) is not the
// same as packets that happen to carry silence (a caller pausing to think).
import { monotonicMs } from "./clock";

type LegState = "flowing" | "stalled";

class MediaWatchdog {
  private lastPacketAt = monotonicMs();
  private state: LegState = "flowing";

  // Tunable windows, not measured values. Fit them to your jitter buffer
  // and how long a caller may legitimately go quiet.
  constructor(
    private readonly stallAfterMs: number, // no packets for this long -> stalled
  ) {}

  // Call on every inbound RTP packet, BEFORE decoding.
  // A quiet caller still sends packets: comfort noise, room tone, hiss.
  onInboundPacket() {
    this.lastPacketAt = monotonicMs();
    if (this.state === "stalled") this.onRecovered();
    this.state = "flowing";
  }

  // Call on a timer while signaling says the call is up.
  tick(callConnected: boolean) {
    if (!callConnected) return;
    const quietFor = monotonicMs() - this.lastPacketAt;
    if (this.state === "flowing" && quietFor > this.stallAfterMs) {
      this.state = "stalled";
      // Signaling is happy but no media is arriving: one-way audio or a
      // stalled leg. Renegotiate media, or drop and let the caller redial.
      // Do NOT wait on audio energy — a thinking caller trips that falsely.
      this.onStallDetected();
    }
  }

  private onStallDetected() {/* renegotiate or tear down */}
  private onRecovered() {/* resume normal turn-taking */}
}`;

const dtmfUpstream = `// ILLUSTRATIVE — DTMF is its own channel, resolved UPSTREAM of the STT.
// A keypad press is two pure sine tones sitting in the voice band; a speech
// recognizer emits garbage for them and mangles the words around them.
type Frame = Int16Array;

function routeInboundAudio(
  frame: Frame,
  digits: DigitSink, // your intent logic, separate from transcription
  stt: SttStream,
) {
  // 1. Prefer out-of-band events (RFC 2833 / telephone-event). If the trunk
  //    signals digits separately, the tones never touch the recognizer.
  const oob = takeOutOfBandDigit();
  if (oob) {
    digits.push(oob);
    return; // handled; nothing to transcribe for this event
  }

  // 2. Inband DTMF: detect and strip before the audio reaches STT, and route
  //    the digit on its own path. People talk and press at the same time, so
  //    stripping the tone protects the surrounding words too.
  const tone = detectInbandDtmf(frame);
  if (tone) {
    digits.push(tone.digit);
    stt.write(suppressToneBand(frame, tone)); // notch out the tone, keep speech
    return;
  }

  stt.write(frame);
}`;

export default function TelephonyFailureModesPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 08"
        title="Telephony failure modes"
        problem={
          <>
            A voice agent that works on localhost has only ever run on a clean,
            full-duplex, lossless path — nothing like a phone call. The moment it
            answers over SIP or a provider like Twilio, a separate signaling path
            and media path can disagree: the call reports connected while audio
            flows one way, stalls, or never negotiates a codec both ends speak.
            This is a tighter reference to that failure surface — each mode, the
            signal that reveals it, and the handling move — companion to the
            narrative field note below.
          </>
        }
      >
        <PatternSection title="Signaling is not media">
          <p>
            The single idea that organizes every failure here: a phone call is
            two independent paths. <strong>Signaling</strong> (SIP) sets the call
            up, tears it down, and reports state. <strong>Media</strong> (RTP,
            usually over UDP) carries the actual audio. They can travel different
            routes, cross different NATs, and fail independently. Because RTP is
            UDP with no handshake and no retransmit, a broken media path does not
            raise an error — packets simply go into a hole while signaling stays
            cheerfully <code>connected</code>. So the rule is: never infer that
            audio is healthy from the fact that the call is up. Watch the media
            directly.
          </p>
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "One-way audio",
                detail:
                  "Signaling completes and the call is up, but RTP only flows in one direction — inbound frames never arrive while outbound TTS streams out fine, or the reverse. It is a media-path problem, usually a NAT or firewall dropping UDP to an address the other end advertised. The tell is asymmetry, and you can only see it by watching packet arrival on each leg, not by watching the signaling state.",
              },
              {
                name: "Silent media stall",
                detail:
                  "A leg that was flowing goes quiet mid-call — a route change, a lost media relay, or congestion — and no packets arrive for the duration. Signaling still says connected. The trap is confusing this with a quiet caller: a caller pausing to think still sends comfort-noise packets, so key detection on packet arrival, not on audio energy.",
              },
              {
                name: "DTMF misread as speech",
                detail:
                  "A caller presses a key and, when the trunk carries DTMF inband, two pure sine tones land in the recognizer's audio. The STT emits garbage tokens for the tones and degrades the words spoken alongside them, because people talk and press at the same time. Treating a keypress as just more audio corrupts the surrounding turn.",
              },
              {
                name: "Codec mismatch",
                detail:
                  "The SDP offer/answer negotiates a codec — or a carrier in the path transcodes to a lossier one such as G.729 — and your pipeline decodes it wrong: reading μ-law bytes as linear PCM, missing the endianness, or assuming 16 kHz on an 8 kHz stream. It does not sound like slightly worse audio; it sounds like static, and STT confidence collapses. Live calls are inexplicably bad while exported recordings are fine.",
              },
              {
                name: "No reconnection on leg drop",
                detail:
                  "A media leg drops and the agent keeps talking into a dead path with no recovery. Without a watchdog watching for the stall, nothing renegotiates media or tears the call down, so the caller is stranded on a line the system still believes is live.",
              },
            ]}
          />
        </PatternSection>

        <PatternSection title="Detect the stall on the media, not the signaling">
          <p>
            One-way audio, a silent stall, and a dropped leg share a detection
            move: watch inbound RTP and notice when it goes quiet while the call
            is still supposed to be live. The subtlety is the distinction the
            watchdog has to make — <strong>no packets at all</strong> is a dead
            leg, but <strong>packets that happen to carry silence</strong> is a
            caller thinking. Key on packet arrival. If you key on audio energy you
            will &quot;recover&quot; a healthy call every time someone pauses.
          </p>
          <CodeBlock
            caption="Illustrative: a media watchdog that distinguishes a dead leg from a quiet caller"
            code={mediaWatchdog}
          />
          <p>
            When the watchdog fires, the handling depends on how much of the stack
            you own. If a provider terminates media for you, the move is usually to
            tear the call down and let the caller redial rather than leave them on
            a broken line. If you run your own media, you can attempt to
            renegotiate the media path first and only drop if that fails. Either
            way the decision belongs to the media layer, because the signaling
            layer never noticed anything was wrong.
          </p>
        </PatternSection>

        <PatternSection title="Give DTMF its own channel, above the recognizer">
          <p>
            DTMF is not speech and should never reach the recognizer as if it
            were. Resolve it upstream of STT. If the trunk gives you out-of-band
            digit events (RFC 2833 / telephone-event), take them and keep the tones
            out of the audio entirely. If DTMF is inband, detect and strip it
            before the audio reaches STT and route the digit to your intent logic
            on a separate path — which also protects the words a caller speaks
            while pressing.
          </p>
          <CodeBlock
            caption="Illustrative: DTMF resolved upstream of speech recognition"
            code={dtmfUpstream}
          />
        </PatternSection>

        <PatternSection title="Negotiate the codec honestly">
          <p>
            Codec surprises are a decode problem more often than a quality one.
            Read what the SDP actually negotiated and decode to that exact format —
            μ-law is not linear PCM, and an 8 kHz stream is not a 16 kHz one.
            Resample honestly rather than upsampling 8 kHz to 16 kHz and pretending
            the missing band came back; upsampling adds samples, not information.
            When accuracy cliffs on live calls but recordings you exported sound
            fine, suspect the decode path before you touch the model. And handle
            call-setup failure as its own case: if offer and answer never agree on
            a codec both ends speak, the call may signal up and then carry media
            neither side can decode — fail it fast and surface why, rather than
            handing the recognizer noise.
          </p>
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/blog/en/telephony-gotchas-sip-audio",
              label:
                "Telephony gotchas: what SIP does to your audio that localhost doesn't — the narrative walkthrough behind this reference",
            },
            {
              href: "/patterns/vad-tuning",
              label:
                "Tuning VAD for real conditions — endpointing against the worse inputs a phone line hands you",
            },
          ]}
        />
      </PatternLayout>
    </>
  );
}
