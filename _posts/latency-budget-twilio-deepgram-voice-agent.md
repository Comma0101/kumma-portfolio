---
title: "The latency budget of a Twilio and Deepgram voice agent, from published numbers"
excerpt: "What each stage of a phone voice agent actually costs — telephony, Deepgram STT, LLM, and TTS — using vendors' own published latency figures, not guesses."
date: "2026-07-08"
author: "Kumma"
tags: ["Latency", "Voice AI", "Deepgram", "Twilio"]
category: "Engineering"
featured: false
---

A phone call feels like a conversation or it does not, and the line between the two is a few hundred milliseconds. People leave a gap of about 200ms between turns in normal speech, and anything past roughly 300 to 400ms starts to feel like a phone tree instead of a person ([Prodinit](https://prodinit.com/blog/production-voice-ai-agents-latency-architecture), [Gradium](https://gradium.ai/content/tts-latency-benchmark-2026)). So the whole game is the budget: from the moment the caller stops talking to the first byte of audio back, where does the time go, and how much of it can you actually spend.

This is the budget for the stack I use for [KOTA](/work/kota) — Twilio for telephony, Deepgram for speech-to-text, an LLM for intent, a streaming TTS for the reply. Every number below is a **published figure from the vendor or an independent benchmark**, cited. It is not a measurement of my line. When I measure the public line end to end, those numbers go on the [latency page](/latency), not here — I do not want to blur the two.

## Where the time goes

A turn is a chain of stages, and on the naive path they add up in sequence. The published component numbers:

- **Endpoint detection (VAD hangover).** Before any of the pipeline runs, the system has to decide the caller actually stopped, not just paused. That trailing-silence window is time the caller feels, and it is the stage people forget — see the [VAD tuning](/patterns/vad-tuning) and [endpointing](/patterns/endpointing) notes. Budget it explicitly; it is often 100 to 300ms of pure waiting.
- **Speech-to-text.** Deepgram publishes sub-300ms streaming latency for Nova-3, with first tokens around 150ms in the US and 250 to 350ms globally ([Deepgram](https://deepgram.com/learn/introducing-nova-3-speech-to-text-api)). Accuracy matters as much as speed for a phone agent: Nova-3 reports a median streaming word error rate near 6.8% and about 5.3% on batch English across 2,703 production files ([Deepgram benchmarks](https://deepgram.com/learn/speech-to-text-benchmarks)).
- **LLM first token.** With a fast model — GPT-4o-mini, Claude Haiku, or a Groq-hosted model — time-to-first-token lands around 100 to 180ms in good conditions, though 300 to 500ms is common in practice ([Prodinit](https://prodinit.com/blog/production-voice-ai-agents-latency-architecture), [Introl](https://introl.com/blog/voice-ai-infrastructure-real-time-speech-agents-asr-tts-guide-2025)). This is usually the widest and least predictable stage.
- **Text-to-speech first audio.** The fast streaming voices publish time-to-first-audio targets in the tens of milliseconds — Cartesia Sonic around 40ms, ElevenLabs Flash around 75ms, Deepgram Aura-2 around 90ms — though independent P50 measurements are higher, roughly 190 to 310ms depending on the provider ([Gradium TTS benchmark](https://gradium.ai/content/tts-latency-benchmark-2026)). Tail latency (IQR) is the number that bites you at scale, not the median.
- **Telephony and network.** WebRTC transport is 20 to 40ms; a Twilio SIP path adds media round-trips on top, and Twilio's own guidance treats a sub-600ms end-to-end turn as the target to engineer toward ([Twilio](https://www.twilio.com/en-us/blog/developers/best-practices/guide-core-latency-ai-voice-agents), [Ecosmob](https://www.ecosmob.com/blog/fix-voice-ai-latency-twilio-sip)).

## Why the naive sum is a trap

Add those up in sequence and you are already near or past a second before the caller hears anything — which is exactly why teams report real agents landing at 800ms to 2s despite each component being fast on its own ([OnCallClerk](https://oncallclerk.com/blog/how-to-reduce-latency-voice-ai-agents), [cloudx](https://dev.to/cloudx/cracking-the-1-second-voice-loop-what-we-learned-after-30-stack-benchmarks-427)). The latency is not in any one box. It is in the seams: waiting for a full transcript before calling the model, waiting for a full completion before starting speech, running stages back to back instead of overlapping them.

The fix is to stop treating the stages as sequential. Act on stable partial transcripts instead of the final. Start streaming the first tokens into TTS before the model finishes the sentence. Overlap the telephony write with generation. That is the whole argument of the [latency budgets pattern](/patterns/latency-budgets): a budget you allocate against and instrument per stage, not one opaque number you discover after a call feels slow.

## The honest part

These are other people's measurements. They are the right starting point for a budget, and they tell you which stages are worth fighting for — the LLM and the endpoint window, mostly, not the STT. But the number that matters for a specific agent on a specific phone line is the one you measure at the phone, under load, across real calls. That is what the [stress suite](/benchmark) and the monthly [latency report](/latency) are for, and until those numbers exist they stay blank rather than borrowed.

If you are building a phone agent and fighting this budget, [tell me where it is slow](/contact) — the endpoint window and the seams between stages are usually where the second went.
