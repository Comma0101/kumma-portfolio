# /build — SMB Agent-Services Landing Page (Design Spec)

Date: 2026-06-17
Status: Approved design, pending spec review

## Purpose

A standalone, conversion-focused landing page that offers to design and build
custom AI agents for small and medium businesses that lack the budget and
engineering staff to build their own. Goal: convert a visitor into a booked
free consult, leading to a paid build. The page is the destination for outbound
outreach (see `docs/growth/smb-outreach-playbook.md`), not a portfolio section.

## Audience

Non-technical business owners (med spas/clinics, home services, salons, retail,
professional services). They buy outcomes (more answered calls, more bookings,
hours saved), not "AI agents." They are cautious about cost, trust in a solo
provider, whether it works, data privacy, and maintenance.

## Strategy decisions (from research, 2026-06-17)

- **Lead with one provable wedge: the AI phone / front-desk agent that stops
  missed calls** (KOTA's exact capability, highest ROI, easiest to prove).
  Keep broader use-cases present so any SMB self-identifies, but do not lead generic.
- **KOTA = proof/demo story; the money verticals are med spas and home services.**
  Restaurants are not the target (hardest to monetize); KOTA is the credibility artifact.
- **The page is necessary but not sufficient.** Deals come from outreach + a
  callable demo + partnerships. The outreach playbook is the actual deal engine.
- Engagement: **free consult, then custom scope + quote.** No public prices for
  now (owner's call). A "from $X" range is a recommended future test, not in v1.

## Scope (v1)

In scope: one new static route `/build`, dark-Atlas aesthetic, standalone chrome,
mailto-based consult form, SEO metadata, sitemap entry.

Out of scope (deferred, needs owner input): Cal.com/Calendly booking integration;
a public callable demo phone number; real KOTA/ARCHON metrics; public pricing;
per-vertical landing variants.

## Architecture & chrome

- New route `app/build/page.tsx` (server component: metadata + renders the client landing).
- **Standalone funnel:** suppress the global portfolio chrome on `/build`:
  - Hide main `Navigation` (follow the existing pathname-guard pattern used for `/stories`).
  - Hide portfolio `ConditionalFooter` on `/build`.
  - Hide `AgentAwareness` pill/banner on `/build` (add to its excluded paths).
- Provide page-local minimal chrome: a small header (the "Kumma" wordmark only,
  no portfolio nav) and a minimal footer (email + copyright).
- Keep the terrain `ThreeScene` background for brand cohesion; content sits on
  solid `--surface`/`--raised` panels so copy stays readable.
- The primary CTA ("Book a free consult") must be the highest-contrast element
  on the page (jade primary Button), repeated at top and near the form.
- Indexable + added to `app/sitemap.ts`. NOT linked from the portfolio nav/footer,
  so the two audiences stay separate. (Search discovery is allowed; cross-linking is not.)

## Page sections (top to bottom)

All copy uses plain benefit language, no jargon, no em-dashes.

1. **Hero.** Eyebrow "AI agents for small business". H1 leads with the missed-call
   wedge, e.g. "Never miss another call, booking, or lead." Subhead: a custom AI
   agent that answers calls, books appointments, follows up, and handles the
   busywork, built and run for you, without a tech team or a big budget. Primary
   CTA to the form. Trust microline: "You talk to the person who builds it, not a
   sales team."
2. **Empathy.** "Big companies have engineers building this. You have a business
   to run. That gap is what I close." (2-3 lines.)
3. **What I can build (use-case grid).** 6 cards, benefit-led, phone agent
   featured first: AI phone/front-desk agent · customer support agent · booking &
   scheduling · lead capture & follow-up · FAQ/knowledge agent · back-office
   automation. Microline: "Not sure which? That is what the consult is for."
4. **Proof ("Real systems, not slideware").** KOTA, framed as a live voice agent
   that answers restaurant calls (link to live site / case study; copy invites
   "hear it for yourself"). ARCHON as an open-source agent orchestration engine
   (translated for non-technical readers: "I build serious AI systems, not demos").
5. **How it works (3 steps).** (1) Free consult, 20 min, tell me the task that
   eats your time. (2) I scope and quote, fixed and clear, no surprises. (3) I
   build it, set it up, and keep it running and improving. Emphasize: you manage
   nothing technical.
6. **Risk reversal block.** Free consult, no obligation · you own your data and
   accounts · your data is never used to train AI models · always a human (me)
   behind it · cancel anytime.
7. **FAQ.** Handles cautious-owner objections: Is my business too small? What does
   it cost? Do I need technical staff? What about my customers' data? How long does
   it take? Who maintains it?
8. **Consult form (#consult).** Fields: name, business name, email, "what would you
   want the agent to handle?". On submit, compose a pre-filled mailto to
   dev@kumma.me (same client-side pattern as `components/home/ContactSection.tsx`)
   and show a status message. No backend; fits static export. Swap to a booking
   embed later.

## Components & files

Create:
- `app/build/page.tsx` — server shell + SEO metadata (title, description, OG).
- `components/build/BuildLanding.tsx` — client component: section markup, scroll
  reveal (reuse the IntersectionObserver pattern from ChapterIndex/ContactSection),
  and the consult form (mailto compose).
- `components/build/buildContent.ts` — the use-cases, FAQ items, steps, and
  risk-reversal points as data (keeps the component clean and editable).
- `styles/build.module.css` — page-local styles using Atlas tokens; includes the
  minimal header/footer, panels, use-case grid (responsive, stacks on mobile),
  and form. Reuse `--font-sans/mono/editorial`, jade/ink tokens, `--ease`.

Edit:
- `components/Navigation.tsx` — hide on `/build` (pathname guard).
- `components/ConditionalFooter.tsx` — hide on `/build`.
- `components/AgentAwareness.tsx` — add `/build` to the excluded paths.
- `app/sitemap.ts` — add `/build` to static routes.

Reuse: `components/system/Button.tsx` (jade primary CTA, already has external +
new-tab a11y), global `.sr-only`, Atlas tokens, fonts.

## Data flow

Static page. The form builds a `mailto:` URL client-side from the field values
and navigates to it (`window.location.href`). No server, no API route, no data
stored. Identical approach to the existing contact form, which already works
under static export.

## Accessibility

- Single clear `<h1>`; sections use proper headings.
- Form inputs have associated labels; required fields marked; status uses `role="status"`.
- External links: new-tab cue via the existing Button/`.sr-only` pattern.
- Honor `prefers-reduced-motion` for reveals (match existing components).
- CTA contrast meets the design-system focus/contrast rules already in globals.

## Success criteria

- `/build` builds and exports statically (28 -> 29 pages), `tsc` clean, no em-dashes.
- Portfolio nav, footer, and agent pill do NOT appear on `/build`; they still
  appear on all other routes.
- `/build` is reachable, in the sitemap, and not linked from the portfolio.
- The consult form opens a correctly pre-filled email on submit.
- The page reads clearly for a non-technical owner: outcome-first, CTA obvious.

## Notes / future (not in v1)

- Highest-value future addition per research: a **public callable demo number**
  for KOTA ("call this and hear it") — the single strongest converter.
- Consider per-vertical variants (med spa, home services) once the generic page
  and outreach validate demand.
- Consider a soft "builds from $X, care plans from $Y/mo" range to reduce friction.
