# Ravel: clearer landing page and setup guide

Implemented 4 October 2026 from the owner's design brief and approved implementation plan. This revision supersedes the older 1280px outer-container and 350svh story specifications. It refines the existing product; it does not publish a release.

## What changed

- Scoped public-page tokens retain Bricolage Grotesque, DM Sans, IBM Plex Mono and the existing cobalt/navy palette. The usable container is 1184px, with equal columns and a 64px desktop gap. Hero and story surfaces are white in light mode and use the brief's single shadow token. Dark borders are stronger. Readable public text has a 12px floor.
- The headline remains “Understand the code you built with AI.” The subhead is “Trace one feature through your real files, then write down what clicked.” The entire prepared hero example is one ordinary link to the demo, with no nested action.
- Four chapters now show fixture source on the left and narration on the right. Excerpts are sliced directly from `demoFiles`, with actual filenames, line numbers and an active line: DraftEditor.tsx 18–24, routes.py 4–10, DraftEditor.tsx 5–14, store.py 3–9. These demonstrate the prepared writing app, not the implementation of Ravel's own notebook.
- Underlined chapter controls retain arrow/Home/End keys, scroll selection, continuous progress and reversible navigation. Choosing the feature row advances to source. Sound is labelled, off by default and located in the stage header. Narration moves 8px; entrance, thread, highlight, accordion and arrow transitions respect reduced motion. Content starts visible.
- Desktop scroll runway is 260svh; sufficiently tall phones use 240svh. Short or reduced-motion screens use normal flow and manual chapters. A resize observer releases a pinned frame if its caption cannot fit. The conservative entry thresholds are 960px desktop height and 1200px phone height; content-fit checks take precedence. There is no additional trailing spacer.
- “Take a closer look” remains four genuinely expandable examples in a compact 2×2 grid, with descriptions visible in their summaries. Audience, setup/FAQ, roadmap and footer share the hero grid. The AI-key question starts open, using native disclosure buttons with explicit expanded state and controlled panels.
- Roadmap copy remains unchanged, with a smaller heading before “See where your saved draft goes.” The approved navy footer retains its navigation and one Back to top control. Its existing-font wordmark spans the container, without stroke, synthetic weight, gradient or standalone arrow.

## Actual destinations

| Action | Destination / behavior |
| --- | --- |
| Open Ravel | `/projects` |
| Try the demo | `/projects/demo` |
| Complete hero example | `/projects/demo` |
| Use with your project / Installation guide / closing setup link | `/docs/quick-start` |
| First story feature row | Selects the source chapter |
| Closer-look summaries | Expand real prepared content in place |
| Actions inside expanded prepared examples | Open the existing draft-persistence exploration; the notebook action selects its notebook tab |
| Footer links | Existing demo, projects, setup, documentation, privacy and troubleshooting routes |
| Back to top | `/#main-content` |

Forward arrows indicate internal actions; footer link lists have no arrows. No release, waitlist, affiliation or user-outcome claim has been added.

## Setup and documentation

Quick Start begins with trying the demo, installing only after receiving the wheel, and connecting a supported project. The no-download warning precedes commands; supported-project guidance precedes folder instructions. Wheel, virtual environment, `--home` and provider consent have plain-language definitions. Replaceable literal paths are explained outside copied commands, preserving quoting and executable examples. Launch alternatives have comments.

Windows is the default installation platform. Explicit macOS/Linux selection persists through guarded browser storage; Left/Right/Home/End move between accessible tabs. Both instruction sets remain visible without JavaScript. Code blocks carry their actual language, copy controls and horizontal scrollbars. Contributor instructions explain the historical active `byline/` directory and remain at the bottom.

The docs shell shares the 1184px container and a reading column of at most 720px. Below 1200px, guide navigation and contents become disclosures. Markdown bodies are memoized so reading-progress updates do not remount headings or code. Mobile navigation starts collapsed before hydration, and only the default OS panel is shown before enhancement when JavaScript is available; this prevents initial layout jumps. The breadcrumb has a 44px touch target.

Naming: Documentation is the guide collection; Ravel is the application; exploration is the user's activity; notebook is saved work; discovery is a saved item. User guides now use these terms. Backend `investigations`, API routes, export fields, `ravel_workshop` package names and technical architecture references remain intact. There is no schema or resource-contract migration.

## Build-time rendering and serving

