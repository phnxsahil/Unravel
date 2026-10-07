# Unravel landing audit — 7 October 2026

## Scope and evidence

This is an audit of the entire current landing page followed by implementation and repeated checks. It includes header, hero, interactive photo example, four-chapter Search walkthrough, expandable examples, change review, setup, FAQ, closing action and footer. Shared navigation/footer regressions were checked on documentation pages too.

The requested matrix was run in Chrome through Playwright: **1440×900, 1280×720, 1024×768, 768×1024 and 390×844**, each in explicit light and dark mode. Browser zoom was 100%, device scale factor 1. Vite ran at `127.0.0.1:5173`; production regression tests used the rebuilt interface at `127.0.0.1:8000`.

The page was swept in increments of 288–320px. Each stop has a native viewport PNG and measurements of bounds, computed typography, composited foreground/background contrast, controls, overflow, clipping, section height and active chapter. Fonts were awaited before capture. Additional renders cover all four chapters, slow/failure/change hero states, all expanded examples, open FAQs and the mobile menu. No long-page images were used.

Scroll sequences were visually reviewed in contact sheets, with original-size checks of hero, code, expanded examples, short-screen walkthroughs, menu, FAQ and footer. Reduced thumbnails are a navigation aid; the gallery links to the original PNGs at the recorded viewport size. Native review caught duplicate list markers that the overflow checks did not detect.

Artifacts are in the repository-root `audit/` directory, excluded from Git:

| Capture | Native viewport renders | Scroll frames | Purpose |
|---|---:|---:|---|
| `before/` | 338 | 214 | Baseline |
| `after-1/` | 340 | 216 | First corrections and deeper recheck |
| `after-2/` | 340 | 216 | Fit, hover containment, code guidance and focus corrections |
| `after-3/` | 340 | 216 | Sound label and CTA hierarchy corrections |
| `after-4/` | 340 | 216 | List markers and accessible heading names; expanded header measurements |
| `after-5/` | 340 | 216 | Header target corrections; native footer spacing review |
| `after-6/` | 340 | 216 | Aligned header/footer brand insets; final version |

Total: **2,378 original renders**, including **1,510 scroll stops**. Review-sheet PNGs are not counted as original renders. `audit/index.html` opens all passes; each variant's `measurements.json` preserves every recorded state. `audit/metrics.json` summarizes the measurements; `audit/interaction-checks/` records normal, hover and focus styles and initial layout shifts.

The baseline captured one script-initialization error per context: the harness accessed `document.documentElement` before it existed. This was a harness defect, not a site error. Theme storage was written first, so baseline themes are correct. The harness was corrected and subsequent sweeps report no page/console errors. Raw baseline logs are retained. Early summary screenshot counts were one too high; the table above counts actual native files.

A second measurement correction matters: the visibility threshold originally excluded the fixed header along with occluded page content. Header hover/focus tests existed, but the original target-size sweep missed its controls. `after-4` was remeasured with a header-specific visibility rule. This found the desktop Docs link at 32.58px width and theme/Open controls at 40px height. The strengthened interaction test failed in six desktop contexts, confirming the gap; `after-5` includes the header in every scroll measurement and verifies those controls at 44px minimum.

## Full issue register

Broken = behavior or content that can fail; Confusing = weak understanding or navigation; Polish = visual/detail issue. Priorities: P1 material failure, P2 usability, P3 detail. No P0 was found. Every final status below is backed by the after renders, DOM checks or named interaction tests.

