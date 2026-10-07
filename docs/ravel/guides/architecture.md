# Under the hood

Unravel uses React/Vite, Motion for React, FastAPI, SQLite, Tree-sitter and optional Python Playwright. The active frontend is `byline/`; unrelated legacy source is preserved.

## Local launch and package

`unravel` and `ravel` are CLI aliases. End users require Python 3.12+, no Node. The wheel carries compiled and prerendered interface assets under `apps/ravel/_web`. Source checkouts fall back to `byline/dist`. Public HTML comes from the same React and Markdown sources; directory index routes remain readable without JavaScript.

## Capture and maps

Bounded read-only capture applies exclusions, hashes files and stores immutable snapshots. Tree-sitter extracts supported symbols, imports and routes. Versioned maps are bounded projections of those captures. Every node/connection cites source. Imports establish dependencies; literal request-to-route matches are inferred, never observed execution.

## AI investigation

Pydantic validates questions, source-tool requests, claims and citation ranges. Anthropic can request captured-source search, symbols or import neighbours. Limits are three rounds, six source requests, 90 seconds and cumulative token ceilings. Actual usage, duration, prompt version and snapshot identity are recorded. Repository text is untrusted data. Neither schema nor citation validation establishes semantic correctness.

## Browser experiments

Allowlisted recipes navigate, click, fill, upload a bundled PNG, wait, reload and assert. Approval and disposable data are required. Fresh contexts enforce approved loopback origins, block unapproved redirects and disable service workers/websockets/downloads. Contexts do not isolate backend data. No model-generated JavaScript, commands or code patches run.

Results preserve bounded events, response status/timing, assertions, screenshots and source before/after identity. Outcomes distinguish expectations met/not met, inconclusive, cancelled and execution error. Source identity is not proof that the running app uses that exact build. Artifacts live under local storage and are referenced by opaque IDs.

## Persistence and recovery

The additive migration adds recipes, runs and artifacts without replacing old records. Captures and explanations use the durable worker, progress events and reconnection machinery. Interrupted checks/experiments require explicit reruns to avoid repeating side effects. Original evidence and notes survive. Project Markdown exports combine source, claims, observations and unresolved questions.

## Contracts and terminology

OpenAPI generates frontend request types and source-map resources. Public terms are Unravel, exploration, Notebook and discovery. Historical `investigation` API names, `ravel` CLI, storage identifiers and URLs remain compatible. Old workbench URLs retain checks and individual exports.

## Release boundaries

Source discovery is partial. A passing run verifies configured expectations only. Live AI evaluation needs provider access. Cloud execution, automatic fixes, arbitrary framework support, public hosting/publication and name availability checks are separate work.

## Source-based recipe proposals

`GET /api/features/{feature_id}/recipe-suggestion` returns a typed proposal from the feature’s captured snapshot: local request paths, explicitly named controls, supporting citations and missing-evidence messages. Query suffixes normalize to their path; dynamic path concatenation and external URLs are not treated as route matches. No assertion or running-app URL is guessed. The frontend edits and saves the proposal through existing recipe resources; approval is scoped to a selected saved recipe. An `ordinary` scenario observes without injecting failure or delay.
