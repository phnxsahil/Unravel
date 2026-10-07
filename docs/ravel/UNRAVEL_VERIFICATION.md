# Unravel local release verification — 6 October 2026

## Delivered

The active React application, public landing page, static documentation and Python distribution now use Unravel. The local journey is connect → recognize an action → inspect its evidence → approve a browser recipe → inspect observations. Notes remain optional. The profile-photo reference includes correct, broken and ambiguous variants with disposable memory storage.

The interface includes Overview, Explore, Experiments, Changes and Notebook. Captured source maps label source facts and inferred relationships. Browser runs show observations before interpretation, preserve source identity and support cancellation, restart recovery and screenshot deletion. Existing notebooks, trusted checks, historical investigation URLs, `ravel` commands and storage names remain compatible. `unravel` is an additional CLI entry point.

## Checks and results

| Check | Observed result |
|---|---|
| Backend suite | 52 passed |
| Frontend fixture suite | 1 passed |
| TypeScript and production build | Passed; 13 readable public HTML pages |
| Browser suite | 23 passed, including a real photo experiment through the UI |
| Browser integration | Eight real Chromium outcomes; source map, notes, export, opaque screenshot deletion and restart passed |
| Network boundary regression | Unapproved fetch and redirect blocked; destination server received zero requests |
| Installation | Version 0.2.0 wheel installed outside the checkout, with Node absent from PATH; assets, 12 docs indexes, storage, missing-key errors, restart and both CLI aliases passed |
| Mobile Lighthouse | Performance 91 / 93 / 92, median **92**; accessibility, best practices and SEO **100** in all three runs |
| Automated accessibility | No WCAG A/AA violations in the tested landing, setup, experiments guide and demo views across the matrix; real experiment result also passed |
| Screenshots | 340 PNGs, five viewport widths × two themes, verified capture receipts and separate four-scene walkthrough captures |
| Offline AI evaluation | 30 source-reviewed cases across three small projects; see evaluation report |

Viewport widths: 390, 768, 1024, 1280 and 1556px. Matrix height: 1020px. Additional short-screen checks: 390×844, 1024×768 and 1440×900. The suite exercises forward/reverse scrolling, keyboard scene changes, optional sound, reduced motion, OS-tab persistence, command copying, menu links, static content without JavaScript and browser console errors. At 1556px the hero left edge is 186px and the right column begins at 810px.

## Fixes found during verification

- Capture completion could leave first-use features stale. Persisted capture job IDs and snapshot-aware polling now update the view.
- A completed job could retain its previous progress message. Terminal states now show their final message.
- An unstyled application button inherited a browser grey background and failed contrast. Explicit theme surfaces/text corrected it.
- Hero heading order failed the automated audit. The prepared action is now an h2.
- Browser routing alone did not intercept redirect hops. Requests now fetch with redirects disabled before fulfilment; every redirect is blocked. Enter the final local URL directly. Redirect-based authentication is unsupported.
- Real React/API projects often use separate local ports. The recipe editor now accepts up to two additional approved loopback origins and shows them in the saved recipe. Saving another recipe resets approval.

## Reproduce

Run `python -m pytest apps/ravel/tests`, frontend `npm run typecheck`, `npm test` and `npm run build`. Run `python -m scripts.verify_browser` for isolated UI tests; set `RAVEL_CAPTURE=1` to write screenshots. Run `python -m scripts.verify_unravel` with the disposable reference app running on port 8017. `python -m scripts.verify_browser_origins` starts its own disposable servers. Both browser scripts require the optional browser dependency and Chromium.

Build the wheel with `python -m build --wheel --no-isolation --outdir .local/releases` after building the frontend. `python -m scripts.verify_install <actual-wheel-path>` creates an isolated environment outside the checkout; its optional `--python` reuses an existing isolated interpreter. `python -m scripts.screenshot_gallery` creates the offline gallery. Frontend `node scripts/lighthouse.mjs landing` runs three mobile audits against the local production server.

Artifacts: `.local/releases/ravel_workshop-0.2.0-py3-none-any.whl`, `.local/screenshots/unravel-release/index.html`, `.local/unravel-browser-results.json`, `.local/unravel-origin-results.json`, `.local/lighthouse/unravel-release-final/` and `.local/evaluation/unravel/results.json`.

## Limits and follow-up

- Live Anthropic answer quality, useful-experiment rate and actual provider cost remain unavailable because no provider key was configured. Offline retrieval coverage is not explanation accuracy.
- Native Linux and Python 3.12 execution were not available in this Windows/Python 3.14 session. These compatibility checks remain unverified.
- Automated accessibility results do not replace screen-reader and human usability testing. Retention, hiring impact and user outcomes have not been measured.
- Maps are partial static analysis, with imports and matched backend routes explicitly distinguished from observed execution. Arbitrary frameworks, authentication, external services and redirects are unsupported.
- Browser screenshots may contain visible development data; storage is local. Fresh browser contexts do not isolate backend records.
- A Starlette TestClient deprecation warning and a sandbox pytest-cache write warning occurred; neither failed the suite. Dependency compatibility should be checked when advancing the runtime.
- Public hosting, publication, name availability, automatic fixes and cloud execution remain outside this release.

## Technical audit

Scores below describe this verification scope, not overall market readiness: performance **92/100** (three-run Lighthouse median), automated landing accessibility **100/100**, responsive matrix **10/10 combinations**, static public routing **13/13 pages**, core browser checks **23/23 tests**.

**P0:** No outstanding finding in the tested scope. **P1:** Live AI semantic quality remains unvalidated; do not present retrieval or citation-range checks as proof of correct explanations. **P2:** Linux/minimum-Python compatibility and human accessibility/usability need external verification. **P3:** Legacy module/package/storage names intentionally differ from the public brand; documentation explains them. Large documentation/highlighting bundles are lazy loaded; further optimisation should be driven by measured docs performance.
