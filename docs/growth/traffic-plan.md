# Traffic Growth Plan — kumma.me

**Goal:** grow qualified traffic that converts into **paid voice-AI services
leads** (the `/build` funnel). Not job-hunting. Every tactic below is judged by
"does this reach a business that can pay, or feed a channel that does."

**Owner:** Kumma (Yang Wu) · **Site:** static Next.js 14 → GitHub Pages · kumma.me

> Companion docs: `blog-topic-backlog.md` (what to write),
> `smb-outreach-playbook.md` (outbound/deals), `exposure-posts.md` (distribution
> kit), `sellability-and-distribution.md` (positioning).

---

## The one thing to internalize

SMB owners **do not search for "custom AI agent."** They search for their
*problem* ("stop missing calls", "ai receptionist cost", "answering service for
med spa"). Inbound traffic is won at the problem layer; deals are also won by
outbound (see the playbook). This plan covers the **inbound/traffic** half.

And you can't grow traffic you can't see. **Measurement is P0 and blocks the
rest** — right now analytics is off and Search Console isn't verified, so we are
flying blind.

---

## Phase 0 — Turn the lights on (do first, ~1 hour)

Nothing here is optional; without it every later decision is a guess.

| # | Action | File / where | Impact |
|---|--------|--------------|--------|
| 0.1 | **Enable Umami analytics** — set `NEXT_PUBLIC_UMAMI_ID` as a repo secret and export it in the build step. Component is already wired but returns `null` without it. | `.github/workflows/deploy.yml` build env + `components/Analytics.tsx` | High |
| 0.2 | **Verify Google Search Console** — set `NEXT_PUBLIC_GSC_TOKEN` (or verify by DNS TXT), then submit `sitemap.xml`. Unlocks the query/impression data that drives the whole content plan. | `app/layout.tsx:61` reads the token; set in `deploy.yml` | High |
| 0.3 | **Verify Bing Webmaster Tools** — Bing also feeds ChatGPT/Copilot search. Submit the same sitemap. | Bing WMT console | Med |
| 0.4 | **Track `/build` CTA as a conversion** — add a Umami event to the "Book a free consult" action so traffic sources can be tied to leads. | `components/build/BuildLanding.tsx` | High |

**Exit criteria:** you can answer "how many people hit `/build` last week and
where did they come from?" and "what queries does GSC show us for?"

---

## Phase 1 — Make the money page findable (week 1)

`/build` is the page that most under-uses the SEO infra we already have: no
JSON-LD, no dedicated OG card, and almost no internal links point to it.

| # | Action | File | Impact |
|---|--------|------|--------|
| 1.1 | **Add `Service` + `FAQPage` JSON-LD to `/build`** — provider, `serviceType: "AI agent development"`, `areaServed`, and the existing FAQ as `FAQPage`. Targets commercial-intent SERP features and AI answers. | `app/build/page.tsx` + `components/seo/JsonLd.tsx` | High |
| 1.2 | **Internal links → `/build`** — every blog post and project page should link to `/build` in-context, and project↔build-log cross-links. Concentrates page authority on the conversion page. | post/project components | High |
| 1.3 | **Dedicated OG card for `/build`** — "Custom AI agents for your business — book a free consult." Right now it inherits the generic home card. | `scripts/generate-og.mjs` + `app/build/page.tsx` | Med |
| 1.4 | **Fix broken blog-listing OG images** — `app/blog/page.tsx` points at `/og-blog-image.png` and `/twitter-blog-image.png` which don't exist; shares render blank. Point at an existing card or generate one. | `app/blog/page.tsx:19,32` | Med |
| 1.5 | **Self-referencing canonicals** on project + blog pages (only `/build` has one today; `trailingSlash: true` makes dupes a real risk). | `app/projects/[slug]/page.tsx`, blog pages | Med |

---

## Phase 2 — Content engine (ongoing, the durable traffic source)

Driven by the `blog-strategist` agent + `blog-topic-backlog.md`.

- **Cadence:** 1 solid post every 2 weeks. Consistency beats bursts. A missed
  week is fine; a dead blog is not.
- **Priority:** Bucket A (buyer-intent/pricing/vertical) first — it's closest to
  money and currently has **zero coverage**. Then B (case-study bridges), then C
  (shareable POV) to feed the top of funnel.
- **Every post:** one target query (tracked in GSC), owner-voice for buyers /
  engineer-voice for peers, internal links to `/build` + a project, a specific
  CTA. No invented metrics.
- **Prune signal noise:** 5 of 10 existing posts are off-thesis (philosophy,
  emotions, generative art). Consider moving them under a clearly separate
  `/stories` or `Notes` section so a buyer's read of the blog stays on-thesis.
  (Don't delete — just don't let them lead.)
- **Bilingual edge:** none of the 3 business posts are translated to Chinese yet.
  Translating A/B posts into `_posts/zh/` is low-competition reach.

**Schema depth to add as content grows** (rich results + LLM grounding):
`Article` enrichment (image, `dateModified`, publisher), `BreadcrumbList` on
posts/projects, `SoftwareApplication`/`SoftwareSourceCode` for ARCHON.

---

## Phase 3 — Distribution (where the traffic actually comes from)

A static site gets ~no traffic on its own. Distribution is the job.

**For buyers (highest priority for the paid-services goal):**
- **LinkedIn (primary).** Post Bucket A/C content as native text (not bare
  links) 2–3×/week. This is where SMB owners and founders are. Best channel for
  services leads, full stop.
- **Vertical communities & local groups.** Med-spa / aesthetics and home-services
  owner groups (FB groups, subreddits, local associations). One warm intro here
  beats 500 HN upvotes *for this goal*. Pair with the outreach playbook.

**For credibility + referrals (feeds inbound, don't over-index):**
- **Open source (ARCHON) as marketing** — the strongest passive lever. Great
  README, a Show HN when there's a real milestone, occasional r/LocalLLaMA /
  r/AI_Agents posts. Stars are credibility buyers check.
- **X / build-in-public** — draft with the X co-pilot idea (agent drafts, you
  approve). Reaches builders who refer client work.
- **Cross-post build-logs** to DEV.to / Hashnode with `canonical_url` back to
  kumma.me (never split ranking signal).

**Skip / deprioritize (sound productive, rarely pay off here):** chasing HN
front-page as a goal, merch of any kind, buying followers, generic dev.to
volume, Product Hunt for anything but a real launch moment.

---

## Phase 4 — Performance (rankings + conversion)

- **Defer the 3D/motion stack.** `ThreeScene` + `three`/`@react-three/*`/`gsap`/
  `framer-motion`/`lenis` load on **every route** including `/build` and blog
  posts, hurting mobile LCP/INP — and Core Web Vitals is a ranking factor.
  Dynamically import (`next/dynamic`, `ssr:false`) and/or exclude from
  text-heavy routes. `app/layout.tsx:80`. **Impact: high.**
- **Add the callable KOTA demo number** referenced in the playbook — the single
  highest-value asset for converting buyer-intent traffic ("hear it yourself").
- **Alt text + meta description audit** across gallery/project images and post
  excerpts.

---

## Measurement rhythm

- **Weekly:** GSC queries (new impressions, page 2 near-wins), Umami top pages +
  `/build` conversions.
- **Monthly:** re-rank `blog-topic-backlog.md` against real GSC data — first-party
  evidence outranks the current estimates. Kill topics that show no impression
  potential; double down on queries where we sit #8–20.

## Sequence at a glance

**P0 measurement → P1 make `/build` findable → P2 start the content engine (A
first) → P3 LinkedIn + open source → P4 speed + demo.** Measurement first
because everything after it should be a decision, not a guess.
