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

## 2026-11-02 — Follow-up font build failure

The handoff cleanup merged through PR #18 as `a634ffdfa6fcbf3f610e6e5fa397b837ecb653de`. Its GitHub Actions run `41536305675` failed at the production build on two attempts, before artifact upload or deployment. The live site continued serving the successful personal-site release.

Both failures came from Next 14's Google-font loader: an unchecked extension regex returned null. The first log named the legacy KOTA detail component; the retry also named the root layout and an active case study. The exact unexpected font URL was not logged. Local builds had succeeded, so a warm local font cache was insufficient evidence of CI reproducibility.

The repair replaces all eleven `next/font/google` import sites with a shared local-font configuration. It preserves the existing Space Grotesk, JetBrains Mono, and normal/italic Cormorant Garamond families, requested weight ranges, CSS variables, swap behavior, and serif fallback. Official unmodified variable font files and OFL licenses are pinned to Google Fonts commit `2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc`, with hashes in `components/fonts/README.md`. The main paper site's Sprat, Junicode, and CJK fonts are unchanged. Later verification and workflow history establish publication of this repair.

Local repair verification passed lint, type checking, all 15 test-file subprocesses, a build with the old `.next/` cache moved aside, and the export audit. Desktop/phone homepage, a case study, and a Chinese note retained their expected Sprat/Junicode/CJK computed fonts, with no overflow, runtime errors, remote-font requests, or auxiliary-TTF requests in those checked paper pages. Auxiliary faces are deferred until a style actually uses them.

## 2026-11-08 — Personal clarification and expert design review

Before proceeding with promotion, the user asked whether the site represented him sufficiently. A bounded read-only review of selected project briefs found additional interests in companionship, sensory environments, games, computational artwork, practical AI systems, and commercial experiments. Project documents establish development choices and interests. Their personal meaning and contribution history require the user's account.

The user then affirmed that imagination participates in reality both ontologically and through choices/actions, with physical laws operative. He distinguished the mental “I” from observing awareness and affirmed that an observer remains. He accepted humans as witnesses and participants, and stated his direction as finding his true self, cultivating himself, and interacting with the world with love.

The user requested that the named philosophical inspirations stay in the background of the team's understanding. Public positioning should express his own beliefs, questions, and intentions. Actual quotations retain source attribution wherever presented. Their role in the homepage's next composition requires editorial review.

At the user's request, three specialist agents reviewed art direction, typography/motion, and editorial philosophy. They identified repeated chapter pacing, delayed phone introduction, and the dominant final Follow action as the principal opportunities. Their proposal develops the incumbent paper, ink, and type system through a composed opening, material transformation, and an outward encounter. PRODUCT records the clarified personal material. HANDOFF points to the [proposed design brief](design/personal-expression-brief.md).

This pass produced documentation and a design proposal. Its new compositions, suggested wording, and interactions await visual review. The released UI and metadata remain at the production implementation. The earlier launch audit left actual search indexing and real-user mobile performance unverified and identified older demo/benchmark promises for review before broad promotion.

## 2026-11-08 — Independent challenge of the design plan

The user asked whether the plan could improve before implementation. Three fresh agents independently challenged its originality, personal accuracy, and implementation feasibility. They found that the proposed portrait formation, material type, and closing curve could remain separate familiar gestures. Several mechanisms already exist in the shipped site. The proposed timings preceded actual composition tests, and the new contribution's ownership and continuity needed definition.

Revision 2 of the [design brief](design/personal-expression-brief.md) develops an actual reader stroke that remains recognisable when its relation to the authored text and line changes. It distinguishes the authored spine, reader contribution, and type, defines current-visit state and skipped/button/drawn behaviour, and calls for changed contexts with honest attribution. Love remains the user's continuing intention, supported by accommodation and contact. Content roles now distinguish beliefs, live questions, dated writing, observations, and commitments. An exact, visibly dated extract from the existing emotion essay is a candidate for the first study, with its current significance awaiting user review.

The development sequence now begins with an eight-part composition study and a thin connected interaction passage. Still-state quality, recognition of different contributions, ordinary reading when participation is skipped, interruption/resize handling, phone layout, font coverage, and measured runtime work are explicit rejection tests. Timing will be calibrated during visual iteration. PRODUCT and HANDOFF point to this revised sequence.

A second review of the revision clarified two implementation requirements. Retain each selected stroke's completed rendered outline alongside its centreline so brush parameters preserve their visible result. Separate reduced-motion preference from participation, keeping drawing and the native pen action available with immediate state changes. The current implementation couples those concerns, so this is part of the proposed prototype work.

This pass updates planning documents. The central mechanism, emotional effect, and personal accuracy still require prototype and user evidence.

## 2026-11-08 — Connected expression prototype

