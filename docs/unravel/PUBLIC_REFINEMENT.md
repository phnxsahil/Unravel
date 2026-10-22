# Unravel — landing and documentation refinement

7 October 2026. Implemented the approved UI/UX audit and the three stronger hero ideas in the existing local product. The owner's minimalist grid, self-hosted Geist, IBM Plex Mono, neutral light/charcoal themes and compact wordmark remain the design direction. No screenshots or traces were captured.

## What changed

| Area | Implemented change | Reason |
| --- | --- | --- |
| Hero | Kept “Understand the app you built.” and added a concrete button → API → controlled failure explanation. Reduced vertical padding. | Explain the mechanism immediately and reveal the example above the fold. |
| Hero example | “Make it fail. See why.” introduces normal, slow and failed upload scenarios. The visible outcome and finding appear before the source workspace. | Give someone new to code a readable result before technical detail. |
| Source path | A continuous line connects Browser, Request and API. Selecting a node opens its source disclosure. | Make exploration and source inspection discoverable. |
| Change question | “Where would I change the upload limit?” selects `reference.py:16`, exposes the actual 512,000-byte guard and states the example's limits. | Demonstrate a useful next-change question with evidence. |
| Walkthrough | All four chapters follow the separate `examples/search-flow` action, request, failure handler and rendered status. | Avoid repeating the upload example or connecting unrelated fixtures. |
| Expanded examples | Feature, code, scenario and result panels expose different excerpts and explanations. The scenario offers a labelled display simulation; the result shows its prepared expectation. | Give each expanded panel its own purpose. |
| Code | Shared complete-file TypeScript/JSX/Python highlighting preserves context; numbered lines scroll horizontally and trailing empty lines are trimmed. | JSX prose is plain text, and wrapping cannot misrepresent source line numbers. |
| Controls | Scenario tabs have tab/panel relationships, selected state, arrow keys, Home/End and visible focus. Selected-state hover stays selected. | Make the example usable with a keyboard and assistive technology. |
| Documentation | Sidebar, overview numbering and previous/next navigation share one beginner-first order. Active sidebar/TOC entries are revealed within their own scroll container. | Avoid losing the last item or scrolling the whole article unexpectedly. |
| Tablet docs | Below 1200px, disclosed navigation sits above the full-width reading column. | Remove the narrow article beside a mostly empty collapsed rail. |
| FAQ | Native details/summary disclosures retain expanded state and keyboard support and work without JavaScript. | Prerendered answers must remain available. |
| Typography | Visible public metadata has a 13px floor; controls/footer are generally 14px; guide prose retains 1.65 line-height. Shared focus rules cover links, buttons, summaries and source blocks. | Improve legibility without enlarging the workbench incidentally. |
| Footer | Reduced phone padding and used two link columns plus a compact Project row. Added the actual package version from `pyproject.toml`. Back-to-top respects reduced motion. | Keep the footer readable and shorter on phones. |
| Naming | Public copy uses US spelling. “Connect a project” is the shared action/guide label. | Reduce avoidable terminology changes. |

The existing documentation rail dimensions, shared alignment, normal footer border, clear CTA hierarchy and theme persistence from the preceding fixes remain in place. Overview uses the wider reading area rather than an empty right TOC column.

## The three hero ideas

1. **Make it fail. See why.** Visitors can compare a visible result with the relevant source branch immediately.
2. **Follow one continuous path.** The selected Browser → Request → API thread reuses the product's source-path language.
3. **Ask a concrete next-change question.** The upload-limit question demonstrates a small, evidenced answer instead of an open-ended chat box.

These are prepared interactions. They send no request and run no AI or local experiment. Actual experiments still require a running local app and explicit approval in Experiments. Source connections do not establish runtime execution.

## Measurements

Recorded through browser DOM measurements in `.local/audit/public-refinement/measurements.json`; no image exports. Measurements use the production build at normal browser scale.

