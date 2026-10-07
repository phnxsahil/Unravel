# Unravel project log

## 2026-10-08 — 0.2.1 product readiness fixes

- Replaced the primary photo demonstration with a labelled Search contract mystery: HTTP 200 with a broken UI. Connected demo source, experiments, comparison and walkthrough export; retained historical examples.
- Added source-backed recipe suggestions and ordinary baseline observations, fixed request-path matching with query suffixes, kept unknown controls/results explicit, and scoped approval to one saved recipe.
- Preserved feature selection, added Follow this feature without AI, clarified historical workspaces, updated setup/architecture guides and Windows/Ubuntu CI configuration.
- Corrected mobile first-use hierarchy and pinned walkthrough framing. Preserved the approved grid, typography, themes and substantial footer.
- Final verification: 58 backend cases, 31 distinct browser cases, nine real Chromium Search runs, type checking/build and three unit cases. Three-run mobile Lighthouse median 91, accessibility 100. Built the versioned 0.2.1 local wheel and verified outside-checkout installation. Full evidence, changed behavior and remaining boundaries: `RELEASE_FIXES_2026-10-08.md`.

## 2026-10-07 — Exhaustive landing audit and substantial footer

- Audited the entire landing in light/dark at 1440×900, 1280×720, 1024×768, 768×1024 and 390×844. Saved a baseline and six correction passes: 2,378 native viewport renders with per-scroll bounds, typography, contrast, control and containment measurements. Native review caught duplicated list numbering and cramped footer insets beyond the automated checks.
- Corrected hero evidence visibility, CTA hierarchy, accessible heading spacing, compact walkthrough context and content-aware fallback, expanded-example layout, code scrolling guidance, setup instructions, anchor offsets and keyboard return focus. Enlarged public and header targets to at least 44px and metadata to at least 13px.
- Built the requested substantial footer with separate Product/Docs/Project links, copyright/version/back-to-top and a giant theme-aware wordmark beneath the readable content. The intentionally faint dark logotype is explicitly excluded from content contrast checks.
- Final header-inclusive measurements find no page overflow, ordinary-text clipping, undersized text/targets, content contrast failures, accessibility findings or console errors in the tested matrix. Type checking, production generation, three unit tests and all 34 browser checks pass against production. Updated the local wheel and compared its 37 interface files with the build.
- Full findings, pass status, measured ratios, exact destinations and verification limits: `LANDING_AUDIT_2026-10-07.md`. Native-size gallery: repository-root `audit/index.html`. No public release or new Lighthouse claims.

## 2026-10-07 — Public UX audit implementation

- Made the hero explain the feature → source → controlled-failure journey, moved the outcome before code, and introduced “Make it fail. See why.” plus an evidence-backed upload-limit question. Preserved the approved minimalist grid and theme palette.
- Rebuilt the walkthrough around one coherent Search fixture, distinct expanded examples and a prepared failure simulation. All four scenes fit desktop/tablet/phone frames; forward/reverse scroll and keyboard navigation remain supported.
- Added complete-file JSX/Python syntax highlighting with unwrapped numbered lines. Fixed low-contrast inherited syntax colors and normalized public metadata to at least 13px.
- Unified beginner-first docs ordering, kept active navigation entries inside their rails, and gave tablet docs a full-width reading column. FAQ disclosures now work without JavaScript. Shortened the mobile footer and displayed the real package version.
- Passed type checking, three unit tests, all 24 browser checks and production rendering. Sampled light/dark pages have no automated accessibility violations. Verified the rebuilt wheel's 37 frontend files against the production build. No screenshots, traces, public release or new Lighthouse claims.
- Measurements, contrast ratios, changed-file ownership, exact destinations and review limits are recorded in `PUBLIC_REFINEMENT.md`.

## 2026-10-06 — Walkthrough and example grid inset correction

