# AI investigation evaluation — 6 October 2026

## What was actually evaluated

Thirty source cases across `examples/profile-photo`, `examples/request-flow` and `examples/search-flow` were reviewed by the implementation agent against checked-in code. They cover source facts, missing persistence evidence, failure handling and explicit correct/broken/ambiguous response branches. There is no claim of independent human review or live model evaluation.

`python -m scripts.evaluate_unravel` records each expected file/line, marker, reviewed statement and retrieval latency under `.local/evaluation/unravel/results.json`.

| Offline measurement | Result |
|---|---:|
| Source-reviewed cases | 30 / 3 projects |
| Expected source covered by entry-file first 45 lines | 14/30 |
| Expected source covered by bounded source search | 30/30 |
| Live-provider cases | 0 |

This baseline comparison measures **context coverage**, not explanation accuracy. The expected statements are test ground truth, not generated answers. Each supplied citation is range-validated. A separate adversarial example demonstrates that a false permanence claim with a valid citation still passes range validation; semantic correctness requires further review.

## Browser evidence

`python -m scripts.verify_unravel` exercises eight real Chromium runs: failed request, slow request, wrong expectation, unmatched request, missing selector, unreachable app, cancellation and reload. It also checks opaque screenshots, deletion, notes, Markdown output and restart. The run records include actual timings and observed statuses in `.local/unravel-browser-results.json`.

Configured expectations are reviewed against the reference app. Passing those recipes establishes only the tested observations. A success-shaped response in the ambiguous reference does not establish actual storage. The deliberately broken variant is available for additional testing.

## Unavailable metrics

A separate real-browser regression (`python -m scripts.verify_browser_origins`) checks unapproved fetches and redirects against a second disposable server. Both are blocked, and that server receives zero requests. This caught and corrected a redirect-hop bypass that a URL validator alone could not prevent. All redirects are unsupported in this version; users must supply the final local app URL.

No configured/authorized Anthropic key was available. Supported live claims, false-alarm rate, model usefulness, live latency, actual model tokens and monetary cost are **unavailable**, not zero. No fabricated résumé percentages or synthetic provider measurements are reported.

Fake-transport tests verify contracts, retrieval rounds, invalid citations, failure handling and budgets without spending provider credit. Before claiming live-model reliability, run these same reviewed questions through the configured provider, review each claim against ground truth and record actual response usage and pricing applicable to that account/model.
