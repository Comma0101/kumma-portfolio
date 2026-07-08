---
title: "Regression-testing a voice agent like software"
excerpt: "A one-line prompt or timer change can silently break a call flow. How to build a regression harness that replays real calls and asserts on structured output."
date: "2026-07-08"
author: "Kumma"
tags: ["Testing", "Voice AI", "Evals", "Reliability"]
category: "Engineering"
featured: false
---

A voice agent is software, and software you can't re-run is software you're guessing about. If you can't take yesterday's calls and replay them through today's pipeline, you have no way to know whether the prompt edit you shipped this morning quietly broke the way it handles a caller who changes their mind. So build the thing that lets you replay: a corpus of recorded calls and synthetic turns, pushed through the real pipeline, with assertions on the structured output the agent produces — not on the words it says.

That last part is the whole game. Most people who try to test a voice agent test the transcript, get flaky failures because the model phrased things differently, and give up. The fix is to assert on the resolved intent.

## Why a voice agent needs a regression harness at all

The failure mode is specific. You tweak one line in a prompt to fix how the agent handles allergies, ship it, and three days later you notice it stopped asking for the delivery address on to-go orders. Nobody touched the address logic. The prompt is one blob of instructions and the model reweighted everything when you added a sentence.

Same story with timers. Voice agents live and die on endpointing — the decision about when the caller is done talking. Nudge the silence threshold down by 200ms to make the agent feel snappier and you start cutting people off mid-sentence, which produces truncated transcripts, which produces wrong intents. The change looks local. The blast radius isn't.

You cannot catch this by hand. "I called it and it worked" tests one path through a system that has thousands, and it tests them against your own clean speech in a quiet room, which is the one input production never sends you. Over on [/benchmark](/benchmark) I run this same idea at scale as a public stress suite — but the version every team needs first is the small, boring one that runs on every commit.

## Fixtures: recorded calls plus synthetic turns

A fixture is one input and the structured output you expect from it. Two kinds are worth keeping.

Recorded real calls are the gold. Actual audio from actual callers, with the accents, the background kitchen noise, the cross-talk, the guy ordering while his kids yell. You store the audio and the intent a human confirmed was correct. These are irreplaceable because you can't invent the specific ways real people are ambiguous.

Synthetic turns fill the gaps. Some cases are rare in your recordings but you still need them covered — a caller who orders, cancels, then reorders something different; a phone number read back digit by digit with a correction halfway through. You can author these as transcripts and skip the audio, or generate speech for them if you want to exercise the recognition stage too. They're cheap, so write one for every edge case you can think of.

Here is the shape I use. It's deliberately plain — a fixture is data, not code.

```yaml
# fixtures/to-go-order-with-correction.yaml
id: to-go-order-with-correction
source: recorded            # or "synthetic"
audio: audio/0h3a1f.wav     # omit for transcript-only fixtures
transcript: |               # human-verified reference transcript
  uh yeah can I get two orange chickens
  actually make one of them kung pao
  and that's for pickup
expect:
  intent: place_order
  fulfillment: pickup
  items:
    - name: kung_pao_chicken
      qty: 1
    - name: orange_chicken
      qty: 1
  missing_fields: []        # nothing the agent should still be asking for
```

Note what's in `expect`: the resolved order, the fulfillment type, and what the agent should still consider missing. Not a single word the agent said out loud.

## Replaying audio or transcripts through the pipeline

The harness feeds each fixture through the same code path production uses. If the fixture has audio, you run it through recognition and then intent resolution — this catches regressions in endpointing, in the speech model, in the whole chain. If it's transcript-only, you inject the text after the recognition stage and test resolution in isolation, which runs faster and won't flake on audio.

Both matter. Audio replays are your integration tests; transcript replays are your unit tests. Keep the split.

```python
def run_fixture(fx, pipeline):
    if fx.audio:
        # full path: audio -> recognition -> intent resolution
        result = pipeline.run_audio(fx.audio)
    else:
        # skip recognition, test intent resolution directly
        result = pipeline.resolve_intent(fx.transcript)
    return result.ticket   # the structured order object
```

One rule: the harness must call the real pipeline, not a copy of it. The moment your test path forks from your production path, you're testing a system nobody ships.

## Asserting on structured output, not wording

The agent can say "sure, one kung pao and one orange chicken for pickup" or "got it — pickup order, kung pao plus orange chicken" and both are correct. If your assertion is a string match, both are failures, and you'll spend your life updating expected transcripts instead of catching bugs. So assert on the ticket.

```python
def assert_ticket(expected, actual):
    assert actual.intent == expected["intent"]
    assert actual.fulfillment == expected["fulfillment"]

    got = {(i.name, i.qty) for i in actual.items}
    want = {(i["name"], i["qty"]) for i in expected["items"]}
    assert got == want, f"items: got {got}, want {want}"

    # the agent should not still be asking for things it already has,
    # and should be asking for things that are genuinely missing
    assert set(actual.missing_fields) == set(expected["missing_fields"])
```

Compare items as a set because order doesn't matter. Check `missing_fields` because a common regression isn't a wrong order — it's an agent that resolves the order fine but forgets it still needs the pickup time, and sends a half-baked ticket to the kitchen.

For fields where the model legitimately has latitude, loosen the check on that field only — a semantic match, or a range — rather than dropping to a string compare for the whole ticket. Precision where you can afford it, tolerance only where you must.

## The three regressions this actually catches

**Prompt regressions.** You edit the resolution prompt and something unrelated shifts. The harness runs the full corpus and the two fixtures that now produce the wrong `fulfillment` light up before the change reaches a caller. This is the payoff that makes the whole thing worth building — prompts are global state, and this is your only defense against editing one.

**Timer and endpointing regressions.** Change the silence threshold or the barge-in behavior and replay the audio fixtures. If the new timing truncates a caller who pauses mid-order, the transcript comes out short and the resolved intent comes out wrong, and the fixture fails. You feel the cost of a timing change in the same run, not in next week's support tickets.

**Grounding regressions.** The agent is grounded against a menu — or a catalog, a policy doc, whatever your domain is. Update that source and a mapping can silently break, so "orange chicken" stops resolving to the real item. A fixture that asserts on the resolved item id catches it. This is the same discipline as [clarify before commit](/patterns/clarify-before-commit): the agent should map to a real thing or ask, and your tests should pin down which real thing.

## Every production failure becomes a fixture

This is the habit that compounds. When a call goes wrong in production — the agent mishears, resolves the wrong item, drops a field — you pull that call, confirm what the correct output should have been, and drop it into the corpus as a new fixture. Fix the bug, watch the fixture go green, and it stays green forever. That exact failure can't come back without a test screaming.

Do this for a few months and your corpus stops being a set of cases you imagined and becomes a map of every way your specific agent has actually failed. That's a far better test suite than anything you'd write up front, because reality picked the cases.

The synthetic turns cover what you can foresee. The recorded failures cover what you couldn't. You want both, and you want the second pile to keep growing.

## "It worked when I tried it" is not a test

It's an anecdote about one path on one input under conditions production never reproduces. A real test is one you can re-run on demand, that fails loudly when behavior changes, and that a teammate can trust without having been on the call with you. If your voice agent doesn't have that, every prompt edit is a bet you're placing blind.

Build the harness before you need it. The first time a one-line change would have silently broken a call flow and didn't, it's paid for itself.

If you're building a voice agent and want help standing up a regression harness that fits your pipeline, [get in touch](/contact).
