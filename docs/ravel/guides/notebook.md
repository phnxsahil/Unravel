# Keep a discovery

A note is optional. A useful session ends when you can explain one part of your app using source and, when available, an observation from an experiment.

## Save what clicked

Open **Notebook** in your project. Write a discovery about the selected feature and choose **Save a discovery**. For example: “The upload waits for response.ok before showing success. A failed-request run showed the error message; I still have not checked whether storage survives restart.”

Unsaved typing is not automatically persisted. Saved discoveries and investigations are stored locally in SQLite. There are no compulsory quizzes, understanding scores or streaks.

## Resume an exploration

Your explorations remain listed in Notebook. A historical exploration opens its original source, answers and notes. Source changes may mark it as potentially outdated without replacing its evidence. Use **Check for changes**, revisit the current feature and explicitly approve a new experiment where useful.

## Export a project walkthrough

Choose **Export project walkthrough** for Markdown containing explored actions, snapshot identity, source paths, explanations and citations, discoveries, configured experiment outcomes and unresolved questions. It contains no invented achievements or résumé metrics.

Historical investigation views also preserve Markdown and JSON exports, notes, predictions and trusted-command checks. Those checks differ from browser experiments and execute existing project scripts on your machine.

## Storage and removal

The default storage location remains `~/.ravel`; `--home` selects another location. Existing registrations, notes and URLs survive the additive migration. Experiment screenshots stay beneath that storage folder and can be deleted independently. Disconnecting a project removes its records and artifacts, leaving your source intact. Export important work before disconnecting; there is no notebook undo.

The public Search demo exports a labelled sample walkthrough. It does not store new personal discoveries. Historical demo notes remain in browser storage; connect a real project to store discoveries in the local database.

