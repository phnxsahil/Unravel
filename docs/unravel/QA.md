# Ravel verification — 3 October 2026

Scope: the new active Ravel product in `byline/` and `apps/ravel/`, on Windows with Python 3.14, Node 24 and installed Chrome. The preserved legacy Byline modules and lovable-project were not certified by this suite.

## Initial implementation checks

The backend and package checks below were completed before the visual revision. The backend was not changed during that revision.

## Automated checks

| Gate | Result | What it establishes |
| --- | --- | --- |
| Backend pytest | 15 passed | Source exclusions/bounds, parsing, invalid citations, provider retry with a fake transport, immutable diffs, search, trusted real commands, cancellation/timeouts, source changes, full API journey, origin guards, restart recovery and repeatable migrations |
| Frontend Vitest | 1 passed | All prepared feature paths and citation ranges exist in the fixture source |
| Playwright | 7 passed | Demo exploration, prepared explanation, notebook reload/export, real local registration and command execution, responsive/accessibility checks, theme persistence, reduced motion and keyboard tab restoration |
| TypeScript | Passed | Active frontend type check; generated API request types are used by the client |
| Production build | Passed | React/Vite application and lazy investigation chunk build successfully |
| npm audit | 0 known vulnerabilities | Installed frontend dependency graph at audit time; not a security certification |
| Python wheel | Built; contents inspected | CLI, backend and independent SQLite migration history are included |

One upstream Starlette/httpx test-client deprecation warning remains; it does not fail the suite. Linux CI is configured but has not run in this local session. Live Anthropic requests were not made; provider tests use a fake transport.

## Initial Lighthouse measurements

Three runs per page against the production frontend served locally, using Lighthouse default mobile simulation. These are lab results and will vary with hosting, devices and workload.

| Page | Performance runs | Median performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- | --- |
| Landing `/` | 95, 97, 99 | 97 | 100 | 100 | 100 |
| Prepared overview `/projects/demo` | 100, 98, 98 | 98 | 100 | 100 | 100 |

All other category scores shown are 100 in each of the three runs. The original exact versions, timestamps and paint/layout measurements are preserved in `lighthouse-initial-summary.json`. Full raw reports are local artifacts in `.local/lighthouse/`. Run `npm run audit:performance` in byline/ with the local server running to regenerate them.

The initial landing performance was 82. File compression and lazy investigation loading improved transfer/startup work. The initial demo scored 84 because asynchronous prepared-data loading caused a layout shift; providing its prepared data immediately removed that shift. These measurements are performance findings, not evidence of improved learning or retention.

## UI review

Browser checks cover landing and workbench at 390, 768 and 1440 pixels, with no document overflow or axe WCAG A/AA violations in the checked states. Dark landing, persistent theme, reduced motion, source selection, mobile evidence access and keyboard tabs are exercised. Desktop and phone workbench screenshots were also visually inspected.

Fixed during verification:

- Weak orange-on-tinted-paper contrast and muted source-line contrast.
- A race where the project became ready before an empty feature query was refreshed. Feature queries now follow the actual snapshot identity and readiness.
- Unchanged refresh leaving a project labelled as indexing.
- Cancellation state and a race allowing removal while a cancelled operation was still finishing.
- A check on newer source appearing to verify older investigation evidence. UI and Markdown exports now show the mismatch.
- Default template/development dependency vulnerabilities; inactive dependencies were removed and supported fixes applied.
- An invalid download assertion in the browser test itself.

## Charcoal design revision verification

The owner requested the original Byline and Composio references, clearer feature explanations, dark surfaces, transitions and per-feature docs. Verification was repeated against the revised production UI.

- TypeScript and production build passed. The documentation is a lazy-loaded module; its canonical Markdown is bundled from docs/ravel/guides.
- Fixture Vitest: 1 passed. npm audit: 0 known vulnerabilities.
- Browser suite: **10 passed**. Existing demo/local-project journeys still verify source, notes, a real trusted command, export and reload. New coverage verifies selectable feature walkthroughs, keyboard movement, workflow-to-guide links, search/no-results, mobile navigation and docs topic selection.
- Landing and workbench pass checked axe WCAG A/AA states with no document overflow at 390, 768 and 1440px. Docs and landing also pass dark/light checks at 390 and 1440px. Reduced motion and theme persistence pass.
- Visually inspected landing, feature explanation and documentation on desktop and phone layouts. Saved the final landing preview locally at .local/ravel-redesign.png.
- Fixed text fading below contrast requirements during transitions by retaining full opacity. Fixed the contextual help link being incorrectly nested inside an ARIA tablist. Help is now a sibling of the actual tabs.
- Corrected mobile documentation search so matched guides remain visible and selectable.

