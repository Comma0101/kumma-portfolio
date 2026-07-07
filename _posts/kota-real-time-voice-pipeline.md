---
title: "Turning a restaurant phone call into a kitchen-ready order"
excerpt: "KOTA takes messy, real-time speech over the phone and resolves it into a structured order the kitchen can act on. Here is the pipeline, and the parts that were actually hard."
date: "2026-06-15"
author: "Kumma"
tags: ["Real-time AI", "Voice agents", "LLM orchestration", "KOTA"]
category: "Engineering"
featured: true
---

Independent restaurants still lose orders for a boring reason: nobody can pick up the phone during a rush. Staff are serving the room, the line rings out, and there is no record that an order was ever attempted. The lost revenue is invisible, which is what makes it easy to ignore.

KOTA is a voice agent that answers those calls and turns them into structured, kitchen-ready orders. It is live at [kota.kummalabs.com](https://kota.kummalabs.com). This is how it works, and where it was harder than a demo suggests.

## The input is messy on purpose

A demo bot handles "I would like one large pepperoni pizza." Real calls sound like:

> "uh yeah can I get like two orange chickens and... wait, do you guys have chow mein?"

Hesitation, filler words, mid-sentence corrections, menu items that do not match the menu's exact wording. The job is not transcription. The job is resolving intent under noise, fast enough that the caller does not feel they are talking to a machine that is thinking.

## The pipeline

The flow is a chain from raw audio to an action the kitchen can trust:

1. **Telephony stream.** The call comes in over Twilio Media Streams as a live audio socket, not a recording. Latency starts mattering here.
2. **Real-time speech.** Audio is transcribed with low-latency streaming speech recognition — Deepgram Nova-2, though I also evaluated Soniox for accuracy under cross-talk.
3. **Intent resolution, menu-grounded.** An LLM resolves the transcript into structured intent, grounded against that restaurant's actual menu so "orange chickens" maps to the real item and modifiers, and ambiguity triggers a clarifying question instead of a guess.
4. **Structured ticket.** The result is a typed order object: items, quantities, modifiers, a confidence value, and any missing information.
5. **Execution.** The ticket is committed into the restaurant's workflow without requiring a POS rewrite — through a Square API integration or direct kitchen output — with transactional SMS confirmation where the caller consents.

The design rule throughout: the model listens in real time, so it should be able to act in real time.

## What was actually hard

The model was rarely the bottleneck. The hard parts were operational:

- **Latency under load.** A reply that is correct but arrives two seconds late breaks the conversation. Streaming end to end, and overlapping recognition with intent resolution, mattered more than model choice.
- **Concurrent calls.** Peak hour means many simultaneous sessions, each holding its own audio stream, state, and menu context. Session isolation is a first-class concern, not an afterthought.
- **Graceful failure.** When confidence drops, the system asks rather than assumes, and escalates to a human when it should.
- **No clean inputs, ever.** There is no "happy path" on a phone line. The system is designed around correction, not around the assumption that the first pass is right.

## Where it is now

KOTA is live and in active development, moving toward more locations and tighter kitchen integration.

The larger point, and the thing I care about across my work: a system is only real once it survives the conditions that a demo never shows it. For a phone agent, that means peak volume, bad audio, and a caller who changes their mind halfway through a sentence.

If you run a business that lives on the phone, this is the kind of agent [I build and run for you](/build). If you are building in real-time voice yourself and want to compare notes, [reach out](mailto:dev@kumma.me).