| ID | Where / issue | Severity | Why it hurts | Concrete change | Final status / evidence | File changed |
|---|---|---|---|---|---|---|
| 01 | Wordmark links are 40px tall | Broken / P2 | Undersized touch area | Minimum height 44px | FIXED; final matrix target scan | `refinement.css` |
| 02 | Back-to-top is 38.39px tall | Broken / P2 | Hard to activate on a phone | Minimum 44px dimensions | FIXED; final bounds and keyboard activation | `refinement.css` |
| 03 | Mobile GitHub link is 43.8px wide | Polish / P3 | Misses the requested 44px target minimum | Footer links minimum width 44px | FIXED; both mobile themes | `refinement.css` |
| 04 | Expanded result's metadata is 12px | Broken / P2 | Small technical text is hard to read | `.micro-label` minimum 13px | FIXED; final text-size scan | `refinement.css` |
| 05 | Scrolled header gains a shadow | Polish / P3 | Changes the flat grid's surface language | Remove compact-state shadow and transform | FIXED; scrolled renders in both themes | `refinement.css` |
| 06 | Hero heading joins words around its break | Confusing / P2 | Accessible name loses separation | Explicit whitespace before the break | FIXED; heading text measurements | `Landing.tsx` |
| 07 | Desktop hero's closed source leaves an empty column | Confusing / P2 | Promised evidence is hidden on arrival | Open source by default above 800px; keep mobile disclosure | FIXED; initial desktop render and source interactions | `PhotoJourney.tsx` |
| 08 | Expanded examples put another two-column scene inside half a grid | Confusing / P2 | Cramped narration and a large empty neighboring cell | Full-width disclosure rows; aligned label/description columns | FIXED; all four expanded renders in each variant | `refinement.css` |
| 09 | Expanded source crowds its center divider | Polish / P3 | Evidence and narration visually merge | 24px source-side inset on desktop; remove redundant inset when stacked | FIXED; expanded original-size checks | `refinement.css` |
| 10 | Compact walkthrough hides its title, instructions and caption | Confusing / P2 | Tabs appear without orientation | Restore heading/caption with a smaller compact heading | FIXED; 1024 and phone renders | `refinement.css` |
| 11 | Compact failed-search excerpt only shows lines 14–15 | Confusing / P2 | Omits the response check needed to understand failure | Show lines 9–15 including `response.ok` and `catch` | FIXED; every chapter-three render | `ScrollStory.tsx` |
| 12 | Expanded scenario promises a slow search it does not demonstrate | Confusing / P2 | Description does not match the interaction | Say “Compare the failed request with the success path” | FIXED; expanded scenario render | `ScrollStory.tsx` |
| 13 | Setup does not say where the unpublished package comes from | Confusing / P2 | Users look for a nonexistent download | Explain owner-provided Python package and no public download yet | FIXED; setup copy in final sweep | `Landing.tsx` |
| 14 | Launch command appears without an installation prerequisite | Confusing / P2 | Someone may try an unavailable command | “After installation, run” before `unravel` | FIXED; setup render | `Landing.tsx`, `refinement.css` |
| 15 | “Choose a folder” implies a folder-picker UI | Confusing / P2 | Actual connection asks for an absolute path | “Enter your folder's absolute path” | FIXED; setup copy; actual interface retained | `Landing.tsx` |
| 16 | Footer says “Explore demo” while hero says “Explore the demo” | Polish / P3 | Inconsistent name for one destination | Use “Explore the demo” | FIXED; link inventory | `SiteChrome.tsx` |
| 17 | External project links open a new tab without explanation | Polish / P3 | Navigation context can surprise users | Add descriptive new-tab titles | FIXED; DOM inspection | `SiteChrome.tsx` |
| 18 | Footer is short and lacks the newly requested watermark | Polish / P3 | Does not meet the approved ending | Substantial top, separate bottom bar, theme-token watermark below | FIXED; final bottom renders and non-overlap assertions | `SiteChrome.tsx`, `refinement.css` |
| 19 | Active section links do not expose current location | Polish / P3 | Selected location is not communicated semantically | `aria-current="location"` for matching anchor | FIXED; nav DOM and anchor interactions | `SiteChrome.tsx` |
| 20 | Anchor/focused destinations can land against the fixed header | Broken / P2 | Top of relevant content can be obscured | 81px scroll margin: 65px header + 16px | FIXED; Product anchor measured at y=81 | `refinement.css` |
| 21 | Long code has no explicit scrolling guidance | Confusing / P2 | A cut-off line can look like missing evidence | Detect overflow and show horizontal/vertical scrolling hint | FIXED; excerpt renders and ArrowRight scrolling test | `SourceExcerpt.tsx`, `refinement.css` |
| 22 | Back-to-top scrolls but leaves focus at the bottom | Broken / P2 | Keyboard user resumes among footer controls | Focus header logo before scrolling; honor reduced motion | FIXED; Enter activation, focus assertion and scrollY<2 | `SiteChrome.tsx` |
| 23 | Fixed walkthrough fit does not include all evidence/caption space | Broken / P1 | Longer chapter content can exceed its frame | Observe actual content, recompute on chapter/state changes, normal-flow fallback when it cannot fit | FIXED; ten final variants and all scene bounds | `ScrollStory.tsx`, `refinement.css` |
| 24 | Hovering the feature-row arrow crosses its right boundary | Polish / P3 | Breaks grid containment | Reserve 8px and prevent SVG shrink | FIXED; 768px overflow finding removed in both themes | `refinement.css` |
| 25 | Manual chapter selection leaves the controls poorly positioned | Confusing / P2 | Users must search for the selected scene | Align manual toolbar beneath the header at 81px | FIXED; short-screen and phone story states | `ScrollStory.tsx` |
| 26 | Static/no-JavaScript page exposes an inert sound control | Confusing / P2 | Offers an action that cannot run | Hide sound under `.no-js` | FIXED; production no-JavaScript checks | `refinement.css` |
| 27 | Mobile “Sound off” wraps onto two lines | Polish / P3 | Header control looks squeezed | Width auto, visible label, no wrap | FIXED; phone story renders | `refinement.css` |
| 28 | Header has another filled primary action beside the hero's primary | Confusing / P2 | Competes with the intended demo entry | Keep “Open Unravel,” use secondary styling | FIXED; initial render and control-style records | `SiteChrome.tsx` |
| 29 | Change review shows both `1.` and custom `01` | Polish / P3 | Duplicated numbering adds noise and misaligns rows | Remove native markers and list indent; preserve ordered-list structure | FIXED; final change-review renders and computed style assertion | `refinement.css` |
| 30 | Other forced-break headings join their words in accessible names | Confusing / P2 | Spoken/read heading differs from visual heading | Add explicit whitespace at intentional line breaks | FIXED; exact heading-name regression and final DOM | `Landing.tsx`, `SiteChrome.tsx` |
| 31 | Desktop header Docs link is 32.58px wide; theme/Open controls are 40px tall | Broken / P2 | Small targets missed by the original fixed-header visibility filter | Apply 44px minimum width/height to header navigation, icons and small action | FIXED; full header-inclusive sweep and strengthened control test | `refinement.css` |
| 32 | Footer tagline sits only 1px inside the left rail | Polish / P2 | Text touches the boundary and lacks the section's breathing room | Give landing header and footer intro matching 48/24/16px responsive insets | FIXED; native footer review and brand-edge/tagline-inset assertions | `refinement.css` |

