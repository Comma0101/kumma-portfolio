# Portfolio Usability Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the portfolio’s accessibility, navigation responsiveness, reduced-motion behavior, route bundle cost, contrast, touch targets, and contact clarity without redesigning it or inventing unavailable KOTA proof.

**Architecture:** Keep the global App Router shell and existing visual system. Put behavior shared by navigation in one tiny pure helper, keep the single main landmark in the root layout, move the terrain into the homepage route, and make all visual corrections inside existing CSS modules. No new dependencies or component system.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, CSS modules, GSAP, Lenis, Three.js, Node test runner, Playwright CLI.

---

## Dirty-worktree rule

The repository already contains staged and unstaged user changes, including
overlaps in `app/layout.tsx`, `app/page.tsx`, and `package.json`.

- Never use blanket `git add`, stash, checkout, or reset.
- Inspect the current file and its user diff before every edit.
- Leave implementation changes uncommitted until their exact patch has been
  reviewed. Do not accidentally include the user’s staged work in a commit.
- The KOTA live line, recordings, benchmark repository, walkthrough, and CTA
  replacement remain out of scope.

### Task 1: Add failing navigation and markup contracts

**Files:**
- Create: `components/navigationBehavior.ts`
- Modify: `components/uxPolishCss.test.ts`

**Step 1: Add tests for native link handling and focus wrapping**

Add these imports and cases to `components/uxPolishCss.test.ts`:

```ts
import {
  PAGE_TRANSITION_SECONDS,
  nextFocusIndex,
  shouldAnimateNavigation,
} from "./navigationBehavior";

describe("navigation behavior", () => {
  it("leaves modified and non-primary clicks to the browser", () => {
    assert.equal(shouldAnimateNavigation({ button: 0 }), true);
    assert.equal(shouldAnimateNavigation({ button: 1 }), false);
    assert.equal(shouldAnimateNavigation({ button: 0, metaKey: true }), false);
    assert.equal(shouldAnimateNavigation({ button: 0, ctrlKey: true }), false);
    assert.equal(shouldAnimateNavigation({ button: 0, target: "_blank" }), false);
    assert.equal(shouldAnimateNavigation({ button: 0, download: true }), false);
  });

  it("keeps the page-cover transition short", () => {
    assert.ok(PAGE_TRANSITION_SECONDS <= 0.35);
  });

  it("wraps focus inside a finite menu", () => {
    assert.equal(nextFocusIndex(0, 5, true), 4);
    assert.equal(nextFocusIndex(4, 5, false), 0);
    assert.equal(nextFocusIndex(-1, 5, false), 0);
    assert.equal(nextFocusIndex(-1, 0, false), -1);
  });
});
```

Add source-contract tests that:

- require `app/layout.tsx` to contain `href="#main-content"`,
  `id="main-content"`, and `tabIndex={-1}`;
- reject `<main` in `ContactPage`, `BenchmarkPage`, `LatencyPage`,
  `BuildLanding`, `app/patterns/page.tsx`, `app/projects/page.tsx`, and
  `app/agent/page.tsx`;
- require the blog filters to expose `aria-pressed`;
- require the full contact action to contain `Open Email`.

**Step 2: Run the tests and verify RED**

Run:

```bash
npm test
```

Expected: FAIL because `navigationBehavior.ts` does not exist and the markup
contracts are not yet satisfied.

**Step 3: Add the minimal pure helper**

Create `components/navigationBehavior.ts`:

```ts
export const PAGE_TRANSITION_SECONDS = 0.35;

type NavigationIntent = {
  button: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  target?: string | null;
  download?: boolean;
};

export const shouldAnimateNavigation = ({
  button,
  metaKey = false,
  ctrlKey = false,
  shiftKey = false,
  altKey = false,
  target,
  download = false,
}: NavigationIntent) =>
  button === 0 &&
  !metaKey &&
  !ctrlKey &&
  !shiftKey &&
  !altKey &&
  target !== "_blank" &&
  !download;

export const nextFocusIndex = (
  current: number,
  length: number,
  backwards: boolean,
) => {
  if (length <= 0) return -1;
  if (current < 0) return backwards ? length - 1 : 0;
  return (current + (backwards ? -1 : 1) + length) % length;
};
```

**Step 4: Run the focused tests**

Run `npm test`.

Expected: navigation helper tests PASS; markup contract tests still FAIL for the
missing production changes.

### Task 2: Establish one accessible page landmark

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `components/ContactPage.tsx`
- Modify: `components/BenchmarkPage.tsx`
- Modify: `components/LatencyPage.tsx`
- Modify: `components/build/BuildLanding.tsx`
- Modify: `app/patterns/page.tsx`
- Modify: `app/projects/page.tsx`
- Modify: `app/agent/page.tsx`

