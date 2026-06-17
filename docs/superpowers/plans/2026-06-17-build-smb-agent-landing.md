# /build SMB Agent-Services Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a standalone, conversion-focused `/build` landing page that offers custom AI-agent build services to non-technical SMB owners, with its own minimal chrome and a mailto-based free-consult form.

**Architecture:** A new static route `app/build/page.tsx` (server shell + SEO metadata) renders a client `BuildLanding` component built from a `buildContent.ts` data file and a `build.module.css` module. The page reuses the global terrain background but suppresses the portfolio's Navigation, footer, and agent-protocol pill (pathname guards), supplying its own minimal header/footer. The consult form composes a `mailto:` client-side (same pattern as the existing contact form); no backend.

**Tech Stack:** Next.js 14 App Router (static export), React 18, TypeScript, CSS Modules, Atlas design tokens (jade/ink), existing `components/system/Button`.

**Testing note:** This repo has no unit-test runner. Verification follows the project's established workflow: `npx tsc --noEmit` (types), `npm run build` (static export to `out/`), and content assertions via `grep` on the emitted HTML. Always stop the dev server before running `npm run build` (shared `.next` clobber is a known issue), then restart `npm run dev` after.

---

### Task 1: Content data file

**Files:**
- Create: `components/build/buildContent.ts`

- [ ] **Step 1: Create the content file with all copy as data**

```ts
export interface UseCase {
  title: string;
  body: string;
}
export interface Step {
  no: string;
  title: string;
  body: string;
}
export interface Faq {
  q: string;
  a: string;
}
export interface ProofItem {
  name: string;
  body: string;
  href: string;
  linkLabel: string;
}

export const heroEyebrow = "AI agents for small business";
export const heroTitle = "Never miss another call, booking, or lead.";
export const heroSubtitle =
  "I build a custom AI agent that answers your calls, books appointments, follows up with leads, and handles the busywork. Built and run for you, without a tech team or a big budget.";
export const heroCtaLabel = "Book a free consult";
export const heroTrust =
  "You talk to the person who builds it, not a sales team.";

export const empathy =
  "Big companies have engineers building this for them. You have a business to run. That gap is what I close.";

export const useCasesHeading = "What I can build for you";
export const useCases: UseCase[] = [
  {
    title: "AI phone agent",
    body: "Answers every call 24/7, takes orders or books appointments, and never leaves a customer on hold.",
  },
  {
    title: "Customer support agent",
    body: "Replies to common questions on your site or chat instantly, day and night, in your voice.",
  },
  {
    title: "Booking & scheduling",
    body: "Turns calls and messages into confirmed appointments on your calendar, with reminders.",
  },
  {
    title: "Lead capture & follow-up",
    body: "Catches every inquiry and follows up automatically so hot leads never go cold.",
  },
  {
    title: "FAQ / knowledge agent",
    body: "Trained on your menus, policies, and docs, so customers get accurate answers without you.",
  },
  {
    title: "Back-office automation",
    body: "Handles the repetitive admin: data entry, summaries, routing, and reminders.",
  },
];
export const useCasesNote = "Not sure which? That is what the consult is for.";

export const proofHeading = "Real systems, not slideware";
export const proofItems: ProofItem[] = [
  {
    name: "KOTA",
    body: "A live voice AI agent that answers restaurant phone calls and turns them into kitchen-ready orders. Hear it for yourself.",
    href: "https://kota.kummalabs.com",
    linkLabel: "See KOTA live",
  },
  {
    name: "ARCHON",
    body: "An open-source engine that coordinates multiple AI models and agents. The serious systems work behind the agents I build.",
    href: "https://github.com/Comma0101/archon",
    linkLabel: "View ARCHON on GitHub",
  },
];

export const stepsHeading = "How it works";
export const steps: Step[] = [
  {
    no: "01",
    title: "Free consult",
    body: "A short call. Tell me the task that eats your time. I tell you straight whether an agent helps.",
  },
  {
    no: "02",
    title: "I scope and quote",
    body: "A clear, fixed quote built to your budget. No surprises, no jargon.",
  },
  {
    no: "03",
    title: "I build and run it",
    body: "I build it, set it up, and keep it running and improving. You manage nothing technical.",
  },
];

export const riskHeading = "Low risk by design";
export const riskReversal: string[] = [
  "Free consult, no obligation",
  "You own your data and accounts",
  "Your data is never used to train AI models",
  "Always a human (me) behind it",
  "Cancel anytime",
];

export const faqHeading = "Questions owners ask";
export const faqs: Faq[] = [
  {
    q: "Is my business too small for this?",
    a: "If you take calls, bookings, or repeat questions, an agent helps. Small is the point: you get enterprise tools without the enterprise team.",
  },
  {
    q: "How much does it cost?",
    a: "It depends on what you need, which is why the consult is free. I scope it to your budget and quote a fixed price before any work starts.",
  },
  {
    q: "Do I need technical staff?",
    a: "No. I build it, connect it, and maintain it. You keep running your business.",
  },
  {
    q: "What about my customers' data?",
    a: "Your data stays yours and is never used to train AI models. The agent runs inside your own accounts and tools.",
  },
  {
    q: "How long does it take?",
    a: "Most first agents go live in a couple of weeks. The consult gives you a real timeline.",
  },
  {
    q: "Who fixes it if something breaks?",
    a: "I do. A simple monthly care plan keeps it monitored, updated, and improving.",
  },
];

export const formHeading = "Book a free consult";
export const formLead =
  "Tell me what eats your time. I will tell you if an agent can handle it.";
export const contactEmail = "dev@kumma.me";
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors (clean).

- [ ] **Step 3: Commit**

```bash
git add components/build/buildContent.ts
git commit -m "feat(build): SMB landing page content data"
```

---

### Task 2: Page styles (CSS module)

**Files:**
- Create: `styles/build.module.css`

- [ ] **Step 1: Create the stylesheet (Atlas tokens, dark panels, jade CTA, responsive)**

```css
/* /build — SMB agent-services landing (dark Atlas, conversion-focused) */

