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
  title: "Clarify-before-commit guardrails",
  description:
    "A confirmation step in front of any irreversible action so a low-confidence transcript never books, charges, or cancels on its own: per-slot confidence, targeted clarifying questions, a read-back summary, and an idempotent commit.",
  openGraph: {
    title: "Clarify-before-commit guardrails | Patterns | Kumma",
    description:
      "Force a clarify-or-confirm step before a voice agent books, charges, or cancels: track confidence per slot, ask when a slot is weak, read back the intent, and make the commit idempotent.",
    url: "https://kumma.me/patterns/clarify-before-commit",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/clarify-before-commit" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Clarify-before-commit guardrails",
  description:
    "A confirmation step in front of any irreversible action so a low-confidence transcript never books, charges, or cancels on its own: per-slot confidence, targeted clarifying questions, a read-back summary, and an idempotent commit.",
  url: "https://kumma.me/patterns/clarify-before-commit",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const slotConfidence = `// Confidence lives per slot, not once for the whole turn. A caller can say
// their name clearly and their phone number through a passing truck.
type Slot<T> = { value: T | null; confidence: number };

interface Booking {
  name: Slot<string>;
  phone: Slot<string>;
  partySize: Slot<number>;
  time: Slot<string>;
}

// Tunable, not measured. Start here and move it against real call recordings:
// too high and the agent re-asks things it heard fine; too low and a
// mis-heard phone number sails straight through to the commit.
const CONFIRM_FLOOR = 0.75;

// The weakest slot decides the whole action. One shaky field is enough
// reason to slow down before doing something irreversible.
function weakestSlot(b: Booking): [keyof Booking, number] {
  const entries = Object.entries(b) as [keyof Booking, Slot<unknown>][];
  return entries
    .map(([k, s]) => [k, s.confidence] as [keyof Booking, number])
    .sort((a, z) => a[1] - z[1])[0];
}`;

const routeGuard = `// Three outcomes, in order of increasing commitment:
//   clarify -> ask one targeted question and stay in the turn
//   confirm -> read the whole intent back and wait for a yes
//   commit  -> perform the irreversible action
function nextStep(b: Booking): "clarify" | "confirm" | "commit" {
  const [field, low] = weakestSlot(b);

  // A missing or weak slot gets a question about THAT slot, not a generic
  // "sorry, can you repeat everything". Targeted re-asks keep the call short.
  if (b[field].value === null || low < CONFIRM_FLOOR) return "clarify";

  // Everything cleared the floor, but "irreversible" still earns one
  // read-back before we act. Confidence being high is not the same as
  // the caller having heard us say it back.
  return "confirm";
}

function clarifyQuestion(field: keyof Booking): string {
  // One slot, one question. Avoid compound questions here: a single "yes"
  // to "party of four at seven?" cannot tell you which half was confirmed.
  const asks: Record<keyof Booking, string> = {
    phone: "What's the best number to reach you on? Just the ten digits.",
    partySize: "How many people should I put the table down for?",
    time: "And what time works for you?",
    name: "Can I get the name for the booking?",
  };
  return asks[field];
}`;

const readbackCommit = `// The read-back confirms the INTENT, not the transcript. Play back the
// resolved values in plain language ("a table for four at 7pm") rather than
// reciting raw ASR text, and get an explicit yes before committing.
async function confirmAndCommit(b: Booking, turn: TurnController) {
  const summary =
    \`So that's \${b.name.value}, party of \${b.partySize.value}, \` +
    \`at \${b.time.value}. Should I lock that in?\`;

  const reply = await turn.ask(summary);
  if (!isAffirmative(reply)) return turn.reviseFrom(reply); // caller corrects

  // Idempotency: derive a stable key from the intent, not the attempt. If the
  // caller says "yes" twice, or the line drops after booking but before the
  // agent hears the ack, the retry lands on the same row instead of a second
  // table. The booking system enforces uniqueness on this key.
  const key = idempotencyKey(b.phone.value, b.time.value, b.partySize.value);
  await bookings.commit({ ...resolve(b), idempotencyKey: key });
}`;

export default function ClarifyBeforeCommitPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 06"
        title="Clarify-before-commit guardrails"
        problem={
          <>
            A voice agent hears an imperfect transcript, and the moment it books
            a table, charges a card, or cancels an appointment, that mistake is
            no longer recoverable inside the call. Clarify-before-commit is the
            rule that puts a confirmation step in front of every irreversible
            action, so a low-confidence phrase turns into a question rather than
            a booking.
          </>
        }
      >
        <PatternSection title="Track confidence per slot, not per turn">
          <p>
            A single overall confidence score hides exactly the case you care
            about. A caller can state their name cleanly and then read a phone
            number while a truck goes past, and one weak field is enough to
            book the wrong person. Keep a confidence value on each{" "}
            <strong>slot</strong> the action depends on, and let the weakest
            slot decide whether the agent is allowed to proceed. The threshold
            below is a starting point to tune against real recordings, not a
            measured result.
          </p>
          <CodeBlock
            caption="Illustrative: confidence attached to each slot"
            code={slotConfidence}
          />
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Commits on low confidence",
                detail:
                  "The agent acts on a slot it barely heard because nothing gated the action on confidence. A mis-heard digit or time flows straight into a real booking, and the error is only discovered when the caller shows up.",
              },
              {
                name: "Over-asks and frustrates",
                detail:
                  "The threshold is set so high, or applied to every field, that the agent re-confirms things it heard perfectly well. The call drags, the caller feels interrogated, and some hang up before the booking is made.",
              },
              {
                name: "Ambiguous confirmation",
                detail:
                  "A compound question — 'party of four at seven?' — gets a single 'yeah'. The agent cannot tell whether the caller confirmed the size, the time, or was just backchanneling, and records a yes it did not really earn.",
              },
              {
                name: "No idempotency",
                detail:
                  "The commit is not keyed on the intent, so a repeated 'yes', a retried request, or a line drop after the write produces a second booking. The caller ends up double-booked with no way to see it happened.",
              },
              {
                name: "Confirms the transcription",
                detail:
                  "The read-back recites raw recognizer text instead of the resolved intent, so the agent confirms the words it thinks it heard rather than what it is about to do. The caller agrees to a sentence, not to the action.",
              },
            ]}
          />
        </PatternSection>

        <PatternSection title="Route on the weakest slot">
          <p>
            Turn the decision into three outcomes ordered by how much they
            commit: <strong>clarify</strong> asks one targeted question and
            stays in the turn, <strong>confirm</strong> reads the whole intent
            back and waits for a yes, and <strong>commit</strong> performs the
            irreversible action. A weak or missing slot routes to a question
            about <em>that</em> slot — not a generic &quot;sorry, can you repeat
            everything&quot; — which keeps the call short and the caller
            oriented.
          </p>
          <CodeBlock
            caption="Illustrative: clarify vs confirm vs commit"
            code={routeGuard}
          />
          <p>
            This is where under-asking and over-asking are balanced with one
            number. Set the floor too low and a mis-heard number sails through
            to the commit; set it too high and the agent re-asks fields it
            already has, and callers hang up. Tune the floor per slot against
            real calls — a phone number can warrant a stricter floor than a
            party size, because getting it wrong costs more.
          </p>
        </PatternSection>

        <PatternSection title="Read back the intent, then commit once">
          <p>
            The confirmation step should play back the <strong>resolved
            intent</strong> in plain language — &quot;a table for four at
            7pm&quot; — not the raw transcript. Confirming recognizer text only
            tells you the words matched; confirming the intent tells you the
            action is right. Ask one thing at a time so a &quot;yes&quot; maps
            to a single fact, and treat anything that is not a clear affirmation
            as a correction to fold back in.
          </p>
          <p>
            Finally, make the commit <strong>idempotent</strong>. Derive a
            stable key from the intent rather than the attempt, so a repeated
            yes, a retry, or a dropped line after the write lands on the same
            row instead of a second table. The action being irreversible is
            exactly why the write must be safe to replay.
          </p>
          <CodeBlock
            caption="Illustrative: read-back confirm and idempotent commit"
            code={readbackCommit}
          />
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/patterns/menu-grounding",
              label:
                "Menu grounding — constraining the agent to what actually exists before it commits",
            },
            {
              href: "/blog/en/does-an-ai-receptionist-actually-work",
              label: "Does an AI receptionist actually work, and where it earns its keep",
            },
          ]}
        />
      </PatternLayout>
    </>
  );
}