- Fixed an older public-style override that removed horizontal padding from the walkthrough and example sections. Both now keep 48px desktop, 24px tablet and 16px phone inner insets.
- Centered the walkthrough introduction and aligned all four step controls in equal columns, switching to two columns on narrow screens. Captions, example headings and guide links sit inside the same inset.
- Added explicit symmetric-inset regression checks across nine widths. Seven focused geometry, navigation, motion and forward/reverse walkthrough checks pass; production rendering passes. Confirmed the latest assets in the local browser and rebuilt the wheel without capturing screenshots.

## 2026-10-06 — Responsive composition follow-up

- Gave tablets 24px gutters and stacked constrained sections below 800px. Reduced nested phone padding while preserving the desktop grid.
- Aligned photo preview columns, retained source numbers on phones, enlarged path/scenario controls, and made phone actions fill their reading width.
- Matched mobile navigation to page gutters with a scrollable short-screen menu. Refined walkthrough tabs and phone documentation spacing.
- Passed the 24-test browser suite and six final focused responsive checks, type checking and production build. Geometry now covers nine widths from 320 to 1556px. Rebuilt the local wheel; no screenshots captured.

## 2026-10-06 — Alignment audit and restrained motion

- Unified section edges and centre seams, correcting the FAQ gap and tablet footer width. Added robust wrapping for source labels and preview code, and an internal scroll area for longer walkthrough excerpts.
- Added gentle hero/source entrance movement, arrow hover feedback and control transitions. Text remains fully readable throughout; reduced motion disables the movement.
- Enlarged small example metadata and touch controls. Added screenshot-free geometry, long-label and motion regression checks.
- Audit findings, measurements and remaining review limits are recorded in `GRID_AUDIT.md`. Rebuilt the local wheel with the polished interface.
- Verification passed: 24 screenshot-free browser checks, type checking, one frontend fixture test and production rendering; no automated accessibility violations on sampled pages.

## 2026-10-06 — Owner-directed minimalist grid redesign

- Replaced the split hero and floating navbar with a centered introduction, wide interactive source workspace and flat navigation.
- Introduced continuous symmetric grid rules, equal section halves, restrained surfaces and shared Geist typography across landing, docs and application. Removed the repeated footer watermark and rounded specimen presentation.
- The photo example now exposes actual prepared source excerpts alongside selected actions. Retained scenario selection and scroll/keyboard walkthrough controls.
- Recorded the owner's no-screenshot instruction and disabled automatic browser failure screenshots and traces. Previous screenshot gallery is historical.
- Design direction and verification scope are recorded in `GRID_REDESIGN.md`.

## 2026-10-06 — Unravel local product upgrade

- Implemented the approved Unravel identity, charcoal/light design, photo-upload demonstration, four-stage scroll walkthrough and project shell. Saving notes is optional.
- Added source-cited versioned maps, bounded investigation tools, typed browser recipes, optional Chromium installation, observed run outcomes, opaque screenshots/deletion, durable partial evidence, changes and Markdown walkthrough exports.
- Added additive SQLite migration and the `unravel` CLI alias, preserving `ravel`, existing storage, notes and historical routes. Packaged the compiled interface and 13 static public pages in wheel version 0.2.0.
- Fixed first-capture refresh, terminal job messaging, button contrast, heading order and redirect approval bypass discovered during testing. Added explicit additional local-origin approval for separate API ports.
- Verified 52 backend tests, one frontend fixture test, 23 browser tests, eight real experiment outcomes, separate network-boundary checks and installation outside the checkout without Node. Mobile landing performance median 92; automated accessibility, best practices and SEO 100.
- Saved a 340-image screenshot gallery and 30-case offline source evaluation. Live provider quality, Linux/minimum-Python execution and human usability remain unverified; no publication or outcome metrics are claimed. See `UNRAVEL_VERIFICATION.md` for exact scope.

Short entries record what changed, why, and how it was checked. No invented progress or product metrics.

## 2026-10-03 — Direction approved and recorded

