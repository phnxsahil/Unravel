# Unravel — grid, text and motion audit

6 October 2026. Scope: polish the accepted minimalist frontend, preserve the product journey, and avoid screenshots. Applied the installed audit and polish skills. Reviewed the landing, Quick Start, experiment guide and demonstration application using DOM measurements, interaction tests and automated accessibility checks.

## Findings and fixes

| Priority | Finding | Change | Evidence |
| --- | --- | --- | --- |
| P2 | FAQ halves did not share the surrounding sections' centre seam. | Removed its independent column gap; equal halves now use the same divider and internal padding. | Before: right half began 32px beyond the centre at 1024/1280/1556px, and 16px beyond it at 768px. After: all measured desktop seams match within 1px. |
| P2 | Footer outer edges differed from other sections at tablet width. | Unified navigation, content, documentation and footer width/gutter rules. | At 768px, the footer previously began at 32px while other sections began at 48px. All measured outer edges now match within 1px. |
| P2 | Long filenames and preview code could outgrow their panels; wrapped code also made the final desktop story scene too tall. | Added zero minimum widths and wrapping for labels and preview excerpts. Longer story code has a bounded, keyboard-accessible scroll area. Full source readers retain horizontal scrolling. | Long-label stress checks at 390/768/1556px; all four scenes fit at 1440×900, 1024×768 and 390×844. |
| P1 | Initial animation experiment reduced code-label contrast during its fade in light mode. | Removed opacity animation. Text remains readable throughout transform-only entrance movement. | Accessibility scans run during normal rendering, without waiting for animation to hide a problem. |
| P2 | Older hover selectors could override the reduced-motion rule. | Strengthened scoped selectors so motion preferences take precedence. | Tests verify arrow movement normally, and no entrance/hover transform under reduced motion. |
| P3 | Hero example metadata was 11px and some compact controls needed more room. | Metadata is 12px; scenario controls are at least 40px tall, with 44px touch controls on narrow screens. | CSS tokens and responsive control rules. |

The baseline ordinary-text scan did not reproduce an overflowing paragraph in the sampled default pages. Code containment and stress cases were therefore checked separately; no claim is made that every user-supplied string has been tested.

## Motion rules

- Hero content enters with an 8px vertical movement over 400ms, lightly staggered.
- Selecting a source path moves the new evidence panel into place by 4px over 260ms.
- Action arrows move 3px over 180ms on devices with a precise hover pointer.
- Scenario, source and navigation controls use 180ms surface feedback. A press moves a primary action by 1px.
- Layout rails and column dimensions remain fixed. No scaling, decorative animation or text fade.
- Reduced motion removes entrance animation, hover/press movement and added control transitions. Public content stays visible without JavaScript.

## Review scores

Scores are engineering review judgments, not automated compliance certificates. Scale: 0 missing, 1 poor, 2 adequate, 3 good, 4 excellent.

| Area | Score | Basis and limits |
| --- | --- | --- |
| Accessibility | 3/4 | Automated AA checks, keyboard controls, motion preference and readable static pages; human assistive-technology review remains outstanding. |
| Performance | 3/4 | Transform-only effects and existing route splitting; no new performance number is claimed. |
| Responsive design | 3/4 | Shared geometry, five widths, long-label stress and short screens; native-device usability remains untested. |
| Theming | 3/4 | Neutral surfaces and both themes verified; multiple historical CSS layers remain a maintenance concern. |
| Visual restraint | 4/4 | Accepted grid composition retained, consistent seams and minimal purposeful motion. |
| **Total** | **16/20** | **Good, with bounded remaining review work.** |

## Verification records

- Measurements: `.local/audit/grid-polish/geometry-before.json` and `geometry.json`. The initial audit sampled 15 route/viewport combinations; the responsive follow-up expands the final file to 27 combinations with no detected uncontained ordinary text or page-level horizontal overflow.
- Browser coverage: 390, 768, 1024, 1280 and 1556px; dark and light themes; landing, two guides and two application views; forward/reverse story selection; keyboard, sound, short screens and reduced motion; setup tabs, copying and readable public pages without JavaScript.
- Added focused geometry, long-label and motion regression checks in `byline/tests/layout-audit.spec.ts`.
- Final result: **24 browser tests passed**; the sampled pages produced **zero automated accessibility violations** under the selected WCAG A/AA rules. This does not establish full accessibility compliance.
- Type checking, the frontend fixture test and production rendering are part of this pass. Production rendering generates 13 public pages.
- Rebuilt the versioned local wheel with the polished frontend. Installation compatibility was exercised in the preceding redesign; no CLI or backend contracts changed in this pass.
- Screenshot capture and traces remain disabled. Screenshot-producing real browser experiment checks are excluded from this frontend pass. Existing artifact galleries are historical.

Remaining P3 work: consolidate historical public CSS once the accepted design is stable; review the large lazy-loaded documentation bundle if documentation performance becomes a measured problem. A new Lighthouse run was omitted because its image capture conflicts with the owner's no-capture instruction. Prior release scores are not presented as measurements of this revision.

Review the current product at `http://127.0.0.1:8000/`.

## Responsive follow-up

The owner's follow-up asks for a more useful mobile and tablet composition. Tablet outer gutters are now 24px, phone gutters remain 16px, and the desktop container remains 1184px. At 800px and below, audience, changes, setup, FAQ and footer sections stack instead of squeezing content into half-width panels. Equal columns remain on larger screens.

Phone actions fill the reading width; the demo removes a redundant outer inset. Scenario labels wrap instead of shrinking; body explanations are 14px and source-path buttons are at least 48px high. The photo header uses three bounded columns so the image, text and status align. Source numbers remain visible. Walkthrough tabs use equal columns and touch targets of at least 44px. Documentation avoids double padding on phones. Mobile navigation follows the page gutters and scrolls internally when a short screen cannot fit all links.

Verification: the 24-test browser suite passed with both themes and the expanded geometry scan. After the final source-number refinement, six focused geometry, motion, navigation and walkthrough checks passed. Measurements cover 320/360/390/600/768/820/1024/1280/1556px. Navigation and controls also pass at 390×320; walkthrough frames pass at 390×844, 1024×768 and 1440×900. Type checking and production rendering pass. No screenshots or traces were captured.
