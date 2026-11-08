---
name: Kumma
description: The incumbent paper, ink, and red-line web design.
colors:
  paper: "#f2efe8"
  ink: "#141414"
  grey: "#6b6760"
  red: "#a3121b"
typography:
  display:
    fontFamily: "Sprat, Georgia, serif"
  body:
    fontFamily: "Junicode, Georgia, serif"
---

# Design System: Kumma

## Overview

The primary replacement site is the rich eight-chapter experience at `/`: paper, ink, and one red line developed through expressive variable type, Chinese typography, brushwork, and a personal narrative. The user chose its richness over the compact experiment. The release preserves this visual grammar while refining its wording around consciousness, self-awareness, embodied understanding, and the limits of interpretation.

`/view` remains an isolated, noindex comparison experiment in the same material language: the spiral portrait leads into an introduction, one quiet dated excerpt from personal writing, and direct paths onward. It is not the intended replacement for `/`.

The introduction and personal metadata foreground consciousness, self-awareness, and imagination. Distinguish personally affirmed beliefs, continuing questions, dated writing, and aspirations. The main journey keeps its attention on Kumma’s perspective. KOTA and other project showcases belong under Work, while complete essays belong under Writing.

## Colors

Paper is the reading surface; ink carries primary text; grey supports secondary text. Red belongs chiefly to linework and deliberate interaction marks. Normative values are recorded above and implemented in `components/personal/Front.module.css`.

## Typography

Sprat supplies variable display lettering; Junicode carries reading text and italic asides. Local subsets of Noto Serif TC, Noto Serif SC, and LXGW WenKai support the existing Chinese typography. Preserve language annotations and the established separation of scripts. Display expression must retain legibility.

## Layout

Use generous whitespace, strong alignment, and responsive type. The existing gutter is `max(16px, 4vw)`; narrow screens adapt the margin and reading width. Preserve reachable navigation and comfortable touch controls without clipping or horizontal overflow.

## Elevation & Depth

Paper grain and ink layering create material depth. The incumbent interface is predominantly flat; depth should serve the artwork or a specific interaction.

## Shapes

Hand-shaped lines, brush outlines, open circles, and typographic rules establish form. Avoid substituting a generic card system for this vocabulary.

## Components

Existing assets include the single-line spiral portrait, SVG ink engine, brushwork, and paper page shell. Links, semantic controls, visible focus, and readable text remain essential. The `/view` motion sequence belongs to its component’s opening contract; it is not a global portrait-zoom prescription.

The `/` experience’s continuous margin ink, participatory editing, variable-type embodiment, and Chinese brush forms establish its expressive range. Its eight chapters retain their sequence: Name, Agency, Understanding, Steps, Practice, Measure, Reason, and The way. The consciousness and self-awareness focus guides the personal language without flattening the page into a short abstract introduction.

Supporting passages express ongoing tensions and commitments: noticing influences before choosing, returning to habitual responses despite understanding an idea, and questioning an interpretation of experience. The delayed darker paragraph is a response to the earlier reflection, rather than a claim of completed personal transformation. Trading reminders retain their specific domain; the accompanying question concerns when a useful rule begins to replace attention.

Work and Writing are the two primary destinations in the paper shell. Its name and explicit Introduction link return to `/`, the chosen canonical entry; visual studies remain available in the footer. Work entries expose concrete systems and engineering decisions. Writing leads with essays and direct language-edition links, with reading references in a secondary native disclosure.

The opening offers quiet Work, Writing, and Email links so visitors can act without completing the chapter sequence. Footer contact paths repeat access at the end. These links belong to the existing paper typography and visible-focus treatment; they should remain subordinate to the personal introduction while being easy to find and use.

## Connected Prototype

The `feat/personal-expression-prototype` branch develops the incumbent world through a retained reader contribution. The finished outline from Agency returns beside an awareness question and the outward invitation. Its shape, proportions, and reader/pen attribution remain consistent. An authored line supplies the complete composition when participation is skipped. Current-mount memory defines its lifetime.

The phone opening places name, face, and substantive first-person language within the first viewport. Reason uses a monumental display phrase, large Junicode italic, an open brush impression, and the retained mark. The caption sits outside the circle with reserved clearance. The ending gives the user's intention to meet the world with love a large typographic composition and stable Email/Writing access. The existing eight marks and final brush character remain in the visual vocabulary.

Interaction is available in reduced motion with immediate state changes. All paper routes use native scrolling. Native chapter links have a two-rem scroll margin. Font-axis compensation and section/thread anchors remain the basis of material motion and measured geometry.

The `/view` writing fragment is a short exact excerpt, visibly dated and connected to its source. It supplies a particular piece of personal thought without an article-promotion title, explanatory summary, or replay control. The final paths provide Writing, Work, X, and email. Navigation remains reachable before the experience is complete.

## Motion and Typographic Material

On experience surfaces, motion makes a specific relationship visible: a change of view, an edit, or a change of reading emphasis. Settled compositions must still be expressive. Use ink geometry, type contrast, and variable-font shape where they carry meaning; avoid repeated fade-and-rise entrances. Preserve the original words and their source context. Prominent sequences run once, can be replayed, and leave readable static states in reduced motion or without JavaScript. Reserve typographic measure before varying weight so reading does not jump. Indexes and long articles remain calm.

In the compact `/view` journey, the portrait’s change of perspective is the sole focal animation. The introduction, writing fragment, and onward paths provide a quiet reading interval; removing the project section does not create a requirement for replacement animation. Short viewports use normal document flow so the complete introduction remains readable.

## Do's and Don'ts

- Preserve keyboard access, touch operation, language semantics, and visible focus.
- Honor reduced motion with a usable, readable settled state.
- Treat visual studies as website craft, not a claim that Kumma is a practicing artist.
- Keep `/` as the primary replacement site and `/view` as an isolated noindex comparison experiment.
- Preserve real content and established work/writing destinations.
