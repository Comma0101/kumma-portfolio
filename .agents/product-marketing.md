# Product Marketing Context

*Last updated: 2026-07-11*

## Product Overview

**One-liner:** Kumma audits, designs, and ships production AI systems that survive real inputs, operational constraints, and failure.

**What it does:** An independent systems practice for difficult production-AI boundaries: real-time voice, model and agent orchestration, production TTS, evaluation, workflow integration, data correctness, and technically ambitious interactive systems. Voice AI is the sharpest proof of the work because it makes latency, ambiguity, guardrails, and recovery immediately visible; it is not the only capability.

**Product category:** Production AI engineering and advisory.

**Product type:** High-trust professional service supported by public case studies, open tooling, live products, and technical research.

**Business model:** Paid production-AI audits, scoped build engagements, and ongoing advisory. Pricing is scoped to the problem; no public fixed price is currently claimed.

## Target Audience

**Target companies:** Founder-led and product-led companies with an AI feature, workflow, or prototype that must become dependable in production. Best fit is a team with a real operational constraint and enough technical ownership to act on an audit or ship a scoped system.

**Decision-makers:** Founders, CTOs, technical product leaders, and engineering leads.

**Primary use case:** Move an AI system from impressive demo behavior to an operable product with explicit latency, evaluation, guardrail, integration, and recovery decisions.

**Jobs to be done:**

- Find why an AI workflow breaks under real inputs and leave with a prioritized fix roadmap.
- Design and ship a difficult production-AI system end to end.
- Add specialist architecture, reliability, evaluation, or real-time-systems judgment to an existing team.

**Use cases:**

- Audit a voice or agent workflow with latency, ambiguity, grounding, or handoff problems.
- Build a scoped real-time voice, orchestration, TTS, evaluation, or workflow-integration system.
- Review model/tool routing, memory, policy, observability, and recovery architecture.
- Turn noisy or incomplete inputs into a correct, inspectable operational output.

## Personas

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Founder / financial buyer | Shipping the right product without an open-ended team expansion | The demo is compelling, but production risk and scope are unclear | A bounded engagement, visible tradeoffs, and a path from problem to operable system |
| CTO / technical decision-maker | Architecture, failure behavior, integration cost, and technical credibility | Generalist implementation misses the real-time or AI-specific boundary | Systems-level diagnosis and implementation grounded in mechanisms and guardrails |
| Engineering lead / champion | Delivery speed, maintainability, tests, observability, and handoff | The team needs specialist depth without adding a full-time role | Focused audit, build, or advisory work that fits the existing stack and leaves inspectable artifacts |

## Problems & Pain Points

**Core problem:** The AI demo works in a narrow path, but real inputs expose latency, ambiguity, grounding errors, brittle integrations, missing evaluation, or failure states nobody designed.

**Why alternatives fall short:**

- Model/API vendors solve a model call, not the surrounding workflow and recovery system.
- Generalist agencies can ship interface and integration work without resolving the hardest AI-specific failure boundary.
- An internal team may know the product deeply but lack focused real-time, orchestration, evaluation, or reliability capacity.
- A larger hire adds time and commitment when the immediate need is a bounded intervention.

**What it costs them:** Delayed launches, unreliable user experiences, manual exception handling, wasted model spend, lost operator trust, and engineering time spent debugging symptoms rather than system design.

**Emotional tension:** The product looks close enough to promise, but the team cannot confidently say what happens when inputs are messy, the model is wrong, a dependency slows down, or a workflow must recover.

## Competitive Landscape

**Direct:** Independent AI consultancies and specialist engineering studios — often broader, but may not expose mechanism, failure modes, and evidence before a sales call.

**Secondary:** Generalist product agencies and systems integrators — can add delivery capacity, but production-AI reliability may not be the core craft.

**Indirect:** Keep debugging internally, buy another model/API, or make a full-time hire — preserves familiarity, but can leave the immediate boundary unresolved or expand the commitment beyond the problem.

## Differentiation

**Key differentiators:**

- Mechanism-first proof: each case study shows input, transformation, output, and guardrail.
- Real-time voice experience makes latency, interruption, ambiguity, and recovery concrete.
- Breadth across models, tools, queues, workflows, data correctness, and interactive delivery—not just prompting.
- Honest status and limits: live, open source, case study, and active R&D are labeled separately.
- One technical owner can audit the boundary, build the system, and explain the tradeoffs.

**How we do it differently:** Start from the operational constraint and failure path, then select models, tools, and interfaces around it. Make reliability decisions inspectable instead of hiding them behind generic AI claims.

