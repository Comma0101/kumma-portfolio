---
title: "Telephony gotchas: what SIP does to your audio that localhost doesn't"
excerpt: "Your voice agent works on localhost because localhost hides everything a phone line does to audio. Here is what breaks the moment a real call hits SIP."
date: "2026-07-08"
author: "Kumma"
tags: ["Telephony", "Voice AI", "SIP", "Real-time"]
category: "Engineering"
featured: false
---

Your voice agent works in the demo because localhost hides the phone line. Clean 16 kHz mic audio, no packet loss, both directions flowing, no codec in the path. The moment that same agent answers a real call over SIP, the audio it hears is a different signal — narrowband, compressed, occasionally missing, sometimes only going one way. Most "it worked yesterday" voice bugs live in that gap.

I build real-time voice agents that run on actual phone numbers, so I spend a lot of time in this gap. Here is what the phone network does to your audio, why the demo never showed you, and where it bites.

## The audio is narrowband and compressed before your STT ever sees it

Your laptop mic gives you wideband audio, typically 16 kHz, often more. A phone call does not. The public switched network and most SIP trunks carry voice at 8 kHz sampling, band-limited to roughly 300–3400 Hz, and encoded with a telephony codec — μ-law (G.711) in North America, or something lossier like G.729 if a carrier in the path decided to save bandwidth.

That is not a small quality knob. You are handing your speech recognizer half the sample rate and a chopped frequency band. Everything above ~3.4 kHz is gone, which is exactly where a lot of consonant energy lives. The fricatives that separate "s" from "f", the plosive burst that distinguishes "p" from "t" — a good chunk of that information got filtered out at the carrier before a single packet reached you.

Two things fall out of this in practice. First, your STT accuracy on phone audio will not match your accuracy on mic audio, and no amount of prompt tuning fixes it because the information is physically absent. Pick a recognizer and a model that is actually trained on or tuned for 8 kHz telephony audio rather than assuming your wideband numbers transfer. Second, do not upsample 8 kHz to 16 kHz and pretend. Upsampling adds samples, not information — you get a 16 kHz-shaped array that still only contains 8 kHz of signal. If your STT expects 16 kHz, resample honestly and tell the model what it is getting; if it has a native 8 kHz path, prefer that.

The codec matters too. μ-law is lossy but consistent, and most good STT handles it fine when you decode it correctly. The failure I see more often is a decoding mistake: treating μ-law bytes as linear PCM, or getting the endianness wrong on the decode. That does not sound like "slightly worse audio," it sounds like static, and your STT confidence cliffs to nothing. When accuracy is inexplicably terrible on live calls but fine on recordings you exported, suspect the decode path first.

## Packets get lost and arrive out of order, and the jitter buffer trades latency to hide it

Media on a call rides RTP over UDP. UDP does not retransmit and does not guarantee order, which is the right choice for real-time audio — a late packet is useless, you would rather skip it than wait. But it means two things are always happening on a real call that never happen on localhost: some packets never arrive (loss), and the ones that do arrive show up with uneven spacing (jitter).

The standard fix is a jitter buffer: hold incoming packets for a few frames so you can reorder them and smooth out the uneven arrival before handing a steady stream to the decoder. This works. It also costs you latency, because every millisecond of buffer is a millisecond you are deliberately delaying the audio to wait for stragglers. That is the trade nobody mentions in the demo — the buffer that makes the audio sound smooth is directly adding to the round-trip time your caller feels before the agent responds.

If you are running your own media handling rather than letting a provider terminate it, you are making this trade explicitly. Illustrative sketch of the shape of it — a small adaptive buffer that widens when the network is choppy and tightens when it is clean:

```python
# ILLUSTRATIVE — shape of an adaptive jitter buffer, not tuned values
class JitterBuffer:
    def __init__(self, target_ms, max_ms):
        self.target_ms = target_ms      # normal hold time
        self.max_ms = max_ms            # cap so latency stays bounded
        self.buf = {}                   # sequence_number -> frame

    def push(self, seq, frame, arrival_jitter_ms):
        self.buf[seq] = frame
        # widen the buffer under jitter, tighten it when the link is clean.
        # more buffer = fewer gaps but more delay. that is the whole tradeoff.
        if arrival_jitter_ms > self.target_ms:
            self.target_ms = min(self.target_ms * 1.5, self.max_ms)

    def pop(self, expected_seq):
        frame = self.buf.pop(expected_seq, None)
        if frame is None:
            return self.conceal()   # packet lost or not here yet: hide the gap
        return frame

    def conceal(self):
        # play comfort noise or repeat the last frame rather than a hard click.
        # what you must NOT do is send silence and let STT think speech ended.
        ...
```

The part that matters for a voice agent specifically is that last method. When a packet is missing, whatever you feed the STT in its place is a decision. Feed it hard silence and your voice-activity detection may decide the caller stopped talking and trigger a turn end mid-sentence. Repeat the last frame or emit comfort noise and the recognizer keeps its place. Packet loss on a phone call is not just an audio-quality problem, it is a turn-taking problem, because your endpointing logic is downstream of the concealment choice.

