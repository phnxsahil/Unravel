import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  registerRoot,
  useCurrentFrame,
} from "remotion";
import {
  ArrowDown,
  ArrowRight,
  Search as SearchIcon,
  Check,
  X,
} from "lucide-react";
import { Mark, Pill } from "../src/ravel/shared";
import SourceExcerpt from "../src/ravel/SourceExcerpt";
import searchSource from "../../examples/search-flow/Search.tsx?raw";
import apiSource from "../../examples/search-flow/api.py?raw";
import "./unravel-film.css";
import { FILM_FPS, FILM_SECONDS, FILM_TIMELINE } from "./unravel-timeline.json";

// The film compares existing fixture branches. No request is sent, no file is
// edited, and no live trace or automatic fix is represented by this composition.
const lineNumber = (source: string, text: string) => {
  const index = source.split("\n").findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Search fixture changed: missing ${text}`);
  return index + 1;
};
const guard = lineNumber(searchSource, "if (!Array.isArray(data.results))");
const request = lineNumber(searchSource, "fetch('/api/search?q='");
const incompatible = lineNumber(apiSource, "return {'items':");
const compatible = lineNumber(apiSource, "return {'results':");
const route = lineNumber(apiSource, "@app.get('/api/search')");
const resourceMatch = apiSource.match(/for item in (\[[^\]]+\])/);
const itemsMatch = apiSource.match(
  /return \{'items': (\[[^\]]+\]), 'accepted': True\}/,
);
if (!resourceMatch || !itemsMatch)
  throw new Error("Search response fixture changed");
const resources = JSON.parse(resourceMatch[1].replaceAll("'", '"')) as string[];
const before = {
  results: resources.filter((item) => item.toLowerCase().includes("react")),
};
const after = {
  items: JSON.parse(itemsMatch[1].replaceAll("'", '"')) as string[],
  accepted: true,
};
const loaded = searchSource.match(/setStatus\('(Results loaded)'\)/)?.[1];
const unavailable = searchSource.match(
  /setStatus\('(Search unavailable)'\)/,
)?.[1];
if (!loaded || !unavailable) throw new Error("Search status fixture changed");

type Layout = { vertical: boolean };
const ease = (frame: number, start = 0, seconds = 0.4) =>
  interpolate(frame, [start * FILM_FPS, (start + seconds) * FILM_FPS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.23, 1, 0.32, 1),
  });
function Fade({
  children,
  at = 0,
  duration = 0.4,
  className = "",
}: React.PropsWithChildren<{
  at?: number;
  duration?: number;
  className?: string;
}>) {
  const frame = useCurrentFrame();
  return (
    <div className={className} style={{ opacity: ease(frame, at, duration) }}>
      {children}
    </div>
  );
}
function Brand({ large = false }: { large?: boolean }) {
  return (
    <div className={`film-brand ${large ? "large" : ""}`}>
      <Mark />
      <span>unravel</span>
    </div>
  );
}
function Heading({
  eyebrow,
  children,
  note,
}: React.PropsWithChildren<{ eyebrow: string; note?: string }>) {
  return (
    <header className="film-heading">
      <div className="film-eyebrow">{eyebrow}</div>
      <h1 data-check>{children}</h1>
      {note && <p data-check>{note}</p>}
    </header>
  );
}
function Response({ broken = false }: { broken?: boolean }) {
  return (
    <code className="film-response" data-check>
      {broken
        ? `{ "items": ${JSON.stringify(after.items)},\n  "accepted": ${after.accepted} }`
        : `{ "results": ${JSON.stringify(before.results)} }`}
    </code>
  );
}
function SearchResult({
  broken = false,
  compact = false,
}: {
  broken?: boolean;
  compact?: boolean;
}) {
  const frame = useCurrentFrame();
  const press = interpolate(frame, [0, 6, 12], [1, 0.98, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <section className={`film-search ${compact ? "compact" : ""}`}>
      <div className="film-panel-title">
        <SearchIcon size={24} />
        <span>Search</span>
        <Pill>{broken ? "Incompatible example" : "Compatible example"}</Pill>
      </div>
      <div className="film-search-body">
        <label>Search query</label>
        <div className="film-input-row">
          <input readOnly value="React" aria-label="Search query" />
          <button
            className="button primary"
            style={{ transform: `scale(${press})` }}
          >
            Search <ArrowRight size={24} />
          </button>
        </div>
        <div
          className={`film-outcome ${broken ? "failed" : "passed"}`}
          data-check
        >
          {broken ? <X /> : <Check />}
          {broken ? unavailable : loaded}
        </div>
        {!broken && (
          <div className="film-result-row" data-check>
            {before.results[0]}
            <ArrowRight size={24} />
          </div>
        )}
        {broken && (
          <p className="film-empty" data-check>
            The response arrived. <br />
            The interface could not use it.
          </p>
        )}
      </div>
    </section>
  );
}
function Event({
  body = false,
  broken = true,
}: {
  body?: boolean;
  broken?: boolean;
}) {
  return (
    <section className="film-event">
      <div className="film-eyebrow">SIMULATED REQUEST EVENT</div>
      <div className="film-http" data-check>
        <span>200</span> OK
      </div>
      <code className="film-endpoint" data-check>
        GET /api/search?q=React
      </code>
      {body ? (
        <Response broken={broken} />
      ) : (
        <p data-check>
          A successful request.
          <br />
          An unsuccessful feature.
        </p>
      )}
    </section>
  );
}
function Snippet({
  backend = false,
  start,
  end,
  highlight,
  title,
}: {
  backend?: boolean;
  start: number;
  end: number;
  highlight?: number;
  title: string;
}) {
  return (
    <section className="film-source">
      <div className="film-panel-title" data-check>
        <span>
          {backend ? "api.py" : "Search.tsx"}{" "}
          <span className="film-subtle">
            · {start}
            {end !== start ? `–${end}` : ""}
          </span>
        </span>
        <Pill>{title}</Pill>
      </div>
      <SourceExcerpt
        body={backend ? apiSource : searchSource}
        language={backend ? "python" : "tsx"}
        path={`examples/search-flow/${backend ? "api.py" : "Search.tsx"}`}
        start={start}
        end={end}
        highlight={highlight}
      />
    </section>
  );
}
function Path({ vertical, animated = true }: Layout & { animated?: boolean }) {
  const frame = useCurrentFrame();
  const labels = [
    ["01", "Search", "Interface action"],
    ["02", "/api/search", "Request path"],
    ["03", "api.py", "Candidate route"],
  ];
  return (
    <div className={`film-path ${vertical ? "stacked" : ""}`}>
      {labels.map(([number, title, hint], i) => (
        <React.Fragment key={title}>
          {i > 0 && (
            <div className="film-connector">
              <div
                style={{
                  transform: vertical
                    ? `scaleY(${animated ? ease(frame, i * 0.3, 0.8) : 1})`
                    : `scaleX(${animated ? ease(frame, i * 0.3, 0.8) : 1})`,
                }}
              />
            </div>
          )}
          <div
            className="film-path-node"
            style={{ opacity: animated ? ease(frame, i * 0.3) : 1 }}
          >
            <span>{number}</span>
            <strong data-check>{title}</strong>
            <small data-check>{hint}</small>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
function Diff({ at = 0 }: { at?: number }) {
  return (
    <Fade at={at} className="film-diff">
      <div className="film-eyebrow">
        LABELLED EXAMPLE EDIT · RESPONSE CONTRACT
      </div>
      <div className="film-diff-lines">
        <code data-check>− results</code>
        <ArrowRight size={32} />
        <code data-check>+ items</code>
      </div>
      <p data-check>Comparing bundled branches, not a captured user edit.</p>
    </Fade>
  );
}
function Working() {
  return (
    <>
      <Heading eyebrow="01 / BEFORE THE CHANGE">
        It worked before
        <br />
        that prompt.
      </Heading>
      <div className="film-working">
        <SearchResult />
        <Diff at={2.15} />
      </div>
      <div className="film-bottom-note">
        A controlled Search example. No live agent conversation.
      </div>
    </>
  );
}
function Broken({ vertical }: Layout) {
  return (
    <>
      <Heading eyebrow="02 / AFTER THE EXAMPLE EDIT">
        200 OK.
        <br />
        Broken UI.
      </Heading>
      <div className={`film-split ${vertical ? "stack" : ""}`}>
        <SearchResult broken />
        <Fade at={0.35}>
          <Event />
        </Fade>
      </div>
      <Fade at={1.25} className="film-takeaway">
        If the request succeeded, why did Search break?
      </Fade>
    </>
  );
}
function Workspace({ vertical }: Layout) {
  const frame = useCurrentFrame();
  const camera = ease(frame, 0, 1);
  return (
    <>
      <Heading eyebrow="03 / OPEN THE QUESTION">
        Understand the app
        <br />
        you built.
      </Heading>
      <div
        className="film-workspace"
        style={{
          transform: `scale(${interpolate(camera, [0, 1], [1.075, 1])})`,
          transformOrigin: "50% 30%",
        }}
      >
        <div className="film-workspace-header">
          <Brand />
          <span>Search · prepared example</span>
        </div>
        <div className="film-tabs">
          <span>Overview</span>
          <span>Explore</span>
          <span>Experiments</span>
          <span className="selected">Changes</span>
        </div>
        <div className={`film-workspace-body ${vertical ? "stack" : ""}`}>
          <div className="film-carry">
            <strong>Search unavailable</strong>
            <span>Simulated request: 200 OK</span>
          </div>
          <div>
            <h2 data-check>What changed?</h2>
            <p data-check>
              The request still succeeds.
              <br />
              The contract changed.
            </p>
            <Fade at={1.8}>
              <button className="button primary">
                Inspect the response handler <ArrowRight size={24} />
              </button>
            </Fade>
          </div>
        </div>
      </div>
      <Fade at={2.1} className="film-takeaway">
        Keep the outcome in view. Follow its source.
      </Fade>
    </>
  );
}
function Follow({ vertical }: Layout) {
  return (
    <>
      <Heading
        eyebrow="04 / SOURCE EVIDENCE"
        note="A matching request and route. Not a live execution trace."
      >
        Follow the change.
      </Heading>
      <Path vertical={vertical} />
      <Sequence durationInFrames={3.5 * FILM_FPS} layout="none">
        <div className="film-source-pair">
          <Fade at={0.7}>
            <Snippet start={request} end={request} title="Found in code" />
          </Fade>
          <Fade at={1.1}>
            <Snippet
              backend
              start={route}
              end={route}
              title="Candidate route"
            />
          </Fade>
        </div>
        <div className="film-bottom-note">
          Connection inferred from source · execution unverified
        </div>
      </Sequence>
      <Sequence from={3.5 * FILM_FPS} layout="none">
        <Fade>
          <div className="film-source-diff">
            <div className="film-panel-title" data-check>
              api.py · example source comparison
            </div>
            <div className="film-diff-row">
              <span>−</span>
              <pre data-check>
                {apiSource.split("\n")[compatible - 1].trim()}
              </pre>
            </div>
            <div className="film-diff-row">
              <span>+</span>
              <pre data-check>
                {apiSource.split("\n")[incompatible - 1].trim()}
              </pre>
            </div>
          </div>
          <div className="film-bottom-note">
            Bundled compatible → incompatible branch · example edit
          </div>
        </Fade>
      </Sequence>
    </>
  );
}
function Reveal({ vertical }: Layout) {
  const frame = useCurrentFrame();
  const front = ease(frame, 3.5, 1);
  return (
    <>
      <Heading eyebrow="05 / THE RESPONSE CONTRACT">
        The server answered.
        <br />
        The interface expected
        <br className="vertical-only" /> something else.
      </Heading>
      <div className={`film-reveal ${vertical ? "stack" : ""}`}>
        <div
          className="film-contract"
          style={{ transform: `scale(${1 + 0.025 * (1 - front)})` }}
        >
          <div className="film-eyebrow">BACKEND RETURNS</div>
          <div className="film-key" data-check>
            items
          </div>
          <Snippet
            backend
            start={incompatible}
            end={incompatible}
            highlight={incompatible}
            title="Incompatible branch"
          />
        </div>
        <div
          className="film-contract"
          style={{ transform: `scale(${1 + 0.025 * front})` }}
        >
          <div className="film-eyebrow">FRONTEND REQUIRES</div>
          <div className="film-key" data-check>
            results
          </div>
          <Snippet
            start={guard}
            end={guard}
            highlight={guard}
            title="Array guard"
          />
        </div>
      </div>
      <Fade at={3.7} className="film-takeaway">
        <code>data.results</code> is missing. The guard rejects the response.
      </Fade>
      <Fade at={5.5} className="film-footer-source">
        <Snippet start={guard + 3} end={guard + 3} title="Visible outcome" />
      </Fade>
    </>
  );
}
function Compare({ vertical }: Layout) {
  return (
    <>
      <Heading
        eyebrow="06 / COMPARE THE BUNDLED VERSIONS"
        note="A compatible example, not an automatic repair."
      >
        See what the change
        <br />
        actually does.
      </Heading>
      <div className={`film-comparison ${vertical ? "stack" : ""}`}>
        <div>
          <SearchResult broken compact />
          <div className="film-comparison-response">
            <Pill>200 OK</Pill>
            <Response broken />
          </div>
        </div>
        <Fade at={1}>
          <SearchResult compact />
          <div className="film-comparison-response">
            <Pill>200 OK</Pill>
            <Response />
          </div>
        </Fade>
      </div>
      <Fade at={2.4} className="film-takeaway">
        Same request status. Different response contract.
      </Fade>
    </>
  );
}
function Evidence({ vertical }: Layout) {
  return (
    <>
      <Heading eyebrow="07 / KEEP THE EVIDENCE">
        Follow a click.
        <br />
        Test a hunch.
        <br />
        Understand why.
      </Heading>
      <div className={`film-evidence ${vertical ? "stack" : ""}`}>
        <div>
          <Brand />
          <Path vertical animated={false} />
        </div>
        <section>
          <div className="film-eyebrow">
            PREPARED WALKTHROUGH · SAMPLE, NOT SAVED WORK
          </div>
          <h2 data-check>
            A response can succeed
            <br />
            while the feature fails.
          </h2>
          <dl>
            <div>
              <dt>Simulation</dt>
              <dd>200 OK · Search unavailable</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>
                api.py:{incompatible} → Search.tsx:{guard}
              </dd>
            </div>
            <div>
              <dt>Interpretation</dt>
              <dd>
                <code>items</code> does not satisfy <code>data.results</code>.
              </dd>
            </div>
            <div>
              <dt>Next question</dt>
              <dd>Which contract should both sides share?</dd>
            </div>
          </dl>
          <button className="button secondary">
            Export sample walkthrough <ArrowDown size={22} />
          </button>
        </section>
      </div>
    </>
  );
}
function Closing() {
  return (
    <div className="film-closing">
      <Brand large />
      <h1 data-check>
        Understand
        <br />
        your next change.
      </h1>
      <div className="film-cta">
        <span className="button primary">
          Get the local demo <ArrowRight size={32} />
        </span>
        <p data-check>github.com/phnxsahil/Unravel</p>
      </div>
      <p className="film-cta-note" data-check>
        Source and setup guide · run on your computer
      </p>
    </div>
  );
}

const scenes = [Working, Broken, Workspace, Follow, Reveal, Compare, Evidence];
function FrameAudit({ frame }: { frame: number }) {
  useEffect(() => {
    const handle = delayRender("Checking film geometry");
    document.fonts.ready.then(() =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const root = document.querySelector(".unravel-film")!;
          const bounds = root.getBoundingClientRect();
          const footer = root
            .querySelector(".film-baseline")!
            .getBoundingClientRect();
          const visible = (element: Element) => {
            let current: Element | null = element;
            while (current && current !== root) {
              const style = getComputedStyle(current);
              if (style.display === "none" || Number(style.opacity) < 0.1)
                return false;
              current = current.parentElement;
            }
            return element.getBoundingClientRect().height > 0;
          };
          const clipped = [
            ...root.querySelectorAll(
              ".film-content [data-check], .film-content pre, .film-takeaway, .film-bottom-note, .film-content .button",
            ),
          ]
            .filter(visible)
            .filter((element) => {
              const r = element.getBoundingClientRect();
              return (
                r.left < bounds.left ||
                r.right > bounds.right ||
                r.bottom > footer.top - 8 ||
                r.top < bounds.top
              );
            })
            .map((element) => element.textContent);
          console.log(
            "FILM_QA " +
              JSON.stringify({
                frame,
                scene: root
                  .querySelector("[data-scene]")
                  ?.getAttribute("data-scene"),
                clipped,
                fonts:
                  document.fonts.check('500 72px "Geist Variable"') &&
                  document.fonts.check('400 32px "IBM Plex Mono"'),
              }),
          );
          continueRender(handle);
        }),
      ),
    );
  }, [frame]);
  return null;
}
export function UnravelFilm({
  vertical = false,
  audit = false,
}: {
  vertical?: boolean;
  audit?: boolean;
}) {
  const frame = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender("Loading Unravel typefaces"));
  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    Promise.all([
      document.fonts.load('500 72px "Geist Variable"'),
      document.fonts.load('400 32px "IBM Plex Mono"'),
    ]).then(() => continueRender(fontHandle));
  }, [fontHandle]);
  const index = FILM_TIMELINE.findIndex(
    (scene) => frame >= scene.start * FILM_FPS && frame < scene.end * FILM_FPS,
  );
  return (
    <AbsoluteFill
      className={`unravel-film ${vertical ? "vertical" : "landscape"}`}
    >
      <div className="film-topline">
        <Brand />
        <span data-check>SEARCH / PREPARED SIMULATION</span>
      </div>
      <div className="film-content">
        {FILM_TIMELINE.map((scene, i) => {
          const Scene = scenes[i];
          return (
            <Sequence
              key={scene.start}
              from={scene.start * FILM_FPS}
              durationInFrames={(scene.end - scene.start) * FILM_FPS}
              layout="none"
            >
              <div className="film-scene" data-scene={scene.id}>
                <Fade duration={i === 0 ? 0.2 : 0.35}>
                  {i === 6 ? (
                    <>
                      <Sequence durationInFrames={4.5 * FILM_FPS} layout="none">
                        <Evidence vertical={vertical} />
                      </Sequence>
                      <Sequence from={4.5 * FILM_FPS} layout="none">
                        <Fade>
                          <Closing />
                        </Fade>
                      </Sequence>
                    </>
                  ) : (
                    <Scene vertical={vertical} />
                  )}
                </Fade>
              </div>
            </Sequence>
          );
        })}
      </div>
      <div className="film-baseline">
        <span>Illustrative framing of the bundled Search case</span>
        <span>{String(index + 1).padStart(2, "0")} / 07</span>
      </div>
      <div
        className="film-progress"
        style={{
          transform: `scaleX(${frame / (FILM_SECONDS * FILM_FPS - 1)})`,
        }}
      />
      {audit && <FrameAudit frame={frame} />}
    </AbsoluteFill>
  );
}
export const UnravelVerticalFilm = ({ audit = false }: { audit?: boolean }) => (
  <UnravelFilm vertical audit={audit} />
);
registerRoot(() => (
  <>
    <Composition
      id="UnravelFilm"
      component={UnravelFilm}
      width={1920}
      height={1080}
      fps={FILM_FPS}
      durationInFrames={FILM_SECONDS * FILM_FPS}
    />
    <Composition
      id="UnravelVerticalFilm"
      component={UnravelVerticalFilm}
      width={1080}
      height={1920}
      fps={FILM_FPS}
      durationInFrames={FILM_SECONDS * FILM_FPS}
    />
  </>
));
