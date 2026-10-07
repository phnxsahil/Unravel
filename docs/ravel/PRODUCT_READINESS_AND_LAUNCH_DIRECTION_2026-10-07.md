# Unravel: product readiness and launch direction

7 October 2026. An audit and proposed direction. Implementation status is now recorded in [the 0.2.1 follow-up](RELEASE_FIXES_2026-10-08.md); the findings below preserve their original audit context.

## Decision

Unravel has a credible local engineering foundation and a substantially improved public interface. It is ready to demonstrate as a work in progress. It is not yet a convincing self-service release for the beginner audience described in the brief.

The largest gap is the distance between the prepared demo and a user's first useful result. More visual effects will not close that gap. Finish one connected experience: encounter a surprising behavior, inspect the evidence, test an explanation, and return after an edit. Then make the launch film from that experience.

Recommended marketing direction: **small mysteries in the app you built**. Keep the main promise, **Understand the app you built.** Make the demonstration begin with an intriguing question and a visible consequence.

Proposed campaign hook: **It worked before that prompt.** The concrete demonstration is **200 OK. Broken UI.** After a backend edit, a Search feature stops working even though the request succeeds. Unravel connects the visible result, the change and the code expecting a different response shape. This is a proposed replacement for the primary photo example; the photo fixture can remain as a regression case. The owner asked for something more immediately recognizable to developers than a returning task or a saved-item example.

## Evidence and limits

- Inspected the current landing audit and its final original renders; the prior layout/accessibility results are historical evidence, not new test results from this product audit.
- Opened the live local demo's Overview, Explore, Experiments and Changes pages. Selected the failure question and inspected its rule-based response.
- Opened a fresh project list, connected the checked-in `examples/search-flow` folder, waited for capture and inspected its actual overview and experiment form.
- Read the active UI, source-map builder, experiment runner, installation guide, evaluation report and existing Remotion film source.
- Compared official Replay, Jam, CodeRabbit, Linear, Vercel, Composio and Remotion pages. Those pages establish their presented capabilities and design principles; this was not a hands-on competitive benchmark, paid-account evaluation or frame-by-frame review of their launch films.
- Local server uses isolated storage at `.local/product-readiness-audit` on port 8000. Its Search registration is audit data, not a change to the user's existing project registrations. No experiment, external service call or live AI request was executed in this audit.
- The global Python environment lacked Alembic; the server started with the repository's existing `.local/python` dependencies. This is an environment observation, not evidence that the packaged installation fails.

## What released products do better

