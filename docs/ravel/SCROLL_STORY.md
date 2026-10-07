# Scroll story implementation

## Research and direction

Reviewed [Framer gallery](https://www.framer.com/community/gallery/), [Linear](https://linear.app/) and [Composio](https://composio.dev/). The resulting direction uses a strong first-screen identity, a stable product plane, progressive detail and explicit audience use cases. It is an original implementation, not a template copy.

Motion uses [useScroll](https://motion.dev/docs/react-use-scroll), useTransform, useMotionValueEvent and eased transforms from Motion for React, already installed in the project.

## Scene sequence

1. Choose a saved-draft feature and its first useful question.
2. Follow the Save button through browser state, request, API and SQLite.
3. Ask why state does not survive refresh; inspect a prepared explanation.
4. Keep the discovery with source in the notebook.

Page scroll chooses a chapter across four quarters of a 350svh section (320svh phone). Scroll upward reverses it. Chapter buttons jump to the corresponding scroll position; arrow keys, Home and End work inside the tablist. There is no scroll interception, timed playback or forced sound.

Reduced motion and viewport heights <=700px use a static section with manual chapter controls. The stage retains readable content and examples below remain independent of the current scroll position.

## Sound

Sound is off on every mount. A user click creates/resumes an AudioContext. Chapter changes synthesize a 240ms low-volume sine tone with an attack/release envelope and a small upward sweep. Cues are throttled, skipped while hidden, disconnected after completion, and the context closes when leaving the landing page. Muting suspends the context. Failure reports a readable status; no essential information depends on sound. No external music or audio assets are used.

## Maintenance

Active scene code: byline/src/ravel/ScrollStory.tsx. Composition: marketing.css. Product prose: guides/product-tour.md and guides/exploring.md. Semantic themes: ravel.css. Earlier Remotion source/assets and render instructions remain available in motion/ and MOTION.md but are no longer used by the landing page.

Run the type check, production build and browser suite after changes. Test both themes and short viewports; preserve semantic text and keep text fully opaque during motion.
