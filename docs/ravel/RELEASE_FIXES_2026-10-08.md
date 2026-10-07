# Unravel 0.2.1 — product readiness fixes

8 October 2026. Follow-up to PRODUCT_READINESS_AND_LAUNCH_DIRECTION_2026-10-07.md. This is an implementation record, not a public launch announcement.

## What changed

The main demonstration is now **200 OK. Broken UI.** Search succeeds at the HTTP layer while an intentionally incompatible response fails the frontend array check. **It worked before that prompt** is the campaign hook, not a claim that an AI made a real edit. Public outcomes remain explicitly labelled prepared simulations. The disposable reference app and approved browser runner produce real observations separately.

Overview introduces Search. Explore shows its handler and candidate backend connection. Experiments keeps the selected scenario and shows a prepared result without repeating the map. Changes compares `results` with `items`. Notebook exports a labelled sample walkthrough. Real projects retain their own captures, notes and run evidence.

## Audit finding status

| Finding | Status | Implementation / remaining boundary |
| --- | --- | --- |
| R01 — photo defaults in real projects | FIXED | App URL starts empty. Typed source proposals supply supported controls and request paths from the selected feature snapshot. Unknown evidence remains empty with recovery instructions. Assertions are supplied by the user. |
| R02 — Search request loses backend connection | FIXED | Complete literal paths normalize query suffixes. Dynamic path concatenation and external URLs do not establish route matches. Connections remain inferred, not runtime claims. |
| R03 — demo invitation advertises writers/drafts | FIXED | Project library, landing and current guides describe the actual Search contract example. Historical writing demo URLs remain available. |
| R04 — repeated demo / selection reset | FIXED | Prepared views serve distinct purposes, scenario selection persists within the browser tab, and real feature selection persists through navigation/reload. |
| R05 — overwhelming experiment editor | IMPROVED | Numbered URL → source proposal → one saved recipe approval → observations flow. Action setup is disclosed after entering a URL; advanced allowlisted step editing remains necessary for unsupported controls. No guessed running-app port or expected result. |
| R06 — distribution | LOCAL ARTIFACT COMPLETE | Versioned wheel, checksum manifest and outside-checkout installation verification. No public hosting or package publication occurred; setup links continue to real instructions. |
| R07 — dead-end demo Changes / Notebook | FIXED | Source-contract comparison and downloadable sample walkthrough. No fake saved personal notes or live results. |
| R08 — live AI evaluation | UNVERIFIED | No configured provider for reviewed live evaluation. Prior offline context coverage is not evidence of answer accuracy, cost or improved success rate. |
| R09 — uninteresting initial photo outcome | FIXED | Primary demo becomes Search: working response, incompatible 200 response, or controlled failure. A deliberate Try Search action reveals the prepared outcome. Photo remains a compatible secondary reference. |
| R10 — generic questions do not focus evidence | IMPROVED | Rule-based suggestions focus the entry source and highlight a supported handler, error branch or request-contract line when found. Missing branches do not become invented explanations. |
| R11 — return loop | IMPROVED | Follow this feature preserves an investigation without AI or a note. Changes links to current source, preserved evidence and saved experiment review. No automatic monitoring or rerun. |
| R12 — historical workspace confusion | FIXED | Original overview and saved workbench have context labels and links to the current Studio. Existing notes and URLs preserved. |
| R13 — obsolete writing-app film | DEFERRED | Old film is not a launch-ready asset. Product fixes precede replacement film production; no new film was rendered or claimed. |
| R14 — repeated public narration | IMPROVED | Shorter hero explanation, one coherent Search case, concrete response comparison, and distinct exploration/results/export views. |
| R15 — mobile installation expectations | FIXED | Setup explicitly explains that installation and folder connections happen on the development computer; the demo is available on any screen. |
| R16 — Linux / minimum Python / independent usability | UNVERIFIED | Updated CI targets Windows and Ubuntu on Python 3.12 with optional browser support and correct wheel version. These remote jobs have not run here. Local verification uses Windows/Python 3.14. Independent usability remains unmeasured. |
| R17 — fabricated learning metrics | PRESERVED BOUNDARY | No click-derived understanding scores, invented resume metrics or invasive analytics introduced. |
| R18 — launch-video formats | DEFERRED | New film, vertical cut and channel assets remain separate production work after the supported journey. |

## Engineering and design rules

