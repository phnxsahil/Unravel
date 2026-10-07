# Ravel interface patterns

## Current Unravel direction — 6 October 2026

Owner-requested minimalist symmetrical grid replaces the historical Cobalt/Studio patterns below. Self-hosted Geist for headings, body and interface; IBM Plex Mono for source. Neutral #0E0E10/#141416 dark surfaces, #FAFAFA/#F5F5F5 light surfaces, one restrained selection blue. Primary buttons are monochrome. Flat 65px navbar; 1184px marketing rail; equal section halves separated by fine lines; a centered headline above a wide action/source workspace. Footer uses a compact identity, no repeated watermark.

Preserve accessible map alternatives, source evidence and working interactions. Do not capture screenshots or screenshot traces. Verify with DOM geometry, accessibility and interaction tests. Exclude screenshot-producing browser experiment runs from visual QA unless explicitly authorized. Current rules: docs/ravel/GRID_REDESIGN.md.

Cobalt / Studio: cool off-white, deep ink, one cobalt accent; sober navy dark theme. Semantic tokens live in byline/src/ravel/ravel.css. Audience: early developers learning from projects built with AI. Demonstrations remain labelled prepared/illustrative.

Bricolage Grotesque identity/headings, DM Sans body/UI, IBM Plex Mono source. Flat open layouts outside the single product canvas. Navigation reserves 88px desktop, 76px phone; its inner bar is 64/56px and compacts after 64px scroll.

Docs: 212px topics, reading column up to 720px, contents up to 190px, 48px gaps. Fluid prose, bounded code/table scrolling, 24px phone gutters, searchable topics, selector and collapsible contents. Never aspect-lock articles.

Landing uses a pinned scroll story with keyboard chapters. Short/reduced-motion layouts release it. Sound is optional, off by default and generated locally. Source examples are separate details elements, so reading an example is independent of the animated scene.

See DESIGN.md and SCROLL_STORY.md in docs/ravel.

Refinement: keep heading, chapter rail, stage and caption on the same horizontal grid. Chapter controls are equal-width, with >=44px targets. Caption space is reserved at 64px desktop/96px phone. Entrance moves 8px without scale. Footer is a navy closing spread with Explore/Field Guide columns, decorative signature and a quiet utility row.
