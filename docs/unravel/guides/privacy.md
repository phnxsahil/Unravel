# Code and privacy

Unravel is a local browser application. Understanding where source and commands go helps you decide what to connect.

## Source stays local until you ask

Connecting a project reads supported local files into SQLite snapshots. Parsing, search, source inspection, comparisons and notes happen locally.

When you ask a live AI question with consent, selected code excerpts and the question go to your Anthropic provider. Your API key belongs in the server environment or untracked `.env`; it is not returned to the browser or included in exports.

The prepared demo uses illustrative source and explanations. It does not send questions to a provider or execute project commands.

## Exclusions and limits

Unravel excludes dependency/generated folders, Git-ignored files, common private names, `.env` files, binaries, unsupported extensions and content matching some secret patterns. Symlinks are skipped and source paths must stay within the selected project folder.

Limits are 2,500 readable files, 512 KiB per included file and 30 MiB total source. An entry-count limit also bounds enumeration. Choose a smaller folder if a project exceeds these bounds.

Secret detection is best effort. Review the source and exclusions before connecting sensitive projects or consenting to an explanation request. The product does not claim comprehensive secret scanning.

## Stored data

The SQLite database contains source snapshots, notes, explanations, jobs, events and check outputs. It is not encrypted by Unravel. Use an appropriate local storage location and access controls for your own computer.

Disconnecting removes that registration's Unravel records while preserving the source folder. Browser-local demo storage is separate.

## Local commands

Existing project scripts run only after explicit project trust. They are not sandboxed. A trusted script may access the same machine resources your terminal can access.

Unravel does not give the AI a command-execution tool. Read [check execution](/docs/checks) before running unfamiliar scripts.

## Current capability boundaries

No remote repository import, automatic GitHub watching, automatic code edits, cloud execution, social posting, chat-history ingestion or interview grading is implemented in this version. Static analysis and source citations do not establish complete runtime behavior.

Next: [learn how the implementation fits together](/docs/architecture).

