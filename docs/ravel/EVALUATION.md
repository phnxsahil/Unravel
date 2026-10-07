# Explanation and product evaluation

Status: evaluation protocol and 30-question seed set prepared; human review and user study have **not** been run. Automated citation validation does not measure explanation correctness.

## Review an answer

Record the captured snapshot digest, question, model, prompt version, response, citations, input/output tokens and duration. For every material claim, a human reviewer opens the cited source and scores supported / inferred appropriately / unsupported. Also record missing context, plain-language clarity, and whether the suggested next question helps.

Use the same snapshot and questions for a baseline assistant and Ravel. Compare supported-claim rate, bad-citation rate, useful-next-step rate and cost. Report raw counts and the sample size. API credits and real reviewers are needed; a fake transport test is not a model evaluation.

## 30 seed questions across three real source scopes

These questions are deliberately answerable or reveal missing evidence. Reviewers supply expected answers and source ranges before evaluating responses. Do not treat these rows as approved ground truth.

| ID | Source scope | Question |
| --- | --- | --- |
| F01 | `examples/request-flow` | What method and URL does the browser use to save? |
| F02 | same | Where is the backend route prefix configured? |
| F03 | same | What is passed from the route to the storage helper? |
| F04 | same | Does storage persist across process restarts? |
| F05 | same | Is the title trimmed or validated? |
| F06 | same | What does the existing npm test actually verify? |
| F07 | same | What would a passing test fail to prove? |
| F08 | same | What happens when the request fails? |
| F09 | same | What evidence would prove the browser and server work together? |
| F10 | same | How could a route-prefix mismatch be caught by a new test? |
| U01 | `byline/src/ravel` | How does a feature click navigate to its investigation? |
| U02 | same | How does project indexing update the starting points? |
| U03 | same | Where are prepared-demo discoveries stored? |
| U04 | same | Where are real-project discoveries stored? |
| U05 | same | How does the UI distinguish demo explanations from live AI? |
| U06 | same | What does the consent checkbox authorize? |
| U07 | same | How does a citation select a source line? |
| U08 | same | What survives a page reload and what does not? |
| U09 | same | How does the selected theme persist? |
| U10 | same | How are local API disconnection errors presented? |
| B01 | `apps/ravel` | Which files are excluded from a source snapshot? |
| B02 | same | How are dirty or non-Git folders identified? |
| B03 | same | What relationships can the parser directly establish? |
| B04 | same | How is explanation context bounded? |
| B05 | same | What makes a citation invalid? |
| B06 | same | Which provider errors are retried? |
| B07 | same | How are explanation cache keys constructed? |
| B08 | same | Which jobs resume after restart and which do not? |
| B09 | same | How are source changes during a check detected? |
| B10 | same | Why does a check on newer source not verify an older investigation? |

## Does the product help?

Pilot with the owner plus five builders. Give each two comparable tasks in their own supported project: explain one feature, then make and verify one small change. Alternate whether their usual assistant or Ravel is used first.

Record time, completed tasks, explanation accuracy, ability to describe the change without assistance, and whether they voluntarily return within a week. Ask what was confusing and what felt enjoyable. Retention and learning are hypotheses until these observations exist.

If the feature path is wrong, fix path discovery before adding more agents. If users only read explanations, improve invitations to inspect source. If they cannot describe what a passing check proves, change result wording and examples. If they do not return, reconsider the problem and onboarding before adding engagement gimmicks.