.page {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  color: var(--paper);
}

/* minimal standalone chrome */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem var(--page-gutter);
  background: rgba(10, 10, 11, 0.72);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.wordmark {
  font-family: var(--font-sans);
  font-weight: 600;
  letter-spacing: -0.02em;
  font-size: 1.1rem;
  color: var(--paper);
  text-decoration: none;
}

.headerCta {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--signal);
  text-decoration: none;
}

.shell {
  width: min(100%, 1040px);
  margin: 0 auto;
  padding: 0 var(--page-gutter);
}

.section {
  padding: clamp(3.5rem, 7vw, 6rem) 0;
  border-top: 1px solid var(--line);
}

.h2 {
  margin: 0 0 1.8rem;
  font-family: var(--font-sans);
  font-weight: 600;
  letter-spacing: -0.03em;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  color: var(--paper);
}

/* hero */
.hero {
  padding: clamp(4rem, 9vw, 7rem) 0 clamp(3rem, 6vw, 5rem);
}

.eyebrow {
  margin: 0 0 1.2rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sand);
}

.title {
  margin: 0;
  max-width: 18ch;
  font-family: var(--font-sans);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  font-size: clamp(2.6rem, 6vw, 4.6rem);
  color: var(--paper);
}

.subtitle {
  margin: 1.6rem 0 0;
  max-width: 54ch;
  color: var(--steel);
  font-size: clamp(1.05rem, 1.6vw, 1.3rem);
  line-height: 1.55;
}

.ctaRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 2.2rem;
}

.trust {
  margin: 1.2rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: var(--faint);
}

/* empathy */
.empathy {
  margin: 0;
  max-width: 40ch;
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  line-height: 1.35;
  color: var(--sand);
}

