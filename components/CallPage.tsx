import styles from "@/styles/call.module.css";
import Button from "@/components/system/Button";
import AudioSlot from "@/components/AudioSlot";

type MenuSection = {
  heading: string;
  items: { name: string; mods?: string }[];
};

// Fictional demo content for Kumma Diner. This is a made-up menu the agent is
// grounded on, not a metric or a claim about anything real.
const MENU: MenuSection[] = [
  {
    heading: "Breakfast",
    items: [
      {
        name: "Two-egg plate",
        mods: "eggs any style · bacon, sausage, or veggie patty · toast",
      },
      {
        name: "Buttermilk pancakes",
        mods: "short stack or full · add blueberry, banana, chocolate chip",
      },
      {
        name: "Diner omelette",
        mods: "three eggs · cheese, mushroom, pepper, ham, spinach",
      },
      {
        name: "Breakfast burrito",
        mods: "eggs, cheese, potato · add avocado, bacon, hot salsa",
      },
      { name: "Steel-cut oats", mods: "brown sugar · banana · walnuts" },
    ],
  },
  {
    heading: "Sandwiches & burgers",
    items: [
      {
        name: "Kumma burger",
        mods: "single or double · lettuce, tomato, onion, pickle · add bacon, egg",
      },
      { name: "Patty melt", mods: "rye · grilled onion · swiss" },
      { name: "Grilled cheese", mods: "white, wheat, or rye · add tomato, bacon" },
      { name: "Turkey club", mods: "triple-decker · sub fries for side salad" },
      { name: "BLT", mods: "regular or extra-crispy bacon" },
      { name: "Veggie wrap", mods: "hummus · greens · roasted pepper" },
    ],
  },
  {
    heading: "Plates",
    items: [
      {
        name: "Chicken tenders",
        mods: "3 or 5 piece · ranch, honey mustard, buffalo",
      },
      { name: "Fish & chips", mods: "cod · tartar · malt vinegar" },
      { name: "Meatloaf plate", mods: "mashed potato · gravy · green beans" },
      {
        name: "Cobb salad",
        mods: "chicken, egg, bacon, avocado, blue cheese · dressing on side",
      },
    ],
  },
  {
    heading: "Sides",
    items: [
      { name: "Fries", mods: "regular, curly, or sweet potato" },
      { name: "Onion rings" },
      { name: "Side salad", mods: "ranch, vinaigrette, or blue cheese" },
      { name: "Cup of soup", mods: "daily" },
    ],
  },
  {
    heading: "Drinks",
    items: [
      { name: "Bottomless coffee" },
      { name: "Fountain soda", mods: "free refills" },
      {
        name: "Milkshake",
        mods: "vanilla, chocolate, strawberry · add malt",
      },
      { name: "Fresh lemonade" },
      { name: "Hot tea" },
    ],
  },
];

// The three recorded clips are the zero-cost proof. Each slot renders a
// non-autoplaying "recording coming" placeholder until a real audio src is
// wired in. To publish a clip later, pass its URL as `src` to the matching
// slot; nothing else needs to change.
const RECORDINGS: { label: string; caption: string; note: string }[] = [
  {
    label: "a clean call",
    caption:
      "A straightforward order, from what the caller said to the ticket the kitchen sees.",
    note: "transcript and the ticket it produced land here with the clip.",
  },
  {
    label: "a messy call",
    caption:
      "Hesitation, corrections, and a mid-call language switch, resolved into one ticket.",
    note: "transcript and the ticket it produced land here with the clip.",
  },
  {
    label: "a failure and the fix",
    caption:
      "Where the agent got the ticket wrong, and the change that handled it.",
    note: "transcript, the wrong ticket, and the fix land here with the clip.",
  },
];

const CHALLENGES = [
  "Order five items with modifications.",
  "Reverse the order halfway through.",
  "Switch to Mandarin mid-sentence.",
  "Call from a loud kitchen.",
  "Try to prompt-inject it.",
];

const BOUNTY_RULES = [
  "One payout per person per month.",
  "You book a slot and we run the call together.",
  "I verify the claim against the transcript.",
  "Decisions are final.",
];

const DISCLOSURE = [
  "Every demo call is recorded and may be published.",
  "A consent message plays at pickup before anything is recorded.",
  "The agent never asks for personal information.",
  "Audio is scrubbed of incidental personal information before anything is published.",
];