The user authorized implementation of the revised plan. The prototype was built on `feat/personal-expression-prototype` from the reviewed planning commits. It keeps the eight-part paper/ink structure, direct Work/Writing/Email access, and project separation.

Implemented work includes a phone opening with name, face, question, and personal belief in the first screen; varied questions/observations/intentions in the chapter reflections; a dated exact extract from *On Emotions*; an authored awareness question and open brush field; and an outward love/contact composition. The Chinese chapter marks and final brush-written character remain visual material. The main quoted reading passage moved out of the primary narrative, with attributed reading references available under Writing. Homepage/social/Person descriptions, AI summaries, and share-image wording were aligned with the user's personally attributed beliefs and aspirations.

The completed reader or pen outline is retained with its centreline, bounds, and source in current-homepage-mount state. The identical outline appears in Agency, Reason, and the ending. Pointer sampling and rendering are bounded, local marks resize proportionally, and context updates happen on completed gestures. Reduced-motion users retain drawing and keyboard/button participation with immediate outcomes. Skipping the intervention leaves the prose and authored ending complete.

Independent finish review confirmed recognition of the same zigzag and honest source labels at desktop and phone widths. Root review fixed a caption/brush overlap at 320 px. The production-export stress check found a native chapter jump conflict with the global virtual scroller after text resizing. Paper routes now skip the smooth-scroll provider, clear its proxy on cleanup, and use a heading scroll margin. Cold links, chapter clicks, and resize-followed links subsequently landed 32 px below the viewport top in both motion modes.

Validation passed all 16 test-file subprocesses, standard lint with five existing legacy warnings, standalone type checking, 66-route production build, and the export audit's 507 internal links / 42 moves / zero broken targets. A parallel typecheck initially raced the build's generated `.next/types`; serial verification after the build passed. Chromium interaction checks on both development and production exports covered two distinct mouse strokes, keyboard pen action, emulated touch drawing, identical source/echo outlines, resizing to 320 px, enlarged text, no-JavaScript reading, and reduced motion. A tall-loop check verified outline identity and caption clearance. A focused interaction run at 4× CPU throttling recorded no long tasks on the desktop test host. An earlier combined resize stress run recorded an 81 ms task before the native-scroll correction; physical-device performance remains unverified.

A temporary Cloudflare Quick Tunnel serves the completed export for phone review, with indexing disabled by response header. Public HTTPS browser checks returned 200, matched all three contribution outlines, showed no overflow or page errors, and navigated to Writing. HANDOFF records its URL and process commands. This is a review preview. Personal/emotional accuracy, the chosen dated excerpt's present significance, and physical iPhone/Safari await the user's assessment.

## 2026-11-08 — Repair of the temporary preview connection

The user reported error 1033. Inspection found that both preview processes started through tool sessions had ended. The local port refused connections, and the original public hostname returned HTTP 530. The tool-session lifetime was insufficient for the delivered review link.

The existing export is now served through transient user services `kumma-expression-preview` and `kumma-expression-tunnel`, managed independently by the user service manager. Both have a 24-hour runtime limit. The local preview retains its noindex response header. The tunnel uses an explicit empty configuration, preserving the machine's unrelated named tunnel. The replacement public hostname returned HTTP 200 and the expected prototype HTML. HANDOFF records the current URL, service inspection, URL retrieval, and stop commands.

## 2026-11-08 — Complete release preparation

The user authorized a complete build, independent decisions, and production deployment following the revised plan. Independent art/editorial and source reviews checked all eight roles, source provenance, public identity wording, contribution continuity, and input/motion states. The release retains the Chinese marks and final brush character as visual material, uses an authored awareness question in Reason, and keeps attributed reading references under Writing.

The release pass corrected idle font calibration that could change displayed weight, rebuilt registration after font/viewport changes, canceled late jobs on disposal, removed the Agency hint's competing entrance, made shared beats and the first chapter mark respond to live motion preferences, and completed the portrait immediately on reduction. A generated no-JavaScript face reuses the live spiral data and functions. Its opaque noscript markup avoids fetching the fallback on JavaScript visits. The share card now uses the same name, spiral face, and red horizon as the opening. Obsolete styles from the replaced Line/Close implementation were removed after importer checks.

The native document integration now avoids a scroller proxy tied to a destroyed legacy Lenis instance. The unverified demo address `/call/` moves to the KOTA project page. The unreleased benchmark has accurate draft metadata, no Dataset claim, noindex, and no sitemap entry. The export audit now checks the no-JavaScript portrait asset, authored contribution defaults, draft indexing, and retired demo canonical. There are 43 compatibility moves.

CI uses the matching Node 22 line and locked `npm ci`, then lint/tests, production build, standalone type checking, and the export audit before artifact upload. Deployment success will be verified through Actions and the public domain before completion is recorded.