Three Lighthouse mobile runs per page on the revised local production build:

| Page | Performance runs | Median performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- | --- |
| Landing `/` | 96, 96, 96 | 96 | 100 | 100 | 100 |
| Prepared overview `/projects/demo` | 98, 99, 97 | 98 | 100 | 100 | 100 |

Other category scores are 100 in each run. The first charcoal revision measurements are preserved in lighthouse-charcoal-first-summary.json; these remain local lab results, not deployed or field performance. The final follow-up adjusted workshop tab semantics, documentation reading size and one documentation label; it did not change the audited landing or overview content.

## Practical limits and next evidence

- Static feature discovery is intentionally limited; dynamic routes/imports and complete runtime architecture are not established.
- AI excerpt selection is bounded and currently favors the first 100 lines of selected files. Citation existence is validated; semantic correctness still needs human evaluation.
- Secret detection is best effort, snapshots are local unencrypted SQLite data, and trusted scripts are not sandboxed.
- Graceful cancellation/recovery is tested. A hard machine/process crash can require manual inspection of orphaned commands.
- Prepared examples have no live AI or fake passing checks. The real example command verifies only its stated URL assumption.
- Minimum supported Python/Node versions and Linux execution remain for the configured CI to verify.
- The owner-plus-five-builders pilot and the 30-question human review remain pending. No learning, retention, customer or hiring outcome has been claimed.

See `EVALUATION.md` for the review and pilot protocol and `LEARNING.md` for a first hands-on session.

## Simplified Geist revision — 3 October 2026

The owner's second correction requested clearer fonts, a UI/UX and color audit, less clutter and a Composio/tester.army direction. DESIGN_AUDIT.md records the critique before implementation and the changes made afterward.

- Landing reduced from seven sections to four, with one source/feature walkthrough. The initial rendered story contains approximately 408 words versus 698 before, including visible source content.
- Geist replaces Space Grotesk; general UI text is larger and source remains in IBM Plex Mono. Dark neutral selection replaces brown highlights, and primary buttons are white on the dark theme.
- Type check, production build and the fixture test passed. Dependency installation reported zero known vulnerabilities.
- All **10 browser tests passed**, including the real local-project journey with notes, a trusted command and export. Axe coverage now includes WCAG 2.1 A alongside existing A/AA tags.
- Checked landing/workbench at 390, 768 and 1440px. Docs and landing pass checked dark/light accessibility states at 390 and 1440px. Keyboard selection, mobile menus, guide navigation, reduced motion and theme persistence pass.
- Fixed a newly exposed documentation issue: larger command text needed keyboard access to horizontal scrolling. Code examples are now focusable. Source-step accessible names use their visible labels.
- Visually inspected the revised desktop and phone landing. The attempted phone workshop screenshot and final screenshot save were blocked by browser approval usage limits; no ravel-clean-design.png was produced.

| Page | Performance runs | Median performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- | --- |
| Landing `/` | 96, 97, 96 | 96 | 100 | 100 | 100 |
| Prepared overview `/projects/demo` | 98, 98, 99 | 98 | 100 | 100 | 100 |

Each remaining category scored 100 in every run. The current measurements are in lighthouse-summary.json; previous revision summaries are preserved separately. These checks do not establish aesthetic approval, comprehension, live AI quality or retention. Backend behavior was not changed during this design revision.

## Paper & Ink revision — 4 October 2026

- Type check, fixture test and production build passed. Twelve browser tests passed, covering source/notes/export, real local project checks, keyboard navigation, theme persistence, docs, and WCAG A/AA checks on tested states.
- New playback tests confirm start, advance, pause, restart, stable chapter height, all chapter content fitting its frame and full frame visibility at 390×844 and 1440×900. Layout/axe coverage also includes 768px. Reduced-motion presentation remains manually operable.
- Found and fixed insufficient contrast in source filenames over the cream selected surface (4.14:1 before darkening quiet text).
- Visually inspected the cream desktop landing, full desktop tour and phone source/explanation chapters through the in-app browser. Saved .local/ravel-paper-tour.png. The stopped preview server was restarted on port 8000.
- Three mobile Lighthouse runs: landing 97/97/97 performance; demo 96/97/96. Accessibility, best practices and SEO were 100 in all runs. These were measured before final label-font cleanup. Final build passed afterward. Measurements and prior Geist results are saved separately.
- No live-model behavior or backend code changed. The storyboard is a prepared demonstration, not a live AI recording or evidence of learning/retention outcomes.

