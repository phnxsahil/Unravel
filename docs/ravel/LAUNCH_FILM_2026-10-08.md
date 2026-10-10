# Unravel launch film — 8 October 2026

Implementation of the 48-second **It worked before that prompt / 200 OK. Broken UI.** timeline in [the product readiness brief](PRODUCT_READINESS_AND_LAUNCH_DIRECTION_2026-10-07.md).

## Compositions and delivery

- `byline/motion/UnravelFilm.tsx`: `UnravelFilm`, 1920×1080; `UnravelVerticalFilm`, 1080×1920. Both are 48 seconds, 60 fps, 2,880 frames.
- The portrait edit has separate spacing, type sizes, stacked Search outcomes, a vertical source path and an evidence layout without the desktop navigation column. It is not a crop.
- Current `ravel.css`, `unravel.css` and `grid-design.css` supply the palette, Geist and IBM Plex Mono. The film reuses `Mark`, `Pill` and `SourceExcerpt` from the application. Film styles only adjust framing and scale.
- Motion is driven by Remotion frames and changes only transforms and opacity. UI press feedback is 200 ms; scene entrances 350 ms; framing and evidence emphasis approximately 1 second. Reading holds fill the rest of each scene.
- The old `byline/motion/RavelFilm.tsx` and its existing media are untouched.

Run from `byline/`:

```sh
npm run render:film
```

This typechecks the new compositions, bundles them, checks 11 key frames in each orientation, renders both H.264/yuv420p videos, validates dimensions/fps/duration, then extracts those same timestamps from the encoded MP4s for visual review.

For a faster composition/layout pass: `npm run render:film -- --stills-only`.

After an interrupted render, `npm run render:film -- --resume` reuses completed deliveries only when the source and output hashes match the receipt.

Outputs:

- `byline/public/media/unravel-film.mp4`
- `byline/public/media/unravel-film-vertical.mp4`
- Matching `-poster.jpg` files and `unravel-film.vtt` captions.
- `.local/unravel-film-review/`: full-size composition stills, decoded MP4 frames, and a JSON receipt containing source/output SHA-256 hashes, geometry/font checks and video metadata.

Windows uses installed Chrome and Remotion's bundled FFmpeg. `UNRAVEL_CHROME` (or existing `RAVEL_CHROME`) selects another Chrome; `FILM_CONCURRENCY` adjusts the default four render workers; `FILM_FFMPEG` selects a decoder (otherwise other platforms use `ffmpeg` on PATH).

## Timeline and claim review

| Time | Depicted story | Source and boundary |
| --- | --- | --- |
| 0–4s | Working Search for React; labelled example edit appears at 2.15s | Compatible response from `examples/search-flow/api.py`; result/status from `Search.tsx`. Edit illustrates choosing a bundled branch, not a recorded AI session. |
| 4–9s | Search unavailable beside 200 OK | Explicitly simulated request event. Incompatible fixture returns `items`, not `results`. |
| 9–15s | Pull back into Unravel; What changed?; inspect handler | Film arrangement of existing prepared Changes/explore workflow. Permanent simulation label. |
| 15–23s | Search → request → candidate route, then source comparison | Exact fixture request and route excerpts; inferred link labelled execution unverified. At 18.5s the two real return lines replace the excerpts as an example diff. |
| 23–32s | `items` versus `results`, array guard, catch branch | Existing `SourceExcerpt` renders the original fixture lines and line numbers. Framing slowly shifts emphasis; no debugger/time-travel claim. |
| 32–40s | Incompatible and compatible outcomes | Both labelled examples; same simulated 200 status, different contracts. Explicitly not automatic repair. |
| 40–48s | Evidence summary, logo, CTA | Prepared/sample walkthrough, not personal saved work. Logo/CTA from 44.5s; repository URL and local setup, not an invented hosted release. |

## Simplifications

The film is a deterministic, clearly labelled simulation arranged for reading, not a screen recording or a new live browser experiment. It does not change the application or fixture. The incompatible payload uses the actual fixture's `items: ["A result"]`, rather than the public demo's illustrative `items: ["React"]`. No request timing, AI conversation, automatic fix, runtime trace, or saved personal investigation is invented.

Audio is omitted; every narrative beat is carried by on-screen text, with a companion caption file. The vertical edit retains the full 48-second story requested here. No shorter teaser, automatic website playback, or public deployment is included.

## Verification

- Both H.264 deliveries verified at exactly 48 seconds and 60 fps: landscape 1920×1080 (2,764,019 bytes), portrait 1080×1920 (2,925,804 bytes).
- Visually inspected 22 decoded MP4 frames: 1.5, 3.4, 6, 12, 17, 20, 26, 30, 36, 42 and 46.5 seconds in each orientation. All seven timeline sections, the example edit, source comparison, response guard/catch and final CTA match the intended sequence. No clipping was visible at these review points.
- The corresponding 22 composition checks passed scene identity, font readiness and content-bound checks. Review is sampled, not an assertion that every encoded frame was manually inspected.
- `npm run typecheck:film`, `npm run typecheck`, `npm test` (2 files / 3 tests), `npm run build` (13 prerendered pages), `node --check scripts/render-film.mjs` and `git diff --check` passed.
- Confirmed no changes to the old film composition, application source or Search fixtures. Backend tests and a live browser experiment were not run: this change adds film assets and rendering infrastructure only.
- The first vertical render was interrupted; the completed landscape was reused only after source/output hash verification. The resumed vertical render completed successfully. Full metadata and hashes are in `.local/unravel-film-review/render-receipt.json`.
