# Unravel

A local workshop for understanding the projects you build with AI. Follow a feature into its source, ask a better question, try a small change in your editor, compare versions, and keep the discovery.

Unravel is the approved evolution of Byline. The active frontend is **byline/**, not lovable-project. Original context and README are preserved in docs/ravel.

## Install and launch

End users need **Python 3.12+**. The versioned wheel includes the browser interface; no Node, frontend build, Docker or separate database is required. A public package/download has not been published. Follow the [Windows and macOS/Linux setup guide](docs/ravel/guides/quick-start.md) using the actual locally built wheel.

```bash
python -m pip install /path/to/ravel_workshop-0.2.1-py3-none-any.whl
ravel
```

`ravel` opens the browser after the loopback server is ready. `ravel serve` retains manual opening; `ravel serve --open` opts in. `ravel doctor` checks assets, storage and port while the server is stopped. `--home` and `--port` work with each command. Stop with Ctrl+C; run again to resume saved projects and discoveries. Data defaults to `~/.ravel`.

Source contributors also need Node.js 20+. Install Python dependencies with `python -m pip install -e ".[dev]"`, run `npm ci` and `npm run build` in `byline/`, then `ravel` from the repository root. Create a wheel after building the frontend with `python -m build --wheel` (requires the `build` tool). The package builder bundles `byline/dist` into `apps/ravel/_web`; source development falls back to `byline/dist`.

For optional AI, set `ANTHROPIC_API_KEY` and optionally `RAVEL_MODEL` in your terminal or an untracked `.env` in the launch folder, then restart. Excerpts go to Anthropic only after consent. Source and notes work without a key. Open product docs at `/docs` and API docs at `/api/docs`.

## Try your first investigation

1. Open **Explore the demo** for the Search contract mystery. Outcomes are labelled simulations; its sample walkthrough is downloadable.
2. Open **Your projects** and connect the absolute path to a local React/JavaScript/TypeScript or Python/FastAPI project. Try the included `examples/request-flow` folder first.
3. Start the recommended feature or pick another starting point. Click source steps and inspect the captured code beside the explanation.
4. Write a prediction or note. Make a small change in your existing editor.
5. Under **Compare & check**, refresh source and inspect the diff. Your original source and discoveries remain associated with their snapshot.
6. Trust the project before running a discovered npm script or pytest check. Read the actual output and scope.
7. Save a discovery and export Markdown or JSON.

## What is implemented

- Welcoming off-white/navy introduction with restrained cobalt, a four-step scroll story, clear Python package setup, and the approved navy footer.
- Ten searchable in-app guides for setup, source, AI, versions, checks, notebook, privacy, architecture and troubleshooting.
- Prepared demo with three explorations, citations, curiosity questions and a persistent notebook.
- Bounded local source capture, exclusions, content hashes, Git/dirty-tree context, Tree-sitter symbols/imports/routes and SQLite FTS5 search.
- Immutable snapshots, version comparisons, outdated-evidence markers, notes and exports.
- Anthropic structured explanations with citation validation, bounded excerpts, transient retries, prompt versioning and snapshot-specific caching.
- Durable local jobs, progress events/reconnection, cancellation and restart recovery.
- Existing npm/pytest checks with explicit trust, timeout, process-tree cancellation, real results and before/after source identity.
- FastAPI OpenAPI-derived request types consumed by the TypeScript client; separate SQLite Alembic migration history.

## Engineering map

| Location | Responsibility |
| --- | --- |
| `byline/src/ravel/App.tsx` | Project library, overview, settings and routes |
| `byline/src/ravel/Landing.tsx` | Interactive marketing page and feature walkthroughs |
| `byline/src/ravel/Docs.tsx` | In-app documentation; reads canonical Markdown from docs/ravel/guides |
| `byline/src/ravel/Workbench.tsx` | Source exploration, experiments and notebook |
| `byline/src/ravel/shared.tsx` | Shared UI, source inspector and job progress |
| `byline/src/ravel/repository.ts` | Local API and prepared-demo adapters |
| `apps/ravel/api.py` | Local HTTP boundaries and input/response validation |
| `apps/ravel/source.py` | Source capture, static analysis and diffs |
| `apps/ravel/service.py` | Durable job lifecycle and orchestration |
| `apps/ravel/ai.py` | Explanation context, provider and citation validation |
| `apps/ravel/runner.py` | Trusted local check execution |
| `apps/ravel/storage.py` | SQLite repository, source search and event history |

For learning by working on the product, read [LEARNING.md](docs/ravel/LEARNING.md). Product choices, failure cases, design and delivery are saved in [docs/ravel](docs/ravel/PRODUCT.md). Small additions and verification results belong in [CHANGELOG.md](docs/ravel/CHANGELOG.md).

## Develop and verify

```powershell
python -m pytest -q
python -m scripts.generate_contracts
cd byline
npm run typecheck
npm test
npm run build
```

Run `python -m scripts.verify_install PATH_TO_WHEEL` to build a fresh environment outside the checkout and verify packaged assets, launch, storage and restart without Node on PATH. Windows and Linux CI include this gate.

Run `python -m scripts.verify_browser` from the repository root for a browser suite with its own disposable local server. Alternatively, start the workshop and run `npm run test:e2e` in byline/. Windows tests use installed Chrome by default. On Linux/macOS install Playwright Chromium (`npx playwright install chromium`), or set `RAVEL_CHROME` to an installed browser. Set `RAVEL_FIXTURE_PATH` to the absolute path of `examples/request-flow` to enable the real-project browser journey. `RAVEL_TEST_URL` overrides the default server URL.

For frontend development, keep the local server running and use `npm run dev` at http://localhost:5173. Vite proxies `/api` to the local backend. `byline/vercel.json` supports a separately published static prepared demo; publication has not been performed.

## Current limits

This is a working first version, not a complete runtime debugger. Static imports and route detection can miss dynamic behavior. AI context currently includes up to eight files and their first 100 lines within 32,000 characters; code deeper in large files may need better retrieval. Citations establish source locations, not semantic correctness.

Secret-pattern exclusions are best effort. Inspect what is captured and do not connect sensitive repositories without reviewing this policy. Source snapshots are stored locally in SQLite without encryption. Existing local scripts can perform arbitrary actions: trusted checks are not sandboxed. A passing check only verifies that command on the recorded source, not the whole product.

Commands and cancellation have been tested on Windows here; Linux compatibility branches exist but have not yet been executed in Linux CI. Live paid model quality, a human-reviewed evaluation, and a six-person product pilot remain pending. See [EVALUATION.md](docs/ravel/EVALUATION.md) and [QA.md](docs/ravel/QA.md) for scoped evidence. Legacy Byline tests/modules remain in the repository, outside the active Ravel test suite.

## Unravel local release

The product now follows a profile-photo upload rather than making note saving the main outcome. Explore source first, then configure approved experiments against your already running local development app. Documentation: [product tour](docs/ravel/guides/product-tour.md), [experiments](docs/ravel/guides/experiments.md), [design rules](docs/ravel/UNRAVEL_DESIGN.md), [evaluation](docs/ravel/UNRAVEL_EVALUATION.md).

The Python package version is 0.2.1. Both `unravel` and `ravel` launch the local browser app. Optional browser support is installed with the wheel's `[browser]` extra, then `unravel browser install`. `unravel reference --example search --port 8017` starts the disposable Search reference. `--variant ambiguous` deliberately returns an incompatible HTTP 200 response; the older photo reference remains the default when `--example` is omitted. Public package publication has not occurred.