- `GET /api/features/{id}/recipe-suggestion`: Pydantic source proposal with snapshot identity, request paths, editable steps, citations and limitations. No model-generated executable code.
- `ordinary` recipe scenario is additive. It observes unmodified requests and still requires explicit origin, action and disposable-data approval. A missing target request or assertion stays inconclusive.
- Approval applies to one selected saved recipe and resets after selection/editor changes. Existing scenario enums, APIs, CLI aliases, storage and snapshots remain compatible.
- `unravel reference --example search --port 8017` serves the compiled Search app. `--variant ambiguous` reproduces an incompatible HTTP 200 response; `--variant broken` returns 500. Default photo reference command remains unchanged.
- Preserve Geist, neutral light/dark, symmetrical grid, flat header, readable navigation and substantial footer. Prepared code has original filenames and line numbers. No screenshot gallery or film added to the product flow.
- Phone walkthrough pinning budgets heading, tabs, stage and guide link together. Redundant outer narration is omitted only in compact pinned mode; short-screen/reduced-motion fallback retains normal-flow content.
- Decorative footer watermark uses CSS-generated artwork with `aria-hidden`; the readable brand is already provided above. This preserves the requested faint watermark without treating it as body text.
- Bound syntax-highlight caching to eight small sources. Public pages preload their actual self-hosted Geist font; documentation CSS is included only on generated documentation pages.

## Verification

- Final backend suite: **58 passed**, including conservative dynamic-button handling. Test output includes an upstream TestClient deprecation warning and a local pytest-cache warning; neither caused a failing test.
- Type checking, production build and three frontend unit cases passed. Build generates 13 readable public pages plus photo/search reference entry points.
- Thirty browser cases passed: complete controls in both themes at 1440×900, 1280×720, 1024×768, 768×1024 and 390×844; docs readability, no-JavaScript FAQ, all story chapters, real project capture/notes/export, invalid-folder states, explicit experiment approval and compatible photo run/reopen/artifact deletion.
- A subsequent twelve-case pass, repeated against the final performance build, added the real Search UI journey: automatic source proposal, correct map, ordinary browser run, restart/reload result, selected-feature persistence and following a feature without AI. Thirty-one distinct frontend browser cases across these two runs, with overlapping cases rerun.
- Nine actual Chromium Search runs passed across correct, incompatible and broken reference implementations. Each variant checks a matching expectation, an intentionally wrong expectation, and controlled failure. Incompatible ordinary runs record HTTP 200 while the frontend shows Search unavailable. No request bodies stored.
- Wheel installed into a previously created isolated environment outside the checkout, with Node removed from PATH. Both aliases, direct generated docs, frontend assets, source proposal endpoint, diagnostics, missing-key error, saved note and restart passed.
- Initial fresh mobile Lighthouse scores: 88, 84, 87 (median 87); decorative watermark flagged by contrast audit. Performance correction and fresh final measurements are recorded below when complete.

## Remaining release decisions

Public distribution destination; independent usability participants; minimum-Python/Linux execution evidence; reviewed live-provider evaluation and real cost measurement; replacement launch-film production. These are not claimed complete by a local source/build pass.

### Final performance and package evidence

- Final three-run mobile Lighthouse: **92 / 89 / 91 performance**, median **91**; **100 accessibility, 100 best practices and 100 SEO** in all three runs. Local production server and installed Chrome; these are measurements of this local environment, not universal hosted performance claims. The previous median was 87. Raw reports: `.local/lighthouse/search-release-final/landing-{1,2,3}.json`.
- Rebuilt wheel includes **39** frontend files, all byte-compared with `byline/dist`. Package: `.local/releases/ravel_workshop-0.2.1-py3-none-any.whl`. Machine-readable size/checksum: `.local/releases/unravel-0.2.1-manifest.json`.
- Local interface restarted on `http://127.0.0.1:8000/` with the existing isolated audit storage, preserving its registered project. Public publication remains separate.

### Changed files

Backend: `maps.py`, `recipe_suggestions.py`, `experiment_api.py`, `experiments.py`, `reference.py`, `cli.py`, `tests/test_experiments.py`. Frontend: `SearchJourney.tsx`, `Studio.tsx`, `studio-api.ts`, generated contracts, `Landing.tsx`, `App.tsx`, `Workbench.tsx`, `SourceExcerpt.tsx`, `SiteChrome.tsx`, `unravel.css`, `refinement.css`, `search-reference.tsx`, `search.html`, `vite.config.ts`, `scripts/prerender.mjs`, browser regression specs. Release: `pyproject.toml`, `scripts/verify_search.py`, `scripts/verify_install.py`, Windows/Ubuntu workflow, README, AGENTS, design notes, task guides and changelog. Unrelated legacy changes were preserved.
