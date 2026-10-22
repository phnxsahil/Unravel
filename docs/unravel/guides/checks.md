# Run a local check

A check is an existing command from your project, such as an npm test/build script or pytest. Unravel records its real output and result.

## Choose and run

1. Open **Compare & check** in an exploration.
2. Inspect the detected check profiles.
3. Confirm that you trust the local project before allowing its commands to execute.
4. Select the check you want and start it.
5. Read the recorded output, status and scope. Cancel it if necessary.

Unravel discovers supported existing npm scripts and configured Python tests. It does not invent a command through AI. Discovery covers common project folders, so an unusual layout may not expose its scripts yet.

## Trust means local execution

Project scripts execute on your computer with your environment. They can do whatever the script itself is written to do. Unravel's runner is not a security sandbox.

Trust your own reviewed code. Unravel restricts the selected profile to discovered script names and project-contained working directories, but those checks do not make arbitrary repository scripts safe.

## Interpret the result

- **Passed:** that command exited successfully.
- **Failed:** the command returned a failure or could not run.
- **Timeout:** the configured time limit was reached.
- **Cancelled:** you stopped the operation.
- **Interrupted:** the server restarted while a check was active; rerun it explicitly.

The default timeout is five minutes. Cancellation attempts to terminate the process and descendants. A hard machine or process crash may still require manual inspection of orphaned processes.

## What a passing result proves

A URL-construction test can prove its URL assumption. It does not prove the API accepted a request, the database saved correctly, or the whole app has no bugs.

The result records source identity before and after execution. If source changed during the check, or differs from the exploration's captured version, Unravel warns that it does not verify the original evidence.

Markdown and JSON exports preserve the result and its scope. There are no fake passing results in the prepared demo, which cannot execute commands.

## A useful next question

Ask yourself: **Which behavior did this command actually exercise, and what did it leave untested?** Save that answer with your discovery.

Next: [save a discovery](/docs/notebook), or [troubleshoot a failed command](/docs/troubleshooting).