- Byline's original posting problem exposed a deeper need: understand AI-assisted projects and discover worthwhile improvements.
- Rejected a general workflow debugger as the primary product after comparing existing tools and personal fit.
- Selected exploration → understanding → external change → evidence as the main journey.
- Selected Ravel, local app plus prepared public demo, SQLite, own API key, and warm/graphite design.
- Recorded the approved plan, failure cases, design and delivery constraints. Implementation and user outcomes are not yet validated.

## 2026-10-03 — First working Ravel workshop

- Replaced the active Byline screen with the Ravel landing, project library, feature overview, investigation, experiment, notebook and settings. Kept the original frontend and PostgreSQL context in the repository and archived its README/instructions for reference.
- Built the symmetrical landing and interactive source specimen, warm reading surfaces, graphite code, orange accents, responsive evidence access, dark mode and reduced motion.
- Added three clearly prepared demo explorations with browser-local notes and Markdown/JSON exports. Demo questions open prepared feature explanations; they do not pretend to run live AI or tests.
- Added a local read-only project connection, bounded source exclusions, Tree-sitter analysis, SQLite search and independent Alembic migrations. No Docker/database server is needed.
- Added immutable snapshots, comparisons, outdated notes/explanations and actual source hashes including dirty and non-Git folders.
- Added Anthropic explanations with consent, validated structured citations, bounded excerpts, retry/timeout behavior, versioned prompts and snapshot-specific caching. Live provider quality has not yet been evaluated.
- Added durable jobs, progress events/reconnection, cancellation and restart recovery. Interrupted checks require an explicit rerun.
- Added trusted execution of existing npm/pytest checks with real command output, timeouts, process-tree cancellation, source identity and result scope. Source changes and older investigation mismatches remain visible, including in exports.
- Saved OpenAPI-derived request contracts and connected them to the frontend client. Split the investigation screen into a lazy-loaded module and formatted the new implementation for readability.
- Fixed the loading race, unchanged-refresh state, cancellation/removal race, evidence/result mismatch and contrast failures found while testing.
- Removed unused template dependencies and patched development dependencies; npm audit reports zero known vulnerabilities.
- Verified 15 backend tests, one fixture test, seven browser tests, type check, production build and Python wheel contents. Saved detailed scope/limits in QA.md.
- Measured mobile Lighthouse medians: landing 97 performance and demo 98; accessibility, best practices and SEO 100 on both. Saved machine-readable results with timestamps.
- Added Windows/Linux CI and an isolated browser-test runner. Linux/minimum-version execution has not been observed yet.
- Added a practical learning guide and a 30-question evaluation seed set. User research, live model correctness, deployment and retention evidence remain pending.

## 2026-10-03 — Owner-directed charcoal redesign and documentation

- Recorded the rejection of the warm workshop presentation. Inspected the original yourbyline.vercel.app and composio.dev references; revised the design and product decisions to match the requested charcoal, vivid orange, sharp dividers and clearer product demonstrations.
- Rebuilt the symmetrical landing around selectable source steps, four feature walkthroughs, a five-step workflow, local setup, guide links and capability FAQ. Buttons open actual demo investigations or documented routes; illustrative examples remain labelled.
- Added purposeful hero, section and selection motion with reduced-motion support. Preserved full text opacity after contrast failures during animation.
- Updated workshop surfaces and direct labels, including Compare & check, Your notes and Save note. Added contextual help and documentation navigation.
- Added nine canonical Markdown guides and a lazy-loaded in-app documentation reader with search, section anchors, mobile topic selection and copy feedback. Documented how source, AI consent, snapshots, commits/worktrees, checks, notes and exports actually work, including their limits.
- Fixed mobile search result visibility and an invalid help link inside the investigation tablist found by accessibility checks.
- Verified type check, production build, one fixture test, ten browser tests and zero known dependency vulnerabilities. Real project registration, notes and trusted check execution continue to pass.
- Reran Lighthouse: revised landing median mobile performance 96; prepared overview 98; accessibility, best practices and SEO 100 in all runs. Preserved the initial measurements and saved the revision summary. No user retention, live-model quality or deployment outcome has been claimed.

