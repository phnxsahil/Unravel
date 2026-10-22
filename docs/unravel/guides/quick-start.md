# Run Unravel from source

Unravel currently works from a source checkout. The prepared demo is available in the browser without a project folder. There is no public package download yet.

## Requirements

You need Python 3.12 or later and Node.js 20 or later.

## Build and run the local app

Run these commands from the repository root:

```bash
python -m pip install -e ".[dev]"
npm ci --prefix web
npm run build --prefix web
```

Open Terminal 1 in the repository root and start the API:

```bash
python -m apps.unravel.cli serve --port 8000
```

Open Terminal 2 in the `web` directory and start Vite:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite serves the React interface and proxies `/api` to the local Python server. The API listens only on `127.0.0.1`. Press **Ctrl+C** in each terminal to stop the processes.

Run local checks from the repository root:

```bash
python -m apps.unravel.cli doctor
```

The doctor command checks the built interface, storage, port and source parser. It does not print keys.

## Try the prepared demo

Open [the prepared Search demo](/projects/demo). Compare the working response with **200 OK, broken UI**, choose **Try Search**, then inspect the source in **Explore**. The demo is a simulation. It does not run a live experiment or send an AI request.

## Build a local wheel

The repository can build a wheel for local installation, but no package is published for public download. From the repository root, build the frontend and wheel:

```bash
npm run build --prefix web
python -m pip install build
python -m build --wheel
```

The result is `dist/unravel-0.3.0-py3-none-any.whl`. Install that file in a Python 3.12 environment when you need the packaged interface. Node.js is not required after the wheel is built.

## Connect a project

1. Open **Your projects**, choose **Connect a project**, and paste an absolute folder path.
2. Wait for source capture. The overview reports readable files, detected starting points and exclusions.
3. Select a recognizable action. Its source path appears underneath.
4. Inspect a source file. You can save notes without an AI key.
5. Optionally run an approved browser experiment using disposable data. Unravel reads source and your editor still makes changes.

Supported projects include React, JavaScript, TypeScript and Python with FastAPI routes. Dynamic or unusual code can produce partial maps. The interface reports what it found and what remains uncertain.

## Storage and optional AI

Data defaults to `~/.unravel`, or `C:\Users\your-name\.unravel` on Windows. It is separate from source projects. Use the same `--home` value on later launches to reopen the same records.

Live questions use your own `ANTHROPIC_API_KEY` and optional `UNRAVEL_MODEL`. Set them in the API terminal or an untracked `.env` file, then restart the API. Read [explanation requests](/docs/explanations) and [code and privacy](/docs/privacy) before enabling a provider. Provider consent is required before selected source excerpts and a question are sent to Anthropic.

## For contributors

The Vercel project root directory is `web`; its `vercel.json` rewrites serve app routes on refresh. The Python API lives in `apps/unravel`. The `unravel` command starts the local app.

Read [explore a feature](/docs/exploring) or [troubleshooting](/docs/troubleshooting) next.