Local release validation passed all 16 test-file subprocesses, lint with five existing warnings, production build, serial standalone type checking, and the extended export audit with 507 internal links, 43 compatibility moves, and zero broken targets. Browser regressions verified initial type weight 10 through idle calibration, settled weight 150, registration errors below 0.15 px at desktop and 0.04 px at 320 px, exact three-scene pen outlines, live motion reduction/restoration, reduced-first Name visibility, zero fallback-image requests for JavaScript visits, the visible 600 px no-JavaScript face, native chapter recovery at 32 px, and the retired demo destination. No page errors occurred in that matrix.

## 2026-11-08 — Connected experience deployed

[PR #20](https://github.com/Comma0101/kumma-portfolio/pull/20) merged reviewed head `027080f9c411f0d5fca66b384758529f44e92311` as `2ba36b2118af397e18af6722ac81981827d4f8d0`. [Pages run 42531658432](https://github.com/Comma0101/kumma-portfolio/actions/runs/42531658432) completed successfully. Locked dependency installation, source quality checks, production build, type/export verification, artifact upload, and deployment all passed.

The public domain returned the new personally attributed belief, retained contribution fields, outward ending, and no-JavaScript portrait asset reference. The maintained checkout was fast-forwarded to the deployed master. Subsequent release-record commits retain this implementation. Physical iPhone hardware and an unbriefed human recall study remain outside the completed automated validation.

The production-domain regression matrix subsequently passed the no-JavaScript image and reading path, initial/settled type calibration, desktop-to-320 px registration, exact pen outline continuity, live motion reduction/restoration, reduced-first Name visibility, zero JavaScript fallback-image requests, not-found recovery, native chapter positioning, and `/call/` compatibility navigation. It reported zero page errors. Independent Chromium checks also passed. A cached WebKit launch produced no usable engine result before host interruption, so WebKit and physical iPhone validation are unverified.

## 2026-11-08 — Map Art compositions

The user described belonging through places people are from, formerly lived, and live now. Overlapping histories can express community. He chose visual art as the current form and approved two compositions with a dedicated presentation within Work.

The new `/work/map-art/` surface presents an imagined history between Amsterdam and Los Angeles, followed by three imagined histories meeting in Amsterdam. Pasadena and Long Beach supply two additional area crops from the existing Los Angeles County pack. Each map is fitted independently. Both compositions are visibly labelled illustrative. Their connections are authored gestures.

The authoring script reuses the separate Map Art project's decoder, projection and topology-selected handwriting. `mapArt.ts` supplies the shared browser/export composition definitions. Committed assets include four lossless city-layer WebPs totalling 496,354 bytes, the Work preview, a social image, two SVG prints and source provenance with pack hashes, bounds, detail scope and snapshots. Ordinary production builds use these committed assets.

Work has an image-led Map Art entrance and a broader introduction. The new page has consistent metadata, a sitemap entry and AI-summary links. PRODUCT records the confirmed motivation. HANDOFF and the surface brief describe implementation and reproduction.

Independent editorial and finish reviews checked the artwork's relationship to belonging, actual geography, illustrative histories, attribution, and phone layout. Review found clipped map labels at 320 px with 200% text enlargement and hidden-only export attribution. End/bottom anchoring corrected the labels. Exported SVGs now include visible source and illustrative-history credits.

Local validation passed all 16 existing test-file subprocesses, lint with the five documented legacy warnings, standalone type checking, and the 67-route production build. The export audit passed 62 HTML pages, 517 internal links and 43 compatibility moves with zero broken targets. Its Map Art checks cover the Work link, canonical/social metadata, sitemap entry, WebP signatures, downloads and visible SVG credit.

Chromium checks against the production export passed desktop and 320/390/760 px layouts, all placed images, settled arrivals, 200% text enlargement, keyboard navigation from Work, visible download focus, a real SVG download, live motion reduction/restoration and no-JavaScript viewing. The matrix recorded zero page errors. Physical iPhone/Safari and the user's aesthetic assessment remain unverified.

[PR #21](https://github.com/Comma0101/kumma-portfolio/pull/21) merged reviewed head `b59a1951e37e70a47210fed0c0d1998bafed7920` as `18e6581e1adea6a2e83169e271b4322378018dc4`. [Pages run 42541090578](https://github.com/Comma0101/kumma-portfolio/actions/runs/42541090578) completed all build and deployment gates successfully. The public page returned HTTP 200 with both studies, illustrative labels, metadata and download links. The same Chromium regression matrix passed against the public domain with zero page errors. Both public SVG downloads matched the committed source hashes and contained visible source credit. The maintained checkout was fast-forwarded to the deployed master.
