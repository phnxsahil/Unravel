# Troubleshooting

Start with the message Unravel shows and the specific operation you were trying. Your earlier exploration remains available after most job failures.

## Unravel is not connected

Start `ravel` from your installed Python environment and open its displayed local URL. For frontend development, run the Vite app on port 5173 with the local backend on port 8000. A static hosted demo cannot read your computer's folders.

## Installation or launch fails

Run `ravel doctor` while the server is stopped. It checks the bundled interface, writable storage and port.

- **Missing interface:** reinstall the versioned wheel. Source contributors should build `byline/` before packaging or starting the development checkout.
- **Port unavailable:** stop the earlier Unravel process or use `ravel --port 8001`. Run doctor with that same port.
- **Storage not writable:** choose a folder you can write with `--home`. Reuse that location on later launches.
- **Browser did not open:** paste the printed local address into your browser.
- **Command not found:** use the full executable path in [setup](/docs/quick-start), or activate the environment where you installed the wheel.

## Connecting a folder fails

Paste an absolute path to an existing folder, without surrounding quotes. A file path is not a project root. If it is already connected, use **Open connected project** rather than adding a second registration. Failed capture leaves a useful error and **Refresh source** to retry; check permissions and connect a smaller supported folder when necessary.

## No starting points appear

Wait for indexing to finish. Confirm that you connected the intended root, then inspect snapshot exclusions. Initial discovery targets supported React components and Python/FastAPI routes, and may miss dynamic or unusual structures.

If a bound is exceeded, connect a smaller source folder. Use **Refresh source** to retry after fixing the problem. An earlier snapshot remains readable if a later refresh fails.

## AI is unavailable

Check Settings, set `ANTHROPIC_API_KEY` and a model available to your account, then restart. Authentication/model errors are shown rather than replaced with fake answers. Provider costs, quotas and availability belong to your account.

For missing or invalid citations, narrow the question and inspect the supplied source. The current excerpt policy can omit relevant code deep in a file.

## A command fails or hangs

Read its recorded output. Confirm required project dependencies are installed and the same existing script works in your terminal. Check trust and profile selection. The default limit is five minutes; use cancellation for a stuck operation.

An interrupted check needs an explicit rerun. If the whole machine or process crashed, inspect orphaned commands before rerunning.

## The result says source changed

This may mean files changed during execution, or the current local files differ from the exploration's original snapshot. Refresh, inspect the difference, and choose which version you intend to verify. Do not treat the warning as a failed assertion by itself.

## A demo note is missing

Demo notes belong to the browser where they were saved. Clearing storage, using a different browser or switching origins can make them unavailable. Export important notes independently.

Next: [setup](/docs/quick-start), [versions](/docs/snapshots), or [checks](/docs/checks).