**Step 1: Confirm the landmark tests fail for the expected files**

Run `npm test` and confirm the failure identifies the missing skip target or a
nested `main` source.

**Step 2: Add the global skip link and main target**

In `app/layout.tsx`, place this as the first focusable control in `<body>`:

```tsx
<a className="skip-link" href="#main-content">
  Skip to content
</a>
```

Change the global main to:

```tsx
<main id="main-content" className="site-main" tabIndex={-1}>
  {children}
</main>
```

In `app/globals.css`, add:

```css
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 2000;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius-control);
  background: var(--paper);
  color: var(--canvas);
  transform: translateY(-160%);
  transition: transform 180ms ease;
}

.skip-link:focus {
  transform: translateY(0);
}
```

**Step 3: Replace nested main elements**

Replace each route component’s opening/closing `main` with `div`, preserving its
existing `id` and class names. Do not change its content or layout.

**Step 4: Run tests and type checking through the build**

Run `npm test`.

Expected: landmark/source tests PASS.

### Task 3: Make route navigation fast and native-compatible

**Files:**
- Modify: `components/TransitionLink.tsx`
- Modify: `components/PageTransition.tsx`
- Modify: `components/Navigation.tsx`
- Test: `components/uxPolishCss.test.ts`

**Step 1: Wire native-compatible click handling**

Extend `TransitionLinkProps` with:

```ts
ariaCurrent?: "page";
```

Before preventing the event, build an intent from the React mouse event and
anchor attributes. Return without interception when
`shouldAnimateNavigation(intent)` is false. Render `aria-current={ariaCurrent}`.

**Step 2: Use the shared transition duration and focus the route target**

Replace every `0.75` page-cover duration with
`PAGE_TRANSITION_SECONDS`. Track the previous pathname in a ref. When the
pathname actually changes, focus `#main-content` with `preventScroll: true` on
the next animation frame.

Do not focus the main landmark on initial hydration.

**Step 3: Expose active-route semantics**

Pass this to desktop and mobile `TransitionLink` instances:

```tsx
ariaCurrent={isActive ? "page" : undefined}
```

**Step 4: Run tests**

Run `npm test`.

Expected: helper and source-contract tests PASS.

### Task 4: Contain and restore mobile-menu focus

**Files:**
- Modify: `components/Navigation.tsx`
- Modify: `components/AgentAwareness.tsx`
- Modify: `styles/navigation.module.css`
- Test: `components/navigationOverlayCss.test.ts`

**Step 1: Add failing CSS/menu contracts**

Extend `navigationOverlayCss.test.ts` to require:

- `.menuButton` width and height at least 44px;
- `.mobileMenu` retains its fixed overlay and higher z-index;
- `Navigation.tsx` contains `aria-modal`, `inert`, and the shared
  `nextFocusIndex` helper.

Run `npm test` and verify these cases fail.

**Step 2: Add refs and focus containment**

Add refs for the menu button and overlay. While open:

- store the previously focused element;
- focus the first menu link, or the close button if no link exists;
- on Tab, collect visible focusables inside the overlay plus close button,
  compute the wrapped index with `nextFocusIndex`, prevent default only at the
  boundaries, and focus the wrapped target;
- on close, restore focus for Escape, close-button, and backdrop dismissal.

**Step 3: Make the background inert**

While open, set `inert` and `aria-hidden="true"` on `#main-content`, the global
footer, and the agent-awareness root. Restore their previous values in cleanup.
Add `data-agent-awareness` to the root rendered by `AgentAwareness`.

Render the overlay with:

```tsx
role="dialog"
aria-modal="true"
aria-label="Site navigation"
aria-hidden={!isMenuOpen}
inert={!isMenuOpen}
```

**Step 4: Increase the control target**

Set `.menuButton` to 44px by 44px. Keep the visible bars unchanged.

**Step 5: Run tests**

Run `npm test`.

Expected: navigation overlay tests PASS.

### Task 5: Scope terrain to the homepage and honor reduced motion

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `components/ThreeScene.tsx`
- Modify: `components/SmoothScrollProvider.tsx`
- Modify: `components/viz/reducedMotionState.ts`
- Modify: `components/viz/reducedMotionState.test.ts`
- Test: `components/uxPolishCss.test.ts`

**Step 1: Add failing reduced-motion tests**

Add to `reducedMotionState.test.ts`:

```ts
import { shouldInitializeSmoothScroll } from "./reducedMotionState";

it("does not initialize smooth scrolling for reduced motion", () => {
  assert.equal(shouldInitializeSmoothScroll(true), false);
  assert.equal(shouldInitializeSmoothScroll(false), true);
});
```

Add source contracts asserting that `layout.tsx` does not import `ThreeScene`
and `app/page.tsx` does.

Run `npm test` and verify RED.

