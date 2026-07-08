---
title: "Why single-prompt AI agents break: orchestration is the product, not the model"
excerpt: "Most agents are one prompt in a loop. Archon is a control plane: it routes across models, runs tools over MCP, keeps compressed memory, and hands real work to coding agents through a worker router."
date: "2026-06-12"
author: "Kumma"
tags: ["Agents", "Orchestration", "MCP", "Archon"]
category: "Engineering"
featured: true
---

Most "AI agents" are a single prompt running in a loop with a few tools bolted on. They demo well and break the moment the task has more than two steps. The failure is almost never the model. It is the absence of orchestration: no memory worth the name, no way to route work, no way to inspect or approve what the thing actually did.

Archon is my attempt at the layer that is usually missing. It is a self-hostable Python agent that behaves like a control plane rather than a chat wrapper. The repo is open: [github.com/Comma0101/archon](https://github.com/Comma0101/archon).

## What it actually is

Archon coordinates models, tools, memory, and other agents through one inspectable system:

- **Model layer.** It routes across Anthropic Claude, OpenAI, and Google Gemini behind a single agent, choosing per task rather than hardwiring one provider.
- **Control plane.** An orchestrator, policy, sessions, and jobs sit over execution turns, so a task is a defined flow with traces, not a black box.
- **Worker delegation.** This is the part I like most. Heavy work is handed to real coding agents (Claude Code, Codex, OpenCode) through a worker router that supervises them. Archon decides, delegates, and checks the result.
- **Tools and MCP.** A deep tool layer over the filesystem, web read and search, and content, plus a Model Context Protocol client so external tools plug in cleanly.
- **Memory and context.** Persistent memory with context compression and distillation, plus usage and token accounting, so long-running work does not drown in its own history.
- **Channels.** It reaches me through the terminal, Telegram with human approvals, voice, and even phone calls.
- **Safety.** Redaction, policy guardrails, and human approval gates are first-class, not patched on.

## Why a control plane, not a bigger prompt

The thing that makes agents unreliable is that complexity leaks into application code. Every app re-implements retries, memory, tool selection, and "is this safe to run." Archon absorbs that into one layer:

- A task flows through **sessions and jobs**, broken into **turns**, each with a reasoning trace.
- When a step is real work, it is **delegated to a worker** and the result is validated, not trusted blindly.
- Anything consequential passes a **human approval gate** over Telegram before it runs.

The goal is autonomy that stays inspectable. I can read what it did, why, and what it cost.

## What it is not

It is not a finished product, and I will not pretend otherwise. It is active research. What is still rough: the worker router's recovery on failed delegations, the memory-compression heuristics, and multi-session scheduling. What works today is the spine: routing, tools, memory, delegation, and approvals, driven from a CLI.

## Run it

The repo has a quickstart and an architecture diagram. If you are working on agent orchestration, multi-model routing, or MCP tooling, I would genuinely like the feedback: [github.com/Comma0101/archon](https://github.com/Comma0101/archon).

This is also the serious systems work behind the [agents I build and run for businesses](/build) — the orchestration a phone or booking agent needs to hold up in production.

Intelligence is not the model. It is the system around it.