## Motion and documentation redesign — 4 October 2026

- Fourteen browser tests passed. They cover real source/notes/export, trusted local checks, keyboard tabs, responsive overflow and WCAG A/AA audits, docs home direct navigation/search, actual video playback, reduced-motion paused state, frame fit at 390×844 and 1440×900, offscreen pause and navbar compaction.
- Fifteen backend tests passed after moving API documentation away from /docs. Two unrelated environment/deprecation warnings were reported (pytest cache permission and Starlette/httpx). Fixture test, type check, production build and dependency audit passed (zero known vulnerabilities reported).
- Fixed the route collision where a direct /docs visit rendered Swagger instead of product documentation. /api/docs and /api/redoc now contain backend reference; product /docs loads the field-guide overview.
- Fixed transient low contrast during fade/color animations by preserving full text opacity and removing theme background interpolation. Fixed a non-tab link inside the tablist, mobile frame clipping and a film that faded to an empty last frame.
- Desktop film: 443,305 bytes; portrait film: 255,353 bytes. Silent H.264 MP4s have posters, captions, HTML transcript, manual chapter controls and expandable examples. Prepared examples are not live model execution.
- Three mobile Lighthouse runs: landing performance 94/98/96 (median 96), demo 95/95/96 (median 95). Accessibility, best practices and SEO scored 100 in all runs. These were measured before final mobile menu-link and guide-text cleanup; final build is verified afterward. Previous measurements are preserved separately.
- Visual review includes the desktop landing, motion section, docs overview and guide, plus portrait film and mobile guides. Screenshots live in .local/ravel-motion-*.png.

These checks establish tested layout, interaction and accessibility behavior. They do not establish aesthetic approval, complete live-AI correctness, understanding or retention outcomes.

- Final chapter-control correction: manual selection holds a readable frame within each chapter; restart displays the complete poster while paused. The production build, type check and all 14 browser tests passed again after this change.

## Cobalt and scroll-story revision — 4 October 2026

- Type check and production build passed. All 16 browser tests passed in the final run (56.1s). Includes landing → real demo source/explanation/notebook/export, real local registration and trusted checks, theme persistence, keyboard chapters, doc search/direct routes, responsive overflow and WCAG A/AA audits on tested states.
- Scroll test confirms forward and reverse navigation changes scenes without video playback. Manual/reduced-motion checks confirm every scene fits at 390×844 and 1440×900, stage height stays stable and sound can be enabled/muted. Short-viewports at 320×568 and 768×600 release the canvas and retain scene content. Sound control was tested; an audible listening review was not performed.
- Found and fixed inherited orange-action text against cobalt (2.75:1), missing per-example guide links after leaving the pinned story, and a tablet short-screen max-height that clipped content.
- Browser visual review covered full-bleed identity, desktop/phone scenes and the mobile product-tour guide. Saved .local/ravel-cobalt-hero.png, ravel-cobalt-story.png and ravel-cobalt-docs.png.
- Three Lighthouse mobile runs: landing 94/91/93 performance (median 93); demo 95/98/99 (median 98). Accessibility, best practices and SEO were 100 in every run. Current summary in lighthouse-summary.json; the former film measurements are preserved in lighthouse-motion-summary.json.
- Backend behavior and live-provider execution were not changed by this revision. The 16-test browser suite includes existing local backend journeys; no new backend pytest claim is made. Visual preference and real-user comprehension remain for user review.

## Alignment and footer refinement — 4 October 2026

Type check and production build passed. All 17 browser tests passed in the final run (1.0m). Added stage position/size stability checks while advancing and reversing the scroll story, plus footer link, overflow and A/AA checks at 320/768/1440px. Existing provider consent, local source/notebook/export/check and docs journeys remain covered.

