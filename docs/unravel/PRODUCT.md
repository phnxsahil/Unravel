# Ravel — product and decision record

Historical record. The approved 6 October 2026 [Unravel brief](UNRAVEL_PLAN.md), [design rules](UNRAVEL_DESIGN.md) and [release verification](UNRAVEL_VERIFICATION.md) supersede this direction.

Approved with Sahil on 3 October 2026. This record is about the product, its decisions, and the work we ship.

## Why Byline became Ravel

Byline began as a way to discover what to post about projects and what the builder had learned. The deeper problem was that building software with AI had become easier than understanding that software. Asking an IDE agent helped with individual questions but required knowing what to ask. Interesting implementation choices and opportunities remained unexplored.

We considered an AI workflow debugger with tracing and replay. It offered engineering depth but missed the builder's interest in curiosity, creativity, and understanding all kinds of projects. Existing platforms such as Langfuse also cover much of that territory. Generic repository chat, documentation, and interview coaching face direct competition from DeepWiki, Code Wiki, CodeTrain, and open-source tutors. These comparisons informed a narrower experience; they do not establish market demand.

**Ravel helps people understand a feature in their own project well enough to change it confidently.**

First audience: students and early developers who build with AI and want to develop stronger engineering judgment. The owner is the first user. The career objective is a product engineering portfolio demonstrating product judgment, interface craft, dependable backend work, and outcomes measured with real people.

## Approved decisions

- Name: Ravel, a working name with unverified domain/trademark availability.
- Delivery: local application in a browser, plus a public prepared demo.
- Local setup: embedded SQLite; no Docker requirement.
- AI: bring your own key; selected code excerpts are sent to the provider. Local does not mean fully offline AI.
- Journey: connect → discover → follow implementation → explore → change externally → check → save.
- Lead with exploration; experiments and prediction exercises are optional.
- Initial supported stack: React JavaScript/TypeScript and Python/FastAPI.
- Existing editor handles edits. No automatic patching or new code editor in v1.
- Reading and static relationships must work without an AI key. AI failures are visible, never replaced with invented answers.
- Retention should come from discoveries and useful recurring work, without forced quizzes, streak pressure, or invented understanding scores.
- Current visual direction: neutral cool off-white and navy, restrained cobalt, Bricolage/DM Sans, balanced introduction, four-step first-feature scroll journey, approved navy footer. Earlier rejected revisions remain as dated history below.
- Demo examples and recorded results must be labelled. No invented testimonials or résumé metrics.

## Failure cases and response

| Failure | Product response |
| --- | --- |
| An IDE already explains this | Compare persistent feature exploration and evidence against a well-prompted IDE baseline. |
| I don't know what to ask | Three useful starting questions attached to the selected feature. |
| This feels like school | Optional branches and experiments; users choose their route. |
| The explanation is wrong | Source citations, human evaluation, and explicit inferred/observed distinctions. |
| Setup consumes the session | Prepared demo immediately, useful code reading before checks or AI setup. |
| Code changed | Immutable snapshots, explicit refresh, and outdated discovery indicators. |
| A passing check hides bugs | Show command, scope, output and limitations; no whole-app certification. |
| I only visit once | Resume investigations and extend previous discoveries during new work. |
| We build too much infrastructure | Finish one stack and journey before remote imports, cloud execution or extra frameworks. |

## Boundaries

V1 reads local folders, captures versions, explains supported features, compares snapshots, runs trusted configured checks, and exports findings. Remote repository import, GitHub OAuth, automatic edits, cloud code execution, interview simulation, and social posting are deferred. Check commands execute trusted local project code; they are not sandboxed. Static code relationships do not prove runtime execution.

## Definition of success

Another person can install, connect a supported project, follow a feature, inspect its evidence, save and resume, make a change in their editor, compare versions, and run a configured check without the creator guiding them. Evaluate with the owner and five builders: compare time to find code, completion, help needed, independent explanation, and voluntary return within seven days. These are planned measurements, not achieved results.

## Design revision — 3 October 2026

