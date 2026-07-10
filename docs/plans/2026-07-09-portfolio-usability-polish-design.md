# Portfolio Usability Polish Design

## Context

The portfolio already has a distinctive visual system and a responsive mobile
layout. The remaining weaknesses are concentrated in navigation behavior,
accessibility, motion preferences, global bundle cost, contrast, touch targets,
and the honesty of the email handoff.

The public KOTA phone line, recordings, benchmark repository, and an interactive
KOTA walkthrough are explicitly deferred. This pass must not fabricate or
simulate those artifacts as if they were live.

## Scope

This is a bounded polish pass, not a redesign.

- Preserve the ink, sage, editorial serif, geometric sans, and operational mono
  system.
- Preserve existing routes and project content.
- Leave the live-line experience and related CTA decisions unchanged.
- Add no new dependencies.
- Work with the current Next.js App Router, CSS modules, GSAP, Lenis, Three.js,
  and existing Node tests.

## Experience Design

### Navigation and landmarks

- Add a keyboard-visible skip link targeting the single global main landmark.
- Give the global main landmark a stable `id` and programmatic focus target.
- Remove nested `main` elements from page components.
- Expose the active route with `aria-current="page"`.
- Preserve browser-native modified clicks and middle clicks.
- Shorten the cover transition so navigation begins in roughly 350ms rather
  than after a 750ms blocking animation.
- Move focus to the main landmark after a route change without disturbing
  pointer users.

### Mobile menu

- Treat the open menu as a modal navigation surface.
- Move focus to the first menu action on open.
- Keep focus within the menu while open.
- Make the background inert and hidden from assistive technology while open.
- Restore focus to the menu button on close.
- Preserve Escape and backdrop-click dismissal.
- Increase the menu button hit area to at least 44 by 44 pixels.

### Motion and performance

- Render the Three.js terrain from the homepage route instead of the global
  layout so non-home routes do not receive the Three.js chunk.
- Keep the existing terrain appearance and homepage behavior.
- Do not initialize Lenis when `prefers-reduced-motion: reduce` is active.
- Keep the static reduced-motion terrain state.
- Avoid a broader GSAP or scrolling-system rewrite in this pass.

### Contrast and touch

- Add a quiet desktop contrast treatment behind critical hero copy without
  removing the terrain.
- Raise faint semantic text colors to readable values, especially KOTA body
  copy and micro-labels.
- Increase mobile blog search and filter controls to a 44-pixel minimum target.
- Give the blog search field a visible focus treatment.
- Expose filter selection with `aria-pressed`.
- Increase small chapter and social link hit areas with padding rather than
  visually oversized text.

### Contact behavior

- Keep the current mail-client handoff.
- Rename the full contact submit action from `Send` to `Open Email` so the label
  describes what happens.
- Add appropriate `autoComplete` values to name and email fields.
- Preserve the existing status message and native validation.

## Architecture

Use the smallest existing seam for every change:

- global landmark and skip link in `app/layout.tsx` and `app/globals.css`
- route behavior in `PageTransition`, `TransitionLink`, and `Navigation`
- homepage-only terrain placement in `app/page.tsx`
- motion preference in `SmoothScrollProvider`
- page-specific contrast and target sizing in existing CSS modules
- contact semantics in the existing form components

No new state library, modal library, focus-trap dependency, or design-system
layer is needed. The mobile navigation contains few focusable elements, so a
small native keyboard handler and `inert` are sufficient.

## Error Handling

- If the menu has no focusable link, retain focus on its close button.
- Always restore body overflow, inert state, and `aria-hidden` state during
  cleanup so route changes cannot leave the page locked.
- If reduced-motion media matching is unavailable, retain current scrolling
  behavior.
- The contact page continues to offer the visible direct email address if the
  operating system cannot open a mail client.

## Testing

Follow red-green-refactor for behavior changes.

- Add focused source/behavior tests for landmarks, route-link semantics,
  transition timing, menu containment hooks, reduced-motion Lenis behavior,
  and contact labeling.
- Run the existing test suite and production build.
- Browser-verify at 1440 by 1000, 375 by 812, and 844 by 390.
- Verify keyboard tab order, menu containment and restoration, skip link,
  route focus, modifier click behavior, reduced motion, search focus, touch
  target dimensions, and horizontal overflow.
- Confirm non-home route bundles no longer include the Three.js chunk.

## Non-Goals

- No callable KOTA line.
- No recordings or measured results.
- No benchmark repository work.
- No interactive KOTA walkthrough.
- No replacement CTA strategy.
- No new visual theme or broad component rewrite.

## Success Criteria

- Exactly one main landmark appears on every core route.
- Keyboard users can skip navigation and retain visible focus.
- The mobile menu contains focus and restores it on close.
- Route navigation starts in approximately 350ms and preserves native link
  behaviors.
- Reduced-motion users do not receive smooth-wheel interpolation.
- Non-home routes do not load Three.js.
- Tested mobile controls meet the 44-pixel target.
- Critical text meets readable contrast against its actual surface.
- Contact actions accurately describe the mail-client handoff.
