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
  title: "Human handoff design",
  description:
    "Detecting when a phone agent is out of its depth and transferring to a person: the triggers, warm versus cold transfer, and carrying the transcript and resolved intent across the boundary so the human does not restart from zero.",
  openGraph: {
    title: "Human handoff design | Patterns | Kumma",
    description:
      "When to hand a call to a person and how to carry the transcript and intent across the transfer so the caller never repeats themselves.",
    url: "https://kumma.me/patterns/human-handoff",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/human-handoff" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Human handoff design",
  description:
    "Detecting when a phone agent is out of its depth and transferring to a person: the triggers, warm versus cold transfer, and carrying the transcript and resolved intent across the boundary so the human does not restart from zero.",
  url: "https://kumma.me/patterns/human-handoff",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const shouldHandoff = `// The decision is a small set of independent triggers, not one model call.
// Any single trigger can send the call to a person; treat them as OR.
type Signals = {
  lowConfidenceStreak: number; // consecutive turns the agent was unsure
  outOfScope: boolean;         // request maps to no tool the agent has
  askedForHuman: boolean;      // caller said "let me talk to a person"
  sentiment: "neutral" | "frustrated" | "angry";
  actionRisk: "low" | "high"; // e.g. refunds, medical, legal, cancellation
};

function shouldHandoff(s: Signals): boolean {
  if (s.askedForHuman) return true;              // honour the explicit request
  if (s.outOfScope) return true;                 // no tool can serve this
  if (s.actionRisk === "high") return true;      // stakes too high to guess
  if (s.lowConfidenceStreak >= 2) return true;   // repeated "I'm not sure"
  if (s.sentiment === "angry") return true;      // stop digging the hole
  return false;
}`;

const handoffPayload = `// Everything the human needs to continue without re-interviewing the caller.
// Assembled once, at the moment of transfer, from state the agent already has.
type HandoffContext = {
  callerNumber: string;        // so a dropped call can be rung back
  reason: HandoffReason;       // which trigger fired
  resolvedIntent: {            // what the agent understood so far
    summary: string;           // "wants to reschedule Thursday's appointment"
    fields: Record<string, string>; // { name, date, service } collected so far
  };
  attempted: string[];         // what the agent already tried, so it isn't redone
  transcript: TranscriptTurn[]; // full turn-by-turn, not a lossy summary alone
};

function buildHandoffContext(call: CallState): HandoffContext {
  return {
    callerNumber: call.from,
    reason: call.handoffReason,
    resolvedIntent: call.intent,
    attempted: call.toolCalls.map((t) => t.description),
    transcript: call.transcript,
  };
}`;

export default function HumanHandoffPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 07"
        title="Human handoff design"
        problem={
          <>
            A phone agent will meet requests it cannot serve: questions outside
            its tools, high-stakes actions it should not take alone, and callers
            who simply want a person. Human handoff is the mechanism that detects
            those moments and transfers the call to someone who can help, and the
            hard part is carrying the transcript and the intent across the
            boundary so the person does not start the conversation over from
            nothing.
          </>
        }
      >
        <PatternSection title="Decide when to hand off">
          <p>
            Handoff is triggered by a small set of independent signals, not a
            single judgment call. The clear ones are an explicit request
            (&quot;let me talk to a person&quot;) and an out-of-scope ask that
            maps to no tool the agent has. The rest are graded: a repeated streak
            of low-confidence turns means the agent is guessing, rising
            frustration or anger means continuing will only make it worse, and a
            high-stakes action — a refund, a cancellation, anything medical or
            legal — is worth a person even when the agent could technically
            proceed. Treat the triggers as an OR: any one of them is enough.
          </p>
          <CodeBlock
            caption="Illustrative: a handoff decision from independent triggers"
            code={shouldHandoff}
          />
          <p>
            Tune the thresholds against real calls rather than fixing them up
            front. The confidence streak and the sentiment cutoff are starting
            points, not measured values; raise them if the agent bails too soon,
            lower them if callers have to fight to reach a person.
          </p>
        </PatternSection>

        <PatternSection title="Warm versus cold transfer">
          <p>
            A <strong>cold transfer</strong> drops the caller onto the human with
            no introduction — the line simply moves. A{" "}
            <strong>warm transfer</strong> briefs the human first: the agent
            passes a short summary of who is calling and what they need before
            the caller is connected, so the person picks up already knowing the
            context. Cold is cheaper and faster; warm avoids the caller having to
            re-explain themselves and is worth it whenever a payload can be
            handed over. Either way, the payload below should travel with the
            call so the summary the human reads matches what the caller actually
            said.
          </p>
        </PatternSection>

        <PatternSection title="Carry the context across the boundary">
          <p>
            The point of a handoff is that the caller does not repeat themselves.
            That only holds if the human receives what the agent already knows:
            the caller&apos;s number so a dropped call can be rung back, the
            resolved intent as the agent understood it, the fields collected so
            far, what the agent already tried so the human does not redo it, and
            the full transcript rather than a lossy summary alone. Assemble this
            once, at the moment of transfer, from state the agent is already
            holding.
          </p>
          <CodeBlock
            caption="Illustrative: the handoff context payload"
            code={handoffPayload}
          />
          <p>
            Include both the summary and the raw transcript. The summary lets the
            human get oriented in a sentence; the transcript lets them check the
            summary when something does not add up. A summary on its own is a
            compression of the call, and the detail it drops is often the detail
            that matters.
          </p>
        </PatternSection>

        <PatternSection title="Telephony mechanics">
          <p>
            At a high level the transfer is a telephony operation. On a SIP path
            the agent issues a <code>REFER</code> to move the leg to another
            endpoint; through a provider like Twilio the same effect comes from
            redirecting the call to a dial verb that rings the human. The payload
            does not travel inside the phone protocol — it moves out of band. The
            agent writes the <code>HandoffContext</code> somewhere the human&apos;s
            surface can read it (a screen pop, a message in the queue, a note on
            the ticket) keyed by the call, then triggers the transfer. The
            caller&apos;s audio and the context arrive on two separate channels
            that the human reunites.
          </p>
          <p>
            Plan for the case where no human answers. After hours, or when the
            queue is empty, there is no one to <code>REFER</code> to, and the
            transfer must not dead-end into silence or a ring that never picks
            up. The agent should fall back gracefully: take a message, capture
            the callback number it already has, and text the caller a link to
            book a time or continue asynchronously. A recorded intent and a
            promised callback beat a transfer into a void.
          </p>
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Dead end",
                detail:
                  "There is no handoff path at all, so a caller the agent cannot serve is stuck talking to a system that keeps failing the same way. Every agent needs at least one exit to a person or a message, even if it is only after-hours voicemail.",
              },
              {
                name: "Context loss on transfer",
                detail:
                  "The call moves but the payload does not, so the human picks up cold and re-interviews the caller from scratch. The caller repeats their name, their number, and their whole problem — the exact thing the handoff was supposed to prevent.",
              },
              {
                name: "Transfer to nobody",
                detail:
                  "The agent transfers after hours or into an empty queue and the call rings out or drops. Without an availability check and a fallback to take a message, the handoff becomes a black hole the caller falls into.",
              },
              {
                name: "Handoff loop",
                detail:
                  "The human bounces the call back to the agent, which re-evaluates the same signals, hits the same trigger, and transfers again. Without a marker that a leg has already been handed off, the caller ping-pongs between agent and person.",
              },
              {
                name: "Trigger-happy transfer",
                detail:
                  "The agent hands off at the first sign of difficulty and resolves almost nothing itself, so it adds a step instead of removing one. Handoff is the exit for what the agent cannot do, not a reflex for anything slightly hard.",
              },
            ]}
          />
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/patterns/clarify-before-commit",
              label:
                "Clarify before commit — resolving ambiguity before acting, so fewer calls need a person at all",
            },
            {
              href: "/blog/en/does-an-ai-receptionist-actually-work",
              label:
                "Does an AI receptionist actually work, and where a human still has to take over",
            },
          ]}
        />
      </PatternLayout>
    </>
  );
}