## Pass-by-pass status

### Baseline / first pass

| Issue group | Severity | Status after baseline | File selected for correction |
|---|---|---|---|
| Small targets and 12px metadata | Broken / Polish | STILL BROKEN | `refinement.css` |
| Scrolled header styling | Polish | STILL BROKEN | `refinement.css` |
| Hero evidence hidden, accessible name joined | Confusing | STILL BROKEN | `PhotoJourney.tsx`, `Landing.tsx` |
| Expanded grid and center inset | Confusing / Polish | STILL BROKEN | `refinement.css` |
| Compact story context, incomplete excerpt, scenario copy | Confusing | STILL BROKEN | `ScrollStory.tsx`, `refinement.css` |
| Installation and folder instructions | Confusing | STILL BROKEN | `Landing.tsx` |
| Footer ending, link consistency | Polish | STILL BROKEN | `SiteChrome.tsx`, `refinement.css` |

### First corrected pass — `after-1`

| Issue group | Severity | Rechecked status | File changed |
|---|---|---|---|
| Targets, metadata, header, hero, expanded rows and setup | Mixed | FIXED | Files above |
| Footer structure and required watermark | Polish | FIXED | `SiteChrome.tsx`, `refinement.css` |
| Hover arrow containment | Polish | STILL BROKEN: 768px overflow | `refinement.css` |
| Content-aware story fit / manual positioning | Broken / Confusing | STILL BROKEN in expanded-state review | `ScrollStory.tsx`, `refinement.css` |
| Scrolling guidance, keyboard return focus, no-JS sound | Confusing / Broken | STILL BROKEN | `SourceExcerpt.tsx`, `SiteChrome.tsx`, `refinement.css` |
| Low-contrast dark watermark | Decorative branding | INTENTIONAL EXCEPTION; not readable content | Explicit Axe exclusion and `aria-hidden` |