Browser inspection confirmed heading, toolbar, canvas and caption share the same 20px/488px left edge/width in the default preview. The caption reserves its height through chapter changes; scene entrance no longer scales the layout. Visually reviewed the new navy footer and phone story. Saved .local/ravel-polished-footer.png and ravel-polished-story.png. No new performance measurement or live-provider execution claim is made for this small refinement.

## 4 October 2026 — Welcoming introduction and first use

- Implemented the approved plan saved in FIRST_USE.md: a neutral off-white/navy hero with restrained cobalt, exact audience promise and local-browser explanation, a readable prepared feature, demo/project actions, install/launch/connect setup, and honest coming-next ideas. Retained the approved navy footer. Scroll chapters now choose → source → question → discovery, with existing keyboard, optional sound and stable/reduced-motion framing.
- Bundled the compiled interface into ravel-workshop 0.1.0 under apps/ravel/_web; retained checkout fallback. Default `ravel` opens the browser after readiness; manual `serve`, explicit `serve --open`, home/port options and `doctor` work with actionable errors. Source editable installs do not require a prebuilt interface. Publication/download hosting were not performed.
- Added the local welcome, OS folder help, progress/status and duplicate recovery, an evidenced short-feature recommendation, unsupported-project guidance with continued source reading, source-first exploration and saved-discovery completion/resume. Reused existing resource interfaces and records; no schema migration. Existing comparison, checks and notebook remain available.
- Updated Windows/macOS/Linux setup, stop/reopen, storage, AI consent/configuration, troubleshooting, walkthrough, architecture, README and product/design/delivery records. Linux/Windows CI now include wheel build and isolated install verification.
- Passed type checking, production build, one frontend fixture test, 30 backend tests and 18 browser tests. Backend coverage includes CLI compatibility/readiness/failures, real occupied ports, storage failure, provider rejection/retry exhaustion, invalid/duplicate/unsupported folders and failed recapture recovery. Browser coverage includes real source/no-key error/notes/check/save/reload, demo notebook/export, error recovery, themes, accessibility, responsive layouts and scroll/keyboard/sound controls.
- Clean Windows Python 3.14 environment outside checkout installed the final wheel and its dependencies. Runtime had no Node on PATH or source PYTHONPATH. Verified packaged assets/direct docs, loopback serving, doctor failures, source capture, missing-key response, saved discovery and stop/restart persistence. Fixed test-harness shutdown for Windows venv redirectors using an internal graceful-stop hook; no product shutdown endpoint was added.
- Mobile Lighthouse performance: landing 92/92/92 (median 92); demo 95/98/98 (median 98). Accessibility, best practices and SEO 100 in every run. Current measurements in lighthouse-summary.json; prior cobalt results preserved. Fixed a dark-theme native button background contrast issue found by the browser gate.
- Linux CI execution, live paid-provider success, listening review of sound, public release and real-user understanding/retention remain unverified. These tests do not certify all projects or prove outcomes.

## 4 October 2026 — Landing and setup refinement

Current verification: type check/build, one frontend fixture test, **31 backend tests**, **32 browser checks**, and final wheel installation outside checkout with Node absent from runtime PATH. Every generated documentation index is verified through the installed package. Public routes render without JavaScript; matching routes hydrate without browser errors. A delayed-module regression test confirms stable mobile guide positioning, and WCAG 2.2 touch targets pass.

Five requested widths × both themes pass overflow, 12px text-floor and accessibility checks. Measured desktop column edges are 186/810px. 240 section/full-page/chapter PNGs with viewport/theme metadata, image hashes and an offline gallery are saved in `.local/screenshots/design-revision/`. Normal full-page images include the intentional pinned runway; four separate scenes and normal-flow captures are provided.

Three-run mobile Lighthouse performance medians: **landing 94, demo 95, Quick Start 95**; accessibility, best practices and SEO **100** throughout the final runs. Docs initially scored 73 median with CLS 0.643 due to post-hydration disclosure collapse. Fixing first-paint navigation/OS presentation and the breadcrumb target reduced CLS to 0.000824. Reports and summary are in `.local/lighthouse/design-revision/`. These are lab results. The existing FastAPI/httpx deprecation warning remains; Linux/minimum-Python execution and live paid-provider quality remain unobserved locally.

See [DESIGN_REVISION.md](DESIGN_REVISION.md) for exact scope, changed files and remaining release work.
