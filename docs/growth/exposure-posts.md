# Exposure kit — build-logs, threads, Show HN (drafts)

Fill the `[brackets]` with real specifics (numbers, repo links, a demo clip). Keep it honest — no invented metrics. Publish the essays on kumma.me first, then cross-post with `canonical_url` pointing back.

---

## 1. Technical build-logs (the organic-traffic engine)

These replace the philosophy-only blog as the *first* technical posts. One per flagship. Target the queries in parentheses.

### A. "Turning a restaurant phone call into a kitchen-ready order" (KOTA)
*(targets: AI restaurant phone ordering, real-time voice agent, Twilio media streams + LLM)*
- The problem, concretely: restaurants miss calls at peak; missed call = lost order, no record.
- The hard part: real speech is messy ("uh, two orange chickens, wait do you have chow mein?") — hesitation, corrections, menu ambiguity.
- The pipeline: telephony stream -> low-latency STT -> menu-grounded intent -> structured ticket -> kitchen output. [name the actual stack: Twilio Media Streams, Deepgram/Soniox, OpenAI, FastAPI, WebSockets, Square]
- What broke and how you handled it: [latency under load, mishears, concurrent calls, API failures, human fallback].
- Numbers if you have them: [calls handled, order accuracy, latency]. If not, say "early production" and show a clip.
- Close: link kota.kummalabs.com + a 30-60s screen recording.

### B. "An agent that orchestrates Claude, GPT, and Gemini — and delegates to coding agents" (ARCHON)
*(targets: multi-LLM orchestration, agent worker router, MCP client, self-hosted AI agent)*
- Why single-prompt chains break; why orchestration is the real product.
- The control plane: orchestrator / policy / sessions / jobs over execution turns.
- The standout: a worker router that delegates real tasks to Claude Code, Codex, and OpenCode.
- Tools + MCP, persistent memory + context compression, channels (terminal, Telegram with approvals, voice, Twilio).
- "Run it yourself" section + architecture diagram.
- Close: link github.com/Comma0101/archon.

### C. "Markets as a real-time system: scoring decisions, not outcomes" (Market Systems)
*(targets: trading decision quality, process over outcome, ICT/SMC systemization)*
- Thesis: insight is not enough; a system is only real if it stays executable under pressure.
- What you built: execution analytics (setup/conviction/error), risk rules as system constraints, decision journal, regime view on MNQ/MES.
- The dashboard that scores decision quality over raw PnL.
- No profitability claims — frame as systems thinking under uncertainty.

---

## 2. X / build-in-public threads (@Comma_9fie)

### KOTA thread
1. I built an AI that answers restaurant phone calls and turns them into kitchen-ready orders. Live: kota.kummalabs.com. Here's the pipeline. 🧵
2. The input is messy: "uh yeah two orange chickens... wait do you have chow mein?" Hesitation, fillers, mid-sentence corrections, menu ambiguity. A demo bot folds; production has to hold.
3. Flow: phone audio -> live transcription -> menu-grounded intent -> a structured ticket the kitchen can act on. [stack]
4. The hard parts weren't the model. They were latency under peak load, concurrent calls, mishears, and graceful human fallback. [one concrete story]
5. What it does now: [calls handled / accuracy / latency, or "early production"]. Clip below. Building it out for more restaurants — DMs open.

### ARCHON thread
1. My personal agent ARCHON orchestrates Claude, GPT, and Gemini — and delegates real work to coding agents (Claude Code, Codex, OpenCode) through a worker router. Open source. 🧵
2. Most "agents" are one prompt in a loop. ARCHON is a control plane: orchestrator, policy, sessions, jobs, with memory and human approval as first-class.
3. The part I like most: a worker router that hands heavy tasks to actual coding CLIs and supervises them. [diagram]
4. Tools over the filesystem + web + MCP, persistent memory with context compression, and channels: terminal, Telegram (with approvals), voice, even phone calls.
5. Repo + how to run it: github.com/Comma0101/archon. Feedback welcome.

---

## 3. Show HN (use once, for ARCHON, when the repo README + demo are ready)

**Title:** Show HN: Archon – a self-hostable agent that orchestrates Claude/GPT/Gemini and delegates to coding agents

**Body:**
I built Archon, a Python agent that acts as a control plane over multiple models and tools instead of a single chat loop. It routes across Claude, GPT, and Gemini, exposes tools over the filesystem/web/MCP, keeps compressed long-term memory, and delegates heavy tasks to coding agents (Claude Code, Codex, OpenCode) through a worker router with policy and human approval. It reaches me through the terminal, Telegram (with approvals), voice, and phone calls.

What's novel vs. other agent frameworks: [1-2 honest differentiators]. What's still rough: [be honest]. Repo: github.com/Comma0101/archon — there's a [demo gif] and a "run it yourself" section. Happy to answer questions about the orchestration/worker design.

**Pre-reqs before posting:** strong README (architecture diagram + demo gif + quickstart), repo pinned on the GitHub profile, and time to sit in the thread and reply for the first few hours.

---

## 4. Distribution checklist
- [ ] Deploy kumma.me (git push origin master) so everything is indexable + shareable.
- [ ] Submit https://kumma.me/sitemap.xml to Google Search Console + Bing.
- [ ] Set NEXT_PUBLIC_UMAMI_ID + NEXT_PUBLIC_GSC_TOKEN (GitHub Actions secrets) to turn on analytics + verification.
- [ ] Publish build-log A (KOTA), then thread it on X same day.
- [ ] Polish ARCHON README (diagram + demo gif), pin the repo, then Show HN.
- [ ] Cross-post each build-log to dev.to / Hashnode with canonical_url back to kumma.me. Tags: ai, llm, agents, webdev.
- [ ] Post ARCHON in r/LocalLLaMA and r/AI_Agents; KOTA in restaurant-tech / indie-hacker communities (lead with the story, not the link).