- At **1440×900**, the two-line H1 is approximately 146px high; scenario tabs begin at 570px and the initial finding ends at 753px, in both themes.
- At **390×844**, scenario tabs begin at 564px and the complete initial finding ends at 826px, in both themes. This is a verified fold at this height, not a guarantee for shorter screens.
- Phone footer height is approximately **604px**, including all link groups, copyright, version and back-to-top.
- Shared geometry checks cover 320/360/390/600/768/820/1024/1280/1556px. Public text/layout checks also cover 1440px; all four scenes are checked at 1440×900, 1280×800, 1024×900 and 390×844.

### Contrast

The accepted palette values were retained. The changed binding is photo-example syntax text: legacy global syntax colors are replaced by the example's ink/muted/accent tokens. The inherited attribute color `#A9C3CE` on `#F5F5F5` was **1.69:1**; it now uses light `--muted: #4D4D4D`, **7.75:1** on that background. The analogous dark binding is `#B5B5BD`, **9.03:1** on `#141416`.

| Text token | Light canvas / paper / surface | Dark canvas / paper / surface |
| --- | --- | --- |
| `--muted` | 8.10 / 7.75 / 7.22 | 9.47 / 9.03 / 8.25 |
| `--faint` | 6.61 / 6.33 / 5.89 | 8.27 / 7.89 / 7.21 |
| `--accent` | 6.65 / 6.37 / 5.93 | 9.31 / 8.88 / 8.11 |

Ratios describe token pairs. Automated checks also inspect rendered pages, including highlighted lines and selected controls. Borders are not text contrast pairs.

## Implementation ownership

- `byline/src/ravel/refinement.css` owns the new public interaction, typography, example layout, tablet reading layout and compact mobile footer rules.
- `SourceExcerpt.tsx` owns complete-file highlighting and balanced per-line markup.
- `PhotoJourney.tsx` owns scenario state, stable hero IDs, source disclosure and the evidence-backed change question.
- `ScrollStory.tsx` owns the coherent Search journey, distinct expansion panels and existing scroll/keyboard/sound behavior.
- `Docs.tsx` owns the shared guide ordering and bounded active-item revelation.
- `Landing.tsx` and `SiteChrome.tsx` own public composition, native FAQ and footer behavior.
- Existing public font declarations in `marketing.css`, `public-design.css`, `grid-design.css` and `docs.css` were normalized instead of retaining blanket descendant font-size overrides. The historical composition layers still exist; a full CSS migration is deferred.
- `vite.config.ts` supplies the real package version. The build continues generating 13 readable public pages from the same React/Markdown sources.
- The Search fixture's return markup was formatted into meaningful source lines; its execution logic was preserved. The product tour documents the two distinct examples and the simulation boundary.

## Destinations and boundaries

“Explore the demo” and “Open the full exploration” → `/projects/demo`; “Connect a project” and “Open Unravel” → `/projects`; setup guide → `/docs/quick-start`; individual walkthrough links → existing exploration/experiment guides. Existing routes, storage, provider consent, CLI commands and backend resources were preserved.

No public publication, cloud feature, new AI capability or user-retention outcome is implied. No new Lighthouse score is claimed because screenshot-producing audit collection remains excluded. Automated accessibility is not a complete human accessibility review; native-device and screen-reader usability remain unverified.

## Final verification

- Type checking passed. Both frontend test files passed: three tests covering prepared fixture integrity and context-aware highlighting.
- All **24 browser checks passed** across `refinement.spec.ts`, `layout-audit.spec.ts` and `public-pages.spec.ts`. They cover both themes, responsive geometry, active rail visibility, four scene fit, forward/reverse scrolling, reduced motion, short screens, keyboard/sound controls, FAQ with/without JavaScript, OS-tab persistence, command copying and readable generated public routes.
- WCAG A/AA automated scans produced **zero violations on the sampled landing, guide and app routes** at 390/768/1024/1280/1556px. The new hero interaction scan also passed. The four-scene test recorded no browser console errors, including hydration warnings.
- Production build passed and generated **13 public pages**. The rebuilt local `ravel_workshop-0.2.0-py3-none-any.whl` contains all **37 frontend production files**, verified byte-for-byte against the final build. Updated product-tour HTML and actual footer version were verified in the package. This pass did not repeat a clean dependency installation or change backend contracts.
- Local wheel SHA-256: `fbff486c7a741fabe8305390a92a1be31685a20a2bf27b0c7f25fcdf48b32c4f`.