/* use-case grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--line);
  overflow: hidden;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1.3rem, 2.6vw, 1.9rem);
  background: var(--surface);
}

.cardTitle {
  margin: 0;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 1.02rem;
  color: var(--paper);
}

.cardBody {
  margin: 0;
  color: var(--steel);
  font-size: 0.9rem;
  line-height: 1.55;
}

.note {
  margin: 1.2rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--faint);
}

/* proof */
.proofRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.proofItem {
  padding: clamp(1.4rem, 3vw, 2rem);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--surface);
}

.proofName {
  margin: 0 0 0.6rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 1.2rem;
  color: var(--paper);
}

.proofBody {
  margin: 0 0 1rem;
  color: var(--steel);
  font-size: 0.95rem;
  line-height: 1.6;
}

.proofLink {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--signal);
  text-decoration: none;
}

.proofLink:hover {
  color: var(--signal-strong);
}

/* steps */
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.stepNo {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--signal);
}

.stepTitle {
  margin: 0.5rem 0 0.4rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--paper);
}

.stepBody {
  margin: 0;
  color: var(--steel);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* risk reversal */
.riskList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
}

.riskItem {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  color: var(--paper);
  font-size: 0.95rem;
  line-height: 1.4;
}

.riskItem::before {
  content: "";
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--signal);
  transform: translateY(-1px);
}

/* faq */
.faqList {
  display: grid;
  gap: 0;
}

.faqItem {
  padding: 1.3rem 0;
  border-top: 1px solid var(--line);
}

.faqItem:first-child {
  border-top: none;
}

.faqQ {
  margin: 0 0 0.5rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 1.02rem;
  color: var(--paper);
}

.faqA {
  margin: 0;
  max-width: 70ch;
  color: var(--steel);
  font-size: 0.95rem;
  line-height: 1.6;
}

/* consult form */
.consult {
  scroll-margin-top: 84px;
}

.formLead {
  margin: 0 0 1.8rem;
  max-width: 52ch;
  color: var(--steel);
  font-size: 1.02rem;
  line-height: 1.6;
}

.form {
  display: grid;
  gap: 1rem;
  max-width: 560px;
}

.form label {
  display: grid;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--faint);
}

.form input,
.form textarea {
  width: 100%;
  padding: 0.8rem 0.9rem;
  background: var(--raised);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--paper);
  font-family: var(--font-sans);
  font-size: 0.95rem;
}

.form input:focus,
.form textarea:focus {
  outline: 2px solid var(--signal);
  outline-offset: 2px;
  border-color: transparent;
}

.submit {
  justify-self: start;
  margin-top: 0.4rem;
  padding: 0.85rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: var(--signal);
  color: var(--canvas);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
}

.submit:hover {
  background: var(--signal-strong);
}

.status {
  margin: 0.4rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--signal);
}

/* footer */
.footer {
  padding: 2.5rem var(--page-gutter);
  border-top: 1px solid var(--line);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  color: var(--faint);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.footer a {
  color: var(--steel);
  text-decoration: none;
}

.footer a:hover {
  color: var(--signal);
}

/* reveal */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s var(--ease),
    transform 0.8s var(--ease);
}

.revealShown {
  opacity: 1;
  transform: none;
}