### Second corrected pass — `after-2`

| Issue group | Severity | Rechecked status | File changed |
|---|---|---|---|
| Arrow containment, story fit, manual positioning | Mixed | FIXED | `ScrollStory.tsx`, `refinement.css` |
| Code guidance, back-to-top focus, no-JS sound | Mixed | FIXED | `SourceExcerpt.tsx`, `SiteChrome.tsx`, `refinement.css` |
| Mobile sound-label wrap | Polish | STILL BROKEN in native review | `refinement.css` |
| Competing filled header CTA | Confusing | STILL BROKEN | `SiteChrome.tsx` |

### Third corrected pass — `after-3`

| Issue group | Severity | Rechecked status | File changed |
|---|---|---|---|
| Mobile sound and CTA hierarchy | Polish / Confusing | FIXED | `refinement.css`, `SiteChrome.tsx` |
| Prior measured findings | Mixed | FIXED | Full register above |
| Duplicate change-review markers | Polish | STILL BROKEN; native-size review caught it | `refinement.css` |
| Other heading name separators | Confusing | STILL BROKEN; DOM review caught it | `Landing.tsx`, `SiteChrome.tsx` |

### Fourth corrected pass — `after-4`

| Issue group | Severity | Rechecked status | File changed |
|---|---|---|---|
| Duplicate markers | Polish | FIXED | `refinement.css` |
| Accessible heading separators | Confusing | FIXED | `Landing.tsx`, `SiteChrome.tsx` |
| Earlier content findings | Mixed | FIXED within tested matrix | Full register above |
| Desktop header targets | Broken | STILL BROKEN after expanding measurements | `refinement.css` |

### Fifth corrected pass — `after-5`

| Issue group | Severity | Rechecked status | File changed |
|---|---|---|---|
| Header link/icon/action targets | Broken | FIXED | `refinement.css` |
| All prior findings | Mixed | FIXED in the final header-inclusive sweep | Full register above |
| Footer tagline touching rail | Polish | STILL BROKEN; native-size footer review | `refinement.css` |

### Sixth corrected pass — `after-6`

| Issue group | Severity | Rechecked status | File changed |
|---|---|---|---|
| Footer tagline inset and matching header/footer brand edges | Polish | FIXED | `refinement.css` |
| All prior findings | Mixed | FIXED in the final sweep | Full register above |
| New findings in the final full pass | — | None found | — |

## Final measurements and retained behavior

Across all ten final contexts: no horizontal page overflow, ordinary-text overflow, clipped content, text below 13px, visible control target below 44px, content contrast below 4.5:1, Axe WCAG A/AA violations or console/page errors. Code overflow is intentional, contained and scrollable. Decorative watermark cropping is intentional. This is a bounded result for the recorded states, not a claim of universal accessibility compliance.

No muted-color token needed replacement in this pass; the existing palette already cleared the requested minimum. The table gives minimum measured ratios against the actual composited backgrounds in the 1440px sweep and interaction renders. Ratios can improve without changing the token because a layout now uses a different surface.

| Token | Value | Before minimum | Final minimum |
|---|---|---:|---:|
| Light `--muted` | `#4d4d4d` | 7.22:1 | 7.44:1 |
| Light `--faint` | `#5a5a5a` | 6.07:1 | 6.07:1 |
| Dark `--muted` | `#b5b5bd` | 7.83:1 | 7.83:1 |
| Dark `--faint` | `#a9a9b2` | 6.84:1 | 6.84:1 |

Lowest measured readable content contrast: **6.07:1 light, 6.84:1 dark**. New `--footer-watermark` uses `#171717` in light and `rgba(255,255,255,0.1)` in dark. The dark watermark is about **1.29:1** by design. It is an `aria-hidden` logotype with no information or control, pointer events or text selection; it is explicitly excluded from Axe's content contrast checks. This exception is recorded in every after summary.

The hero remains two lines with one filled primary action. The scenario tabs appear at y=571–615 at 1440×900, 559–603 at 1280×720, 532–576 at 1024×768, 550–594 at 768×1024 and 565–609 at 390×844. Thus they are above the fold in every requested viewport. Mobile stacks the actions, presents the outcome before technical evidence and keeps the source disclosure optional.

