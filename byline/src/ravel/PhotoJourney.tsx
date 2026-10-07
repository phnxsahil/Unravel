import { useEffect, useId, useState } from "react";
import { ArrowRight, Check, FileCode2, Image, Loader2 } from "lucide-react";
import photoSource from "../../../examples/profile-photo/web/ProfilePhoto.tsx?raw";
import apiSource from "../../../examples/profile-photo/web/api.ts?raw";
import serverSource from "../../../apps/ravel/reference.py?raw";
import type { SourceFile } from "./types";
import SourceExcerpt from "./SourceExcerpt";

function sourceLineCount(source: string) {
  const lines = source.split("\n");
  while (lines.at(-1) === "") lines.pop();
  return lines.length;
}

export const photoFiles: SourceFile[] = [
  {
    path: "web/ProfilePhoto.tsx",
    body: photoSource,
    language: "tsx",
    lines: sourceLineCount(photoSource),
  },
  {
    path: "web/api.ts",
    body: apiSource,
    language: "typescript",
    lines: sourceLineCount(apiSource),
  },
  {
    path: "apps/ravel/reference.py",
    body: serverSource,
    language: "python",
    lines: sourceLineCount(serverSource),
  },
];
import type { EvidenceMap } from "./studio-api";
export const photoMap: EvidenceMap = {
  title: "Upload a photo",
  snapshot_id: "photo-prepared-v1",
  digest: "prepared-reference",
  feature_id: "photo",
  version: 1,
  nodes: [
    {
      id: photoFiles[0].path,
      label: "Upload photo",
      role: "action",
      kind: "source",
      citations: [{ path: photoFiles[0].path, line: 23, end_line: 23 }],
    },
    {
      id: photoFiles[1].path,
      label: "Send the image",
      role: "source",
      kind: "source",
      citations: [{ path: photoFiles[1].path, line: 2, end_line: 7 }],
    },
    {
      id: photoFiles[2].path,
      label: "Receive the upload",
      role: "route",
      kind: "source",
      citations: [{ path: photoFiles[2].path, line: 14, end_line: 24 }],
    },
  ],
  edges: [
    {
      id: "photo-import",
      from: photoFiles[0].path,
      to: photoFiles[1].path,
      kind: "source",
      label: "Imports uploadPhoto",
      citations: [{ path: photoFiles[0].path, line: 2, end_line: 2 }],
    },
    {
      id: "photo-request",
      from: photoFiles[1].path,
      to: photoFiles[2].path,
      kind: "inferred",
      label: "Matching request and route; execution unverified",
      citations: [
        { path: photoFiles[1].path, line: 2, end_line: 2 },
        { path: photoFiles[2].path, line: 14, end_line: 14 },
      ],
    },
  ],
  questions: [
    "How does this work?",
    "What happens if it fails?",
    "What would changing it involve?",
  ],
  limitations: [
    "This public example is prepared. Source links are not a live execution trace.",
  ],
};

