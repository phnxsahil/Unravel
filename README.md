# Unravel

Unravel is a local-first workshop for understanding the applications you build with AI.

It helps you connect a project, recognize a real action, follow the evidence through its source, approve a controlled experiment, compare the result, and keep the discovery. Source capture, analysis, notes, snapshots, diffs, checks, and optional AI explanations stay on your machine unless you explicitly enable a provider.

## Product layout

- `byline/` — the active React/Vite frontend.
- `apps/ravel/` — the Python/FastAPI API, source analysis, jobs, storage, and CLI.
- `docs/ravel/` — product documentation, guides, design notes, and verification records.
- `examples/` — small projects for trying the workflow.

## Run locally

Requirements: Python 3.12+ and Node.js 20+.

```bash
python -m pip install -e ".[dev]"
cd byline
npm ci
npm run dev
```

The frontend expects the Python API in `apps/ravel/`. To use the packaged local app, build the frontend and run `ravel` from the repository root:

```bash
cd byline
npm run build
cd ..
ravel
```

Optional AI explanations require `ANTHROPIC_API_KEY`. Source exploration, notes, and prepared demonstrations work without one.

## Verify changes

```bash
python -m pytest -q
cd byline
npm run typecheck
npm test
npm run build
```

Read the [quick-start guide](docs/ravel/guides/quick-start.md), [product tour](docs/ravel/guides/product-tour.md), and [architecture guide](docs/ravel/guides/architecture.md) for more detail.

Design-system attribution: the original Figma Make Design System Foundation work and its shadcn/ui components are credited in [byline/ATTRIBUTIONS.md](byline/ATTRIBUTIONS.md).