## 2026-10-03 — Audit-led simplification and Geist typography

- The owner rejected the first charcoal revision as cluttered and asked for clearer fonts and a cleaner Composio/tester.army direction. Completed and saved a UI/UX, information hierarchy and color audit before rebuilding.
- Replaced Space Grotesk with self-hosted Geist across the active product. Increased reading sizes in the workshop and docs, reserved monospace primarily for source, removed brown fills and made primary actions neutral.
- Rebuilt the landing as four sections with one source/feature walkthrough, a three-step local workflow, compact setup/help and a smaller footer. Removed repeated feature explanations, the command wall and dense documentation directory from the landing. All guides remain in the documentation area.
- Added an original connected-source illustration with short entrance/connection motion and reduced-motion support. Walkthroughs do not auto-advance.
- Simplified library headings and the demo invitation, removed decorative rail prose and added a clear empty-project message.
- Fixed keyboard scrolling for longer documentation commands and aligned source-step accessible names with their visible labels.
- Verified type checking, production build, one fixture test and ten browser tests. Lighthouse mobile performance medians: landing 96, demo 98; accessibility, best practices and SEO 100 in every run. Existing local-project registration, notes, trusted check execution and export continue to pass.
- Saved the current design rules, audit, contrast calculations and revision measurements. Visual acceptance and user comprehension remain unmeasured until the owner and pilot users review the product.

## 4 October 2026 — Paper & Ink and playable examples

Owner supplied the editorial palette and asked for stop-motion-style examples and a walkthrough that fits together. Applied cream/ink with orange stamps, a separate Terminal Noir dark theme, and self-hosted Bricolage/DM Sans typography. Added a user-started four-chapter tour with Play/Pause/Restart and manual chapter controls. Reduced the heading/context stack, fixed chapter height, compacted phone source navigation, and kept guides outside the presentation frame. Examples remain explicitly prepared/illustrative; this is an interactive storyboard, not a recording of live AI execution. This direction overrides the previous dark-default instruction.

## 4 October 2026 — Motion, navigation, docs and identity redesign

The owner rejected the static tour and asked for visible transitions, more space, clearer steps, a changing navbar, a new logo and a docs redesign. Added Motion for React entrances, a staggered source-thread hero, an actual 20-second Remotion MP4 with desktop and portrait compositions, and manual chapter/play/pause/restart controls. Playback starts once when sufficiently visible, pauses offscreen/hidden, and stays manual with reduced motion. Examples moved behind disclosure to keep the page legible.

Rebuilt the navigation as a bar that compacts on scroll, with keyboard/mobile dismissal. Redesigned docs around a first-project overview, task guides, larger prose, contents and reading progress. Fixed /docs being intercepted by FastAPI Swagger: API docs moved to /api/docs and /api/redoc. Replaced the loop mark with an r/source/thread SVG and matching favicon.

Fixed transient text contrast, invalid tablist child content, film end-frame disappearance and mobile frame sizing during verification. Fourteen browser tests, fifteen backend tests, fixture test, type check and production build passed. Film assets are 443,305 bytes (wide) and 255,353 bytes (portrait). They are prepared illustrations; no live AI or customer outcome is implied.

## 4 October 2026 — Cobalt identity and scroll-driven story

The owner rejected the cream palette, repeated arrangement and timed player. Replaced them with a full-bleed cobalt brand poster, scroll-linked Motion scenes, optional original synthesized sound, independent examples and a specific audience/use-case section. Updated shared controls, dark theme, logo colors, docs overview and reading layout. Preserved older Remotion assets for reuse; the landing page does not embed them.

