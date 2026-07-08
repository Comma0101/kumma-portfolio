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
  title: "Menu and domain grounding",
  description:
    "Grounding a voice agent in a real menu or catalog so it resolves what the caller said to items that actually exist, using a resolver, enumerated choices, and a confidence score per match rather than inventing plausible items.",
  openGraph: {
    title: "Menu and domain grounding | Patterns | Kumma",
    description:
      "Constrain the model to a real catalog: separate transcription from resolution, fuzzy-match spoken phrases to structured items, bind modifiers, and say when something is genuinely off-menu.",
    url: "https://kumma.me/patterns/menu-grounding",
    type: "article",
  },
  alternates: { canonical: "https://kumma.me/patterns/menu-grounding" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Menu and domain grounding",
  description:
    "Grounding a voice agent in a real menu or catalog so it resolves what the caller said to items that actually exist, using a resolver, enumerated choices, and a confidence score per match rather than inventing plausible items.",
  url: "https://kumma.me/patterns/menu-grounding",
  author: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  publisher: { "@type": "Person", name: "Kumma", url: "https://kumma.me" },
  isPartOf: {
    "@type": "CollectionPage",
    name: "Patterns",
    url: "https://kumma.me/patterns",
  },
};

const menuShape = `// The catalog is the ground truth. Every accepted order line must point
// at a real entry here — the model does not get to invent a new one.
type MenuItem = {
  id: string;
  name: string;
  aliases: string[];          // synonyms, nicknames, common mishearings
  modifiers: ModifierGroup[]; // what can legally attach to this item
};

type ModifierGroup = {
  id: string;
  name: string;               // e.g. "milk", "size", "spice"
  options: string[];          // enumerated — not free text
  required: boolean;
};

const menu: MenuItem[] = [
  {
    id: "latte",
    name: "Caffe latte",
    aliases: ["latte", "cafe latte", "latay", "flat latte"],
    modifiers: [
      { id: "size", name: "size", options: ["small", "medium", "large"], required: true },
      { id: "milk", name: "milk", options: ["whole", "oat", "soy", "almond"], required: false },
    ],
  },
  // ...
];`;

const resolveItem = `// Two jobs, kept apart: transcription hands us a spoken phrase; resolution
// maps that phrase onto a real catalog entry (or refuses to).
type Match = { item: MenuItem; confidence: number };

function resolveItem(spoken: string, menu: MenuItem[]): Match | null {
  const phrase = normalize(spoken); // lowercase, strip filler, expand "a"/"an"
  let best: Match | null = null;

  for (const item of menu) {
    // Score the phrase against the canonical name and every known alias.
    // similarity() is illustrative — token overlap plus edit distance,
    // NOT a benchmarked accuracy figure.
    const candidates = [item.name, ...item.aliases];
    const score = Math.max(...candidates.map((c) => similarity(phrase, normalize(c))));

    if (!best || score > best.confidence) {
      best = { item, confidence: score };
    }
  }

  // Below the floor, we do not guess. A low top score means "did not hear a
  // real item", which is a clarify-or-decline signal, not a match.
  const FLOOR = 0.6; // tune against real calls, not a measured constant
  return best && best.confidence >= FLOOR ? best : null;
}`;

const bindModifiers = `// A modifier only counts if the item it lands on can legally take it.
// "Oat" is meaningless on a pastry; "large" is meaningless on a fixed-size
// item. Bind against the item's own enumerated options, then flag leftovers.
function bindModifiers(item: MenuItem, spokenMods: string[]) {
  const applied: Record<string, string> = {};
  const unresolved: string[] = [];

  for (const raw of spokenMods) {
    const token = normalize(raw);
    const group = item.modifiers.find((g) =>
      g.options.some((opt) => similarity(token, opt) >= 0.7),
    );

    if (group) {
      const opt = group.options.find((o) => similarity(token, o) >= 0.7)!;
      applied[group.id] = opt; // last one wins if the caller restated it
    } else {
      unresolved.push(raw); // heard a modifier that this item cannot take
    }
  }

  // required groups with nothing bound are an ask-back, not a default.
  const missing = item.modifiers.filter((g) => g.required && !(g.id in applied));
  return { applied, missing, unresolved };
}`;

