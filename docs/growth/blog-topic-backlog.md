# Blog Topic Backlog

Maintained by the `blog-strategist` agent (`.claude/agents/blog-strategist.md`).
Goal: attract paying voice-AI services buyers and route them to `/build`.

**Scoring:** Intent × Winnability × Proof × (ease) — see the agent spec. Higher =
write sooner. Status: `idea` → `queued` → `drafting` → `published`.

**Honesty rule:** posts marked ⚠️ depend on a real metric or demo Kumma must
confirm before publishing. No invented numbers.

## Cluster structure (pillar → spokes)

Content is organized as one **pillar** with interlinked **spokes** (see the agent
spec). Every new post links to the pillar and at least one sibling.

- **Pillar (to write):** *"AI receptionists for small business, explained"* — the
  broad definitive page the spokes point back to.
- **Spokes published:** A6 (does it work / embarrass me), A5 (which option to
  pick). Next spokes: A1 (cost), A2 (med-spa worth-it), A4 (missed-call cost).

## Published

- ✅ **A6** — `does-an-ai-receptionist-actually-work` (2026-07-07). Live.
- ✅ **A5** — `off-the-shelf-ai-phone-tool-vs-answering-service-vs-custom-agent`
  (2026-07-08). Reframed to a durable category-level comparison (no vendor names,
  since current product specs can't be verified). Live.

---

## Bucket A — Buyer-intent / SEO (owner voice, closest to money)

| # | Working title | Target query | Intent | Status | Notes |
|---|---------------|--------------|--------|--------|-------|
| A1 | What a custom AI receptionist actually costs in 2026 (real ranges) | "ai receptionist cost" | High | queued | #1 FAQ + #1 objection. ⚠️ use Kumma's real build/run ranges. |
| A2 | Is an AI phone answering service worth it for a med spa? | "ai answering service med spa" | High | queued | Beachhead vertical, zero content today. |
| A3 | AI answering service vs. hiring a receptionist: the real math | "ai vs receptionist cost" | High | idea | Decision-stage. Third-party stats must be sourced. |
| A4 | How much revenue is your HVAC business losing to missed calls? | "missed call cost home services" | High | idea | Secondary vertical; pain-quantifier. |
| A5 | Off-the-shelf tool vs. answering service vs. custom agent (published as category-level) | "ai answering service vs custom ai agent" | High | ✅ published | Reframed from vendor names to durable approach comparison. |
| A6 | Does an AI receptionist actually work, or will it embarrass me? | "does ai receptionist work" | High | ✅ published | Live. Pair with callable demo when ready. |
| A7 | Can AI book straight into my calendar / booking system? | "ai appointment booking integration" | Medium | idea | Integration objection. |
| A8 | AI front desk for aesthetic clinics: intake, reminders, no-show follow-up | "ai front desk aesthetic clinic" | High | idea | Whole-workflow, low-competition long-tail. |

## Bucket B — Credibility / build-log (engineer voice, proof + referrals)

| # | Working title | Target query | Intent | Status | Notes |
|---|---------------|--------------|--------|--------|-------|
| B1 | Keeping a voice agent under 1s latency on a real phone line | "real-time voice agent latency" | Medium | idea | Deepen existing KOTA post. ⚠️ real latency figure. |
| B2 | Grounding an agent to a real price list so it never invents an answer | "prevent llm hallucination voice agent" | Medium | idea | Answers the top buyer fear; reuse KOTA menu-grounding. |
| B3 | When the AI mishears: graceful failure and human handoff | "ai voice agent human handoff" | Medium | idea | Answers "what if it gets it wrong". |
| B4 | Building an AI booking agent for a med spa, start to finish | "how to build ai receptionist" | High | idea | Vertical build narrative = doubles as case study. |
| B5 | Why single-prompt "agents" break, and what orchestration means | "ai agent orchestration" | Low | idea | Extend ARCHON post; founder credibility. |
| B6 | The stack behind a production voice agent (Twilio, Deepgram, LLM) | "production voice ai stack" | Low | idea | Infra SEO; signals depth. |
| B7 | From missed call to booked appointment in 8 seconds: one call, dissected | "ai phone agent example call" | High | idea | Demo-in-writing; clip-friendly. ⚠️ real timing. |

## Bucket C — POV / shareable (travels on LinkedIn/X, feeds the funnel)

| # | Working title | Angle | Status | Notes |
|---|---------------|-------|--------|-------|
| C1 | Your business already has an AI budget — it's the money you lose to missed calls | Reframe cost as already-spent | idea | LinkedIn hook for SMB owners. |
| C2 | Most "AI agents" are demos. A system is only real once it survives peak hour. | Anti-hype, Kumma's real thesis | idea | Highly shareable on X. |
| C3 | SMBs will get the enterprise AI playbook before enterprises finish theirs | Optimistic, counters "too small" | idea | Quote-tweetable. |

---

## Recommended first 4 (evidence-based, pending GSC data)

1. **A1** — pricing is the #1 FAQ/objection; ranks and pre-qualifies. ⚠️ needs Kumma's real ranges.
2. **A2** — opens the med-spa beachhead (currently zero content) with a "worth it" buyer query.
3. **B7 / B4** — a written demo + vertical case study; converts and is highly linkable.
4. **C1** — a top-of-funnel LinkedIn hook that routes attention to A1/A2.

> Once GSC is wired (traffic-plan P0), re-rank this list against real impression
> data before drafting — first-party evidence outranks these estimates.
