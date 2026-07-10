---
title: "Evals over vibes: testing AI systems like software"
excerpt: "It worked when you tried it is not a test for any LLM system. Here is how to build an eval discipline that catches prompt, model, and retrieval breaks."
date: "2026-07-08"
author: "Kumma"
tags: ["Evals", "AI systems", "Reliability", "LLM"]
category: "Engineering"
featured: false
---

If you can't re-run yesterday's inputs through today's system and check the result, you don't have a test — you have a memory of a demo that went well. The discipline that fixes this is evals: a corpus of fixtures, each pairing an input with the structured outcome you expect, run through the real system on every change. It works the same whether the system is a voice agent, a retrieval pipeline, or a multi-step agent, and it is the difference between shipping on evidence and shipping on vibes.

Most LLM systems ship on vibes. Someone types a few prompts into the thing, it answers well, and that gets called testing. Then a model version bumps, or a prompt gets a sentence added, or the retrieval index gets rebuilt, and something three features away quietly breaks. Nobody notices until a user does.

## Why "it worked when I tried it" isn't a test

It's an anecdote about one input, on one path, under conditions you picked. LLM systems are the worst possible place to trust that, because the thing you're testing is non-deterministic and globally coupled. A prompt is one blob of instructions, and the model reweights all of it when you change a line. So a fix to how the system handles refunds can shift how it handles cancellations, and you'd never guess the two were connected.

A real test is one you can re-run on demand, that fails loudly when behavior changes, and that a teammate can trust without having watched you run it. If your LLM product doesn't have that, every prompt edit and every model bump is a bet you're placing blind.

The reason people skip it is that LLM output looks hard to assert on. It's text, it varies, string matching flakes constantly. So they conclude the system is untestable and fall back to eyeballing. That conclusion is wrong, and the rest of this post is why.

## The fixture is the unit

A fixture is one input paired with the structured outcome it should produce, plus tags so you can slice results by scenario later. It's data, not code — plain enough that a non-engineer on the team can author and verify one.

The shape barely changes across domains. For a support agent it's a user message and the resolved action. For a retrieval system it's a query and the facts the answer must contain. For a classifier it's a document and the label. Here's a general one:

```yaml
# fixtures/refund-past-window.yaml
id: refund-past-window
source: recorded            # a real conversation we saw in production
tags: [refunds, policy-edge, out-of-window]
input: |
  I want a refund on order 4471, I bought it six weeks ago
expect:
  intent: request_refund
  decision: deny
  reason_code: outside_return_window   # the policy fact it must ground to
  escalated: false
  missing_fields: []        # nothing it should still be asking the user for
```

Note what lives in `expect`: the resolved decision, the policy fact it grounded to, whether it escalated, and what it should still consider missing. Not a single word of the reply. The wording is the model's business. The outcome is yours to pin down.

Two kinds of fixtures earn their keep. Recorded ones — real inputs you actually saw — are the gold, because you can't invent the specific ways real users are ambiguous. Synthetic ones cover the edges you can foresee but rarely see: the user who asks for a refund, changes their mind, then asks about a different order in the same turn. Write those by hand; they're cheap.

## Assert on structured output, not wording

This is the whole game, and it's where most attempts die. The system can say "I've processed that refund" or "done — your refund is on its way" and both are correct. If your assertion is a string match, both are failures, and you'll spend your life updating expected transcripts instead of catching bugs.

So make the system produce a structured object — an intent, a decision, resolved fields, a set of retrieved sources — and assert on that.

```python
def assert_outcome(expected, actual):
    assert actual.intent == expected["intent"]
    assert actual.decision == expected["decision"]
    assert actual.reason_code == expected["reason_code"]

    # a refund system that denies correctly but forgets to escalate
    # the angry edge case is still a regression
    assert actual.escalated == expected["escalated"]

    # it should not still be asking for things it already has
    assert set(actual.missing_fields) == set(expected["missing_fields"])
```

For fields where the model legitimately has latitude — a free-text summary, a paraphrased answer — you don't drop to a string compare. You loosen the check on that one field: a semantic-similarity threshold, or a graded rubric (below), while the rest of the object stays exact. Precision where you can afford it, tolerance only where the task genuinely allows it.

## Graded rubrics vs golden sets

Two grading styles, and you want both because they catch different things.

A golden set is exact-match assertion: the outcome is right or it's wrong, no partial credit. Use it wherever the correct answer is unambiguous — an intent label, a routing decision, a resolved order, a policy code. Most of your fixtures should be golden, because a hard pass/fail is what lets you block a bad change in CI without a human reading anything.

