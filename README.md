# Unravel

<img src="byline/public/brand/unravel-logo-dark.svg" alt="Unravel" width="310" />

![Unravel demo](docs/ravel/v03-screenshots/after-overview.jpg)

Understand the app you built.

I built Unravel for people who use AI to make software and then need to understand the result. It connects a visible feature to the source that handles it, shows candidate API routes, lets you inspect a prepared failure, and keeps a record of what you learned.

## What it does

Unravel can:

1. Connect a local project folder.
2. Capture readable source files and build a bounded feature map.
3. Show source relationships and candidate backend routes with citations.
4. Let you inspect a prepared Search contract simulation.
5. Run approved local browser checks with disposable data.
6. Save notes and export a discovery as Markdown or JSON.

The maps are static evidence. A matching request and route is an inferred relationship until a browser check records an observation.

## Quick start

The supported development path is a source checkout. You need Python 3.12 or later and Node.js 20 or later.

From the repository root:

```bash
python -m pip install -e ".[dev]"
cd byline
npm ci
npm run build
```

Open a second terminal and start the API from the repository root:

```bash
python -m apps.ravel.cli serve --port 8000
```

Start Vite in the frontend terminal:

```bash
cd byline
npm run dev -- --host 127.0.0.1 --port 5173
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite serves the interface and proxies `/api` to the local API. Run `python -m apps.ravel.cli doctor` to check the built interface, storage, port and parser.

The prepared demo is also available at `/projects/demo` after the local site starts. It is a browser simulation. It does not contact an AI provider or run a live experiment.

## How it works

The Python API stores projects, snapshots, investigations, discoveries and approved checks in SQLite under `~/.ravel` by default. Tree-sitter reads supported Python, JavaScript and TypeScript syntax. The React interface displays the resulting evidence and keeps prepared demo notes in the browser.

The optional explanation flow uses your own provider key. Unravel sends selected source excerpts and a question only after you give provider consent.

## Local first and privacy

Source capture, storage, notes and prepared demonstrations work without an AI key. The local server listens on `127.0.0.1`. Source files remain in their project folders. Disconnecting a project removes Unravel records and leaves the source folder untouched.

The demo stores notes in the current browser. Live explanation requests can send selected excerpts to Anthropic after consent. Read the [privacy guide](docs/ravel/guides/privacy.md) before enabling a provider.

## Roadmap

1. Improve maps for more framework conventions and dynamic routes.
2. Add more small, source backed examples for local checks.
3. Publish a versioned package after the source installation path stays stable.

## Project layout

`apps/ravel` contains the FastAPI application, source analysis, storage and CLI.

`byline` contains the active React and Vite interface.

`docs/ravel` contains product guides, design notes and verification records.

`examples` contains small projects used by the prepared workflows and tests.

## License

Unravel is released under the [MIT License](LICENSE).