The shared desktop rail is 1184px with equal section halves and 48px inner insets; smaller layouts use responsive gutters and stack constrained sections. The walkthrough pins at 1440×900, 1024×768 and 768×1024 when its current scene fits. At 1280×720 and 390×844 it uses manual, ordinary-flow chapters with the same keyboard controls. Reduced motion and very short screens use normal flow. Longer evidence cannot force a clipped fixed frame.

Typography remains self-hosted Geist with IBM Plex Mono for code. Body/UI/metadata hierarchy and unwrapped code lines are retained. Complete-file highlighting correctly keeps JSX text as text; trailing blank source lines are trimmed. The photo upload and Search examples differ. Simulation labels, rule/source limitations and the explanation-before-code hierarchy remain visible. US spelling is retained in public copy.

Footer links and readable text stay separate above the watermark. Its normal border uses `--line`, not blue. The bottom contains © 2026 Unravel, the local-software tagline, real package version and a working back-to-top button. The watermark uses a viewport clamp fallback and a container-relative clamp to fill the real rail at narrow widths; only its very bottom is cropped.

## Interactions, semantics and verification

- Native links/buttons/details preserve keyboard access; real tabs expose tablist, selection and panel associations. Existing Home/End/arrow behavior is retained.
- The final control checks record hover colors/borders/transforms and verify 44px dimensions plus a visible 2px focus ring on visible stable header, hero, example, setup, FAQ, closing and footer controls in every requested context. Story states are exercised separately.
- FAQ Enter/Space updates expanded state. FAQs and public content remain readable and usable without JavaScript. Sound starts off, explains its purpose, exposes pressed state and is hidden in static HTML.
- All four chapters are checked through scroll in both directions and keyboard controls; source inspection uses actual prepared filenames and line numbers.
- Anchor offsets, mobile menu, long labels, short screens, reduced motion, code keyboard scrolling, footer containment and focus return are checked. The landing has no disabled primary controls; no artificial disabled states were added.
- Initial layout-shift measurements are saved in interaction JSON and checked below 0.1 (final run range approximately 0.0014–0.0233). These are local Chrome measurements, not a new Lighthouse score or field-performance claim.
- Type checking, production Vite build and generation of 13 readable public pages pass. Three unit tests pass. All 34 relevant browser tests pass after the final header/footer corrections, including the strengthened ten-context interaction test and brand-edge alignment assertions.
- The local wheel is rebuilt from the production interface. Its packaged frontend files are compared byte-for-byte with `byline/dist`. Public release remains unchanged.

### Destinations

| Label | Actual destination |
|---|---|
| Explore the demo / full exploration | `/projects/demo` |
| Connect a project / Open Unravel | `/projects` |
| Product | `/#how-it-works` |
| How it works | `/#features` |
| Docs | `/docs` |
| Setup guide / Get started | `/docs/quick-start` |
| Code & privacy | `/docs/privacy` |
| Troubleshooting | `/docs/troubleshooting` |
| GitHub | `https://github.com/phnxsahil/byline` |
| Changelog | `https://github.com/phnxsahil/byline/blob/main/docs/ravel/CHANGELOG.md` |

## Decisions and verification limits

No unresolved landing layout defect was found in the final recorded matrix. The owner's requested giant wordmark replaces the previously requested compact ending; this is now the current design rule. One product decision remains outside visual implementation: whether/how to distribute the unpublished installation package publicly. The page clearly explains its present availability.

Actual iOS/Android browsers, Safari/Firefox, assistive screen readers and a human five-second comprehension/retention study were not run. Keyboard, DOM and automated accessibility checks do not replace those studies. Audio control behavior was tested, but perceived sound quality was not evaluated. External GitHub URL availability and public repository freshness were not verified; the links point to the existing configured project destinations. This UI pass did not rerun live AI evaluation or backend experiments. No new Lighthouse benchmark is claimed.

## Reproduction

From active frontend `byline/`, run `node scripts/audit-landing.mjs <phase>` against the dev server, or set `RAVEL_TEST_URL` for production. Run `python scripts/audit-gallery.py` and `python scripts/audit-summary.py` afterward. The durable regression is `tests/landing-complete.spec.ts`, supported by `refinement.spec.ts`, `layout-audit.spec.ts` and `public-pages.spec.ts`.
