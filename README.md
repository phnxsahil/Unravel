# Unravel




A local workshop for understanding the projects you build with AI. Follow a feature into its source, ask a better question, try a small change in your editor, compare versions, and keep the discovery.




Unravel grew out of Byline. The active frontend is **byline/**, not lovable-project. Original context and README are preserved in docs/ravel.




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




- Welcoming off-white/navy introduction with restrained cobalt, a four-step scroll story, clear Python package setup, and the navy footer.
- Ten searchable in-app guides for setup, source, AI, versions, checks, notebook, privacy, architecture and troubleshooting.
- Prepared demo with three explorations, citations, curiosity questions and a persistent notebook.
