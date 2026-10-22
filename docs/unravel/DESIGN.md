# Ravel design system

Historical design record. Current identity, colours and interaction rules are in [UNRAVEL_DESIGN.md](UNRAVEL_DESIGN.md).

## Current direction — Cobalt / Studio

The owner requested a drastic redesign on 4 October 2026: different palette and structure, scroll transitions instead of a Play film experience, more explicit targeting, responsive framing and optional sound. This supersedes Paper & Ink and the Remotion landing player. Earlier work remains in CHANGELOG.md and MOTION.md.

Audience: students and early developers building with AI, explaining a project or returning to make a change. Personality: curious, confident, readable, precise.

## Visual thesis

A cobalt studio for making unfamiliar code understandable: a clear welcome, a readable source example and a stable product canvas that changes with the reader’s scroll.

## Palette and type

- Light: canvas #F3F5F9, paper #E8EDF5, surface #DCE3EE, ink #18233B, muted #526078, quiet #58657B.
- Accent: #3154DC stamp, #2848C5 contextual text, #E1E7FB wash. Hero uses the neutral canvas and navy text; cobalt is reserved for actions, source connections and selected states.
- Dark: #111827 canvas, #1A2335 paper, #263249 surface, #E7EDF8 text, #B0BED3 muted, #A8BAFF contextual accent.
- Bricolage Grotesque identity/headings, DM Sans interface/body, IBM Plex Mono only for source.
- Primary action text follows the semantic canvas token for contrast across themes. No remaining orange button overrides.

## Content plan

1. Balanced introduction: “Understand the code you built with AI.” Message/actions beside a prepared feature. Navbar identity; no giant arrow or repeated wordmark.
2. Scroll story: choose → source → question → discovery. One stable canvas with chapters, optional sound and contextual guide links. Examples below are independent disclosures.
3. Audience and use cases: build with AI, explain a project, make another edit. Specific tasks, no invented customer claims.
4. Install → launch → connect, with Python requirements and honest release status; provider/privacy answers, coming-next section and approved navy footer.

## Interaction thesis

- Large identity and feature graph arrive with eased transforms; source thread moves subtly.
- Native page scroll advances/reverses the product story; progress moves continuously and scenes settle into place.
- Chapters support keyboard selection; navigation floats above the page and gains depth on scroll. Sound is explicit opt-in.

## Framing and responsive behavior

Product canvas uses a wide composition on desktop and a tall composition on phones. Its content is real HTML, not scaled video pixels. Height responds to available viewport space. Reduced motion or viewport height at most 700px releases the sticky section and uses manual controls, allowing normal scrolling. Examples remain outside the pinned stage.

Docs are fluid prose, not aspect-locked pages. Reading columns use minmax(0,…) and wrap long inline paths. Code and tables scroll inside their own bounds. Images/video preserve their intrinsic ratio with contain sizing. Search/select/contents adapt to phones.

## Verification and truth

Check real stage fit, content overflow, reverse scroll, manual controls, reduced motion, optional sound, docs navigation and A/AA contrast. Keep live-provider consent and source read-only behavior. The illustrations are labelled prepared/illustrative; they are not live AI execution, arbitrary agent edits or proof of user outcomes.

See SCROLL_STORY.md for interaction details and QA.md for measured results.

## Alignment refinement

The pinned walkthrough uses one shared horizontal grid for heading, equal-width chapters, full-width canvas and caption. Reserve at least 64px caption height on desktop and 96px on phones, so prose changes do not resize the scene. Scene transitions translate 8px without scale; text remains fully opaque. Scroll math matches 88px desktop and 76px phone navigation.

Footer: navy closing spread, introduction and two equal navigation columns, large decorative wordmark, quiet bottom rule and back-to-beginning link. It uses the same 1280px outer / 48px gutter grid as the story; phone gutters are 24px.

## 4 October 2026 — Shared grid and readable evidence

The current design uses an **1184px usable container**, equal columns and a 64px gap, superseding the older outer-container specification above. Public typography/spacing are scoped to landing/docs. White light-mode hero/stage surfaces, stronger dark borders, the fixture code/narration story, underlined controls, normal-flow fallbacks, compact examples, simpler setup and full-width flat navy-footer wordmark implement the owner's revised brief.

The landing and eleven documentation routes are generated as readable HTML and enhanced with React. Mobile docs navigation and OS panels have stable first-paint layouts. Full decisions, routes, measurements, screenshots and deferred work are in [DESIGN_REVISION.md](DESIGN_REVISION.md).
