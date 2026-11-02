# Project log

This file records decisions and release results. Preserve completed entries as history and append later outcomes rather than rewriting the sequence. [HANDOFF.md](../HANDOFF.md) is authoritative for the current checkout, active work, cleanup status, and next steps. Product and visual conventions live in [PRODUCT.md](../PRODUCT.md) and [DESIGN.md](../DESIGN.md).

## 2026-11-02 — Personal site replacement

### Editorial and design decisions

- The site’s purpose became explicit: people finding Kumma should encounter his perspective and inquiry, with software and writing as parts of his life.
- Both consciousness and self-awareness are central. Consciousness concerns experience, the self, and their relation to reality; self-awareness concerns noticing thoughts, emotions, habits, and choices.
- These interests do not establish a theory of consciousness, religious affiliation, or spiritual attainment. Wording preserves commitments alongside open questions.
- Kumma is learning to draw. Website artwork does not establish a drawing practice or an artist identity.
- Search descriptions, social metadata, Person/WebSite structured data, share-image wording, and AI summaries were aligned with the inquiry-first account.
- The `/view` experiment explored a spiral portrait, a personal introduction, a KOTA correction example, and an essay passage. KOTA was subsequently removed from that main journey because a project case study was taking over the personal introduction.
- A compact `/view` revision retained the portrait, awareness question, one dated writing excerpt, and onward links. Comparing it with the richer site exposed an overcorrection: too much human progression and visual expression had been removed.
- Kumma explicitly preferred the richer site. The eight-chapter paper-and-ink experience at `/` was chosen as the primary site and refined in place. `/view` was retained as a noindex comparison experiment.
- The main narrative preserves 名, 主, 知, 步, 習, 律, 理, and 道: Name, Agency, Understanding, Steps, Practice, Measure, Reason, and The way.
- Continuous red ink, participatory editing, variable typography, practice strokes, vertical Chinese text, and the brush-written ending remain the visual grammar. The refinement did not replace them with a shorter abstract introduction.
- Supporting language now treats agency, embodiment, recurrence, and interpretation as ongoing tensions rather than a completed personal transformation.
- The three trading reminders remain explicitly situated in trading. Their accompanying question examines the limits of rules rather than prescribing those reminders for every part of life.
- The English chapter reflections are personal writing informed by classical texts, not character etymologies or translations. Earlier etymological material remains labelled historical in `docs/chapters-shuowen.md`.
- KOTA and other project showcases belong under Work. Writing retains complete essays and their source context; visual studies remain website craft.
- Work, Writing, and Email became directly reachable from the opening, with contact paths repeated in the footer. Shared page-shell links return to `/`.
- Compatibility was preserved for 42 legacy addresses, including a generic path to Work for the retired market-systems project address.

### Release identity

| Item | Recorded value |
| --- | --- |
| Previous production revision | `709e2ca0c3ee745f3b1daddbf2c3b4e59cc53063` — `fix: isolate mobile menu background` |
| Prepared release revision | `57d9cc8312d62e5d84766ad6c6a3cc21734dccb3` — `feat: prepare the personal paper-and-ink site for release` |
| Production pull request | PR #17 |
| Production merge revision | `41949da5473d60de4e8fb577c7f1430d50bb1730` — `Replace the engineering homepage with Kumma’s personal site` |
| GitHub Actions deployment run | `41528963290` — success |
| Public site | [kumma.me](https://kumma.me/) |

PR #17 was merged and the deployment run succeeded. The publishing agent validated the live domain after deployment. These are release results, separate from the later documentation and cleanup follow-up.

### Verification recorded for the release

- `npm test`: 15 test-file subprocesses passed. This count describes the repository’s current test runner output, not the larger counts in older planning notes.
- Standalone TypeScript validation used `./node_modules/.bin/tsc --noEmit --incremental false --target es2020`.
- Scoped ESLint used the local configuration with `--no-eslintrc --config .eslintrc.json`, avoiding the inherited parent-checkout plugin conflict in nested worktrees.
- The production build exported 66 routes; 506 internal links and 42 legacy addresses were checked.
- Browser verification covered desktop and phone layouts, chapter interaction and keyboard alternatives, reduced-motion and no-JavaScript reading, primary destinations, contact access, and language editions.
- Exported metadata, structured data, social images, and the retained `/view` noindex status were checked.
- Live validation followed the successful GitHub Pages deployment rather than treating a local build as proof of publication.

These checks describe this release. Re-run the relevant checks after later changes; the production build skips ESLint, so lint remains a separate gate.

## 2026-11-02 — Handoff and cleanup follow-up

After publication, the user requested a Markdown handoff, a project log, and cleanup so another agent could continue reliably.

The follow-up established a single starting path: root `AGENTS.md` → `HANDOFF.md`, supported by README, PRODUCT, DESIGN, this log, and a documentation index. The outer local checkout's agent entry now points at the maintained personal-site worktree rather than resuming its older immersive branch.

Verified cleanup:

- Removed the unreferenced `KotaCorrection` and `ReadingEmphasis` TSX/CSS pairs. The rich homepage and retained `/view` do not import them.
- Removed tracked `dev.log`; ignored development logs and browser scratch output.
- Moved the February `PROJECT_CONTEXT.json` snapshot into `docs/archive/` with its bytes unchanged, and labelled prominent old plans/debug notes as historical.
- Removed the invalid duplicate flat ESLint entrypoint and set the active legacy configuration's `root` flag, fixing parent-checkout configuration inheritance.
- Aligned the TypeScript target to ES2020 and added `npm run typecheck`, eliminating the earlier target override.
- Preserved the successful export validation as `scripts/audit-static-export.py` and `npm run audit:export` so later agents can reproduce it.
- Preserved the other worktrees, shared visual helpers, fonts/source assets, and legacy 3D code rather than attempting an untraced global deletion.

Local verification passed: standard lint (five documented pre-existing legacy warnings), type checking, all 15 test-file subprocesses, a 66-route production build, and the export audit's 506 internal links / 42 legacy moves with no broken targets. Current-document Markdown links resolved, and the archived context was verified byte-identical. Subsequent commit, pull-request, and workflow history identify publication of this follow-up; these local checks alone do not assert deployment success.
