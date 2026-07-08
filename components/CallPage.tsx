"use client";

import { useState } from "react";
import styles from "@/styles/call.module.css";

// Not available yet. When the line is live, set this to the E.164 / display
// number and the hero will render a `tel:` link plus a copy button.
// Leave empty to keep the "line goes live soon" awaiting state.
export const DEMO_NUMBER: string = "";

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

const CHALLENGES = [
  "Order five items with modifications.",
  "Reverse the order halfway through.",
  "Switch to Mandarin mid-sentence.",
  "Call from a loud kitchen.",
  "Try to prompt-inject it.",
];

const BOUNTY_RULES = [
  "One payout per person per month.",
  "Submission is the call timestamp, what you said, and expected versus actual ticket.",
  "Wu verifies the claim against the transcript.",
  "Decisions are final.",
];

const DISCLOSURE = [
  "Every call is recorded and may be published.",
  "A consent message plays at pickup before anything is recorded.",
  "The agent never asks for personal information.",
  "Audio is scrubbed of incidental personal information before anything is published.",
];

export default function CallPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_NUMBER);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
    (
      window as unknown as { umami?: { track?: (e: string) => void } }
    ).umami?.track?.("tel_click");
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* ── Hero ── */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Live demo line</p>
          <h1 className={styles.title}>Call the agent</h1>

          <div className={styles.numberBlock}>
            {DEMO_NUMBER ? (
              <div className={styles.numberLive}>
                <a
                  href={`tel:${DEMO_NUMBER.replace(/[^\d+]/g, "")}`}
                  className={styles.numberLink}
                  onClick={handleCopy}
                >
                  {DEMO_NUMBER}
                </a>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={handleCopy}
                  aria-live="polite"
                >
                  {copied ? "copied" : "copy number"}
                </button>
              </div>
            ) : (
              <div className={styles.numberAwaiting}>
                <span className={styles.awaitingLabel}>number</span>
                <span className={styles.awaitingValue}>
                  the line goes live soon
                </span>
              </div>
            )}
          </div>

          <p className={styles.subtitle}>
            An AI agent taking phone orders for Kumma Diner, a fictional demo
            restaurant with a real menu.
          </p>

          <div className={styles.counter}>
            <span className={styles.counterLabel}>Calls handled</span>
            <span
              className={styles.counterSlot}
              aria-label="awaiting data"
              title="awaiting data"
            />
          </div>
        </header>

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

        {/* ── Challenges ── */}
        <section className={styles.section} aria-labelledby="challenge-heading">
          <h2 id="challenge-heading" className={styles.h2}>
            Try to break it
          </h2>
          <p className={styles.sectionLead}>
            The agent is meant to hold up under real conditions. Push on it.
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

        {/* ── Bounty ── */}
        <section className={styles.section} aria-labelledby="bounty-heading">
          <h2 id="bounty-heading" className={styles.h2}>
            The bounty
          </h2>
          <div className={styles.bounty}>
            <p className={styles.bountyLead}>
              <span className={styles.bountyAmount}>$50</span> to anyone who
              makes it produce a wrong kitchen ticket.
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
              The best break attempts will show up here.
            </p>
          </div>
        </section>

        {/* ── Disclosure ── */}
        <section className={styles.section} aria-labelledby="disclosure-heading">
          <h2 id="disclosure-heading" className={styles.h2}>
            Before you call
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