export default function PhotoJourney({
  compact = false,
  id,
}: {
  compact?: boolean;
  id?: string;
}) {
  const generatedId = useId();
  const instance = id ?? generatedId;
  const [scenario, setScenario] = useState<"normal" | "slow" | "failure">(
    "normal",
  );
  const [part, setPart] = useState(0);
  const [showChange, setShowChange] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(!compact);
  useEffect(() => {
    if (compact && matchMedia("(min-width: 801px)").matches)
      setSourceOpen(true);
  }, [compact]);
  const scenarios = ["normal", "slow", "failure"] as const;
  const selectedFile = photoFiles[part];
  const excerpt =
    showChange && part === 2
      ? { start: 14, end: 17, highlight: 16 }
      : part === 0 && scenario !== "normal"
        ? scenario === "failure"
          ? { start: 10, end: 15, highlight: 14 }
          : { start: 7, end: 12, highlight: 9 }
        : part === 0
          ? { start: 21, end: 24, highlight: 23 }
          : part === 1
            ? { start: 2, end: 7, highlight: 2 }
            : { start: 14, end: 24, highlight: 23 };
  const finding =
    scenario === "failure"
      ? "A failed request reaches the catch branch. The interface shows an error instead of reporting success."
      : scenario === "slow"
        ? "The loading message is set before awaiting the request. It stays visible while the upload is pending."
        : "The success message is set after uploadPhoto resolves. A real browser experiment checks what your app actually displays.";
  return (
    <div className={"photo-journey " + (compact ? "is-preview" : "")}>
      <div className="photo-toolbar">
        <div className="photo-topline">
          <span className="micro-label">
            PROFILE PHOTO / PREPARED SIMULATION
          </span>
        </div>
        <div
          className="photo-scenario"
          role="tablist"
          aria-label="Example scenario"
        >
          {scenarios.map((item, index) => (
            <button
              key={item}
              type="button"
              role="tab"
              id={`${instance}-tab-${item}`}
              aria-controls={`${instance}-panel`}
              aria-selected={scenario === item}
              tabIndex={scenario === item ? 0 : -1}
              data-scenario={item}
              onClick={() => {
                setScenario(item);
                setPart(0);
                setShowChange(false);
              }}
              onKeyDown={(event) => {
                const target =
                  event.key === "ArrowRight"
                    ? scenarios[(index + 1) % 3]
                    : event.key === "ArrowLeft"
                      ? scenarios[(index + 2) % 3]
                      : event.key === "Home"
                        ? "normal"
                        : event.key === "End"
                          ? "failure"
                          : undefined;
                if (!target) return;
                event.preventDefault();
                setScenario(target);
                setPart(0);
                setShowChange(false);
                document.getElementById(`${instance}-tab-${target}`)?.focus();
              }}
            >
              {item === "normal"
                ? "Works normally"
                : item === "slow"
                  ? "Slow request"
                  : "Request fails"}
            </button>
          ))}
        </div>
      </div>
      <div
        id={`${instance}-panel`}
        role="tabpanel"
        aria-labelledby={`${instance}-tab-${scenario}`}
        className="photo-scenario-panel"
      >
        <div className="photo-outcome">
          <div className="photo-preview">
            <div className="photo-avatar">
              <Image size={28} strokeWidth={1.4} aria-hidden="true" />
            </div>
            <div>
              <h2>Upload a profile photo</h2>
              <p role="status">
                {scenario === "normal"
                  ? "Photo uploaded"
                  : scenario === "slow"
                    ? "Uploading photo…"
                    : "Upload failed. Try again."}
              </p>
            </div>
            {scenario === "normal" ? (
              <Check className="photo-ok" size={20} aria-hidden="true" />
            ) : scenario === "slow" ? (
              <Loader2 size={20} aria-hidden="true" />
            ) : (
              <span className="photo-error">503</span>
            )}
          </div>
          <div className="photo-takeaway">
            <span className="micro-label">WHAT THIS EXPLAINS</span>
            <p>{finding}</p>
          </div>
        </div>
        <div className="photo-workspace">
          <div className="photo-action-column">
            <p className="photo-path-label">
              Select a connection to inspect its source.
            </p>
            <div className="photo-thread" aria-label="Explore the upload path">
              {photoMap.nodes.map((node, index) => (
                <div key={node.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPart(index);
                      setShowChange(false);
                      setSourceOpen(true);
                    }}
                    aria-pressed={part === index}
                  >
                    <span className="thread-node">{index + 1}</span>
                    <span>
                      {node.label}
                      <small>
                        {index === 0
                          ? "Browser"
                          : index === 1
                            ? "Request"
                            : "API"}
                      </small>
                    </span>
                  </button>
                  {index < 2 && <ArrowRight size={14} aria-hidden="true" />}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="photo-change-question"
              aria-expanded={showChange}
              aria-controls={`${instance}-change`}
              onClick={() => {
                setShowChange(!showChange);
                setPart(2);
                setSourceOpen(true);
              }}
            >
              Where would I change the upload limit?{" "}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
            <p
              className="photo-change-answer"
              id={`${instance}-change`}
              hidden={!showChange}
            >
              The API rejects bodies above 512,000 bytes at reference.py:16.
              Inspect that server check before changing the limit. This fixture
              does not establish how another app validates files.
            </p>
          </div>
          <details
            className="photo-source-disclosure"
            open={sourceOpen}
            onToggle={(event) => setSourceOpen(event.currentTarget.open)}
          >
            <summary>
              Inspect the code <FileCode2 size={16} aria-hidden="true" />
            </summary>
            <div
              className="photo-evidence"
              key={`${part}-${scenario}-${showChange}`}
            >
              <span>
                <FileCode2 size={14} aria-hidden="true" />
                {selectedFile.path}
              </span>
              <SourceExcerpt
                body={selectedFile.body}
                language={selectedFile.language}
                path={selectedFile.path}
                {...excerpt}
              />
              <p>
                {part === 0
                  ? "Source evidence: the component manages the visible status. Select a scenario to inspect the corresponding branch."
                  : part === 1
                    ? "Source evidence: the request sends the image to /api/photo and checks the response."
                    : "Matching request and route; execution unverified. The reference API uses disposable memory."}
              </p>
            </div>
          </details>
        </div>
      </div>
      <p className="photo-simulation-note">
        Prepared source and simulated states. No request or AI call runs here.
      </p>
    </div>
  );
}
