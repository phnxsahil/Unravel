# Follow how your app works

Open **Overview** and choose a recognizable action. **Search** is a plain-language label supported by a literal button in the reference source. Technical paths stay underneath so you can check what was actually found.

## Read the map

**Explore** shows a small path centred on the selected action. Select a node to inspect its captured source. On phones the map and source follow each other; the numbered source list is accessible without a graphical canvas.

- **Found in code:** a component, handler, import or literal route supported by cited source.
- **Inferred:** a possible connection, such as a literal request matching a FastAPI route. This is not a runtime trace.
- **Observed in this run:** request and assertion evidence recorded during an approved experiment.

Imports prove dependencies, not execution order. Dynamic URLs, framework routing, indirect handlers and unusual project layouts can produce incomplete maps. If a label cannot be established from a literal control, the source filename remains visible. Inspect the file to understand the limitation.

## Ask better questions

Use **How does this work?**, **What happens if it fails?** or **What would changing it involve?**. Source-first suggestions are rule based and available without a key. Live explanations require your Anthropic key and consent. They can retrieve bounded source context from the same immutable snapshot.

## Check the other path

Open **Experiments** when you have a running development app and disposable data. Configure and approve a recipe before execution. A screenshot or passing assertion establishes only what that run observed. [Learn about experiments](/docs/experiments).

## Return after an edit

Keep editing in your own editor. **Check for changes** captures a new source version; **Changes** compares it with the preceding capture. Earlier explanations remain attached to their original source and may be flagged as outdated. Notes in **Notebook** are optional.

Existing investigation URLs still open the original exploration interface, including trusted command checks and structured exports.

