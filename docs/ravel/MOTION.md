> Historical Remotion film revision. The active landing page now uses the scroll story documented in SCROLL_STORY.md. These rendering instructions and assets are retained for reuse.

# Ravel motion and interface brief

## Intent

A student has just built a feature with AI and wants to understand what the code actually does. The site should feel like opening a useful notebook: a small question, a visible thread into the source, and room to think. The material is cream paper, warm ink and a small orange source point.

Domain: curiosity, source files, request paths, evidence, changes and discoveries. The color world is cream paper, deeper paper layers, charcoal ink, orange stamps and a dark terminal inset. The signature is the source thread, repeated in the logo, hero path, film trace, selected chapter and reading progress.

The page uses one hero promise, one motion demonstration, three workflow steps and a final setup invitation. Keep documentation as a reading experience with a clear starting point. Avoid repeated framed feature panels, dense annotation walls and competing calls to action.

## Hierarchy and rhythm

Body uses DM Sans; Bricolage Grotesque provides the headline voice; IBM Plex Mono is reserved for code. Major sections have 56–120px of space depending on breakpoint and job, related controls use 8–24px, and reading sections have 42–56px of separation. A film is a distinct media surface; routine navigation and prose stay open.

The docs layout uses a 220px topic column, a reading column up to 680px and a 180px section index, separated by 56px on large screens. The overview expands the middle column. Phone guides use 24px gutters, 15px prose, a topic selector and expandable contents.

## Film storyboard

| Time | What happens | What it teaches |
| --- | --- | --- |
| 0–5s | Feature sheet arrives; an orange path connects editor, API and SQLite | A feature spans several files |
| 5–10s | A question types in; the answer appears with source attached | Browser memory and persistence are different |
| 10–15s | The request URL changes; a route question appears | An edit needs context and checking |
| 15–20s | A notebook discovery arrives and stays visible at the end | Keep the understanding with its evidence |

The film is a prepared illustration of supported product concepts. The URL comparison is explicitly illustrative. It does not pretend to execute a live model call, write a real project note or run a passing check.

The wide composition is 1200×750. The portrait composition is 720×900 with less text and vertically arranged steps. Both run at 24fps for 480 frames, with discrete paper movement and restrained tracing/type transitions. Both contain no audio. The film has a caption track and a complete HTML walkthrough at /docs/product-tour.

## Playback

Start once when at least 35% of the frame is visible. Pause when the frame leaves view or the document is hidden. A user's pause is preserved: returning to the section does not restart it. Manual chapter selection pauses and seeks to a readable point within the chapter (8.5, 13.5 or 18.5 seconds). The first chapter returns to 0 with its complete poster visible. Restart returns to chapter one paused. Reduced-motion users get the poster and manual controls. If playback fails, expandable examples and the transcript still work.

## Regenerate

From the frontend directory:

```text
npm run render:film
```

The renderer uses the installed Chrome on Windows, or RAVEL_CHROME when set. Remotion packages are pinned to the same version. Rendering is a build-time task; Remotion is not shipped to visitors. The script writes MP4s and posters to public/media and its temporary bundle to .local/film-bundle.

Motion for React drives section entrances. CSS handles the navbar, source-thread hero and hover feedback. UI text keeps full opacity through transitions. Reduced motion removes movement and video autoplay.