@media (max-width: 860px) {
  .grid,
  .steps {
    grid-template-columns: 1fr 1fr;
  }
  .proofRow {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .grid,
  .steps {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Commit** (CSS module is verified once the component imports it in Task 3)

```bash
git add styles/build.module.css
git commit -m "feat(build): SMB landing page styles"
```

---

### Task 3: BuildLanding client component

**Files:**
- Create: `components/build/BuildLanding.tsx`

- [ ] **Step 1: Create the client component (sections + reveal + mailto form + minimal chrome)**

```tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Button from "@/components/system/Button";
import styles from "@/styles/build.module.css";
import {
  contactEmail,
  empathy,
  faqHeading,
  faqs,
  formHeading,
  formLead,
  heroCtaLabel,
  heroEyebrow,
  heroSubtitle,
  heroTitle,
  heroTrust,
  proofHeading,
  proofItems,
  riskHeading,
  riskReversal,
  steps,
  stepsHeading,
  useCases,
  useCasesHeading,
  useCasesNote,
} from "./buildContent";

const initialForm = { name: "", business: "", email: "", message: "" };

export default function BuildLanding() {
  const root = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((t) => t.classList.add(styles.revealShown));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.revealShown);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSent(false);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = [
      `Name: ${form.name}`,
      `Business: ${form.business}`,
      `Email: ${form.email}`,
      "",
      form.message,
    ].join("\n");
    const subject = `Free consult request: ${form.business || form.name}`;
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
    window.location.href = mailto;
  };

  return (
    <div ref={root} className={styles.page}>
      <header className={styles.header}>
        <a href="#top" className={styles.wordmark}>
          Kumma
        </a>
        <a href="#consult" className={styles.headerCta}>
          Book a free consult
        </a>
      </header>

      <main id="top">
        {/* Hero */}
        <section className={`${styles.hero} ${styles.shell}`}>
          <p className={styles.eyebrow}>{heroEyebrow}</p>
          <h1 className={styles.title}>{heroTitle}</h1>
          <p className={styles.subtitle}>{heroSubtitle}</p>
          <div className={styles.ctaRow}>
            <Button href="#consult" variant="primary">
              {heroCtaLabel}
            </Button>
          </div>
          <p className={styles.trust}>{heroTrust}</p>
        </section>

        {/* Empathy */}
        <section className={`${styles.section} ${styles.shell}`}>
          <p className={`${styles.empathy} ${styles.reveal}`} data-reveal>
            {empathy}
          </p>
        </section>

        {/* Use cases */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {useCasesHeading}
          </h2>
          <div className={`${styles.grid} ${styles.reveal}`} data-reveal>
            {useCases.map((u) => (
              <div key={u.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{u.title}</h3>
                <p className={styles.cardBody}>{u.body}</p>
              </div>
            ))}
          </div>
          <p className={styles.note}>{useCasesNote}</p>
        </section>

        {/* Proof */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {proofHeading}
          </h2>
          <div className={`${styles.proofRow} ${styles.reveal}`} data-reveal>
            {proofItems.map((p) => (
              <div key={p.name} className={styles.proofItem}>
                <h3 className={styles.proofName}>{p.name}</h3>
                <p className={styles.proofBody}>{p.body}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.proofLink}
                >
                  {p.linkLabel}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {stepsHeading}
          </h2>
          <div className={`${styles.steps} ${styles.reveal}`} data-reveal>
            {steps.map((s) => (
              <div key={s.no}>
                <span className={styles.stepNo}>{s.no}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Risk reversal */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {riskHeading}
          </h2>
          <ul className={`${styles.riskList} ${styles.reveal}`} data-reveal>
            {riskReversal.map((r) => (
              <li key={r} className={styles.riskItem}>
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className={`${styles.section} ${styles.shell}`}>
          <h2 className={`${styles.h2} ${styles.reveal}`} data-reveal>
            {faqHeading}
          </h2>
          <div className={`${styles.faqList} ${styles.reveal}`} data-reveal>
            {faqs.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <h3 className={styles.faqQ}>{f.q}</h3>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Consult form */}
        <section
          id="consult"
          className={`${styles.section} ${styles.shell} ${styles.consult}`}
        >
          <h2 className={styles.h2}>{formHeading}</h2>
          <p className={styles.formLead}>{formLead}</p>
          <form className={styles.form} onSubmit={onSubmit}>
            <label>
              Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                required
              />
            </label>
            <label>
              Business
              <input
                type="text"
                name="business"
                value={form.business}
                onChange={onChange}
                placeholder="Your business name"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@business.com"
                required
              />
            </label>
            <label>
              What would you want the agent to handle?
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={5}
                placeholder="e.g. answer the phone and book appointments when we are busy"
                required
              />
            </label>
            <button type="submit" className={styles.submit}>
              Book a free consult
            </button>
            {sent && (
              <p className={styles.status} role="status">
                Your email app is opening. You can also write directly to{" "}
                {contactEmail}.
              </p>
            )}
          </form>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Kumma</span>
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors (clean).

- [ ] **Step 3: Commit**

```bash
git add components/build/BuildLanding.tsx
git commit -m "feat(build): SMB landing client component"
```

---

### Task 4: Route shell + metadata

**Files:**
- Create: `app/build/page.tsx`

- [ ] **Step 1: Create the server page shell with SEO metadata**

```tsx
import type { Metadata } from "next";
import BuildLanding from "@/components/build/BuildLanding";

export const metadata: Metadata = {
  title: "Custom AI agents for your business",
  description:
    "I design and build custom AI agents for small businesses: phone agents, booking, support, and follow-up. Built and run for you. Book a free consult.",
  openGraph: {
    title: "Custom AI agents for your business | Kumma",
    description:
      "Stop missing calls, bookings, and leads. I build and run a custom AI agent for your business. Book a free consult.",
    url: "https://kumma.me/build",
    type: "website",
  },
  alternates: { canonical: "https://kumma.me/build" },
};

export default function BuildPage() {
  return <BuildLanding />;
}
```

- [ ] **Step 2: Stop dev server, build, verify the route and content render**

Run:
```bash
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
npm run build
```
Expected: `Compiled successfully`, page count increases by one (29 pages), and a `/build` line appears in the route table.

Then:
```bash
grep -c "Never miss another call" out/build/index.html
grep -c "What I can build for you" out/build/index.html
grep -c "Book a free consult" out/build/index.html
```
Expected: each prints `1` or more.

- [ ] **Step 3: Commit**

```bash
git add app/build/page.tsx
git commit -m "feat(build): /build route shell + SEO metadata"
```

---

### Task 5: Suppress portfolio chrome on /build

**Files:**
- Modify: `components/Navigation.tsx`
- Modify: `components/ConditionalFooter.tsx`
- Modify: `components/AgentAwareness.tsx`

- [ ] **Step 1: Hide the main Navigation on /build**

In `components/Navigation.tsx`, add an early return just before the final `return (` (the line that renders `<nav ...>`, currently around line 174). All hooks are declared above this point, so a conditional return here is safe:

```tsx
  if (pathname === "/build" || pathname === "/build/") return null;

  return (
    <nav
```

- [ ] **Step 2: Hide the portfolio footer on /build**

In `components/ConditionalFooter.tsx`, replace the body so it normalizes the path and hides on `/build` as well as `/stories`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const p = pathname?.replace(/\/+$/, "") || "/";
  const hideFooter = p === "/stories" || p === "/build";
  const isBlog = pathname?.startsWith("/blog");

  if (hideFooter) {
    return null;
  }

  return <Footer variant={isBlog ? "blog" : "default"} />;
}
```

- [ ] **Step 3: Hide the agent-protocol pill/banner on /build**

In `components/AgentAwareness.tsx`, find the existing guard line:

```tsx
  if (path === "/agent" || path === "/stories") return null;
```

Replace it with:

```tsx
  if (path === "/agent" || path === "/stories" || path === "/build") return null;
```

- [ ] **Step 4: Stop dev server, rebuild, verify chrome is absent on /build but present elsewhere**

Run:
```bash
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
npm run build
```
Expected: `Compiled successfully`, 29 pages.

Then:
```bash
echo "nav on /build (want 0): $(grep -c 'aria-label=\"Main navigation\"' out/build/index.html)"
echo "nav on home (want 1): $(grep -c 'aria-label=\"Main navigation\"' out/index.html)"
echo "agent pill on /build (want 0): $(grep -c 'View the agent protocol' out/build/index.html)"
echo "portfolio footer wordmark on /build (want 0): $(grep -c 'AI systems made operational' out/build/index.html)"
echo "build own footer email (want 1+): $(grep -c 'dev@kumma.me' out/build/index.html)"
```
Expected: nav on /build = 0, nav on home = 1, agent pill on /build = 0, portfolio footer on /build = 0, build footer email >= 1.

- [ ] **Step 5: Commit**

```bash
git add components/Navigation.tsx components/ConditionalFooter.tsx components/AgentAwareness.tsx
git commit -m "feat(build): suppress portfolio nav, footer, and agent pill on /build"
```

---

### Task 6: Sitemap entry

**Files:**
- Modify: `app/sitemap.ts:10`

- [ ] **Step 1: Add /build to the static routes**

In `app/sitemap.ts`, change the static routes array:

```ts
  const staticRoutes = ["", "/agent", "/blog", "/gallery", "/stories", "/build"].map((p) => ({
```

- [ ] **Step 2: Stop dev server, rebuild, verify sitemap includes /build**

Run:
```bash
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
npm run build
grep -c "https://kumma.me/build" out/sitemap.xml
```
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(build): add /build to sitemap"
```

---

### Task 7: Final verification sweep + restart dev

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck + build + content + em-dash sweep**

Run:
```bash
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
npx tsc --noEmit
npm run build
echo "use cases present: $(grep -c 'AI phone agent' out/build/index.html)"
echo "proof present: $(grep -c 'Real systems, not slideware' out/build/index.html)"
echo "risk line present: $(grep -c 'never used to train AI models' out/build/index.html)"
echo "consult anchor present: $(grep -c 'id=\"consult\"' out/build/index.html)"
echo "em-dash scan (want none): $(grep -rl '—' app components data styles public/llms.txt public/llms-full.txt 2>/dev/null || echo none)"
```
Expected: tsc clean, `Compiled successfully` (29 pages), each content check >= 1, em-dash scan prints `none`.

- [ ] **Step 2: Restart dev and confirm the route serves**

Run (dev in background, then probe):
```bash
npm run dev &
sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4242/build/
```
Expected: `200`.

- [ ] **Step 3: Manual visual check**

Open `http://localhost:4242/build/` and confirm: no portfolio top-nav, no portfolio footer, no agent pill; the hero CTA is the brightest element; "Book a free consult" scrolls to the form; the form opens a pre-filled email on submit; layout reads cleanly on a narrow (mobile) width.

---

## Self-Review

**Spec coverage:**
- Standalone route + dark Atlas + own chrome -> Tasks 4, 5 (+ Task 2 header/footer styles). ✓
- Suppress nav/footer/agent pill -> Task 5. ✓
- Terrain kept, content on solid panels -> Task 2 (`--surface`/`--raised` panels; page is `z-index:1` over the global `ThreeScene`). ✓
- CTA highest-contrast (jade) -> Task 2 `.submit` + hero primary `Button`. ✓
- 8 sections with copy -> Task 1 content + Task 3 markup (hero, empathy, use cases, proof, how it works, risk reversal, FAQ, consult form). ✓
- Use-case grid, phone agent first -> Task 1 `useCases[0]` is the phone agent. ✓
- Proof KOTA "hear it" + ARCHON -> Task 1 `proofItems`. ✓
- Mailto consult form, no backend -> Task 3 `onSubmit`. ✓
- Indexable + sitemap, not cross-linked -> Task 6; no portfolio nav/footer link added. ✓
- SEO metadata -> Task 4. ✓
- A11y (labels, sr-only new-tab, reduced motion, role=status) -> Tasks 2, 3. ✓
- Deferred (booking, demo number, prices, real metrics) -> not built, by design. ✓

**Placeholder scan:** No TBD/TODO. All steps contain real code or exact commands. The only `placeholder=` strings are HTML input placeholder attributes (intended UI), not plan placeholders.

**Type consistency:** `buildContent.ts` exports (`heroTitle`, `useCases`, `proofItems`, `steps`, `riskReversal`, `faqs`, `contactEmail`, etc.) match exactly the names imported in `BuildLanding.tsx`. `ProofItem` fields (`name`, `body`, `href`, `linkLabel`) match their usage. Form state keys (`name`, `business`, `email`, `message`) match the inputs' `name` attributes and the mailto body.

**Build workflow:** every build step stops the dev server first (known `.next` clobber issue) and Task 7 restarts it.
