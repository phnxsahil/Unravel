# A first look at Unravel

**Understand the app you built.** Explore how it works, see what happens when things go wrong, and find where to make your next change.

Unravel is a local browser app for students, self-taught developers and solo builders creating React applications with AI. Start with a familiar action rather than a directory full of files.

## Recognize an action

[Explore the Search demo](/projects/demo). It starts with a familiar mystery: **200 OK. Broken UI.** The API deliberately changes `results` to `items`; the frontend still expects `results`. All public outcomes are prepared simulations, not live browser or AI results.

Select **Before the change**, **200 OK, broken UI**, or **Failed request**, then choose **Try Search**. Select **UI expects results** or **API returns results or items** to inspect the source. The Search scenario persists while moving between the demo views in the same browser tab.

The separate **Follow the thread** walkthrough traces the prepared Search example from its button to `/api/search`, its failure handler and the status message. Scroll forward or backward, select a chapter, or use the arrow keys, Home and End on the chapter tabs. Short screens and reduced-motion settings use a normal-flow presentation. Optional sound signals chapter changes and starts off.

## Follow the evidence

Open **Explore** to see the Search handler and matching API route. Select a source node to inspect its captured file. **Found in code** identifies a source fact. **Inferred** identifies a possible connection, such as a matching request and route. Imports alone do not establish execution. **Observed in this run** belongs to recorded browser results.

React, JavaScript, TypeScript and Python/FastAPI have initial source discovery support. Dynamic requests and unusual frameworks may need manual inspection; there is no claim of complete runtime coverage.

## Try a scenario

Connect your own project and open **Experiments**. Start its development server, review the recipe and explicitly approve disposable data. Fail a request, delay it or reload after an action. Read observed results before relying on an explanation. [Read the experiment guide](/docs/experiments).

The landing page's **Simulate a failed search** control only changes a prepared display. It sends no request and produces no observed experiment evidence. The **Take a closer look** panels expose the button, route, failure scenario and expected result separately.

## Return with context

**Check for changes** captures external edits while preserving old source. **Changes** compares snapshots and marks potentially outdated explanations. In a real project, open **Notebook** to save an optional discovery or export a Markdown walkthrough. In the demo, **Changes** shows the prepared response comparison and **Notebook** exports a labelled sample walkthrough. Notes are not an understanding score.

A useful first session ends when you can explain one part of your app using its source and, when available, an observed result. AI questions are optional and require your Anthropic key and consent.

