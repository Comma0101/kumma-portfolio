# Sellability + Distribution Strategy

Synthesis of a four-agent research sweep (positioning, demand/audience, conversion, distribution),
June 2026. Goal: make kumma.me actually *sell* Kumma into the right opportunities.

## The verdict

The site is a top-tier **showcase** but does not yet **sell**. The substance is genuinely
top-decile for an independent (a live product a stranger can phone, an open-source agent,
real build-logs). The gap is three layers: **positioning sharpness, a proof-and-ask layer,
and distribution.**

## 1. Positioning

- Stop leading with the abstract. "AI systems that act in the real world" is the generic
  framing CTOs skim past. Shipped, live systems are the signal that wins.
- **Wedge = real-time voice.** "I built an AI that answers restaurant phone calls" is concrete,
  demo-able, and impossible to fake. Lead with the hook; prove *range* with agent orchestration
  + 0-to-1 shipping. Do NOT niche to voice-only (kills founding-engineer breadth).
- Anchor line shipped on the home hero: **"I build AI that runs in production, not in demos."**
  ("runs in production" is the credibility signal CTOs weight most.)
- Avoid title theater ("Agentic GenAI Architect", "Builder", "Context Engineer") and
  adjective-only claims ("scalable, robust"). Show receipts.

## 2. Demand / who buys

Hottest, best-matched pockets for these exact skills (2026):

- **Forward-deployed / applied-AI engineer** — the hottest role in tech; FDE postings up
  5,000%+ since 2025; $300K-$500K TC at labs (Anthropic, OpenAI, Scale, Palantir, Glean, Cursor).
- **Real-time voice AI startups** — hiring founding/senior engineers hard. Wayline (YC):
  Founding AI Agent Engineer $190K-$240K + 1-3% equity. Take2 (Techstars): Senior Voice AI Eng.
  Infra layer: Vapi, Retell, Bland, Cartesia, Deepgram, LiveKit, ElevenLabs.
- **Agent orchestration / agent-infra** — ARCHON maps 1:1 to YC founding-eng JDs.
- **AI consulting** — AI agent dev $175-$300/hr, Voice AI $150-$275/hr, $600-$1,200/day.
- **Restaurant voice (KOTA's lane)** — real demand (34% of restaurants use voice AI, 48% more
  planning within 12mo) but crowded + low-ACV SMB. Best as a side door, not the homepage.

**Audience priority for the site:**
1. Voice-AI / agent-infra startups hiring founding + forward-deployed engineers. (Highest value
   AND most attainable — portfolio is a near-perfect keyword + proof match.)
2. AI consulting / contract clients in voice + agents. (Fast cash, same proof, doubles as lead-gen.)
3. Restaurant/SMB buyers for KOTA — dedicated product page in pure ROI language, kept separate.

## 3. Conversion gaps + highest-ROI fixes

Gaps: no metrics/social proof anywhere; no "work with me" offer or availability status;
mailto friction (and it breaks on static export); project pages link out before proving anything.

Ranked fixes:
1. **Add quantified proof to KOTA + ARCHON** (latency, calls handled, concurrency, GitHub stars).
   Numbers are the conversion engine. (Needs Kumma's real numbers — do not fabricate.)
2. **"Work with me" / availability block** — who you help + what you do + engagement type + status.
   (Shipped a first version: hero now carries an availability line.)
3. **Replace mailto with a booking embed** (Cal.com / Calendly "Book a 20-min call"). Dodges the
   static-export API problem and removes the highest-friction step. (Needs Kumma's booking link.)
4. **Rewrite project pages: Problem -> Constraints -> Approach -> Results-with-numbers.** Lead with
   outcome, not architecture. Make the on-site page enough to evaluate him.
5. **Tighten hero + status line.** (Shipped.)

Aesthetic + agent-aware feature: keep both. They differentiate and signal "lives in agentic
systems." But llms.txt does NOT drive traffic — treat it as a capability signal, not a channel.
Guardrails: primary CTA must be the highest-contrast element; metrics must hit readable contrast;
terrain/motion must not delay first paint or bury the proof.

## 4. Distribution — 30/60/90

A site nobody sees can't sell. Winning loop for this archetype: public artifact + daily
build-in-public + show up where buyers already are.

**Days 0-30 (foundation + first burst):**
- Rewrite ARCHON README (top-of-fold demo GIF, one-command quickstart, "available for work" line);
  stand up a hosted ARCHON demo.
- Optimize LinkedIn (keyword headline + About, 5+ skills) and X bio/pinned post (best demo video).
- Start X cadence now: 1 visual post/day + 30 min/day replying in voice-AI / agent timelines
  (X algo weights replies ~13x likes).
- Join Latent Space Discord, Pipecat + LiveKit Discords, r/ai_agents.
- **Execute a Show HN for ARCHON** (Tue-Thu 8-10am PT). Title: "Show HN: ARCHON - open-source
  multi-LLM agent orchestrator" (no superlatives). Live demo + maker comment ready in minutes.
  A front page = 5K-30K of the right people in a day.

**Days 30-60 (authority + KOTA distribution):**
- Publish 2 deep build-logs (ARCHON internals; KOTA real-time voice latency). Cross-post DEV.to + Reddit.
- KOTA: 90s demo video; Product Hunt launch ("AI phone host for independent restaurants").
- KOTA partnerships: apply to Toast / Square marketplaces; talk to Deliverect-style aggregators.
- Apply to speak/demo at an AI Engineer (ai.engineer) 2026 event; register for MURTEC/FS-TEC (RTN).

**Days 60-90 (convert attention to inbound):**
- Add explicit "available for founding-engineer / applied-AI consulting" CTA to site, X, GitHub.
- Join talent collectives: South Park Commons, A.Team, Kasp, WorkGenius. Post in HN "Who wants to
  be hired" monthly threads.
- Attend one in-person event (AIE or MURTEC) — highest-trust intros.
- Repurpose every build-log -> X thread -> LinkedIn post. One artifact, four surfaces. Measure DMs/
  calls/intros, not followers/stars.

**Two highest-ROI moves if nothing else:** (1) a well-executed Show HN for ARCHON with a live demo,
(2) a daily visual build-in-public cadence on X with heavy replying in voice-AI / agent circles.

## What needs Kumma (can't be done from the repo)

- Real metrics for KOTA + ARCHON (latency, calls, concurrency, stars) to fill the proof layer.
- A booking link (Cal.com / Calendly) to replace the mailto CTA.
- Execute the distribution playbook (X cadence, Show HN, communities) — this is the exposure engine.
