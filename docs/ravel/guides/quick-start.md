# Connect a project

Unravel runs on your computer and opens in your browser. It is a local browser app, launched with a small Python command. You do not need an editor extension or desktop wrapper.

## 1. Try the demo

Open [the prepared Search demo](/projects/demo). Compare the working response with **200 OK, broken UI**, choose **Try Search**, then inspect source in **Explore**. The demo is a simulation: no live experiment or AI request runs.

## 2. Install when you have the package

You need **Python 3.12 or later**. The wheel contains the compiled interface: end users do not need Node, Docker, a frontend build or a separate database. Check your Python version before installing.

> **No public download yet.** The versioned wheel has been built locally, but package publication is not available yet. Obtain the actual wheel from the project owner before running the installation commands.

A **wheel** is a Python installation package that includes Unravel and its built interface. A **virtual environment** is a separate folder for Unravel's Python dependencies.

**Replaceable example:** change only the quoted wheel filename and folder in the installation command to the actual file you received. Keep the quotes around paths, including paths with spaces.

### Windows PowerShell

```powershell
python --version
python -m venv "$HOME\ravel-env"
& "$HOME\ravel-env\Scripts\python.exe" -m pip install "C:\Downloads\ravel_workshop-0.2.1-py3-none-any.whl"
& "$HOME\ravel-env\Scripts\unravel.exe"
```

### macOS / Linux

```bash
python3 --version
python3 -m venv "$HOME/ravel-env"
"$HOME/ravel-env/bin/python" -m pip install "$HOME/Downloads/ravel_workshop-0.2.1-py3-none-any.whl"
"$HOME/ravel-env/bin/unravel"
```

The command opens the browser after the local server is ready. If opening fails, copy the printed address into your browser. It listens only on `127.0.0.1`.

## Launch, stop and reopen

If you activate the environment, `unravel` is enough. Otherwise use the full executable path above. Keep its terminal open. Press **Ctrl+C** there to stop the app; closing a browser tab does not stop the server. Run the same command again to reopen it. Connected projects, explorations and discoveries resume from local storage.

`unravel serve` starts without automatically opening a browser. Use `unravel serve --open` to explicitly open it. All launch forms accept `--home` and `--port`.

```bash
# Check setup while Unravel is stopped
unravel doctor
# Launch and open the browser on another port
unravel --port 8001
# Alternative: choose an explicit storage folder
unravel serve --open --home /absolute/path/to/ravel-data --port 8001
```

`--home` selects the folder where Unravel keeps its database and source captures. The `/absolute/path/to/ravel-data` above is a replaceable Unix example; on Windows use a quoted absolute path such as `"C:\Unravel data"`. Run doctor while the server is stopped; a running app occupies its port. Diagnostics check the interface, writable storage and port availability without printing keys.

## 3. Connect a project

> **Supported projects:** React/JavaScript/TypeScript components and Python/FastAPI routes. Unusual or unsupported projects show a notice and a general source-reading starting point when files are readable. Try a smaller supported folder or the prepared demo. Unravel reads source; your editor still makes changes.

1. Open **Your projects**, choose **Connect a project**, and paste an absolute folder path. Windows: click File Explorer's address bar and copy. macOS: in Finder hold Option and choose **Copy … as Pathname**. Linux: open a terminal in the folder and run `pwd`. Remove surrounding quotes if your file manager adds them.
2. Wait for source capture. The progress panel shows work; the overview reports readable files, detected starting points and exclusions.
3. In **Overview**, select a recognizable action. Its technical source path appears underneath. Source names remain visible where a human-readable label cannot be established.
4. Inspect a source file. You can read code and save notes without an AI key.
5. Optionally run an approved browser experiment using disposable data. Explain what the source and observation establish. **Notebook** notes are optional; existing explorations and discoveries survive reopening.


## Storage and optional AI

Data defaults to `~/.ravel` (`C:\Users\your-name\.ravel` on Windows). It is separate from source projects. Use the same `--home` on later launches to reopen the same records. Disconnect removes Unravel's registration and notebook, leaving source files intact.

Live questions use your own `ANTHROPIC_API_KEY`, optionally `RAVEL_MODEL`, and the existing provider-consent flow. Set these in your terminal, or an untracked `.env` in the folder you launch from, then restart Unravel. Read [explanation requests](/docs/explanations). Provider errors are shown honestly; the demo's prepared answers do not replace failed live requests.

**Provider consent** is your permission to send selected source excerpts and your question to Anthropic for a live answer.

## For contributors

Source contributors additionally need Node.js 20+. From the repository root, create and activate a Python environment, then:

`byline/` is the active frontend directory; its historical name is preserved in paths and build commands.

```bash
python -m pip install -e ".[dev]"
cd byline
npm ci
npm run build
cd ..
ravel
```

Build a distributable wheel with `python -m pip install build` and `python -m build --wheel`. Build the frontend first. The package builder copies `byline/dist` into the installed package; source checkouts retain their development fallback.

Next: [explore a feature](/docs/exploring) or [troubleshooting](/docs/troubleshooting).



