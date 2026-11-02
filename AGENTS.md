# Agent starting point

Read [HANDOFF.md](HANDOFF.md) before changing the project. It describes the current release, checkout, architecture, validation, and next starting point. [docs/PROJECT_LOG.md](docs/PROJECT_LOG.md) records history; it is not a replacement for the current handoff.

## Current product

- The live site is [kumma.me](https://kumma.me/). The canonical homepage is the rich eight-chapter paper-and-ink experience in `app/page.tsx` → `components/personal/Front.tsx`.
- The user explicitly prefers its continuous red line, variable typography, Chinese text, brushwork, and participatory interactions. Refine that design in place unless a different direction is explicitly requested.
- Consciousness and self-awareness are both central. Use [PRODUCT.md](PRODUCT.md) for personal truths and [DESIGN.md](DESIGN.md) for visual conventions. Do not invent beliefs, biographical events, credentials, spiritual attainment, or a theory of consciousness.
- The user is learning to draw; do not describe drawing as an established practice or professional identity.
- Projects belong under `/work`; writing belongs under `/notes`. Keep direct Work, Writing, and Email access. `/view` is a retained noindex comparison, not the chosen homepage.

## Workspace discipline

- Verify the repository root, branch, and status before edits. Start new work from the latest `origin/master` on an isolated branch.
- On this machine the maintained checkout is `/home/comma/Documents/kumma-portfolio/.worktrees/personal-retro`. The outer checkout and other worktrees contain older branches and potentially unrelated work. Do not reset, delete, or overwrite them as cleanup.
- `docs/archive/`, old rebuild/growth/planning notes, and historical memory are reference material. They do not override the current handoff or product/design decisions.
- Preserve unrelated user work. Trace imports before removing legacy code, dependencies, fonts, assets, or ink helpers. The retained experiment is deliberate.

## Build and validation

- Use the pinned npm project and lockfile. `npm run dev` uses port 4242; `npm run dev -- --port 4243` is the alternate when the static preview occupies 4242.
- Stop Next development before running a production build; both use `.next/`.
- Use `npm run lint`, `npm run typecheck`, and `npm test`. Run `npm run build` and `npm run audit:export` for release or route/export changes. See README for exact commands and the handoff for known legacy warnings.
- Use real-browser desktop/phone checks for visual changes, including visible keyboard focus, reduced motion, and readable no-JavaScript states. Preserve chapter IDs, measured anchors, and the distinction between source texts and personal interpretations.
- Generated `out/`, `.next/`, share images, dependencies, logs, and browser screenshots are not source to commit.

## Release and handoff

- Publishing to `master` triggers GitHub Pages. Keep external actions within the user's authorization; complete local validation before publication and verify both the workflow and live domain afterward.
- Maintain HANDOFF for current state and append verified outcomes to the project log. Never mark a deployment complete based only on a local build.
- The user often reviews from an iPhone over SSH. Provide a working public or forwarded preview URL; local `/tmp` screenshots are internal QA evidence, not a usable delivery link.