| Reference | What its official material shows | Principle to adopt | Boundary for Unravel |
|---|---|---|---|
| [Replay](https://docs.replay.io/reference/replay-devtools/overview) | Inspecting recorded execution at a selected moment | Put a visible event next to the evidence that explains it | Unravel records bounded browser observations and static source. It does not have Replay's deterministic execution replay or arbitrary state inspection. |
| [Jam](https://jam.dev/docs/product-features/jam-ai/ai-debugger) | Bug context from logs, requests and session replay feeds investigation | Carry context automatically instead of asking the beginner to reconstruct it | A suggested recipe should still be editable and explicitly approved. |
| [CodeRabbit](https://www.coderabbit.ai/) | Reviews and change-oriented workflows embedded around code changes | Give users a recurring trigger: an edit to something they previously explored | Do not expand into a general review, security or automatic-fix platform for this release. |
| [Linear](https://linear.app/now/behind-the-latest-design-refresh) | Its design refresh reduces competing navigation and excessive separators | Make the current question the focal point; let the navigation recede | Preserve the owner's grid direction, but reserve internal rules for meaningful groups. |
| [Vercel Geist](https://vercel.com/geist/introduction) | A reusable component and design foundation | Reuse real interface components and tokens across app, docs and film | A matching font and dark palette alone do not demonstrate product quality. |
| [Composio](https://docs.composio.dev/docs/quickstart?cta_placement=developers-hero-docs) | A concrete initial task and a path into working integrations | Show a complete task before the catalogue of capabilities | Unravel should demonstrate one supported exploration before showing every panel. |

These are adjacent references, not identical competitors. Unravel's defensible initial position is helping a solo AI-assisted builder understand a specific behavior through their own source and an approved observation. A generic repository chat, attractive graph or auto-generated explanation is too easy to substitute with existing tools.

## Product and launch findings

Severity describes the intended beginner self-service release. P1 should be addressed before presenting that release as finished; P2 improves usefulness or clarity; P3 is presentation polish.

| ID | Priority | Evidence / problem | Concrete change | Done when |
|---|---|---|---|---|
| R01 | P1 | A freshly connected Search project receives `/api/photo`, port 8017, `Choose photo`, `Upload photo` and the upload-failure assertion in Experiments. These are hard-coded defaults in `Studio.tsx`. | Replace global photo defaults with feature-specific editable proposals; use a neutral empty state when evidence is insufficient. Keep the photo recipe confined to its fixture. | Search, photo and another supported project each receive relevant steps, or a clear request for missing information. Never silently substitute a different action. |
| R02 | P1 | The Search map contains only its React node. `maps.py` compares the captured request string exactly with backend paths; `/api/search?q=` does not match `/api/search`. | Normalize a safely established pathname independently from its query. Retain unsupported dynamic-path limitations and mark candidate route connections inferred. | The bundled Search example exposes the matching route without implying observed execution. Unresolvable paths remain explicit gaps. |
| R03 | P1 | Project picker advertises saving a draft and running writers, but links to the photo demo. Seen live in `/projects`. | Replace the legacy description and audit reachable demo/docs/sample links as one narrative. | Entry copy describes the experience the link actually opens. |
| R04 | P1 | Overview and Experiments reuse essentially the same photo simulation. Advancing feels like repetition rather than progress. | One persistent case with distinct stages: behavior → explanation → approved scenario → result. Preserve selected action and scenario between views. | Every advance reveals new evidence; returning does not reset the case unexpectedly. |
| R05 | P1 | Real experiments require app URL, target path, scenario, optional origins, step types, accessible names and expected outcomes before the first result. | Guided recipe setup: confirm running app → choose action → choose condition → review proposal. Advanced step editing remains available. Populate only values supported by evidence. | A first-time builder can configure one supported case without reading selector terminology or rebuilding the recipe from memory. |
| R06 | P1 | Setup explicitly says the package must be obtained from the owner; there is no published download. | Prepare a versioned release destination, checksum, exact installation instructions, uninstall/reopen guidance and a support destination. Publication remains a separate owner action. | A person with no contact with the creator can obtain the intended version and start it. |
| R07 | P1 | Demo Changes shows explanatory prose; Notebook asks for a connected project. The public trial does not complete the return-and-output story. | Include a labelled prepared before/after case and a sample export. Preserve the distinction between fixture evidence and the visitor's own runs. | Someone can experience the complete promised loop before installation. |
| R08 | P1 | Live AI explanation accuracy and useful-experiment quality are unvalidated. The existing 30-case exercise measures offline source coverage. | Evaluate generated claims on the reviewed cases with an authorized provider, including ambiguous evidence, false conclusions, token usage and latency. Keep source-only mode useful. | Release claims match actual reviewed model results, or explicitly describe AI as an experimental optional feature. |
| R09 | P2 | The photo panel begins at `Photo uploaded`; visitors switch labels instead of performing an action with a surprising consequence. | Replace the primary demo with a small interactive mystery. Show the familiar app surface first, reveal code after the visitor asks why. | The first interaction produces a visible, understandable question without reading a paragraph of code. |
| R10 | P2 | “What happens if it fails?” gives a general instruction to inspect errors and loading state. It does not select the relevant source or continue the case. | Make suggested questions context actions: focus the supported branch, explain it briefly and offer the applicable scenario. | A question moves the exploration forward; missing evidence produces a specific limitation. |
| R11 | P2 | Return visits are organized around capture, diffs and outdated investigations. There is no demonstrated habit tied to one feature the user cares about. | Let users explicitly follow an action. On a later capture, show what changed around that action and whether a saved approved recipe can be rerun. | After an external edit, the user sees why it matters to an earlier exploration. This can start with the existing manual Check for changes action. |
| R12 | P2 | The original writing-app workbench remains reachable through historical links; its labels and information architecture differ from the new Studio. | Keep historical URLs working, but provide clear migration/context and consistent public naming. Avoid routing new users into both models. | A new user encounters one main exploration model; an existing user can still recover old work. |
| R13 | P2 | The film source is still `RAVEL / WRITING APP`, cream/orange, draft-focused and 20 seconds at 24fps. It does not match the current product. | Replace the launch composition after the new journey works. Share tokens, logo, scenario data and evidence components. | Every depicted feature is available in the release or explicitly labelled as a concept. |
| R14 | P2 | The grid is coherent, but hero, introduction, walkthrough and expandable examples repeatedly explain exploration. The emotional intensity stays flat. | Use the first two sections for one question and its reveal; use later sections for personal-project use and return visits. Reduce repeated narration. | Each section answers a different visitor question. |
| R15 | P2 | The local-app model is clear in copy, but a phone visitor cannot use a desktop project folder directly. | Keep the mobile demo complete; explain that connection/installation happens on their computer at that handoff. | Mobile visitors can enjoy the example without expecting phone access to their development folder. |
| R16 | P2 | Prior verification leaves Linux/minimum-Python and human accessibility unverified. This audit did not fill those gaps. | Run release installation on claimed platforms and invite independent users to complete the supported journey. Keep the support matrix honest meanwhile. | Platform claims have recorded results and the first-use flow works without creator assistance. |
| R17 | P2 | Video interest, time spent and note saving could be mistaken for successful learning. | Measure reaching evidence, correctly distinguishing observations from guesses, and voluntarily returning after a real edit. Collect with consent; do not ship invasive analytics by default. | Marketing and resume metrics report actual denominators and measured outcomes. |
| R18 | P3 | The launch assets have no current shared story, framing rules or channel-specific layouts. | Produce a film, short hook, vertical version, poster and architecture walkthrough from the same real case. | Reframing preserves readable evidence and coherent narration in every format. |

The previous landing audit's 32 fixed layout findings remain useful. These new findings concern continuity, beginner effort, real-project behavior and release credibility; passing CSS checks did not establish those qualities.

## Design critique

**Anti-pattern verdict:** the current interface avoids the common gradient/glow/metric-card template. Its remaining generic quality is the interchangeable example and repeated explanation. It feels like a tidy developer-tool demonstration, with limited emotional payoff. Preserve the neutral theme, restrained typography, reliable controls and explicit evidence labels.

Expert heuristic review of the inspected journey, not a user-study score:

| Heuristic | Score / 4 | Reason |
|---|---:|---|
| System status | 3 | Capture states and simulation labels are clear. |
| Match with users' language | 2 | Plain public copy gives way to recipes, origins and accessible names. |
| User control | 3 | Cancel, navigation and optional AI exist; setup still demands substantial work. |
| Consistency | 2 | Legacy entry copy and duplicate/new workbenches interrupt the story. |
| Error prevention | 2 | Execution approvals are valuable; irrelevant defaults invite mistakes. |
| Recognition over recall | 2 | Users must carry knowledge about their app into the recipe form. |
| Efficiency | 2 | Too much preparation before an observed result. |
| Minimalist presentation | 3 | Clear neutral system; repetitive sections weaken hierarchy. |
| Error recovery | 3 | Existing run outcomes and source limitations are explicit. Full fresh regression not repeated here. |
| Help/documentation | 3 | Substantial task guides; distribution and old narrative references still need attention. |
| **Total** | **25/40** | **Significant product-flow work remains.** |

The recipe editor fails five of the skill's eight cognitive-load checks: single focus, one decision at a time, minimal simultaneous choices, avoiding recall across screens, and progressive disclosure. Chunking, grouping and numbered hierarchy are present. This is an expert checklist, not a measured cognitive-capacity result.

Persona walkthroughs:

- **First-time AI builder:** can understand the headline, but switching from a prepared photo tab to configuring a real request creates a steep jump. The next screen should carry the chosen action and propose one test.
- **Mobile visitor from a launch clip:** can read the site, but has no satisfying complete mystery or clear desktop handoff. Finish the demo on the phone and make desktop installation a later choice.
- **Skeptical engineer or recruiter:** will appreciate bounded tools and source identities, then notice that the basic Search fixture lacks a route connection and has a photo recipe. Fix these before filming an apparently general workflow.

## The proposed memorable moment

### It worked before that prompt

Show an actual search field in a small developer resource browser. Begin with working results. A labelled example edit changes the backend response. The next search shows **Search unavailable**, while a request event shows **200 OK**. The question is: **If the request succeeded, why did the feature break?**

1. The visitor searches in the working version and sees a result.
2. They choose **After the edit** and repeat the same action. The request succeeds but the feature fails.
3. **What changed?** opens the relevant before/after source comparison while keeping the visible outcome in view.
4. Unravel connects the Search action, request path and candidate backend route. Recorded request status and visible assertion results appear as observed evidence.
5. A short reveal highlights `items` on the backend and `data.results` in the frontend. The existing React fixture explicitly rejects a response whose `results` value is not an array.
6. State the takeaway plainly: **The server answered. The interface expected a different format.** The observed response status does not by itself prove the cause; the controlled fixture and source comparison supply the supporting evidence.
7. Offer **Compare the compatible version**. Clearly identify it as a bundled implementation, not a fix Unravel applied automatically.
8. End with **Understand your next change** and a readable case containing the action, source versions, observations and unresolved questions.

Do not make guessing mandatory or score the visitor. An optional “What do you think happened?” moment can encourage curiosity, with an immediate reveal available. The experience should make beginners feel capable rather than examined.

The public version is an explicitly labelled interactive simulation or recorded fixture. The installed version runs a real disposable reference. `examples/search-flow` already has the key source behavior: its correct backend returns `results`, its ambiguous branch returns `items`, and the UI requires `data.results`. However, the current UI request does not select that backend variant. Before filming, wire explicit compatible/incompatible reference versions, record real outcomes, and provide reviewed recipes. Do not claim the end-to-end demonstration already works.

The experiment model currently offers failure, slow and reload scenarios. A clean comparison also needs an explicit ordinary run that observes the request without injecting a failure or delay; add that as a reviewed capability rather than disguise a baseline as another scenario. No arbitrary response-body rewriting is necessary for the first release: the two controlled reference implementations provide the different behaviors.

For a user's project, compare captured source before and after an edit. If there is no earlier snapshot, say so. A Git diff alone cannot establish that the earlier version worked. Attribute an edit to AI only when the user supplies that context; the source comparison works for any edit. The launch film should label its edit as an example, rather than fabricate a live agent conversation.

Observed screenshots and requests do not automatically prove that a particular function ran. Align the timeline with source as evidence and inference, preserving the distinction. The marketing camera can slow the presentation; it must not imply that Unravel can pause and time-travel arbitrary JavaScript execution.

Supporting campaign angles:

| Angle | What a developer recognizes | Product evidence required | Decision |
|---|---|---|---|
| It worked before that prompt | Uncertainty after an AI edit | Source snapshots plus a repeatable observation | Lead narrative |
| 200 OK. Broken UI. | Successful request, failed feature | Controlled response-shape mismatch and visible outcome | Lead demonstration |
| The diff is small. What did it affect? | A local edit with a wider consequence | Supported dependency/call evidence; explicitly incomplete map | Follow-up film after analysis improves |
| Your agent says done. What changed? | The gap between completion text and personal understanding | A concise source-backed change explanation | Positive ownership angle; no promise to certify the app |
| Profile photo fails | A familiar but unsurprising example | Existing fixture and tests | Retain for testing; remove as main marketing story |

Individual developers describe edits breaking previously working functionality in [this Cursor discussion](https://www.reddit.com/r/cursor/comments/1hn9i6h) and [this first-project account](https://www.reddit.com/r/cursor/comments/1fk1tzg/im_really_disappointed_with_cursor_ai_paid_sub/). These are older, self-selected anecdotes supporting the language of the hook, not evidence of prevalence, current model quality or willingness to pay. Validate the proposed message with target users before claiming it converts better.

This shifts the appeal toward curiosity without making “find every bug” the product promise. Normal behavior and successful changes should also be explorable.

## Product changes that make the promise real

Keep the current five project destinations initially, but design one continuous case within them. Persist the selected feature, question, snapshot and recipe between views. A compact context strip can say **Search · snapshot … · failure scenario**. The main surface should have a clear next action.

Real-project experiments should start from the selected feature. Resolve the app URL through explicit user confirmation. Suggest source-backed requests and possible action labels. If the request cannot be established, say so and ask the user to identify it. Keep the technical editor under an advanced disclosure. A recorder or an inspect-and-select step helper is useful future work, not an existing capability.

Return visits should center on **the thing you explored changed**. Reuse captured snapshots and saved recipes. Show whether old evidence is still applicable, what changed in the relevant source, and which approved test can be rerun. No fabricated understanding score, daily streak or unnecessary notification is needed.

The shareable output should be a compact explanation with source identity, observed facts, interpretation and open questions. Start with the existing Markdown export. A visual card or short evidence clip is a later presentation format; let users review content and redact paths before sharing.

The strongest AI engineering demonstration is the complete investigation: bounded source tools, typed claims, explicit uncertainty, a proposed test, approved execution and evidence that can contradict the model. The current code already contains part of that architecture. Demonstrate and evaluate the joined behavior before adding more agents or model providers.

## Proposed 48-second product film

Creative direction: precise, calm motion with a brief moment of surprise. Use the existing neutral Unravel identity and folded-thread motif. One continuous path follows the story from interface to request to evidence. Film treatments are proposed; no new video was rendered in this audit.

| Time | Picture | On-screen message / narrative purpose |
|---|---|---|
| 0–4s | Search returns a result in the before version; a labelled example edit lands | **It worked before that prompt.** The previously working behavior is visible. |
| 4–9s | Repeat Search; show `Search unavailable` alongside a recorded `200 OK` | **200 OK. Broken UI.** Hold the contradiction long enough to register. |
| 9–15s | Camera pulls back into Unravel; choose What changed? | **Understand the app you built.** Show the actual product identity and entry. |
| 15–23s | A thin path connects Search to its request and candidate route; the source diff opens | **Follow the change.** Distinguish recorded events from inferred source links. |
| 23–32s | Slow, controlled move between backend `items` and frontend `results` | **The server answered. The interface expected something else.** Hold the two lines for reading. |
| 32–40s | Compare the incompatible and compatible reference versions and their observed outcomes | **See what the change actually does.** Do not imply automatic repair. |
| 40–48s | Pull back to the completed evidence view, then logo and one CTA | **Follow a click. Test a hunch. Understand why.** End with the actual available demo or release URL. |

Motion specification:

- Real controls respond in approximately 150–220ms. Scene transitions take approximately 300–450ms. Film framing moves can take 0.8–1.2s and pause for 2–3 seconds at important evidence. These are proposed timing rules, not competitor measurements.
- Slow the reveal and framing, not every click. Avoid slow controls in the usable app.
- Compose at a clean 16:9 master, preferably 3840×2160 at 60fps for scalable screen graphics. Produce a readable 1080p delivery and an independently composed 1080×1920 vertical edit; do not crop the desktop sidebar into an unreadable phone video.
- Use a 40–48s product film, a 10–12s silent landing teaser, a 15–20s vertical hook and a 90–120s founder walkthrough showing the real workflow and its limits.
- Animate transforms and opacity; move the framing toward the evidence. Avoid generic floating panels, random 3D rotations, blur over readable text and invented terminal activity.
- One soft click, one restrained transition cue and a small resolution sound are enough. Use original/licensed audio. Captions must carry the story without sound. Website audio remains opt-in; reduced-motion visitors receive static evidence/manual steps.
- Reuse current UI components, typography, tokens and fixture/run data in Remotion. The existing renderer is useful infrastructure, but the old composition is not a suitable launch asset. [Remotion's fundamentals](https://www.remotion.dev/docs/the-fundamentals) and [rendering documentation](https://www.remotion.dev/docs/render) support this component-based workflow.
- Use real capture for the founder walkthrough and evidence views; frame-based compositions for legible transitions and titles. Review every filmed claim against the release build.
- Keep media out of the critical initial page path: poster first, defer the video, pause offscreen and avoid competing with the interactive example. The existing accessible story should remain usable without the film.

## What should ship together

Recommended order, with completion evidence rather than an arbitrary deadline:

1. **Close the real-project gaps:** correct recipe defaults, supported query/path mapping, narrative consistency and explicit partial-support states. Validate on at least the existing three fixtures.
2. **Build one complete mystery:** runnable Search versions, an explicit ordinary observation mode, before/after capture, prepared public version, source/observation distinction, reviewed recipes, clear ending and restartable case.
3. **Complete first use and return:** guided setup, preserved case context, a meaningful Changes example and a sample export. Let unfamiliar testers attempt the journey without coaching.
4. **Prepare the release:** downloadable artifact and exact instructions, platform support results, support/issue link, version, known limitations and optional-AI status. Public publication still requires the owner's release decision.
5. **Make the launch assets:** produce the film from the verified journey, vertical cut and a plain founder walkthrough. Final visual polish follows the complete workflow.

Suggested design-skill sequence for implementation: `$clarify` for the real-project handoff, `$onboard` for the first case, `$distill` for repeated sections, `$animate` for the evidence reveal, then `$polish`. These describe work to do; those commands were not executed by this audit.

Suggested trial gates, not claimed outcomes: invite five unfamiliar target users; aim for at least four to finish the prepared case and identify one observed fact without help. Separately test installing and connecting a supported folder. Record every failure rather than treating this tiny sample as market validation. Evaluate AI claims separately from onboarding and visual appeal.

For a resume or engineering video, show the static-analysis limits, request-boundary protections, typed recipes, cancellation/recovery, snapshot identity and honest AI evaluation. Those decisions provide much stronger evidence than an unmeasured claim of saving developers time.

## Boundaries and unresolved choices

The change-centered hook and Search demonstration are recommendations, not an approved implementation or completed feature. No video, automatic fixer, runtime time-travel debugger or public release was added in this audit.

Name availability, release hosting and support ownership still need a release decision. New live-provider evaluation needs a configured, authorized provider. Competitor conversion, retention and marketing performance are unknown. The previous layout verification remains useful, but a clean layout does not establish product-market fit or launch readiness.