The first workshop conveyed too little about what works and how to use it. The owner requested the original Byline landing and Composio as the new references, with dark surfaces instead of brown, clearer feature demonstrations and more transitions. The revised page leads with an actual prepared source path, four selectable capabilities, an explicit five-step workflow, copyable local setup, documentation and capability answers. Workshop actions now use direct labels such as Compare & check and Save note. All nine user guides live in the repository and render inside the app. Motion preserves text contrast and respects reduced-motion preferences. This revision changes presentation and help; it does not establish user satisfaction or retention.

## References considered

- https://yourbyline.vercel.app/ — current charcoal, numbered sections and typography reference.
- https://composio.dev/ — current product walkthrough and feature clarity reference.
- https://tester.army/ — flow-focused demonstrations and disciplined composition.
- https://langfuse.com/ — existing observability and experimentation.
- https://codetrain.ai/solo — existing learning from a repository.
- https://github.com/ktaletsk/learn-codebase — questions and active recall.
- https://cursor.com/docs — existing IDE exploration and verification.
- https://posthog.com/product-engineer/getting-started — real users and iteration for product engineering.

Changes to the approved direction belong in this record and CHANGELOG.md with their reason and validation.

## Second design correction — 3 October 2026

The owner again rejected the presentation, specifically the fonts and clutter, and requested an audit before implementation. The review in DESIGN_AUDIT.md identified tiny type, repeated explanations, competing visual accents and unclear progression. The latest version reduces the landing from seven sections to four, combines the feature/source examples, replaces Space Grotesk with Geist, simplifies library copy and keeps full setup in the existing docs. The references are now primarily tester.army and Composio. The technical product scope is unchanged; aesthetic acceptance and comprehension remain for the owner and real users to assess.

## 4 October 2026 — Paper & Ink and playable examples

Owner supplied the editorial palette and asked for stop-motion-style examples and a walkthrough that fits together. Applied cream/ink with orange stamps, a separate Terminal Noir dark theme, and self-hosted Bricolage/DM Sans typography. Added a user-started four-chapter tour with Play/Pause/Restart and manual chapter controls. Reduced the heading/context stack, fixed chapter height, compacted phone source navigation, and kept guides outside the presentation frame. Examples remain explicitly prepared/illustrative; this is an interactive storyboard, not a recording of live AI execution. This direction overrides the previous dark-default instruction.

## 4 October 2026 — Motion, navigation, docs and identity redesign

The owner rejected the static tour and asked for visible transitions, more space, clearer steps, a changing navbar, a new logo and a docs redesign. Added Motion for React entrances, a staggered source-thread hero, an actual 20-second Remotion MP4 with desktop and portrait compositions, and manual chapter/play/pause/restart controls. Playback starts once when sufficiently visible, pauses offscreen/hidden, and stays manual with reduced motion. Examples moved behind disclosure to keep the page legible.

Rebuilt the navigation as a bar that compacts on scroll, with keyboard/mobile dismissal. Redesigned docs around a first-project overview, task guides, larger prose, contents and reading progress. Fixed /docs being intercepted by FastAPI Swagger: API docs moved to /api/docs and /api/redoc. Replaced the loop mark with an r/source/thread SVG and matching favicon.

Fixed transient text contrast, invalid tablist child content, film end-frame disappearance and mobile frame sizing during verification. Fourteen browser tests, fifteen backend tests, fixture test, type check and production build passed. Film assets are 443,305 bytes (wide) and 255,353 bytes (portrait). They are prepared illustrations; no live AI or customer outcome is implied.

## Welcoming introduction and first use — 4 October 2026

Approved delivery is a Python-packaged local browser app for people who build with AI and want to understand their own projects. First outcome: choose a supported feature, inspect source, optionally ask why, and save a discovery. The recommendation uses existing evidence; saved discoveries determine completion and resume. No click-based understanding score. Existing snapshot comparison and notebook work today. Coming next: guided reviews after edits and project explanation practice, without dates. No desktop wrapper, extension, hosted download or package publication in this release. Full plan and implementation notes: FIRST_USE.md.
