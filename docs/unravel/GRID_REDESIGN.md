# Unravel — minimalist grid redesign

Owner correction, 6 October 2026: the previous release retained too much of the earlier frontend. Replace its composition with a minimalist, symmetrical grid informed by Linear and Vercel. **Do not capture screenshots from now on.** Automated failure screenshots and screenshot-bearing browser traces are disabled. Earlier capture galleries remain historical.

## Working brief

- **Visual thesis:** a quiet technical workspace, with neutral surfaces, precise Geist typography and continuous hairline rules.
- **Content plan:** centered introduction → wide interactive photo/source workspace → four-step walkthrough → change context → local setup → FAQ → compact footer.
- **Interaction thesis:** selected actions connect to actual source excerpts; four scroll chapters retain forward/reverse and keyboard navigation; controls use restrained 160ms feedback rather than decorative effects.

Audience and product remain AI-assisted students and solo builders exploring their own source. Familiar actions lead to evidence and approved observations. Public examples remain explicitly simulated.

## Visible changes

- A centered two-line hero replaces the old split headline/card composition. Primary actions are neutral, rectangular controls.
- The hero example is a wide two-column workspace: visible action/source path on the left, source excerpt and explanation on the right. Scenario controls use one compact toolbar; the takeaway is a thin footer row.
- Navigation is a flat 64px bar with aligned outer rules, centered links and a separate action area. The floating pill is removed.
- Marketing uses two continuous outer rules, symmetric columns and a shared center divider. Setup, change review and FAQ use this structure; detached rounded cards and broad shadows are removed.
- The walkthrough remains scroll-driven. Its heading, chapter controls and framed source/narration stage use the same line and typography system.
- The footer contains one compact identity and readable navigation; the repeated large wordmark is removed.
- Documentation and application typography use the same self-hosted Geist. Code retains IBM Plex Mono. Application feature selection becomes a connected tab rail, with quieter sidebar and source panels.

## Tokens and references

Dark: #0E0E10 / #141416 / #1D1D20, text #EDEDED, secondary #A5A5AB, rule #2B2B30. Light: #FAFAFA / #F5F5F5 / #EDEDED, text #171717, secondary #595959, rule #DEDEDE. Blue is limited to selection/source connections, while primary calls to action use text/surface contrast. Semantic colours retain their actual status meaning.

The marketing width remains 1184px. Outer gutters are 48px on large screens and 16px on phones. At 1556px, the outer rules begin at 186px; the product workspace is inset 48px equally. Heading weight is 500. The navbar icon stays 22px.

Applied the installed Impeccable frontend-design guidance and frontend-skill composition guidance with the owner's symmetry preference taking precedence over generic asymmetry guidance. References: [Geist](https://vercel.com/geist/introduction), [Linear's interface refresh](https://linear.app/now/behind-the-latest-design-refresh). Original composition; no copied assets.

Verification uses type checking, production rendering, DOM geometry, keyboard interaction and accessibility tests. No screenshots or image captures are part of this revision.

## Follow-up polish

The accepted layout received an alignment and text-containment audit. FAQ, setup and footer now share the same centre seam and outer gutters. Long source labels and preview code wrap; longer story excerpts scroll within their framed panel. Entrance movement and hover feedback preserve readable text and honour reduced motion. See `GRID_AUDIT.md` for measurements, findings and review limits.

## Verification result

Production build generated 13 readable public pages. Type checking and the frontend fixture test pass. The final screenshot-free interface suite passed **22 tests**, covering both themes at 390/768/1024/1280/1556px, accessibility scans, forward/reverse walkthrough scrolling, keyboard/sound controls, short screens, reduced motion, installation tabs, command copying and no-JavaScript public content. The tablet walkthrough overflow found during verification was corrected. Screenshot-producing experiment regression was excluded from this final visual pass; its prior product verification remains recorded separately.

DOM inspection confirms Geist typography, a flat navigation bar, a centered message above a wide evidence workspace, neutral primary controls and square workspace corners. Automated screenshot and trace capture are off; no PNGs are present in the final browser test output. The prior gallery is not a preview of this revision. Review the live local site at `http://127.0.0.1:8000/`.