**Why that's better:** Buyers can evaluate technical judgment before starting a conversation and scope an engagement around the part that actually blocks production.

**Why customers choose us:** Specialist depth without defaulting to a full-time hire or a large agency process.

## Objections

| Objection | Response |
|-----------|----------|
| “Can one independent engineer handle this?” | Scope the engagement around one critical boundary, show the architecture and artifacts, and identify where the client team or another specialist must own adjacent work. |
| “Where are the big customer logos and ROI numbers?” | Do not substitute invented proof. Use live products, deployed mechanisms, open-source work, technical evidence, and explicit limits; add measured outcomes only when verified. |
| “We do not know whether we need an audit or a build.” | Start with the problem, constraint, stack, timeline, and budget. Recommend the smallest engagement that can reduce uncertainty or ship the required system. |

**Anti-persona:** Full-time recruiters; buyers seeking a commodity chatbot or a vague “add AI” feature; teams unwilling to expose constraints or own production operations; work that requires fabricated claims, unsafe behavior, or hidden sensitive data.

## Switching Dynamics

**Push:** Repeated demo-to-production failures, slow or inconsistent interactions, manual recovery, and unclear system ownership.

**Pull:** A bounded specialist engagement with public technical proof and a concrete path from failure analysis to shipped system.

**Habit:** Keep tuning prompts, swapping models, or adding patches because the team already understands those moves.

**Anxiety:** Bringing in an outsider may create handoff cost, reveal more scope, or produce an elegant prototype that the team cannot operate.

## Customer Language

There is not yet a verified interview/review corpus. The phrases below are working buyer-language hypotheses and must not be presented as customer quotations.

**How they describe the problem:**

- “The demo works, but real inputs break it.”
- “Latency is killing the experience.”
- “We do not know when the agent is safe to act.”
- “We need the system shipped, not another model comparison.”
- “We need specialist help without hiring a full team.”

**How they describe us:**

- “Production AI systems engineer.”
- “The person to bring in for the hard system boundary.”
- “A focused audit or build, not staff augmentation.”

**Words to use:** production AI, real inputs, operational constraint, failure mode, latency, grounding, guardrail, recovery, inspectable, scoped audit, build engagement, advisory.

**Words to avoid:** revolutionary, seamless, cutting-edge, 10×, guaranteed, magic, AI transformation, hire me, job seeker, full-time opportunity.

**Glossary:**

| Term | Meaning |
|------|---------|
| Production AI | An AI-enabled system designed for real inputs, integrations, monitoring, failure, and recovery—not only a controlled demo |
| Guardrail | A rule, validation, clarification, approval, or recovery behavior that constrains unsafe or ambiguous action |
| System boundary | The point where a model meets latency, data, tools, operators, policy, or another production constraint |
| Evidence flow | The visible input → transformation → output → guardrail mechanism used across the portfolio |

## Brand Voice

**Tone:** Confident, restrained, technically credible, and candid about limits.

**Style:** Short declarative headlines; plain-language explanation; concrete mechanisms; editorial pacing; no hype or résumé language.

**Personality:** Precise, curious, independent, rigorous, and visually ambitious.

## Proof Points

**Metrics:** No unverified performance or commercial metrics. Publish measured latency/evaluation data only with methodology and raw evidence.

**Customers:** No logo wall or named-client claim without permission.

**Testimonials:** None currently approved for publication.

**Value themes:**

| Theme | Proof |
|-------|-------|
| Real-time voice systems | KOTA live voice/order flow, call/demo artifacts, voice patterns and stress-suite work |
| Production pipelines | Audiobook AI live Kokoro TTS product with ingest, normalization, queue, recovery, assembly, and PWA delivery |
| Agent orchestration | ARCHON open-source control plane across models, tools, workers, memory, approvals, trace, and recovery |
| AI-to-3D craft | Splash Ink active R&D prototype using depth/point initialization and 3D Gaussian Splatting |
| Real-time interactive systems | Spectral World Player local-audio/Web Audio analysis driving an adaptive Three.js world |
| Data correctness | Robinhood case study turning a messy CSV into an inspectable paired transaction ledger without trading-performance claims |

## Goals

**Business goal:** Generate qualified paid-project conversations for production-AI audits, builds, and advisory—not full-time employment.

**Conversion action:** Primary: start a project at `/contact`. Secondary: inspect a relevant case study or hear the voice demo.

**Current metrics:** Baseline traffic and conversion rates are not yet established. Track project-start, case-study-open, demo-open, contact-open, and mailto-submit intent without collecting form content.
