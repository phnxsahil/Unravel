# Unravel design and engineering rules

The latest owner-requested [minimalist grid redesign](GRID_REDESIGN.md) supersedes the font, palette and composition rules below. The explicit October landing audit authorized targeted verification renders; older galleries represent earlier designs.

Approved 6 October 2026. This document supersedes prior Ravel visual rules; technical identifiers remain compatible.

## Identity and content

Wordmark: lowercase **unravel**. Monochrome folded-thread **u** icon: 22px in navigation, designed to remain legible at 16px. Headline: **Understand the app you built.** Supporting copy: **Explore how it works, see what happens when things go wrong, and find where to make your next change.**

Audience: students, self-taught developers and solo builders using AI for React apps. Start with a visible action, source evidence and a controlled observation. Saving a note is optional. No outcome scores, fabricated statistics, cloud execution or implied affiliation.

## Design tokens

Default charcoal: background #0C0D10, surface #141519, raised #202126, text #F0F0F2, secondary #B0B1BA. Neutral off-white light mode. Blue indicates selected source and actions; green/amber/red indicate real states. DM Sans body/UI, Bricolage Grotesque display, IBM Plex Mono identifiers. Body 16px; controls 14px; metadata 12px. Marketing content 1184px, equal columns and 64px gap. Spacing follows 8px increments.

The hero has one interactive Search response-contract simulation: 200 OK, broken UI. Code and narration share the pinned walkthrough stage. Main app task evidence takes prominence over sidebar navigation. Borders establish grouping, not decoration. Motion respects reduced motion and releases to normal flow when the stage cannot fit. Sound is optional and initially off.

References inspected: [Linear](https://linear.app/now/behind-the-latest-design-refresh), [Geist](https://vercel.com/geist/introduction), [TesterArmy](https://tester.army/), [Composio](https://composio.dev/). Their hierarchy and workflow clarity informed an original composition; no copied assets or fonts were introduced.

## Public actions and compatibility

Explore the demo → `/projects/demo`; Connect a project/Open Unravel → `/projects`; setup → `/docs/quick-start`; browser prerequisites → `/docs/experiments`. New project navigation: Overview, Explore, Experiments, Changes, Notebook. Settings remains `/settings`. Historical `/projects/:id/explore/:investigationId` links retain the old workbench. `/projects/:id/legacy` keeps the previous overview accessible.

Public name is Unravel. `ravel`, `RAVEL_HOME`, `RAVEL_MODEL`, `~/.ravel`, `ravel.sqlite`, `/api/investigations`, Python modules and `byline/` retain compatibility meanings. The package name remains `ravel-workshop`, version 0.2.1. Name availability and public package publication are unverified/separate.

## Engineering boundaries

Immutable snapshots and source-cited maps distinguish Found in code, Inferred and Observed in this run. AI cannot execute commands. Typed browser recipes require local origins, approval and disposable data. A fresh browser does not isolate backend records. Request bodies are not stored by default; screenshot contents remain local. Source identity does not prove which build a development server is running.

Acceptance evidence and remaining limits are recorded in `UNRAVEL_VERIFICATION.md` and `UNRAVEL_EVALUATION.md`. Screenshot gallery is generated under `.local/screenshots/unravel-release`. Package requests, automatic fixes, cloud runs, arbitrary framework coverage and public release remain deferred.
