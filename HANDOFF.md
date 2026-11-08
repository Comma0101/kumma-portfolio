# Project handoff

Last updated 2026-11-08. Read this first, then PRODUCT.md and DESIGN.md. The [project log](docs/PROJECT_LOG.md) preserves decisions and release evidence.

## What is live

- Public site: <https://kumma.me/>.
- Source: <https://github.com/Comma0101/kumma-portfolio>, production branch `master`.
- The rich personal-site replacement shipped through [PR #17](https://github.com/Comma0101/kumma-portfolio/pull/17), merge `41949da5473d60de4e8fb577c7f1430d50bb1730`.
- [Deployment run 41528963290](https://github.com/Comma0101/kumma-portfolio/actions/runs/41528963290) succeeded. Desktop/phone navigation, language editions, metadata, feed, sitemap, and retired-page handling were checked on the live domain.
- The original reviewed release commit is `57d9cc8312d62e5d84766ad6c6a3cc21734dccb3`. The previous engineering-site revision is `709e2ca0c3ee745f3b1daddbf2c3b4e59cc53063`, retained in Git history as the pre-replacement reference.
- Later documentation/cleanup commits build on that release. Use the current `origin/master` for new work rather than checking out a fixed historical SHA.

## Start in the correct checkout

On this machine, use:

```sh
cd /home/comma/Documents/kumma-portfolio/.worktrees/personal-retro
git status --short
git branch --show-current
git log -1 --oneline
```

That directory name comes from the original feature worktree; it is the maintained personal-site checkout. Before a new task, fetch the latest production reference and create a task branch from `origin/master`, preserving any existing work.

The outer `/home/comma/Documents/kumma-portfolio` checkout is an older `feature/immersive-redesign` workspace. Other immersive/shanshui worktrees also exist. Their files and branches are not part of cleanup here. Historical context in those checkouts can describe a different site.

## Settled design and editorial decisions

The user chose the eight-part paper-and-ink site over a shorter `/view` experiment. Preserve the red spine, large variable type, spiral portrait, participatory edit, practice marks, vertical Chinese text, and brush-written ending. Do not restart the rejected reduction to a portrait, a question, and a single excerpt.

Both consciousness and self-awareness matter, including experience/self/reality questions and attention to thoughts, emotions, habits, and choices. The user has since affirmed personal beliefs about imagination participating in reality and awareness observing the mental “I”, with an observer remaining. He describes humans as witnesses and participants. Finding his true self, cultivating himself, and engaging with the world with love give this inquiry its practical direction. PRODUCT records these as personal convictions, aspirations, and continuing questions. The user is learning to draw. Existing essays are dated positions whose present significance requires his account.

Projects, including KOTA, belong under Work. The main page has no featured project case study. Work, Writing, and Email are visible in the opening and available again at the end. Trading reminders retain their specific domain.

## Current design work

The user authorized the complete build, editorial decisions, and production deployment on 2026-11-08. The [personal-expression brief](docs/design/personal-expression-brief.md) records the expert-team review and independent challenge. The release candidate implements revision 2, with local source, build, and browser validation complete. Actions and public-domain verification are the remaining release gates.

Public identity wording uses his own beliefs, questions, and commitments. The philosophical influences discussed in discovery provide internal context. The release retains the Chinese chapter marks and final brush character as visual vocabulary, uses the authored awareness question in Reason, and keeps attributed reading references under Writing.

The revised proposal develops the rich paper/ink world through an actual reader contribution that remains recognisable in later compositions. Distinguish authored spine, reader mark, and typography, with a complete authored reading for people who skip interaction. Give beliefs, questions, dated writing, observations, and intentions different roles. Love remains the user's stated intention and guides accommodation and contact. The current prominent closing Follow action gives social following greater visual weight than that newly confirmed outward commitment.

The first connected prototype is implemented on `feat/personal-expression-prototype`. The eight chapters retain their structure with varied pacing, a compact phone opening, a dated extract from the existing emotion essay, an authored awareness question, and an outward love/contact composition. The Chinese chapter marks and final brush-written character remain part of the prototype's visual vocabulary. Main identity copy uses the user's own positions and intentions. The earlier sourced passage is available through the existing reading references.

`ContributionProvider` owns the latest completed contribution for the current homepage mount. `Agency` retains its finished outline, bounded centreline, bounds, and reader/pen source. `ContributionMark` renders the identical outline in Reason and the ending. A fresh mount begins with an authored composition. Drawing, the native pen action, skipped interaction, and reduced motion have complete paths. Typography and source labels accommodate a changed viewport without regenerating the selected mark.

Paper routes now use native scrolling. The shared smooth-scroll provider skips them and clears its scroller proxy on cleanup. This resolved a chapter-jump failure after text resizing. Headings reserve a small scroll margin. The new reflection caption sits outside the brush circle with reserved space, including at 320 px and enlarged text.

Local validation passed all 16 test-file subprocesses, lint with the five documented legacy warnings, standalone type checking, the 66-route production build, and export audit with 507 internal links / 42 legacy moves / zero broken destinations. Chromium checks covered distinct drawn strokes, keyboard pen action, emulated touch drawing, equal retained outlines, resizing, enlarged text, no-JavaScript reading, reduced motion, direct chapter entry, and return navigation. A focused interaction run on a desktop host with 4× CPU throttling recorded no long tasks. Physical iPhone/Safari and personal/emotional accuracy await user review.

The repaired temporary HTTPS review URL is <https://zum-operations-vote-answer.trycloudflare.com/>. The original tool-session preview stopped after the work turn, producing the user's reported 1033 error. The replacement server and tunnel are transient user services managed by systemd, independently of the tool session, with a 24-hour runtime limit.

The server serves the completed `out/` on 127.0.0.1:4242 with `X-Robots-Tag: noindex, nofollow`. Its source is `/tmp/kumma-expression-preview-server.py`. The tunnel uses `cloudflared tunnel --config '' --no-autoupdate --protocol http2 --url http://127.0.0.1:4242`. The explicit empty config avoids loading the machine's existing named-tunnel settings. Production runs `master` at kumma.me. No production release was made for this prototype.

Inspect these services with `systemctl --user status kumma-expression-preview kumma-expression-tunnel`. Retrieve the current URL from `journalctl --user -u kumma-expression-tunnel -o cat`. Stop this preview with `systemctl --user stop kumma-expression-tunnel kumma-expression-preview`. The preview service restarts on failure. Review or stop both services after the review window. The hostname is temporary and tied to the current tunnel. Keep the machine's unrelated named tunnel separate.

## Architecture map

| Area | Start here |
| --- | --- |
| Canonical homepage | `app/page.tsx`, `components/personal/Front.tsx` |
| Eight sections | `Opening`, `Agency`, `CatchUp`, `Steps`, `Practice`, `Rules`, `Line`, `Dao` in `components/personal/` |
| Chapter reflections/navigation | `chapters.ts`, `ChapterMark.tsx`, `MarginNav.tsx`, `Colophon.tsx` |
| Retained reader contribution | `Contribution.tsx`, `contribution.ts`, `Agency.tsx`, `ContributionMark.tsx` |
| Reflection and outward composition | `Line.tsx`, `Close.tsx`, `Encounter.module.css` |
| Visual system | `Front.module.css`, `type.ts`, local fonts |
| Ink and motion | `Thread.tsx`, `Ink.tsx`, `ink.ts`, `pen.ts`, `brush.ts`, `useBeat.ts`, `Portrait.tsx` |
| Auxiliary fonts/build reliability | `components/legacyFonts.ts`, `components/fonts/README.md` |
| Work | `app/work/`, `Work.tsx`, the four case-study components |
| Writing | `app/notes/`, `notes.ts`, `NoteViews.tsx`, `_posts/`, `_posts/zh/` |
| Shared page shell | `Shell.tsx`, `SectionNav.tsx`, `Paper.tsx` |
| Legacy addresses | `routes.ts`, `Moved.tsx`, `app/projects/[slug]/page.tsx` |
| Identity/search/social | `app/layout.tsx`, `app/page.tsx`, `components/seo/JsonLd.tsx`, `public/llms*.txt`, `scripts/generate-og.mjs` |
| Comparison experiment | `app/view/page.tsx`, `PerspectiveJourney.tsx`, `PerspectiveOpening.tsx` |
| Deployment | `.github/workflows/deploy.yml`, `next.config.mjs`, `public/CNAME` |

`chapters.ts` feeds both running heads and footer contents. Hardcoded ChapterMark labels must agree with it. The red spine measures specific section IDs and `data-anchor`/`data-thread` attributes; removing a section or anchor requires tracing that geometry first.

The older 3D components and assets are not the active homepage, but some remain shared or reachable. Their dependency graph has not been globally pruned. Do not delete them or remove dependencies solely because the homepage does not use them.

All font files are local. The paper faces remain under `components/personal/fonts/`; existing auxiliary Space Grotesk, Cormorant Garamond, and JetBrains Mono faces are configured in `components/legacyFonts.ts`. Their full source files, licenses, pinned provenance, and hashes live in `components/fonts/`. The Google-font build loader failed twice in the cleanup CI follow-up despite a successful cached local build, so the remote factory imports were replaced. Do not reintroduce build-time font downloads as incidental cleanup.

## Run and verify

Stack: Next.js 14.2.33, React 18.3.1, TypeScript, CSS Modules, GSAP, SVG/Canvas, and perfect-freehand. Use the checked-in npm lockfile. Python 3.9+ is needed for the static-export audit and existing authoring tools.

```sh
npm ci                         # fresh install only
npm run dev                    # port 4242
# or: npm run dev -- --port 4243

npm run lint
npm run typecheck
npm test

# Stop Next development before these commands:
npm run build
npm run audit:export
python3 -m http.server 4242 --bind 127.0.0.1 --directory out
```

Next development and production build share `.next/`; do not run them concurrently. A static server can serve the completed `out/`. Check ports before starting a server and stop only processes you own.

Cleanup aligned TypeScript with the tests' ES2020 target, added `npm run typecheck`, made the legacy ESLint configuration self-contained, and removed the conflicting flat-config entrypoint. Standard npm commands are the current interface; earlier special CLI flags in historical logs describe the release environment before this cleanup.

`npm run lint` currently passes with five existing warnings in legacy `AboutGallery.tsx`, `Animations/AnimationTwo.tsx`, `LiquidPortalTransition.tsx`, and `Logo3D.tsx` (image/hook guidance). They are not new cleanup regressions. Do not silence them globally or rewrite archived effects without tracing usage.

The production build skips ESLint, and the current deployment workflow runs the build rather than all local gates. Run lint/type/tests separately before publishing. The export audit checks real generated internal links, legacy destinations, metadata/JSON-LD, the retired project stub, sitemap/feed, identity summaries, and domain configuration.

For UI changes, inspect desktop and phone renders and exercise keyboard focus, chapter interaction, reduced motion, no-JavaScript reading, Work/Writing/contact, and Chinese/English switching. Allow the opening drawing to settle before judging a screenshot: the portrait has a deliberate drawing sequence and fallback delay. Element screenshots can capture fixed skip links outside their normal viewport position; verify actual focus and geometry before treating this as a UI defect.

## Compatibility and privacy

- Forty-two legacy paths have compatibility pages. The retired `/projects/market-systems/` address points generically to `/work/`; do not restore its retired content.
- Moved project slugs are included in static params independently of the public project list. Adding a map entry alone is insufficient if the export does not generate that path.
- `/view` remains noindex and is absent from the sitemap. Keep it separate from the chosen homepage.
- Contact uses the existing mailto flow. Browser QA must not send forms, email, or demo calls unless explicitly authorized.
- Generated share images, `out/`, `.next/`, dependencies, logs, and browser artifacts are ignored. `/tmp` evidence and tool session IDs are temporary, not a durable handoff interface.

## Cleanup and historical material

The unused KOTA-correction and how/why-emphasis prototype modules were removed after repository-wide reference checks. The active root and retained `/view` do not import them. A tracked development log was removed, and generated logs/browser scratch files are ignored.

The stale February `PROJECT_CONTEXT.json` is preserved at `docs/archive/PROJECT_CONTEXT.2026-02-12.json`. Old master plans, voice-AI growth/rebuild documents, and immersive specs remain historical references; [docs/README.md](docs/README.md) distinguishes them from current guidance.

## Where the next agent should start

Begin with the user's prototype feedback, a clean status check, PRODUCT/DESIGN, and the current design brief above. The user placed personal accuracy and visual expression ahead of growth work. Review the live temporary prototype and improve the compositions based on that feedback. The earlier launch audit left search indexing and real-user mobile performance unverified, and identified older demo/benchmark public promises for review before broad promotion. Those findings are separate from the completed release validation.

Keep this file current, append verified outcomes to the project log, and record what was actually tested. Publication is complete only after the workflow succeeds and the live domain serves the intended result.