A graded rubric scores an open-ended output against criteria — did the answer cite the right source, did it stay on policy, was it complete — often with a second model as the judge. Use it where there's no single right string: summaries, explanations, multi-turn conversations. The catch is that a model judge is itself a non-deterministic system, so you calibrate it against a handful of human-labeled cases before you trust it, and you keep the rubric criteria concrete ("names the return window in days") rather than vague ("is helpful"). A vague rubric is just vibes with extra steps.

Rule of thumb: golden for anything you can make discrete, rubric for the genuinely open-ended, and push as much as you can into the golden pile.

## The regressions this actually catches

Three failure modes, all invisible to hand-testing, all caught by a corpus that runs on every change.

**Prompt regressions.** You edit one instruction and something unrelated shifts, because the prompt is global state. The harness runs the full corpus and the two fixtures that now produce the wrong decision light up before the change reaches a user. This alone justifies the whole thing.

**Model regressions.** The provider ships a new version, or you switch models to cut latency. It's better on average and worse on the exact edge cases your product depends on. Without a corpus you find out from users. With one, you diff the two models over the same fixtures and see precisely which behaviors moved.

**Retrieval and grounding regressions.** The system is grounded against something — a knowledge base, a product catalog, a policy doc. You rebuild the index or update a document, and a mapping silently breaks, so a query stops surfacing the right fact. A fixture that asserts on the retrieved source id or the grounded field catches it. This is the same discipline whether the grounded thing is a restaurant menu or a compliance policy.

## Wire it into CI or it won't hold

An eval suite you run by hand when you remember is a suite you'll stop running the week you're busy. The point is to make it impossible to merge a change that breaks known-good behavior, which means it runs on every pull request, and a failure blocks the merge the same way a broken unit test does.

```yaml
# .github/workflows/evals.yml — illustrative
name: evals
on: [pull_request]
jobs:
  run-evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: python -m evals.run --corpus fixtures/ --report report.json
      # non-zero exit on any golden-set failure or rubric score
      # below threshold, so a prompt edit can't merge red
```

Two things make this hold in practice. First, every production failure becomes a fixture: when the system gets something wrong, you pull that input, confirm the correct outcome, and drop it into the corpus. Fix the bug, watch it go green, and that exact failure can't come back without a test screaming. Do this for a few months and your corpus stops being cases you imagined and becomes a map of every way your system has actually failed.

Second, you accept that some fixtures are probabilistic. A flaky assertion on a non-deterministic system isn't always a bug — sometimes it's a fixture that needs a threshold instead of an equality, or a rubric instead of an exact match. Tune the assertion to the real variance; don't paper over a real regression by loosening everything.

## A voice agent is this discipline under a hard constraint

I build real-time voice agents, and everything above is exactly how I test them — [regression-testing a voice agent](/regression-testing-a-voice-agent) is this same corpus with audio fixtures instead of text. Voice is just the hardest version of the general problem. You get all of it — non-determinism, prompt coupling, grounding, model bumps — plus a hard real-time constraint that adds two things nothing else has: a speech-recognition stage that can mangle the input before the model ever sees it, and a latency ceiling where a correct answer that arrives two seconds late is a failure. So the fixtures carry audio and a latency budget, and the assertions check timing alongside the resolved outcome. Same discipline, more surface area. If you can build an eval harness that survives a phone line, retrieval and agent evals feel roomy by comparison.

That transfer runs the other way too. [ARCHON](/projects/archon), my agent-orchestration work, is not voice at all — it routes across models, delegates to worker agents, and gates consequential actions behind approvals. It needs the same discipline: a fixture is a task and the trace of decisions it should produce, and you assert on whether the orchestrator routed, delegated, and stopped where it should. Different surface, identical spine.

The eval discipline is the transferable skill. Voice, retrieval, agents, plain single-prompt features — they're all LLM systems, and none of them are testable by hand. The corpus is what makes them software instead of a demo you keep re-running and hoping. I go deeper on the harness design in [the eval-harness pattern](/patterns/eval-harness), and I run a public version of this idea at scale over at [/benchmark](/benchmark).

Build the corpus before you need it. The first time a one-line prompt change would have silently broken production and a fixture caught it instead, it's paid for itself. If you're shipping an LLM system and want help standing up an eval discipline that fits it, [get in touch](/contact).