export default function MenuGroundingPattern() {
  return (
    <>
      <JsonLd data={articleLd} />
      <PatternLayout
        kicker="Pattern 05"
        title="Menu and domain grounding"
        problem={
          <>
            A caller orders in their own words — a nickname, a half-remembered
            name, something the recognizer slightly misheard — and the model, left
            to itself, will happily produce a fluent, plausible item that your
            kitchen does not make. Grounding is the mechanism that constrains the
            agent to a real menu or catalog, so what the caller said is resolved to
            an item that actually exists or is flagged as off-menu, never quietly
            invented.
          </>
        }
      >
        <PatternSection title="Two jobs, not one">
          <p>
            Transcription and resolution are different problems and should be kept
            apart. <strong>Transcription</strong> turns audio into a spoken phrase:
            &quot;lemme get a large latay&quot;. <strong>Resolution</strong> takes
            that phrase and decides which real catalog entry, if any, it refers to.
            A model that does both in one step tends to smooth over the gap —
            &quot;latay&quot; becomes a confident <code>latte</code> with no record
            that it was a guess. Separating the steps gives you a place to attach a
            confidence score and a place to decline.
          </p>
          <p>
            The catalog is the ground truth. Every accepted order line points at a
            real <code>id</code>; the model&apos;s job is to map onto that structure,
            not to extend it. Enumerating aliases and modifier options up front is
            what lets a resolver match a spoken phrase instead of trusting the
            model&apos;s free-form output.
          </p>
          <CodeBlock caption="Illustrative: the catalog as ground truth" code={menuShape} />
        </PatternSection>

        <PatternSection title="Failure modes">
          <FailureModes
            items={[
              {
                name: "Hallucinated item",
                detail:
                  "The caller says something the menu does not cover and the model returns a fluent, reasonable-sounding item anyway. The order line looks valid but points at nothing the kitchen can make, and the mistake surfaces at fulfilment rather than on the call.",
              },
              {
                name: "Wrong modifier binding",
                detail:
                  "Two items and two modifiers in one utterance — 'a large latte and an oat cortado' — and 'oat' attaches to the latte, or 'large' drifts onto the cortado. Modifiers were parsed as a flat list instead of bound to the item that can legally take them.",
              },
              {
                name: "Synonym or nickname miss",
                detail:
                  "A regular orders by a name the staff use but the catalog does not list, so the resolver scores every real item low and either declines a valid order or forces a clarify on something the caller considers obvious. The alias table is thinner than how people actually speak.",
              },
              {
                name: "Silent substitution",
                detail:
                  "The requested item is genuinely off-menu, and instead of saying so the agent maps it to the nearest thing that does exist and reads it back as if it were what the caller asked for. The caller only finds out when the wrong thing arrives.",
              },
              {
                name: "Quantity ambiguity",
                detail:
                  "'A couple of croissants' or 'a few' is resolved to a specific number without confirmation, or dropped to a quantity of one. The item resolved cleanly but the count is a guess dressed up as a fact.",
              },
            ]}
          />
        </PatternSection>

        <PatternSection title="Implementation notes">
          <p>
            Put a resolver between the transcript and the order. It scores the
            spoken phrase against every item&apos;s canonical name{" "}
            <strong>and</strong> its aliases, keeps the best match, and returns a
            confidence with it. The alias list is where synonyms, nicknames, and
            common mishearings live, so the match is against how people actually
            say the item, not just its printed name.
          </p>
          <CodeBlock caption="Illustrative: resolving a phrase to a real item" code={resolveItem} />
          <p>
            The confidence floor is what turns &quot;always produce something&quot;
            into &quot;produce something or admit you did not hear a real
            item.&quot; Below the floor is not a weak match to accept quietly; it is
            a signal to clarify or to say the item is not on the menu. The value is
            a starting point to tune against real calls, not a measured constant —
            raise it when the agent accepts near-misses, lower it when it clarifies
            things a caller finds obvious.
          </p>
          <p>
            Modifiers bind to items, not to the utterance. Once an item resolves,
            match each spoken modifier against that item&apos;s own enumerated
            options, so &quot;oat&quot; can only land on something that offers a
            milk choice. A modifier that fits no group on the item is not silently
            dropped — it is flagged, because it usually means the wrong item
            resolved or the caller is describing something you do not offer.
            Required groups with nothing bound become an ask-back, not a default.
          </p>
          <CodeBlock caption="Illustrative: binding modifiers to the resolved item" code={bindModifiers} />
          <p>
            Quantity gets the same treatment as everything else: a vague count is
            an unresolved field, not a value to invent. &quot;A couple&quot; and
            &quot;a few&quot; should confirm rather than commit. And when the top
            match sits below the floor, the honest move is to name it — &quot;we do
            not have that, did you mean one of these&quot; over an enumerated set —
            rather than substitute the nearest real item and hope.
          </p>
        </PatternSection>

        <RelatedNotes
          items={[
            {
              href: "/patterns/clarify-before-commit",
              label: "Clarify before commit — confirming an ambiguous order before it becomes a ticket",
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
