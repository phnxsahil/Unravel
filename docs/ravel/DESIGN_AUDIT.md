# UI/UX and color audit — 3 October 2026

## Verdict before the second redesign

The owner rejected the previous charcoal revision. Technical accessibility and performance scores did not establish visual quality or comprehension. The presentation still feels assembled from repeated feature sections, boxed examples and tiny technical labels. The design fails the distinctive, restrained presentation test.

The rendered landing contained seven main sections and approximately 698 words in its initial state. A DOM inspection found 194 text-containing elements below 12px, including nested spans rather than 194 unique labels. CSS confirms several meaningful labels at 8–11px. This is a readability problem even where contrast passes.

## Heuristic review

These are a designer's subjective review scores, not measured user outcomes.

| Heuristic | Score /4 | Finding |
| --- | --- | --- |
| System status | 3 | Loading, prepared examples, save feedback and jobs are visible. |
| Match with the real world | 2 | Workshop/thread metaphors and technical labels obscure the practical task. |
| User control | 3 | Back navigation, cancellation and explicit trust exist; drafts have persistence limits. |
| Consistency | 2 | Dense landing annotations contrast with vague library copy and three different navigation patterns. |
| Error prevention | 3 | Explicit project trust and destructive-action confirmation protect consequential actions. |
| Recognition over recall | 2 | Feature, workflow and source diagrams repeat ideas without establishing one first action. |
| Efficiency | 2 | Keyboard tabs work, but the marketing path makes users read and choose repeatedly. |
| Minimalist design | 1 | Frames inside frames, repeated captions, small mono labels and too many section introductions. |
| Error recovery | 3 | Provider errors preserve exploration; reconnect and retry are offered. |
| Help and documentation | 3 | Nine searchable task guides exist; navigation and reading typography need refinement. |
| Total | 24/40 | Significant design improvements needed. |

## Priorities

- P1: Reading sizes and letter spacing. Replace tightly tracked Space Grotesk with Geist; use readable body text, 14px navigation and monospace only for actual source. Typeset and normalize.
- P1: Repeated explanation. Merge source demonstration and feature showcase into one interactive product walkthrough. Reduce the main story to four sections. Distill and clarify.
- P1: Competing chrome. Remove numbered section furniture, repeated badges, inset frames, duplicated CTA groups and the landing command wall. Use whitespace and typography to group content. Quieter and arrange.
- P2: Color hierarchy. Keep charcoal neutral, remove brown selection surfaces, use white primary actions and restrained orange selection/focus. Semantic colors remain attached to actual outcomes. Colorize and normalize.
- P2: Product flow. Label the library, features and notes directly; provide one clear path from demo to local setup. Onboard and clarify.
- P3: Motion. Use a short entrance, a meaningful connected-source illustration and selected-panel movement, respecting reduced motion. Polish after responsive and keyboard checks.

## Cognitive load

Five of eight checklist items need improvement: single focus, clear hierarchy, one decision at a time, minimal competing choices, and progressive disclosure. Grouping, chunking within individual components and keeping source context nearby are useful foundations. This is a high-load assessment, not a claim that the app is unusable.

## Persona walkthroughs

- First-time AI-assisted builder: the hero asks the user to explore, then presents source steps, four feature modes and a second five-step workflow. It is unclear which sequence to follow first. Introduce the benefit, demonstrate it once, then explain local setup.
- Low-vision / keyboard user: tab semantics and contrast checks pass in the revised states, but 8–11px metadata and heavy negative tracking remain hard to read. Improve actual sizes and focus visibility; keep source scrolling contained.
- Returning project owner: library marketing headings and the large demo promotion compete with connected projects. Put project work first and keep the demo invitation compact.

## Reference interpretation and execution plan

Inspected https://tester.army/ and https://composio.dev/ in the browser. TesterArmy uses an open hero, straightforward type and one dominant visual; Composio uses a restrained dark canvas and an explicit product demonstration. Borrow those composition principles with original Ravel copy and source examples. Do not copy customer claims, testimonials or product capabilities.

Visual thesis: an uncluttered charcoal product studio, clear sans-serif typography, ample space, one connected-source visual and limited warm-orange detail.

Content plan: introduction → interactive feature walkthrough → three-step local workflow → setup/help → compact footer. Detailed commands and reference material belong in the existing docs.

Interaction thesis: a short hero entrance; a restrained source-connection motion; purposeful tab changes with preserved reading contrast. No auto-advancing demo.

The user's requested scope and references are explicit, so implementation proceeds without another preference questionnaire. Evaluation after implementation should include responsive layout, readable labels, actual navigation, keyboard tabs, documentation and the existing local-project journey. User satisfaction still requires the owner's review.

## Implemented result and color review

- Landing: four main sections instead of seven; approximately 408 words in the initial state, compared with 698 before (including visible source content). This is a content reduction, not a measured comprehension improvement.
- Geist replaces Space Grotesk throughout the active product. Documentation body is 15px, landing body 15–17px on desktop, and active workshop instructions are larger. Monospace no longer styles general metadata by default.
- Source and feature demonstrations are consolidated. The setup command wall, six-link documentation grid, repeated process controls and large footer directory are removed from the landing.
- Primary actions are neutral, selected orange details are sparse, and brown highlighting is replaced with neutral slate.
- Library headings now identify the work directly and the empty list explains where projects will appear. Documentation commands retain keyboard access when they overflow.

Calculated static token contrast (WCAG relative luminance):

| Role | Foreground | Background | Contrast |
| --- | --- | --- | --- |
| Primary text | #F2F2F4 | #101113 | 16.90:1 |
| Secondary text | #B1B1BB | #16171A | 8.43:1 |
| Quiet text | #A0A0AB | #16171A | 6.92:1 |
| Selected accent | #F5A56E | #25272B | 7.47:1 |
| Light secondary text | #555660 | #F5F5F7 | 6.68:1 |

These pairs exceed the 4.5:1 body-text threshold. Browser checks cover rendered states as well. Contrast alone does not establish an attractive interface.

The main remaining product validation is whether a new builder can describe Ravel's purpose, enter the demo and explain one feature without prompting. No post-redesign satisfaction score or user outcome is invented.
