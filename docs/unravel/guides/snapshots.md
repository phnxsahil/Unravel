# Compare source changes

Unravel does not edit your code. Keep working in your editor, ChatGPT, an IDE agent or a Git worktree, then return with context.

## Check for changes

Use **Check for changes** on project entry or in **Changes**. Capture reads the connected folder's current files, applying exclusions and size limits. A commit is optional; Git commit and dirty status are metadata. An uncommitted edit is visible in the next capture. A separate worktree must be connected by its own absolute path.

## Compare versions

Changes compares the two latest distinct captures. Expand a filename to inspect its diff. Unchanged captures reuse the existing snapshot. Earlier source stays intact. This lets you check what an external agent changed without pretending Unravel watched every keystroke or knows which tool authored it.

## Revisit affected explanations

Explorations with changed supporting files are marked potentially outdated. This is a prompt to inspect source, not a claim of a bug. Notebook links preserve the original evidence. Revisit the feature and ask again if useful; approve a configured experiment to observe the current development app.

Experiments capture source identity before and after a run. A mismatch with the recipe or an edit during execution is reported. Captured source is not proof that the running server was built from that exact code; confirm your development server has picked up edits.

## What is not detected

Import-based affected paths are bounded, and dynamic dependencies may be missed. Database-only edits, environmental differences and untracked remote work do not automatically become source changes. A source diff cannot establish that an earlier failure is fixed; inspect an observed result or run a relevant check.

Historical exploration URLs retain their original comparison controls and trusted command checks.


## Follow a feature

In **Explore**, choose **Follow this feature** to preserve its source version without an AI key or note. After an affected external edit, **Check for changes** keeps the old evidence and marks that exploration for review. From **Changes**, revisit its current source, open the preserved explanation, or review saved experiments. Running again always requires approval; following does not monitor or modify your app automatically.
