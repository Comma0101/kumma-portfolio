# Project handoff

Last updated 2026-11-08. Read this first, then PRODUCT.md and DESIGN.md. The [project log](docs/PROJECT_LOG.md) preserves decisions and release evidence.

## What is live

- Public site: <https://kumma.me/>.
- Source: <https://github.com/Comma0101/kumma-portfolio>, production branch `master`.
- The complete connected experience shipped through [PR #20](https://github.com/Comma0101/kumma-portfolio/pull/20), merge `2ba36b2118af397e18af6722ac81981827d4f8d0`.
- [Deployment run 42531658432](https://github.com/Comma0101/kumma-portfolio/actions/runs/42531658432) passed locked installation, lint/tests, build, generated-site verification, and deployment. The public domain serves the new personal belief, contribution fields, outward ending, and portrait fallback.
- The reviewed release head is `027080f9c411f0d5fca66b384758529f44e92311`. The original paper-site release remains in [PR #17](https://github.com/Comma0101/kumma-portfolio/pull/17). The previous engineering site is retained at `709e2ca0c3ee745f3b1daddbf2c3b4e59cc53063`.
- Later release-record commits build on the deployed implementation. Use the current `origin/master` for new work.

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

The user authorized the complete build, editorial decisions, and production deployment on 2026-11-08. The [personal-expression brief](docs/design/personal-expression-brief.md) records the expert-team review and independent challenge. The completed release implements revision 2 and has passed the production workflow. Source, build, and browser evidence is recorded in the project log.

Public identity wording uses his own beliefs, questions, and commitments. The philosophical influences discussed in discovery provide internal context. The release retains the Chinese chapter marks and final brush character as visual vocabulary, uses the authored awareness question in Reason, and keeps attributed reading references under Writing.

The revised proposal develops the rich paper/ink world through an actual reader contribution that remains recognisable in later compositions. Distinguish authored spine, reader mark, and typography, with a complete authored reading for people who skip interaction. Give beliefs, questions, dated writing, observations, and intentions different roles. Love remains the user's stated intention and guides accommodation and contact. The current prominent closing Follow action gives social following greater visual weight than that newly confirmed outward commitment.

The connected experience is on `master`. The eight chapters retain their structure with varied pacing, a compact phone opening, a dated extract from the existing emotion essay, an authored awareness question, and an outward love/contact composition. The Chinese chapter marks and final brush-written character remain visual vocabulary. Main identity copy uses the user's own positions and intentions. The earlier sourced passage is available through the existing reading references.

`ContributionProvider` owns the latest completed contribution for the current homepage mount. `Agency` retains its finished outline, bounded centreline, bounds, and reader/pen source. `ContributionMark` renders the identical outline in Reason and the ending. A fresh mount begins with an authored composition. Drawing, the native pen action, skipped interaction, and reduced motion have complete paths. Typography and source labels accommodate a changed viewport without regenerating the selected mark.

Paper routes use native scrolling. The legacy smooth-scroll integration uses the document's native position without a custom proxy, so recovery into a paper route leaves no destroyed-scroller callbacks. Headings reserve a small scroll margin. The reflection caption sits outside the brush circle with reserved space, including at 320 px and enlarged text.

Shared beats, the first chapter mark, Thread, and Portrait respond to live motion preferences. Calibration preserves displayed type, rebuilds after real width/font changes, and cancels pending work on disposal. The no-JavaScript portrait is generated from the same data and spiral functions during prebuild. Opaque noscript markup prevents a duplicate image download for JavaScript visits. The share card uses the name, spiral face, and red horizon.

Validation passed all 16 test-file subprocesses, lint with the five documented legacy warnings, standalone type checking, the 66-route production build, and export audit with 507 internal links / 43 legacy moves / zero broken destinations. Chromium checks covered distinct drawn strokes, keyboard pen action, emulated touch drawing, equal retained outlines, resizing, enlarged text, no-JavaScript reading and face, reduced motion, live preference changes, calibrated type registration, direct chapter entry, and not-found recovery. A focused interaction run on a desktop host with 4× CPU throttling recorded no long tasks. Physical iPhone hardware and human recall/emotional response remain follow-up evidence.

The public review and delivery URL is <https://kumma.me/>. The temporary tunnel was an interim preview. Its user services are `kumma-expression-preview` and `kumma-expression-tunnel`. Inspect their state before reusing port 4242, and stop only these preview services when they are no longer needed. Keep the machine's unrelated named tunnel separate. The project log preserves the 1033 repair history.

## Architecture map

### Map Art

The new artwork surface is `/work/map-art/`, with an image-led entrance in Work. Its two compositions explore the user's confirmed interest in belonging through places people are from, formerly lived, and live now. The examples use Amsterdam and Los Angeles-area street geometry with explicitly imagined histories. Personal motives are recorded in PRODUCT.

Start with `MapArt.tsx`, `MapArtPrint.tsx`, `mapArt.ts` and `MapArt.module.css`. The shared `mapArt.ts` composition definitions also drive the downloadable SVGs. Four lossless city-layer WebPs are reused across the two studies. Native no-JavaScript and reduced-motion readings show the finished images. The bounded arrival responds to live motion changes and cleans up its observer, media listener and timer.

Assets and provenance are committed under `public/art/map-art/`. Source packs came from the separate `/home/comma/Documents/map-art` project, which was read without modification. Reproduce assets with `node scripts/generate-map-art.mjs /path/to/map-art` from this portfolio checkout. That authoring command needs Python/Pillow and reuses the map project's decoder, projection and topology-selected handwriting. Ordinary site builds use the committed assets.

The SVGs carry visible OpenStreetMap/ODbL attribution and illustrative-history labels. The portfolio export audit checks the route, Work link, metadata, sitemap, image signatures, downloads and visible credit. The external map runtime and general city availability still require separate verification. The sound visualizer remains in algorithm development.

### Existing site

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

The production build skips ESLint. The deployment workflow runs locked installation, lint/tests, build, type checking and export audit as separate gates. Run those checks locally before publishing. The export audit checks real generated internal links, legacy destinations, metadata/JSON-LD, the retired project stub, sitemap/feed, identity summaries, domain configuration and the Map Art surface.

For UI changes, inspect desktop and phone renders and exercise keyboard focus, chapter interaction, reduced motion, no-JavaScript reading, Work/Writing/contact, and Chinese/English switching. Allow the opening drawing to settle before judging a screenshot: the portrait has a deliberate drawing sequence and fallback delay. Element screenshots can capture fixed skip links outside their normal viewport position; verify actual focus and geometry before treating this as a UI defect.

## Compatibility and privacy

- Forty-three legacy paths have compatibility pages. The retired `/projects/market-systems/` address points generically to `/work/`; do not restore its retired content. `/call/` moves to the KOTA project. The benchmark is an unreleased draft with accurate metadata, no Dataset claim, noindex, and no sitemap entry.
- Moved project slugs are included in static params independently of the public project list. Adding a map entry alone is insufficient if the export does not generate that path.
- `/view` remains noindex and is absent from the sitemap. Keep it separate from the chosen homepage.
- Contact uses the existing mailto flow. Browser QA must not send forms, email, or demo calls unless explicitly authorized.
- Generated share images, `out/`, `.next/`, dependencies, logs, and browser artifacts are ignored. `/tmp` evidence and tool session IDs are temporary, not a durable handoff interface.

## Cleanup and historical material

The unused KOTA-correction and how/why-emphasis prototype modules were removed after repository-wide reference checks. The active root and retained `/view` do not import them. A tracked development log was removed, and generated logs/browser scratch files are ignored.

The stale February `PROJECT_CONTEXT.json` is preserved at `docs/archive/PROJECT_CONTEXT.2026-02-12.json`. Old master plans, voice-AI growth/rebuild documents, and immersive specs remain historical references; [docs/README.md](docs/README.md) distinguishes them from current guidance.

## Where the next agent should start

Begin with the next user request, a clean status check, PRODUCT/DESIGN, and the current design brief. The user authorized the completed release. Preserve its personal truth and rich visual vocabulary. The earlier launch audit left search indexing and real-user mobile performance unverified. The unverified demo promise and benchmark metadata have been resolved. Growth/account setup and physical-device evidence are follow-up work.

Keep this file current, append verified outcomes to the project log, and record what was actually tested. Publication is complete only after the workflow succeeds and the live domain serves the intended result.