export default function CallPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* ── Hero ── */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Voice agent demo</p>
          <h1 className={styles.title}>Hear the agent take an order</h1>

          <p className={styles.subtitle}>
            An AI agent taking phone orders for Kumma Diner, a fictional demo
            restaurant with a real menu. Listen to recorded calls below, or book
            a slot to run one live.
          </p>

          <div className={styles.ctaRow}>
            <Button href="/contact" variant="primary">
              Book a live demo
            </Button>
            <Button href="#recordings" variant="ghost">
              Hear recorded calls
            </Button>
          </div>

          <p className={styles.heroNote}>
            The live line runs by appointment, so the agent is not a target for
            spam. You get a real conversation, not a robot to hammer.
          </p>
        </header>

        {/* ── Recorded calls (centerpiece) ── */}
        <section
          id="recordings"
          className={styles.section}
          aria-labelledby="recordings-heading"
        >
          <h2 id="recordings-heading" className={styles.h2}>
            Recorded calls
          </h2>
          <p className={styles.sectionLead}>
            Recordings of demo calls, so you can hear the agent work without
            booking anything. Nothing plays until you press play.
          </p>

          <div className={styles.recordingsGrid}>
            {RECORDINGS.map((r) => (
              <div key={r.label} className={styles.recordingItem}>
                <AudioSlot label={r.label} caption={r.caption} />
                <div className={styles.transcriptNote}>
                  <span className={styles.transcriptTag}>
                    transcript → ticket
                  </span>
                  <p className={styles.transcriptBody}>{r.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Menu ── */}
        <section className={styles.section} aria-labelledby="menu-heading">
          <h2 id="menu-heading" className={styles.h2}>
            The Kumma Diner menu
          </h2>
          <p className={styles.sectionLead}>
            This is what the agent is grounded on. Everything below is on the
            menu. Everything not below is not.
          </p>

          <div className={styles.ticket}>
            <div className={styles.ticketHead}>
              <span>Kumma Diner</span>
              <span>order line</span>
            </div>
            {MENU.map((group) => (
              <div key={group.heading} className={styles.ticketGroup}>
                <p className={styles.ticketGroupHead}>{group.heading}</p>
                <ul className={styles.ticketList}>
                  {group.items.map((item) => (
                    <li key={item.name} className={styles.ticketRow}>
                      <span className={styles.ticketName}>{item.name}</span>
                      {item.mods && (
                        <span className={styles.ticketMods}>{item.mods}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Challenges (what to try in a live demo) ── */}
        <section className={styles.section} aria-labelledby="challenge-heading">
          <h2 id="challenge-heading" className={styles.h2}>
            What to try in a live demo
          </h2>
          <p className={styles.sectionLead}>
            Book a slot and push on it under real conditions. These are the
            things worth trying.
          </p>
          <ol className={styles.challengeList}>
            {CHALLENGES.map((c, i) => (
              <li key={c} className={styles.challengeItem}>
                <span className={styles.challengeNo}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.challengeText}>{c}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Bounty (gated) ── */}
        <section className={styles.section} aria-labelledby="bounty-heading">
          <h2 id="bounty-heading" className={styles.h2}>
            The bounty
          </h2>
          <div className={styles.bounty}>
            <p className={styles.bountyLead}>
              <span className={styles.bountyAmount}>$50</span> to anyone who
              produces a wrong kitchen ticket in a live demo.
            </p>
            <ul className={styles.ruleList}>
              {BOUNTY_RULES.map((rule) => (
                <li key={rule} className={styles.ruleItem}>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Hall of fame ── */}
        <section className={styles.section} aria-labelledby="fame-heading">
          <h2 id="fame-heading" className={styles.h2}>
            Hall of fame
          </h2>
          <div className={styles.fameEmpty}>
            <p className={styles.fameEmptyText}>
              The best break attempts from live demos will show up here.
            </p>
          </div>
        </section>

        {/* ── Disclosure ── */}
        <section className={styles.section} aria-labelledby="disclosure-heading">
          <h2 id="disclosure-heading" className={styles.h2}>
            Recording and consent
          </h2>
          <ul className={styles.disclosureList}>
            {DISCLOSURE.map((line) => (
              <li key={line} className={styles.disclosureItem}>
                {line}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