`npm run build` builds the client and then generates 12 pages from the same React components and Markdown: landing, docs overview and ten guides. Vite builds a temporary server-rendering entry under its ignored cache directory. The client enhances matching generated routes with React; interactive and unknown routes use normal application rendering. Browser-only state and optional storage are guarded. With JavaScript disabled, all four source chapters are in normal reading order, both OS instructions are available, and guide links navigate normally.

The authorized integration exception is confined to static serving: a generated directory index is checked safely inside the asset directory before the existing app-shell fallback. Vercel rewrites now target generated guide indexes explicitly. Existing frontend build and wheel packaging automatically include all pages. Public routes, CLI commands, API contracts and application data behavior remain unchanged.

## Verification

- Type checking, production build, one frontend fixture test, 31 backend tests and 32 browser checks passed. One existing FastAPI/httpx deprecation warning remains.
- Landing and Quick Start were measured at 1556, 1280, 1024, 768 and 390px, in both themes, at 1020px height. No horizontal overflow or readable text below 12px was found. At 1556px, left edge = 186px; hero, audience, FAQ, second roadmap item and footer navigation all start at 810px. The next section heading begins within the specified fold.
- Coverage includes all four chapters, scroll/reverse-scroll, stable stage dimensions, keyboard selection, optional sound controls, short 320×568 and 768×600 screens, reduced motion, menu behavior, accessible guides, OS persistence, literal command copying, blocked storage, zero browser/hydration errors, and no-JavaScript reading/navigation. A delayed-module test verifies that mobile setup keeps its first-paint heading position when React loads; WCAG 2.2 touch-target checks pass.
- The final wheel was reinstalled in an isolated Windows Python 3.14 environment outside the checkout, with Node absent from runtime PATH and no source PYTHONPATH. Verified all eleven generated documentation indexes, assets/fonts, local storage, diagnostics, source capture, missing-key behavior, saved discovery and restart. Linux/minimum-Python execution remains assigned to the existing CI matrix and was not observed locally.

### Mobile Lighthouse

Three production-server runs per route, mobile lab simulation:

| Page | Performance runs | Median | Accessibility / best practices / SEO |
| --- | --- | --- | --- |
| Landing | 93 / 97 / 94 | 94 | 100 / 100 / 100 |
| Demo | 94 / 95 / 96 | 95 | 100 / 100 / 100 |
| Quick Start | 94 / 98 / 95 | 95 | 100 / 100 / 100 |

The first docs audit exposed hydration-driven navigation collapse: performance 74/73/72, accessibility 97, first-run cumulative layout shift 0.643. After fixing first-paint disclosure/OS behavior and the breadcrumb target, docs layout shift measured 0.000824 in all three runs. These are laboratory measurements, not production traffic or user-outcome evidence. Reports: `.local/lighthouse/design-revision/`.

## Screenshots and review

240 verified PNGs are saved in `.local/screenshots/design-revision/`: 24 per width/theme combination. Each includes normal full landing and Quick Start pages, first screens, every landing section, separate captures of all four story states, a normal-flow reduced-motion landing, the complete guide article, all six guide sections and macOS/Linux instructions. Metadata records actual viewport, theme and layout measurements; the manifest records image dimensions and hashes. `index.html` is an offline gallery.

A normal full-page image contains one pinned scene and its intentional scroll runway; it cannot represent all chapter states. Use the separate stage captures or the reduced-motion full page for that review. Old capture artifacts remain archived separately.

## Changed files

- Public UI: `byline/src/ravel/{Landing,ScrollStory,SiteChrome,Docs,shared}.tsx`, new `public-design.css` and `prerender.tsx`.
- Build/hosting: `byline/src/main.tsx`, `byline/index.html`, `byline/package.json`, `byline/scripts/{prerender,lighthouse}.mjs`, `byline/vercel.json`.
- Static integration/verification: `apps/ravel/api.py`, new `apps/ravel/tests/test_public_assets.py`, `scripts/verify_install.py`, `byline/tests/{workshop,public-pages}.spec.ts`.
- Guides and records: Quick Start, product tour, architecture and user-facing exploration terminology; DESIGN.md, QA.md, CHANGELOG.md, DELIVERY.md and this record.

## Deferred

Optional page-length decorative thread and package-request flow remain deferred. Public package publication/download hosting, a desktop wrapper, editor extension, signup, live paid-provider evaluation, audio listening review and real-user learning/retention studies are not part of this delivery. No new product capabilities or unavailable-feature claims were introduced.
