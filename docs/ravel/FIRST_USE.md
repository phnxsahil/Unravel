# Ravel: welcoming introduction and clear first use

Historical first-use record. The current Unravel action → evidence → approved experiment journey is documented in [the product tour](guides/product-tour.md) and [release verification](UNRAVEL_VERIFICATION.md).

Approved plan implemented 4 October 2026.

## Product outcome

A local browser app for students and early developers who build with AI and want to understand their own projects. First success: connect → choose a feature → follow source → optional question → save a discovery. Existing records resume progress; saving is completion, never an inferred understanding score.

## Landing and design

Headline: “Understand the code you built with AI.” Supporting copy: “Follow a feature, ask better questions and turn your project into something you can explain.” Actions: Try the demo / Use with your project. Direct explanation: “Runs on your computer. Opens in your browser.” Neutral cool off-white, navy text, restrained cobalt for actions/connections/selection. Message and prepared source example share a balanced desktop layout and stack on phones. Oversized arrow and duplicate hero wordmark removed; approved navy footer retained.

Four scroll chapters choose → source → ask → save preserve fixed framing, aligned controls, keyboard navigation, reduced-motion/short-screen manual operation and optional sound. Setup states Python requirements before install and explains install → launch → connect. All install actions point to real instructions because no public download is published. Coming-next copy describes guided reviews and explanation practice without dates or inert buttons. Comparison and notebook remain available today.

## Distribution and public interfaces

Compiled `byline/dist` is bundled under `apps/ravel/_web` by the setuptools build command. Installed serving prefers packaged files, with checkout fallback. Versioned wheel: ravel-workshop 0.1.0, Python 3.12+. End users need no Node/build/Docker/external database.

Default `ravel` opens the browser after readiness. Existing `ravel serve`, `--home`, `--port` remain; `serve --open` opts into opening. `doctor` checks interface, writable storage and port. Loopback only; browser failure prints the address, occupied ports explain `--port`, storage errors explain `--home`. Guides cover each OS, stop/reopen, storage and optional Anthropic settings.

## First project

Welcome explains local capture and supported React/JavaScript/TypeScript/Python/FastAPI source. Folder help covers Windows, macOS and Linux absolute paths. Progress, exclusions, missing folders, duplicate registrations, unsupported discovery and failed capture have next actions. Recommendation picks a feature with source evidence and fewer steps, using existing descriptions/questions. Users can choose another. Source precedes optional AI. Provider consent/errors remain unchanged. A saved discovery confirms completion and resumes from the existing backend resources; no database migration is added.

## Acceptance and boundaries

Check clean wheel installation outside checkout, frontend assets/direct docs/storage, default/explicit launch and diagnostics; occupied port, browser failure and unwritable storage. Complete demo/local source and saved-discovery journeys and restart. Check invalid-folder/unsupported/missing-key/provider failures. Check phone/tablet/desktop, short screens, keyboard, optional sound, both themes, reduced motion, type checking, build, backend/browser tests and mobile Lighthouse.

The local Windows verification and measured scores are recorded in CHANGELOG.md and QA.md. Portable gates are added to Windows/Linux CI; Linux is not claimed locally verified without an actual run. Public publication and download hosting, richer reviews, project explanation practice, wrapper and extension are outside this release. Live-provider success still depends on a real user key and consent.
