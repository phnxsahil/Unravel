# Ask with source context

AI is optional. Read source, inspect maps, configure experiments and save notes without a provider key.

## Connect your provider

Set `ANTHROPIC_API_KEY` in your server environment or an untracked `.env` in the launch folder. `RAVEL_MODEL` preserves the existing model configuration. Restart the server and check **Settings**. The browser receives connection status, never the key.

## Ask one question

Inspect a feature in **Explore**. Choose one of the three suggested questions or type a specific question. Confirm consent for this request, then **Ask with source**. The question and bounded excerpts go to Anthropic; connecting a folder does not send source automatically. Consent is your permission for this provider request.

## How the investigation works

The model starts with at most three selected files and their first 45 lines. It may request literal source searches, symbol excerpts or import neighbours from the same captured snapshot. Tool requests cannot read arbitrary filesystem paths, execute commands, run JavaScript or edit source. Repository text remains untrusted data.

Limits are three model rounds, six source-tool requests and a 90-second total deadline. Individual provider calls have a 30-second timeout. Transient failures consume rounds; there is no unbounded retry. Default cumulative ceilings are 24,000 input and 6,000 output tokens. `UNRAVEL_INPUT_TOKEN_LIMIT` and `UNRAVEL_OUTPUT_TOKEN_LIMIT` set bounded alternatives. Dispatch uses a conservative byte estimate; recorded usage comes from actual provider responses.

The result records prompt version, source identity, rounds, tool requests, actual token usage and duration. Missing context returns an actionable limitation. Results can be reused only when source identity, paths, question, model and prompt version match.

## Read claims critically

**Found in code** claims cite supplied source. **Inferred** claims need reasoning or additional evidence. Source facts are not browser observations. Pydantic validates structure and citation ranges are checked against supplied excerpts; neither proves semantic correctness. Verify the cited code and use experiments where appropriate.

Missing keys, invalid citations, malformed output, rejected models, provider failures and exhausted budgets produce errors. Your exploration is preserved. A failed live answer is never replaced by a prepared answer.

The public Search demo makes no AI requests. Historical demo investigation links retain their explicitly prepared explanations for compatibility.

