# Learn Ravel by investigating Ravel

You do not need to understand the whole repository first. Start with a feature, predict what happens, follow its source, then check your prediction.

## One useful first session

1. Open the prepared demo. Follow “Where does a saved draft go?” Click its source steps and open a prepared explanation.
2. Write what you think would happen if the browser closes after saving. Separate what the code shows from what would need a running test.
3. Save a discovery. Reload the page and export it. Notice which state is stored in the browser.
4. Connect `examples/request-flow` in the local workshop. Follow POST `/drafts` into `store.py`. These are real files, separate from the illustrative demo.
5. In your existing editor, change `store.py` to trim whitespace. Refresh source in Ravel and compare the snapshots. Your old investigation keeps its original source; changed evidence is marked outdated.
6. Select the existing npm test only after trusting the folder. Read its scope: this example checks a URL assumption, not database behavior. A passing result does not establish that trimming works.
7. Write the missing test you would need. That is an engineering decision worth discussing in an interview.

## Follow one real request through the implementation

| Question | Start here | What you learn |
| --- | --- | --- |
| How does clicking a feature open an investigation? | `byline/src/ravel/App.tsx` → `repository.ts` → `apps/ravel/api.py` | UI state, HTTP requests, validation |
| How do notes survive reload? | `Workbench.tsx` → `storage.py` | Server state vs React state, persistence |
| Why does source capture exclude files? | `source.py`, ingestion tests | File boundaries, resource limits, privacy |
| Why can a static import be misleading? | `source.py` → `make_features` | Parsing vs observed execution |
| How does analysis continue after a restart? | `service.py` → `storage.py` | Job state machines, recovery, event history |
| Why must an AI answer include citations? | `ai.py`, `test_provider.py` | Structured output, validation, retries |
| Can a valid citation still support a wrong explanation? | `EVALUATION.md` | Evidence existence vs semantic correctness |
| How does cancelling a check stop its children? | `runner.py`, runner tests | Process control, timeouts, Windows/Linux branches |
| What changed between two versions? | `source.py` → `difference` | Content hashes, immutable data, diffs |
| How do browser and API types stay aligned? | `scripts/generate_contracts.py`, `contracts.generated.ts` | OpenAPI and generated request contracts |

## A useful habit

Before asking an assistant to explain a function, write your prediction in two sentences. Then inspect the function and its test. Ask about the part where your prediction and the evidence disagree. Make one small change and describe why the test is enough—or why it is not.

DSA is a separate practice. This project gives you concrete reasons to understand maps, sets, graphs, queues, bounds, and time complexity; it does not replace interview problem practice.

## Resume evidence

Today you can describe the implementation: local source ingestion, Tree-sitter analysis, immutable snapshots, SQLite/FTS5, durable jobs, validated AI citations, and trusted check execution. Use measured QA results from `QA.md` with their scope.

Do not invent an “improved understanding by X%” bullet. Run the comparison described in `EVALUATION.md` first. A credible bullet can use: “Built X, verified by Y, using Z.” If no before/after study exists, an implementation claim is sufficient.
