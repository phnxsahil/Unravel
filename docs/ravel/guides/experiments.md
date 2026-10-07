# Try a controlled experiment

An experiment changes one condition in an already running local development app. Unravel records what happened before offering any interpretation. It does not edit source or start your app.

## Install the optional browser

Ordinary source exploration needs no browser dependency. Python 3.12+ is required. Obtain the actual versioned wheel before installing; no public download is available.

```powershell
# Replace this quoted filename with the actual wheel you received.
python -m pip install "C:\Downloads\ravel_workshop-0.2.1-py3-none-any.whl[browser]"
unravel browser install
```

```bash
# Replace this quoted filename with the actual wheel you received.
python -m pip install "$HOME/Downloads/ravel_workshop-0.2.1-py3-none-any.whl[browser]"
unravel browser install
```

## Start with the disposable Search app

Build the interface first when working from source. Launch a reference app on a different port:

```bash
unravel reference --example search --port 8017
# Stop it with Ctrl+C before starting an alternative:
unravel reference --example search --port 8017 --variant ambiguous
# Deliberately failed backend request:
unravel reference --example search --port 8017 --variant broken
```

Open `http://127.0.0.1:8017`. The correct implementation returns `results`. The ambiguous implementation returns `items` with HTTP 200, making the unchanged frontend show **Search unavailable**. This is an intentional contract mismatch, not a claim that an AI made a real edit. Connect `examples/search-flow` in a source checkout to inspect its code. The installed reference app works without that checkout, but connecting other source requires a local folder.

The older photo reference remains available with `unravel reference --port 8017`; it retains disposable in-memory storage and the existing variants.

## Review a recipe

Choose **Experiments** in your project. Enter the local app URL and target request path. The app must already run; Unravel does not start development servers. Only explicitly approved loopback origins are allowed. If your API uses a separate port, enter its origin under **Additional local origins**. Approve at most two additional origins; the saved recipe lists every approved destination.

Review source-based suggestions for the selected feature. Suggestions have source citations and can be edited; no expected result is guessed. Missing request paths or named controls stay empty with an explanation.

Choose **Observe without changing the request** for a baseline, failure (controlled HTTP 503), slow request (two-second delay), or reload. Add the action steps in order. Match buttons by their accessible names, upload inputs by their labels and assertions by exact visible text. The upload step always uses a bundled tiny PNG. Navigate accepts a relative path. No arbitrary JavaScript, commands or patches are accepted.

For Search, use **fill → Search query → React**, **click → Search**, then **assert visible → Results loaded** for the correct ordinary baseline. With the ambiguous reference, that same assertion should be **expectation not met**, despite a recorded HTTP 200. Use **Search unavailable** when testing the controlled failure.

Select one saved recipe before checking the two approval boxes. Approval belongs to that recipe selection and resets when selection or editor content changes. Saving a recipe does not run it. With no assertion, an experiment remains inconclusive.

A compatible photo failure recipe is:

1. Upload → **Choose photo**.
2. Click → **Upload photo**.
3. Assert visible → **Upload failed. Try again.**

For slow requests, assert **Uploading photo…**, then wait long enough and assert **Photo uploaded**. For reload, complete the action first, add a reload, then assert the expected state. The reference component resets its visible status on reload; that alone does not establish whether its backend still holds a photo.

## Approve disposable data

Review the saved URL, scenario, request path, steps and expected text before pressing **Run this experiment**. Confirm approval and disposable development data. A fresh browser context isolates cookies and browser state; **it does not isolate backend data**. Clicks and uploads can create or change records. Authentication and external destinations are not supported. Service workers and websockets are blocked.

## Read the result

- **Expectation met:** configured assertions passed in this run.
- **Expectation not met:** at least one configured assertion failed.
- **Inconclusive:** missing assertions, no matching request or blocked dependencies prevent a complete conclusion.
- **Cancelled:** execution stopped; partial observations remain available.
- **Execution error:** the app, browser, element or deadline prevented completion.

Inspect request status/timing, assertion outcomes, timeline and the final screenshot. Request and response bodies are not stored by default. Screenshots can contain visible development data and stay under local application storage. **Delete local screenshots** removes run images. Disconnecting a project also removes its artifacts.

Runs have a 90-second deadline, at most 20 steps, 200 timeline events and 100 response records. Source identity is captured before and after execution. Changes flag the result for review; a run is not proof that the whole application works.

## Recover

Missing browser: install the browser extra and run `unravel browser install`. Unreachable app: start its server and check the port. Missing element: inspect its label and confirm it is visible without signing in. Blocked dependency: use an approved local test dependency. Redirects are blocked, including redirects between local URLs: enter the app’s final URL directly. Redirect-based authentication is unsupported. Cancellation or restart: review any partial evidence and explicitly approve a rerun.