If loss is the source of your noise floor problems, the threshold and endpointing work is the same work I wrote up in [tuning VAD for real conditions](/patterns/vad-tuning) — the mechanism is identical, the phone line just hands you worse inputs to tune against.

## One-way audio: the call connects, but only one leg has media

This one is genuinely nasty because everything looks fine. The SIP signaling completes, the call is "up," your logs say connected — and one side hears nothing. It is almost always a media-path problem, not a signaling one: RTP is trying to flow to an address or port that a NAT or firewall in the path is dropping, and because RTP is UDP with no handshake, nothing errors. The packets just go into a hole.

The tell is asymmetry. Your agent's STT receives zero audio frames while your outbound TTS is streaming out fine, or the reverse. You cannot detect this by watching the signaling state, because the signaling is happy. You detect it by watching the media itself — specifically, by noticing that inbound RTP has gone quiet while the call is still supposed to be live.

```python
# ILLUSTRATIVE — detecting a dead inbound media leg on a live call
import time

class MediaWatchdog:
    def __init__(self, silence_limit_s):
        self.last_inbound_frame_at = time.monotonic()
        self.silence_limit_s = silence_limit_s

    def on_inbound_rtp(self, _frame):
        self.last_inbound_frame_at = time.monotonic()

    def check(self, call_is_connected):
        if not call_is_connected:
            return
        quiet_for = time.monotonic() - self.last_inbound_frame_at
        if quiet_for > self.silence_limit_s:
            # signaling says connected but no media is arriving.
            # this is one-way audio, not a quiet caller. act on it:
            # renegotiate media, or drop and let the caller redial.
            self.on_one_way_audio_detected()
```

Note the distinction the watchdog has to make: no inbound RTP at all is different from RTP arriving that happens to be silence. A quiet caller still sends packets — they carry background hiss, comfort noise, low-level room tone. A dead media leg sends nothing, no packets, for the duration. Key on packet arrival, not on audio energy, or you will "fix" a one-way call every time someone stops to think for a couple of seconds.

## DTMF tones collide with speech

Callers press keys. Sometimes because you asked ("press 1 to confirm"), sometimes out of habit, sometimes by accident with their cheek. Those keypresses are DTMF — dual-tone multi-frequency — and how they reach you depends on the trunk. They might arrive as out-of-band signaling events (RFC 2833 / telephone-event), or they might be encoded as actual tones in the audio stream.

When they are in the audio stream, they land in your STT. A DTMF tone is two simultaneous pure sine waves sitting right in the voice band, and a speech recognizer has no idea what to do with that — best case it emits garbage tokens, worst case it wrecks the recognition of whatever the caller was saying at the same time. And people do talk and press at the same time.

Handle DTMF as its own channel, upstream of STT. If your provider gives you out-of-band DTMF events, take them and never let the tones into the recognizer's audio at all. If DTMF is inband on your trunk, detect and strip it before the audio reaches STT, and route the digit to your intent logic separately. The mistake is treating a keypad press as "just more audio" and hoping the language model sorts it out. It will not, and the collision degrades the surrounding words too.

## Echo and half-duplex: the agent hears itself

On localhost your input and output are cleanly separated. On a phone call, depending on the handset, the network, and any conferencing in the path, some of your agent's own outbound speech can bleed back into the inbound audio as echo. Now your STT is transcribing your TTS, your VAD thinks the caller is talking, and your barge-in logic fires on the agent's own voice.

Consumer phones and carriers do a lot of echo cancellation already, so this is not guaranteed to bite — but it is not guaranteed not to, and when it does the symptom is bizarre: the agent interrupting itself, phantom user turns, transcripts full of the bot's own script. If you support barge-in (letting the caller interrupt the agent mid-sentence, which you should), you need to be sure the "interruption" you detected is the caller and not a reflection of your own output. Echo cancellation and knowing what you are currently playing out — so you can discount it in the inbound path — is the defense. Do not assume the network handled it for you.

## The throughline

None of this is exotic. It is the baseline condition of running audio over a phone network, and every bit of it is invisible on localhost because localhost is a clean, lossless, full-duplex, wideband, codec-free path — which is to say, nothing like a phone call. The demo passing tells you the logic is right. It tells you almost nothing about whether the thing survives contact with SIP.

The move is to stop testing against clean audio the day you have a working pipeline. Get it onto a real number early, call it from a bad cellular connection, press keys while you talk, put yourself on speaker in a noisy room. The failures show up in minutes and they are always the same handful of things above.

I keep a voice agent live on a real phone line for exactly this reason — [it runs on the public line](/call), against real codecs and real packet loss, not a websocket to my laptop. If you are building one and hitting the wall between "works in the demo" and "works on the phone," [get in touch](/contact).