Added reverse-scroll, keyboard/sound, stage-fit and short-viewport checks. Found and fixed inherited orange-button text causing poor contrast, guide links disappearing as the scroll chapter changed, and tablet short-screen clipping. Updated product-tour/exploration guides, DESIGN.md, SCROLL_STORY.md and saved interface patterns. Verification results are recorded in QA.md.

## 4 October 2026 — Alignment and footer refinement

Aligned the story heading, equal-width chapter rail, stage and caption to one content grid. Reserved caption space to stop scene height shifting when descriptions wrap. Reduced scene entrance to an 8px eased translation without scale. Corrected mobile scroll offsets from 88px to the actual 76px header and made manual progress reflect chapters in the short-screen layout.

Replaced the compact footer with a navy closing spread: introduction, Explore/Field Guide link columns, large decorative brand signature and a back-to-beginning action. Kept links usable at 320px. Type check and production build passed; 17 browser tests passed, including stage stability through normal forward/reverse scrolling and footer accessibility/navigation on 320/768/1440px widths.

## 4 October 2026 — Welcoming introduction and first use

- Implemented the approved plan saved in FIRST_USE.md: a neutral off-white/navy hero with restrained cobalt, exact audience promise and local-browser explanation, a readable prepared feature, demo/project actions, install/launch/connect setup, and honest coming-next ideas. Retained the approved navy footer. Scroll chapters now choose → source → question → discovery, with existing keyboard, optional sound and stable/reduced-motion framing.
- Bundled the compiled interface into ravel-workshop 0.1.0 under apps/ravel/_web; retained checkout fallback. Default `ravel` opens the browser after readiness; manual `serve`, explicit `serve --open`, home/port options and `doctor` work with actionable errors. Source editable installs do not require a prebuilt interface. Publication/download hosting were not performed.
- Added the local welcome, OS folder help, progress/status and duplicate recovery, an evidenced short-feature recommendation, unsupported-project guidance with continued source reading, source-first exploration and saved-discovery completion/resume. Reused existing resource interfaces and records; no schema migration. Existing comparison, checks and notebook remain available.
- Updated Windows/macOS/Linux setup, stop/reopen, storage, AI consent/configuration, troubleshooting, walkthrough, architecture, README and product/design/delivery records. Linux/Windows CI now include wheel build and isolated install verification.
- Passed type checking, production build, one frontend fixture test, 30 backend tests and 18 browser tests. Backend coverage includes CLI compatibility/readiness/failures, real occupied ports, storage failure, provider rejection/retry exhaustion, invalid/duplicate/unsupported folders and failed recapture recovery. Browser coverage includes real source/no-key error/notes/check/save/reload, demo notebook/export, error recovery, themes, accessibility, responsive layouts and scroll/keyboard/sound controls.
- Clean Windows Python 3.14 environment outside checkout installed the final wheel and its dependencies. Runtime had no Node on PATH or source PYTHONPATH. Verified packaged assets/direct docs, loopback serving, doctor failures, source capture, missing-key response, saved discovery and stop/restart persistence. Fixed test-harness shutdown for Windows venv redirectors using an internal graceful-stop hook; no product shutdown endpoint was added.
- Mobile Lighthouse performance: landing 92/92/92 (median 92); demo 95/98/98 (median 98). Accessibility, best practices and SEO 100 in every run. Current measurements in lighthouse-summary.json; prior cobalt results preserved. Fixed a dark-theme native button background contrast issue found by the browser gate.
- Linux CI execution, live paid-provider success, listening review of sound, public release and real-user understanding/retention remain unverified. These tests do not certify all projects or prove outcomes.

## 2026-10-04 — Clearer landing page and readable setup