**Step 2: Add the minimal motion helper**

Add to `reducedMotionState.ts`:

```ts
export const shouldInitializeSmoothScroll = (prefersReducedMotion: boolean) =>
  !prefersReducedMotion;
```

In `SmoothScrollProvider`, read the media query at the beginning of the layout
effect and return before constructing Lenis when the helper returns false.

**Step 3: Move the terrain**

Remove the `ThreeScene` import/render from `app/layout.tsx`. Import and render it
from `app/page.tsx` immediately before the homepage content.

Because it is now home-only, remove `usePathname` and the pathname guard from
`ThreeScene`; use an empty effect dependency array.

**Step 4: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: tests PASS; build exits 0.

### Task 6: Repair contrast, touch targets, and blog state semantics

**Files:**
- Modify: `app/globals.css`
- Modify: `components/home/HeroSection.module.css`
- Modify: `components/home/ChapterIndex.module.css`
- Modify: `styles/kotaCaseStudy.module.css`
- Modify: `styles/blog.module.css`
- Modify: `components/BlogSection.tsx`
- Test: `components/uxPolishCss.test.ts`

**Step 1: Add failing CSS contracts**

Add tests requiring:

- `--faint` to resolve to a color with at least 4.5:1 contrast on `--canvas`;
- a desktop hero quiet-layer pseudo-element;
- `.searchBar:focus-within` to provide a visible signal-colored ring;
- mobile `.searchInput` and `.filterButton` minimum heights of 44px;
- mobile chapter links to use `min-height: 44px` and `inline-flex`.

Run `npm test` and verify RED.

**Step 2: Raise semantic contrast**

Change `--faint` to a tested accessible gray while preserving its warm tone.
Raise KOTA selectors currently using white at 25–45% opacity so body copy and
labels meet the intended contrast on `--canvas`/`--surface`.

Do not brighten borders or decorative grid lines to body-text contrast.

**Step 3: Protect desktop hero copy**

Add a non-interactive pseudo-element behind the desktop copy that fades from a
strong canvas scrim behind text to transparent before the terrain’s visual
center. Keep the existing mobile panel and disable the extra layer where it is
not needed.

**Step 4: Repair blog and mobile targets**

- Add a `:focus-within` ring to `.searchBar`.
- Set mobile search/filter controls to at least 44px high.
- Add `aria-pressed={isActive}` to each category filter.
- Increase mobile chapter/social link hit areas with padding/min-height while
  preserving their current type size.

**Step 5: Run tests**

Run `npm test`.

Expected: contrast/touch/source contracts PASS.

### Task 7: Make the email handoff truthful and autofill-friendly

**Files:**
- Modify: `components/ContactPage.tsx`
- Modify: `components/home/ContactSection.tsx`
- Test: `components/uxPolishCss.test.ts`

**Step 1: Verify the contact source contract is RED**

Run `npm test`; confirm it fails because the full contact action still says
`Send` or autocomplete attributes are absent.

**Step 2: Implement the minimal semantic change**

- Change the full contact submit label to `Open Email`.
- Add `autoComplete="name"` to name fields.
- Add `autoComplete="email"` to email fields.
- Leave mailto generation, required fields, status messages, and the honeypot
  unchanged.

**Step 3: Run tests**

Run `npm test`.

Expected: all Node tests PASS.

### Task 8: Full verification

**Files:**
- No production edits unless a failing check reveals a regression.

**Step 1: Static verification**

Run:

```bash
npm test
git diff --check
npm run build
```

Expected: all commands exit 0.

**Step 2: Bundle verification**

Inspect `.next/app-build-manifest.json` and confirm the non-home route entries do
not include the chunk containing `WebGLRenderer`. Record homepage and Blog/Call
gzip totals using the existing read-only Node/zlib check.

**Step 3: Browser verification**

Serve `out/` and use the Playwright CLI at:

- 1440 by 1000 desktop;
- 375 by 812 phone;
- 844 by 390 landscape;
- reduced-motion emulation.

Verify:

- one main landmark on every core route;
- skip link reveals and focuses main;
- normal navigation begins within approximately 350–450ms;
- Command/Ctrl-click and middle click remain native;
- route focus moves to main after client navigation;
- closed mobile links are not tabbable;
- open menu contains focus, Escape closes it, and focus returns;
- background is inert while the menu is open;
- blog search has visible focus and filters report pressed state;
- tested touch controls are at least 44px high;
- no horizontal overflow;
- Lenis is absent when reduced motion is active;
- desktop hero and KOTA text remain readable against the rendered background.

**Step 4: Review the exact patch**

Run `git diff --` with only the files named in this plan. Confirm unrelated
staged and unstaged changes remain untouched. Do not commit the implementation
until the overlapping user changes have been explicitly reviewed.
