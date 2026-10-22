import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import searchSource from "../../../examples/search-flow/Search.tsx?raw";
import apiSource from "../../../examples/search-flow/api.py?raw";
import type { SourceFile } from "./types";
import type { EvidenceMap } from "./studio-api";
import SourceExcerpt from "./SourceExcerpt";

export const searchFiles: SourceFile[] = [
  {
    path: "examples/search-flow/Search.tsx",
    body: searchSource,
    language: "tsx",
    lines: searchSource.trimEnd().split("\n").length,
  },
  {
    path: "examples/search-flow/api.py",
    body: apiSource,
    language: "python",
    lines: apiSource.trimEnd().split("\n").length,
  },
];
export const searchMap: EvidenceMap = {
  title: "Search",
  version: 1,
  feature_id: "search",
  snapshot_id: "search-prepared-v1",
  digest: "prepared-search",
  nodes: [
    {
      id: searchFiles[0].path,
      label: "Search button and response handler",
      role: "action",
      kind: "source",
      citations: [{ path: searchFiles[0].path, line: 9, end_line: 15 }],
    },
    {
      id: searchFiles[1].path,
      label: "GET /api/search",
      role: "route",
      kind: "source",
      citations: [{ path: searchFiles[1].path, line: 3, end_line: 9 }],
    },
  ],
  edges: [
    {
      id: "search-request",
      from: searchFiles[0].path,
      to: searchFiles[1].path,
      label: "Matching request and route; execution unverified",
      kind: "inferred",
      citations: [
        { path: searchFiles[0].path, line: 9, end_line: 9 },
        { path: searchFiles[1].path, line: 3, end_line: 3 },
      ],
    },
  ],
  questions: [
    "How does this work?",
    "What happens if it fails?",
    "What would changing it involve?",
  ],
  limitations: [
    "Prepared source example. This map is not a live trace; the response-shape change is deliberate.",
  ],
};
type Scenario = "before" | "changed" | "failure";
const scenarios: Scenario[] = ["before", "changed", "failure"];
const labels = ["Before the change", "200 OK, broken UI", "Failed request"];
const walkthrough = `# Search: 200 OK, broken UI\n\nPrepared simulation, not a live browser run.\n\n## Action\nSearch for React.\n\n## Source\nSearch.tsx:9 sends /api/search?q=React. Lines 11–12 require data.results to be an array. api.py:8 returns items in the deliberately incompatible variant.\n\n## Result\nThe simulated request succeeds with HTTP 200, but its response shape fails the frontend guard and reaches Search unavailable. A successful status code alone does not establish a working UI.\n\n## Next question\nWhich response contract should the frontend and backend share?\n`;
export function SearchChanges() {
  return (
    <section className="change-entry">
      <span className="micro-label">
        PREPARED COMPARISON / NOT A LIVE FOLDER
      </span>
      <h2>The request still succeeds. The contract changed.</h2>
      <pre>{`Before: { "results": ["React"] }\nAfter:  { "items": ["React"], "accepted": true }`}</pre>
      <p>
        The Search handler reads <code>data.results</code>. The incompatible
        variant returns <code>items</code>. Follow the guard at Search.tsx:12
        before deciding what to change.
      </p>
      <Link className="button" to="/projects/demo/explore">
        Inspect the response handler <ArrowRight size={16} />
      </Link>
    </section>
  );
}
export function SearchNotebook() {
  return (
    <section className="change-entry">
      <h2>A response can succeed while the feature fails.</h2>
      <p>
        This prepared walkthrough connects the action, response contract and
        visible error. It is a sample explanation, not your saved work or a live
        result.
      </p>
      <a
        className="button"
        download="unravel-search-walkthrough.md"
        href={`data:text/markdown;charset=utf-8,${encodeURIComponent(walkthrough)}`}
      >
        Export sample walkthrough
      </a>
      <Link className="button" to="/projects">
        Try it with your project
      </Link>
    </section>
  );
}
export default function SearchJourney({
  compact = false,
  id,
  experiment = false,
}: {
  compact?: boolean;
  id?: string;
  experiment?: boolean;
}) {
  const uid = useId();
  const instance = id || uid;
  const [scenario, setScenario] = useState<Scenario>(() => {
    if (compact) return "changed";
    try {
      const value = sessionStorage.getItem("unravel:search-scenario");
      return scenarios.includes(value as Scenario)
        ? (value as Scenario)
        : "before";
    } catch {
      return "before";
    }
  });
  const [ran, setRan] = useState(false);
  const [part, setPart] = useState(0);
  const choose = (value: Scenario) => {
    setScenario(value);
    setRan(false);
    if (!compact) {
      try {
        sessionStorage.setItem("unravel:search-scenario", value);
      } catch {
        /* Optional storage. */
      }
    }
  };
  return (
    <div
      className={`photo-journey search-journey ${compact ? "is-preview" : ""}`}
    >
      <div className="photo-toolbar">
        <span className="micro-label">SEARCH / PREPARED SIMULATION</span>
        <div
          className="photo-scenario"
          role="tablist"
          aria-label="Search scenario"
        >
          {scenarios.map((value, index) => (
            <button
              type="button"
              key={value}
              role="tab"
              id={`${instance}-${value}`}
              aria-controls={`${instance}-result`}
              aria-selected={scenario === value}
              tabIndex={scenario === value ? 0 : -1}
              onClick={() => choose(value)}
              onKeyDown={(event) => {
                const next =
                  event.key === "ArrowRight"
                    ? scenarios[(index + 1) % 3]
                    : event.key === "ArrowLeft"
                      ? scenarios[(index + 2) % 3]
                      : event.key === "Home"
                        ? scenarios[0]
                        : event.key === "End"
                          ? scenarios[2]
                          : undefined;
                if (next) {
                  event.preventDefault();
                  choose(next);
                  document.getElementById(`${instance}-${next}`)?.focus();
                }
              }}
            >
              {labels[index]}
            </button>
          ))}
        </div>
      </div>
      <div
        className="photo-scenario-panel"
        role="tabpanel"
        id={`${instance}-result`}
        aria-labelledby={`${instance}-${scenario}`}
      >
        <div className="photo-outcome">
          <div className="photo-preview">
            <div>
              <h2>
                {compact
                  ? "It worked before that prompt."
                  : experiment
                    ? "Test the response contract."
                    : "Search worked. Then the API changed."}
              </h2>
              <p>
                Search for <strong>React</strong>.{" "}
                {compact
                  ? ""
                  : "Compare the response with the frontend’s expectation."}
              </p>
              <button
                className="button primary"
                type="button"
                onClick={() => setRan(true)}
              >
                {experiment ? "Run prepared scenario" : "Try Search"}
              </button>
              <p role="status">
                {!ran
                  ? "Ready — no request has run."
                  : scenario === "before"
                    ? "Simulated: 200 OK · Results loaded · React"
                    : scenario === "changed"
                      ? "Simulated: 200 OK · Search unavailable"
                      : "Simulated: 503 · Search unavailable"}
              </p>
            </div>
          </div>
          <div className="photo-takeaway">
            <span className="micro-label">WHY THIS HAPPENS</span>
            <p>
              {scenario === "changed"
                ? "The API now returns items. The UI still reads results. A green network response does not mean the feature works."
                : scenario === "failure"
                  ? "A controlled failure reaches the catch branch. The UI reports Search unavailable."
                  : "The API returns results, matching the frontend’s array check."}
            </p>
            <code>
              {scenario === "changed"
                ? '{ "items": ["React"], "accepted": true }'
                : scenario === "before"
                  ? '{ "results": ["React"] }'
                  : '{ "detail": "Controlled failure" }'}
            </code>
          </div>
        </div>
        {!experiment && (
          <div className="photo-workspace">
            <div className="photo-action-column">
              <p className="photo-path-label">
                Inspect the contract on either side.
              </p>
              <div className="photo-thread">
                {searchMap.nodes.map((node, index) => (
                  <button
                    type="button"
                    key={node.id}
                    aria-pressed={part === index}
                    onClick={() => setPart(index)}
                  >
                    <span>{index + 1}</span>
                    <strong>
                      {index === 0
                        ? "UI expects results"
                        : "API returns results or items"}
                    </strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="photo-evidence search-source">
              <span>{searchFiles[part].path}</span>
              <SourceExcerpt
                {...searchFiles[part]}
                start={part === 0 ? 9 : 3}
                end={part === 0 ? 15 : 9}
                highlight={part === 0 ? 12 : scenario === "changed" ? 8 : 9}
              />
            </div>
          </div>
        )}
        {experiment && ran && (
          <div className="change-entry">
            <h3>Prepared result</h3>
            <p>
              {scenario === "before"
                ? "The response contract matches. The UI shows Results loaded."
                : "The UI shows Search unavailable. Inspect the response handler before choosing a fix."}
            </p>
            <Link className="button" to="/projects/demo/changes">
              Compare the response contract
            </Link>
          </div>
        )}
        <p className="map-limitation">
          Prepared local example. Selecting a scenario does not contact a
          provider or run your server.
        </p>
      </div>
    </div>
  );
}
