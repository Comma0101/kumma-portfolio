---
title: "Choosing a speech-to-text and TTS stack for a voice agent in 2026"
excerpt: "How to pick streaming STT and TTS for a real-time phone agent, judged on the numbers a caller feels: streaming latency, partial stability, and tail latency."
date: "2026-07-08"
author: "Kumma"
tags: ["Speech-to-text", "TTS", "Voice AI", "Deepgram"]
category: "Engineering"
featured: false
---

Choose streaming STT and TTS on the numbers a caller actually feels: streaming latency, partial-transcript stability, phone-band accuracy, and tail latency — not the headline word error rate on a leaderboard. Below are published third-party figures for the common options in 2026, plus the reason none of them settle the choice: the only number that counts is the one you measure on your own line.

A voice agent lives or dies in a window of a few hundred milliseconds. People leave a gap of about 200ms between turns in normal speech, and once the reply drifts past roughly 300 to 400ms the call starts to feel like a phone tree ([Prodinit](https://prodinit.com/blog/production-voice-ai-agents-latency-architecture)). So when you compare providers, the first spec-sheet number to ignore is the one every vendor leads with: batch word error rate on clean, wideband audio. Your caller is on an 8kHz phone line, mid-sentence, correcting themselves. That is a different problem than the one the leaderboard measures.

## What actually matters when the agent is live

Four things, roughly in order:

- **Streaming latency** — time from audio in to the first useful token or first audio byte out, not the time to a final result.
- **Partial-transcript stability** — whether the interim transcript stops flickering and rewriting itself early enough that you can act on it. This is the one nobody benchmarks and everybody feels. See the [streaming STT pattern](/patterns/streaming-stt) for why acting on stable partials, rather than waiting for the final, is the whole game.
- **Phone-band accuracy** — WER on narrowband, noisy, cross-talking audio, which is nothing like the clean read-speech corpora that headline WER comes from.
- **Tail latency** — P95 and the interquartile range, because at any real call volume the slow tail is what a fraction of your callers actually experience.

Headline WER sits nowhere on that list. It is a real signal — for a transcription product. A live phone agent is a different job.

## How do you judge streaming STT?

On first-token latency and on how fast the partial transcript settles, then on phone-band WER. Take Deepgram Nova-3, the common default. Deepgram publishes sub-300ms streaming latency with first tokens around 150ms in the US ([Deepgram](https://deepgram.com/learn/introducing-nova-3-speech-to-text-api)), and a median streaming WER near 6.84% against about 5.26% on batch, measured across 2,703 files spanning nine domains including drive-thru and voicemail ([Deepgram benchmarks](https://deepgram.com/learn/speech-to-text-benchmarks)). That domain mix matters more than the number itself — it is at least closer to phone audio than a podcast corpus.

Here is where honesty about sourcing earns its keep. An independent 2026 benchmark from Gradium measured Nova-3 with a median time-to-first-token near 992ms and a word error rate far higher than Deepgram's own figure, under Gradium's harness and network path ([Gradium STT benchmark](https://gradium.ai/content/stt-api-benchmark-2026-latency-accuracy)). Both numbers are real. They disagree because they measure different audio, different routes, and different definitions of "first token". That gap is the point of the whole post: a published number tells you a provider *can* be fast under some conditions, not that it *will* be on your line.

What the two sources agree on is the shape. Nova-3 is fast and, relative to its siblings, consistent — the independent test put its latency standard deviation below Nova-2's ([Gradium](https://gradium.ai/content/stt-api-benchmark-2026-latency-accuracy)). Consistency is most of what you are actually buying.

## How do you judge streaming TTS?

On time-to-first-audio and its spread, because everything after the first chunk streams anyway. The vendor-stated targets and the independent medians are not the same number, and the distance between them is the story.

The published time-to-first-audio targets: Cartesia Sonic around 40ms, ElevenLabs Flash around 75ms, Deepgram Aura-2 around 90ms. The independent P50 numbers from Gradium's TTS benchmark land much higher and reorder things by consistency — Cartesia Sonic at 188ms P50 but a wide ~100ms IQR, ElevenLabs Flash at 288ms P50 with a tight 28ms IQR, and Deepgram Aura-2 at 313ms P50 ([Gradium TTS benchmark](https://gradium.ai/content/tts-latency-benchmark-2026)).

Read those rows together. Sonic wins the median and gives back the tail; Flash is slower at P50 but its 28ms IQR means almost every caller gets nearly the same latency. For a phone agent handling concurrent calls, the tight distribution is often worth more than the faster median, because the median is not what your unlucky caller hears at 6pm on a Friday.

## Why the tail beats the median

Because you do not ship one call. You ship thousands, and the median hides the ones that break. A stack with a great P50 and a fat P95 will feel snappy in your demo and ragged in production, and the slow calls cluster exactly when you are busiest. Judge on P95 and IQR. A provider that publishes only a median, or only a "target", is telling you what it can do on a good day.

The same logic runs through STT partials. A model that emits a fast first token but keeps rewriting the transcript for another 400ms has not really given you anything to act on — you either wait for it to settle or you act on a guess and eat the correction. First-token latency without stability is a vanity number. That is why the [streaming STT pattern](/patterns/streaming-stt) is built around stable partials, not first tokens.

## The honest part

Every figure above is a published third-party measurement, linked. None of them is mine, and none of them is your agent. The Deepgram-versus-Gradium disagreement on Nova-3 is exactly what you should expect, not a scandal: each benchmark measures its own audio on its own network, and yours is different from both. The right way to use these numbers is to narrow the field and set expectations, then measure the finalists yourself — same phone path, same codec, same load, same accents your callers actually have.

That is what the [latency page](/latency) is for: numbers I measured on a real line, kept separate from the borrowed ones here so the two never blur. Until a number is measured on your own line, it is a starting point, not an answer.

If you are choosing a voice stack and want a second set of eyes on the tradeoffs, [tell me what you are building](/contact).
