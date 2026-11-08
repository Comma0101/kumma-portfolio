# Personal expression through typography and motion

Prepared 2026-11-08 from the user's clarification and a review by three specialist agents covering art direction, typography/motion, and editorial philosophy.

Revision 2 incorporates an independent challenge by three further agents covering originality, personal accuracy, and typography/implementation feasibility. The user asked whether the plan could improve before building.

Status is an implemented release candidate on `feat/personal-expression-prototype`. The user authorized completion, editorial decisions, and deployment on 2026-11-08. Personal commitments below come from the user. The direction and acceptance criteria remain the basis of review. Actual validation and deployment evidence are recorded in HANDOFF and the project log.

## Purpose

People finding Kumma should encounter a particular person through a substantial visual experience, with writing, work, and contact immediately reachable. The homepage is an Experience surface. Its typography, linework, rhythm, and participation carry meaning alongside the words.

The user requests Awwwards-quality visual craft. Its [published evaluation](https://www.awwwards.com/about-evaluation/) considers design, usability, creativity, and content. The working standard combines authored visual form with useful reading, interaction, responsive composition, and reliable operation.

## Confirmed personal material

- Consciousness and self-awareness are central interests.
- Kumma believes imagination participates in reality both ontologically and through choices and actions. Physical existence follows physical laws within this account.
- The mental “I” can be observed. An observer remains when identification with that image falls away.
- Humans are witnesses and participants.
- He wants to find his true self, cultivate himself, and interact with the world with love.
- The relation between infinite and finite existence, and the role of human consciousness, remain questions he investigates.

Public positioning should use these personal beliefs, questions, and intentions. The named inspirations discussed during discovery belong to the team's background understanding. Source attribution accompanies any actual quotation presented. Claims about lived attainment, religious affiliation, scientific proof, and motives for every project require evidence or further user guidance.

## What the current site provides

The continuous red spine, spiral portrait, Sprat and Junicode, compensated variable-font geometry, participatory Agency edit, practice strokes, Chinese typography, and brushwork establish the visual vocabulary the user preferred.

The principal gaps are rhythm and emotional direction. Several chapters use similarly spacious, vertically staged compositions and resolve into large statements. The opening's unused vertical interval delays the introduction on phones. The prominent Follow action makes social following the main closing invitation. Love, play, presence, and imaginative making have less presence in the public account than reflection and discipline.

The review used source and desktop/phone evidence. Project briefs support a wider range of interests, while the user's motives for individual projects remain open. Their presence does not establish release, adoption, or from-scratch authorship.

## Recommended visual direction

Give the page continuity through an actual contribution. The existing Agency interaction accepts a reader's stroke. Let that particular mark return in a later composition with a changed spatial relationship to the authored text and linework. At the end, make room around the recognisable contribution beside a personal intention and an ordinary contact invitation.

This is a proposed artistic relationship between observing and participating. Its value must become visible in the prototype. The contribution's reappearance should invite recognition and pleasure. The user's stated intention and the interface's accommodation carry the commitment to love.

Preserve the distinction between the authored spine, the reader's contribution, and the typography. Their geometry has separate sources in the current implementation. Their relationship can be composed deliberately through alignment, intervals, and handoffs.

The central risk is whether this continuity produces a more particular encounter with Kumma. Test that risk before extensive opening or ending polish.

### Changes from the first proposal

| Earlier proposal | Revised plan |
| --- | --- |
| Three separately polished signature scenes | A complete rhythm study and one connected passage whose earlier event has a later consequence. |
| An outlined “I” as a possible signature | Study a changed relationship to familiar material before committing a new literal symbol. |
| Decorative proof impressions | Use actual reader marks or clearly identified type studies. Historical corrections require genuine source material. |
| A new closing gesture representing love | Welcome the earlier contribution and a visitor who skips participation, alongside an explicit personal intention. |
| Precise durations chosen in the brief | Perceptible arrival, change, and resting states, with timing calibrated in the browser. |
| High-fidelity bookends first | Prove the difficult connection, then refine the strongest transition and its surrounding compositions. |

### Opening

Compose the name, portrait, and a personal introduction together within an ordinary phone's first screen. On desktop, set the mass of the name against the concentrated detail of the face. The red stroke develops from a loose mark into a contour and the continuing line.

The first phone composition should show the name, a recognisable portrait, and one substantive personal sentence. Longer introduction text follows in normal flow. All reading and navigation are available immediately. Preserve quiet direct access to Work, Writing, and Email.

Opening, portrait, and spine currently have distinct triggers. Define their handoff positions and interruption behaviour when composing them as one visual event. Review cold arrival, returning visits, and arriving at a later chapter.

### Understanding and form

Develop the existing outline-to-ink composition through a study of the same words in different material states. Define the arrival, a meaningful intermediate state, and the resting composition. Each must work as a still image. The existing transformation is part of the baseline, so identify what the revised composition contributes.

Retain registration between outline and filled type. Sprat's actual axes are weight 10–200 and width 100–200. Reuse the existing compensation machinery, reserve bounds, and preserve reading order. Prepare layout-dependent values outside the animation loop. Calibrate the duration against the composition, gesture, and device.

Vary material weight without assigning it a moral rank. A legible resting state can retain openness and unfinished form. The reader's actual mark may enter as an annotation with its own visual identity. A later return to that familiar mark or phrase can explore a changed relationship to it.

### An outward ending

Use the user's statement about meeting the world with love as the editorial basis. Give the final composition enough space for another presence. Bring the earlier contribution into a shared field, with the authored line accommodating its shape and an ordinary contact invitation alongside it.

The ending has a complete authored composition for people who skip interaction. It welcomes an imperfect contribution. Reading and contact have stable targets and native behaviour. The resting and reduced-motion arrangements make the relationship visible immediately.

Love is the user's continuing intention. The visual treatment is a proposed expression of attention and accommodation, to be judged by him. An interaction may also supply surprise, humour, or beauty on its own terms.

## Contribution and continuity

The first prototype uses the existing Agency intervention as its source. Define these states explicitly.

| State | Behaviour |
| --- | --- |
| Reader draws | Select the latest completed deliberate stroke. Preserve the existing local attempt history and carry the selected geometry forward. |
| Reader uses the pen button | Use a prepared stroke with its source recorded as the pen. Attribute it accordingly if a label is shown. |
| Reader skips | Present the complete authored reading and ending. |
| Reader prefers reduced motion | Keep the drawing and native pen control available. Apply completed contribution states immediately with a settled surrounding composition. |
| Reader returns upward | Show the current contribution consistently in its related compositions. |
| Viewport changes | Recompose the field while preserving the selected trace's proportions and recognisable geometry. |
| Fresh page load or homepage remount | Start a complete new visit. A restored mounted page keeps its current contribution consistent. |

The shared representation needs the completed rendered outline, its bounded centreline, measured bounds, and contribution source. Retain the finished outline so brush size, seed, smoothing, and lift preserve their visible result. Uniform scale and translation operate on that retained geometry. The selected trace belongs to document memory for the current visit. Update the shared contribution on a completed gesture, and keep pointer sampling local to the interaction.

The implementation retains the exact completed Agency outline in current-mount state and renders it in both later compositions. Thread has separate authored geometry that ends beside the reflection field. Contribution-source and retained-outline data attributes expose the relationship for QA.

The original baseline coupled reduced motion with disabled drawing and a hidden pen control. The release separates participation from motion preference. Reduced-motion readers receive immediate state changes and equivalent contribution choices.

## Content and personality

Give different kinds of thought different roles.

- An affirmed belief uses first-person wording in readable text.
- A live question retains its openness.
- An observation describes a tension in ordinary experience.
- An exact writing fragment carries its original title, date, and route to the complete essay.
- A commitment states how Kumma wants to live and relate to others.

For the first study, a source-backed writing candidate is the opening of *On Emotions*, dated 2025-10-26. Its first two sentences begin with “I’ve come to realize that emotions aren’t enemies” and describe emotions as parts of ourselves that are “more honest, less rehearsed.” Use an exact extract from `_posts/On-Emotions.md`, visibly dated. Its present significance remains subject to the user's review. A specific lived episode could later deepen this material when he supplies one.

The portfolio of projects suggests warmth, play, perception, and ambitious making as areas to explore. Preserve their independent purposes. The artwork can have playful or pleasurable intervals without assigning every movement an explanatory lesson.

## Eight-part rhythm

| Existing role | Content and composition |
| --- | --- |
| Name | A recognisable person, name and face, with a substantive first-person introduction. |
| Agency | A question about response and choice, with a short deliberate intervention. |
| Understanding | A lived tension in monumental type, with meaningful outline/weight states. |
| Steps | A brief spatial return with retained evidence and a distinct pace. |
| Practice | Concrete verbs, close detail, and a dated writing fragment. Give curiosity and play room here. |
| Measure | A compressed reading interval about context and consequences. Keep trading's domain visible. |
| Reason | A live question and a return to familiar material in a changed relationship. |
| The way | A continuing intention, a shared field, and a reachable invitation to connect. |

The eight roles remain the working structure. The release retains their Chinese marks and final brush character as visual vocabulary, leads Reason with an authored question, and keeps attributed reading passages under Writing. The main identity wording uses the user's own positions and intentions.

## Copy candidates

These are candidates for distinct positions, with status kept explicit.

- “Who is aware of the person I call myself?” is a proposed authored question.
- “I want to find my true self and let that understanding change how I live.” expresses the user's aspiration.
- “I believe imagination participates in the making of reality.” attributes his affirmed personal belief.
- “I want to meet the world with love.” expresses his aspiration.

Develop wording and composition together. The hierarchy should make their differing roles legible.

## Development sequence

1. Lay out an eight-part composition study with actual candidate text, scale, density, and reading intervals. Review the complete rhythm at phone and desktop sizes.
2. Build a thin connected passage from the existing intervention through a changed typographic/reading state to the proposed shared ending. Include the personal question, first-person belief, dated writing, and continuing intention in the prototype.
3. Refine the strongest transition and its arrival, intermediate, and resting compositions at production fidelity. Compose the opening and ending around the proven relationship.
4. Review the whole reading, interaction, motion, and runtime. Compare the result against the incumbent and capture what the revision contributes.

## Acceptance and rejection tests

These are proposed review criteria. Implementation evidence will establish whether they are met.

- Two visibly different input strokes remain different and recognisable in later compositions. A prepared pen contribution has honest attribution.
- The complete personal introduction, reading, and contact path are available when participation is skipped.
- After a brief visit, an unbriefed reader can identify Kumma and recall one particular belief or intention alongside a visual event. Record the reader's actual response.
- The full composition study shows distinct roles and a varied rhythm. Each central scene has an arrival, intermediate, and resting still at 390×844 and 1440×1000.
- Typography fits at 320 px width, short landscape sizes, and 200% zoom. New Chinese characters pass the repository's font-coverage test and reproducible subsetting workflow.
- Fast scrolling, upward return, a direct chapter link, navigation away/back, late fonts, and reduced motion produce legible settled scenes. New motion resolves before it interferes with a later reading interval.
- Touch, pointer, and keyboard participation have equivalent outcomes, stable targets, visible focus, and normal page scrolling. Reduced-motion readers can contribute through drawing or the native pen action with immediate state changes.
- Record browser, device, viewport, and motion settings for performance evidence. On a representative phone, check frame traces and animation-related main-thread work against a 50 ms long-task boundary. Fix repeated layout measurement and pause off-screen work before expanding effects.
- Temporarily remove a proposed new effect during review. Retain it when its absence materially diminishes the encounter, recognition, beauty, or clarity.
- The user judges whether the experience feels personally accurate. The named inspirations stay outside public identity wording, and the metaphysical statement remains personally attributed.

Reuse native scroll, the GSAP lifecycle, ink geometry, measured section wrappers, chapter IDs, and thread anchors. Animate within reserved bounds and profile the layout-dependent font work. Keep project showcases under Work. Preserve source content and inspect dependencies before removing legacy components. Publication follows implementation, validation, and review.