- Applied the approved design revision: shared 1184px grid, exact proposed subhead, accessible whole-card demo link, real fixture excerpts and line numbers, underlined story chapters, header sound control, fit-aware normal-flow fallback, compact expandable examples, open AI-key FAQ, closing demo/setup actions and cleaner navy footer.
- Reworked Quick Start with honest package availability, supported-project guidance, plain-language setup terms, accessible persistent OS tabs, language-labelled copyable code and contributor instructions. Public terminology uses exploration/notebook/discovery; technical identifiers and historical paths are preserved.
- Added build-time HTML for landing, docs overview and all ten guides from the same components/Markdown. Matching routes hydrate; other routes mount the app. Guarded browser state/storage and added safe directory-index serving plus explicit static-host rewrites. Rebuilt the existing wheel with every generated page.
- Fixed inherited source colors, narrow-screen clipping, public/app hydration mismatch, Markdown remounting during scroll, first-paint mobile docs layout shift and the breadcrumb touch target discovered during verification.
- Passed type check/build, one frontend fixture test, 31 backend tests, 32 browser checks and installed-wheel verification outside the checkout without Node. Saved 240 verified screenshots covering five widths, both themes, whole pages, sections and four story states.
- Mobile Lighthouse medians: landing 94, demo 95, setup 95; accessibility/best practices/SEO 100. Setup CLS improved from 0.643 to 0.000824 after the first-load fix. Lab measurements and verification limits are documented in DESIGN_REVISION.md and QA.md.
- Deferred the optional decorative page thread and package-request flow. No public release, signup, new model provider, editor extension, desktop wrapper or data-schema change.

## 2026-10-04 — Compact footer, source preview and charcoal dark theme

- Reduced the footer signature to 72–128px; enlarged footer navigation/description to 16px and labels/bottom text to 14px. Light footer stays navy; dark footer is neutral charcoal.
- Replaced the hero diagram with a source-backed save-handler preview, question and plain-language insight. Entire preview still opens `/projects/demo`; hero actions still lead to demo and Quick Start.
- Restored desktop scroll pinning on ordinary 900px laptop screens by compacting the heading/stage and lowering the conservative threshold to 760px with measured-fit fallback. Four chapters, source highlights, continuous progress, keyboard selection, optional sound and reverse scrolling remain. Chapter entry moves horizontally; reduced motion disables it.
- Replaced navy dark surfaces with neutral charcoal across shared application tokens. No new fonts, libraries or product claims.
- Fixed an inherited preview heading width that pushed the next section below the fold; wrapped the source excerpt on phones so the save call remains readable.
- Verification: type checking, production build (12 generated pages), fixture test, all 32 browser checks, then two final phone/theme checks after the wrapping adjustment. Browser coverage includes accessibility, scrolling at 1440×900, short screens, reduced motion, no JavaScript and hydration.
- Saved and verified 240 PNG exports plus 10 viewport/theme receipts and SHA-256 manifest in `.local/screenshots/charcoal-refinement/`; preserved the earlier archive. Gallery: `index.html`.
- Mobile landing Lighthouse medians over three runs: performance 93, accessibility 100, best practices 100, SEO 100. Performance runs ranged 90–96; this is a local synthetic measurement, not a user outcome.
- Rebuilt wheel and verified installed loopback launch, assets, direct docs, diagnostics, source, missing-key handling, discovery storage and restart outside the checkout with Node absent from PATH. Linux and paid live-model validation were not run in this refinement.
- Detailed rationale and official design references: `CHARCOAL_REFINEMENT.md`.

## 2026-10-04 — Restore scroll registration in narrow browser panels

- Navbar logo icon reduced from 30px to 22px on landing and documentation.
- Narrow panels no longer default to manual chapters below 1200px height. A compact pinned layout uses three actual source lines around each highlighted call, accurately labelled, and retains all four scroll-selected steps.
- Compact layout removes the duplicate heading/caption while keeping the story eyebrow, narration, chapter tabs, source evidence and progress. Screens below 700px, widths below 360px and reduced motion retain normal flow.
- Verified all four steps forward and backward at 545×742 (the current browser panel), 390×844 and 1280×720; complete stage visibility and no scene clipping. Eight targeted browser tests passed, alongside type checking and production build. The browser retained an earlier HTML document until a fresh revision URL was opened; current assets are now loaded.
