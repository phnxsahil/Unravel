import { useEffect, useRef, useState } from "react";
import {
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowRight, Check, FileCode2, Volume2, VolumeX } from "lucide-react";
import { GuideLink } from "./SiteChrome";
import { Link } from "react-router";
import searchSource from "../../../examples/search-flow/Search.tsx?raw";
import searchApi from "../../../examples/search-flow/api.py?raw";
import SourceExcerpt from "./SourceExcerpt";

const chapters = [
  {
    label: "Recognize the action",
    title: "One Search button. One starting point.",
    text: "Start with the Search button. Its handler gives you a concrete place to begin exploring this example.",
    guide: "exploring",
    link: "How action discovery works",
    id: "choose",
  },
  {
    label: "Follow its connections",
    title: "A request and its supporting source.",
    text: "The search handler requests /api/search. Inspect the matching backend route and distinguish source evidence from an observed run.",
    guide: "exploring",
    link: "How source exploration works",
    id: "trace",
  },
  {
    label: "Try a scenario",
    title: "Try the other path.",
    text: "A failed search request reaches the catch branch. This prepared scenario shows the expected behavior; your local experiment can check it.",
    guide: "experiments",
    link: "How experiments work",
    id: "explain",
  },
  {
    label: "Understand the result",
    title: "Leave with something you know.",
    text: "The status message is the visible result to check. Keep the source explanation separate from what an approved browser run actually observes.",
    guide: "experiments",
    link: "How results work",
    id: "save",
  },
];

export const sourceExcerpts = [
  {
    path: "examples/search-flow/Search.tsx",
    start: 19,
    end: 24,
    highlight: 23,
  },
  { path: "examples/search-flow/api.py", start: 1, end: 9, highlight: 3 },
  { path: "examples/search-flow/Search.tsx", start: 9, end: 15, highlight: 15 },
  {
    path: "examples/search-flow/Search.tsx",
    start: 23,
    end: 25,
    highlight: 24,
  },
];
const storyFiles = [
  {
    path: "examples/search-flow/Search.tsx",
    body: searchSource,
    language: "tsx",
    lines: searchSource
      .split("\n")
      .filter((line, index, lines) => index < lines.length - 1 || line !== "")
      .length,
  },
  { path: "examples/search-flow/api.py", body: searchApi, language: "python" },
];

function Scene({
  active,
  advance,
  compact = false,
  expanded = false,
}: {
  active: number;
  advance?: () => void;
  compact?: boolean;
  expanded?: boolean;
}) {
  const [failedSearch, setFailedSearch] = useState(false);
  const fullExcerpt = sourceExcerpts[active];
  const excerpt = compact
    ? {
        ...fullExcerpt,
        start:
          active === 2
            ? 9
            : Math.max(fullExcerpt.start, fullExcerpt.highlight - 1),
        end:
          active === 2
            ? 15
            : Math.min(fullExcerpt.end, fullExcerpt.highlight + 1),
      }
    : fullExcerpt;
  const file = storyFiles.find((file) => file.path === excerpt.path)!;
  const narration = [
    {
      title: "What happens when you click Search?",
      text: "The button calls search(). Its status is displayed just below it. Select the request to continue along this same action.",
    },
    {
      title: "Follow the request to the server.",
      text: "The handler calls /api/search with an escaped query. This backend defines the matching route. That match is source evidence; a live run would establish execution.",
    },
    {
      title: "What if the search request fails?",
      text: "A non-success response throws. The catch branch sets “Search unavailable.” Check that status in an approved local run.",
    },
    {
      title: "Know what to look for in a run.",
      text: "React renders status below the Search button. Compare the prepared expectation with recorded events in your own app.",
    },
  ][active];
  return (
    <div className="story-evidence">
      <div className="story-source">
        <div className="story-file">
          <FileCode2 size={16} />
          <span>{file.path}</span>
          <span>
            Lines {excerpt.start}–{excerpt.end}
          </span>
        </div>
        <SourceExcerpt body={file.body} language={file.language} {...excerpt} />
      </div>
      <div className="story-narration">
        <h3>{narration.title}</h3>
        <p>{narration.text}</p>
        {active === 0 &&
          (advance ? (
            <button className="story-feature-row" onClick={advance}>
              <span>Follow the search request</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <Link className="story-feature-row" to="/projects/demo">
              Open the prepared exploration <ArrowRight size={18} />
            </Link>
          ))}
        {active === 3 && (
          <p className="story-discovery">
            <Check size={17} /> Prepared expectation: “Search unavailable.”
          </p>
        )}
        {active === 2 && (
          <div className="story-experiment">
            <button
              type="button"
              aria-pressed={failedSearch}
              onClick={() => setFailedSearch((value) => !value)}
            >
              {failedSearch
                ? "Reset prepared scenario"
                : "Simulate a failed search"}
            </button>
            <p role="status">
              {failedSearch ? "Search unavailable" : "Results loaded"}
            </p>
            {expanded && (
              <p>Prepared simulation. No network request is sent.</p>
            )}
          </div>
        )}
        {active === 3 && expanded && (
          <div className="story-experiment">
            <span className="micro-label">PREPARED FAILURE EXPECTATION</span>
            <ol>
              <li>Search is selected.</li>
              <li>A non-success response is rejected.</li>
              <li>“Search unavailable” appears in the status.</li>
            </ol>
          </div>
        )}
        <span className="story-source-reference">
          {file.path}:{excerpt.highlight}
        </span>
      </div>
    </div>
  );
}

// The same fixture excerpts remain available when scripting is disabled.
function StaticStory() {
  return (
    <div className="static-story">
      {chapters.map((chapter, active) => (
        <section key={chapter.id}>
          <h3>{chapter.label}</h3>
          <Scene active={active} />
          <GuideLink to={chapter.guide}>{chapter.link}</GuideLink>
        </section>
      ))}
    </div>
  );
}

export default function ScrollStory() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [phone, setPhone] = useState(false);
  const [shortScreen, setShortScreen] = useState(true);
  const [compactScreen, setCompactScreen] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const width = matchMedia("(max-width: 760px)");
    const update = () => {
      setShortScreen(innerHeight < 700 || innerWidth < 360);
      setCompactScreen(width.matches || innerHeight < 850);
      setPhone(width.matches);
    };
    update();
    window.addEventListener("resize", update);
    width.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      width.removeEventListener("change", update);
    };
  }, []);
  const staticLayout = reduced || shortScreen;
  useEffect(() => {
    if (staticLayout || !section.current) return;
    const pin = section.current.querySelector<HTMLElement>(".story-pin");
    if (!pin) return;
    const checkFit = () => {
      const caption = pin.querySelector<HTMLElement>(".story-caption");
      const scene = pin.querySelector<HTMLElement>(".story-scene");
      const frame = scene?.getBoundingClientRect();
      const content = scene
        ?.querySelector<HTMLElement>(".story-evidence")
        ?.getBoundingClientRect();
      const outer = pin.getBoundingClientRect();
      const bottom = caption?.getBoundingClientRect().bottom ?? outer.bottom;
      if (
        bottom - outer.top > innerHeight - 65 - 16 ||
        (frame && content && content.bottom > frame.bottom - 8)
      )
        setShortScreen(true);
    };
    const observer = new ResizeObserver(checkFit);
    observer.observe(pin);
    const evidence = pin.querySelector<HTMLElement>(".story-evidence");
    if (evidence) observer.observe(evidence);
    const frame = requestAnimationFrame(checkFit);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [staticLayout, active, compactScreen]);
  const [sound, setSound] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const lastCue = useRef(0);
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start 65px", "end end"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0.03, 1]);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!staticLayout)
      setActive(Math.min(3, Math.max(0, Math.floor(value * 4))));
  });
  function cue(index: number) {
    const ctx = audio.current;
    if (
      !ctx ||
      ctx.state !== "running" ||
      document.hidden ||
      performance.now() - lastCue.current < 220
    )
      return;
    lastCue.current = performance.now();
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(260 + index * 70, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      520 + index * 70,
      ctx.currentTime + 0.12,
    );
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.24);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
  useEffect(() => {
    if (sound) cue(active);
  }, [active, sound]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  async function toggleSound() {
    if (sound) {
      setSound(false);
      await audio.current?.suspend();
      return;
    }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
      setSound(true);
      setSoundError(false);
    } catch {
      setSoundError(true);
    }
  }
  function select(index: number) {
    setActive(index);
    if (!section.current) return;
    if (staticLayout) {
      const toolbar =
        section.current.querySelector<HTMLElement>(".story-toolbar");
      if (toolbar)
        window.scrollTo({
          top: toolbar.getBoundingClientRect().top + scrollY - 81,
          behavior: "instant",
        });
      return;
    }
    const headerHeight = 65;
    const top =
      section.current.getBoundingClientRect().top + scrollY - headerHeight;
    const travel = section.current.offsetHeight - innerHeight + headerHeight;
    window.scrollTo({
      top: top + travel * ((index + 0.1) / 4),
      behavior: "instant",
    });
  }
  function keys(event: React.KeyboardEvent, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % 4
        : event.key === "ArrowLeft"
          ? (index + 3) % 4
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? 3
              : undefined;
    if (next !== undefined) {
      event.preventDefault();
      select(next);
      document.getElementById("story-tab-" + next)?.focus();
    }
  }
  const current = chapters[active];
  return (
    <>
      <section
        id="features"
        className={
          "scroll-story " +
          (staticLayout
            ? "is-reduced"
            : compactScreen
              ? "is-compact-story"
              : "")
        }
        ref={section}
        aria-label="Scroll through the Unravel product story"
      >
        <div className="story-pin">
          <div className="story-heading">
            <span className="section-eyebrow">
              FROM “IT WORKS” TO “I GET IT”
            </span>
            <h2>Follow the thread.</h2>
            <p>
              {staticLayout
                ? "Four steps, one familiar action. Choose a step."
                : "Four steps, one familiar action. Scroll or choose a step."}
            </p>
          </div>
          <div className="story-toolbar">
            <div
              className="feature-tabs"
              role="tablist"
              aria-label="Unravel walkthrough"
            >
              {chapters.map((item, index) => (
                <button
                  key={item.id}
                  role="tab"
                  id={"story-tab-" + index}
                  aria-selected={active === index}
                  aria-controls="story-panel"
                  tabIndex={active === index ? 0 : -1}
                  onClick={() => select(index)}
                  onKeyDown={(event) => keys(event, index)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div
            className="product-demo story-stage"
            id="story-panel"
            role="tabpanel"
            aria-labelledby={"story-tab-" + active}
          >
            <div className="story-stage-label">
              <span>PREPARED EXAMPLE</span>
              <button
                className="story-sound"
                onClick={toggleSound}
                aria-pressed={sound}
                title="Toggle optional sound effects for walkthrough steps"
                aria-label={
                  sound ? "Mute sound effects" : "Enable sound effects"
                }
              >
                {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>Sound {sound ? "on" : "off"}</span>
              </button>
            </div>
            <m.div
              className="story-scene"
              key={active}
              initial={reduced ? false : { x: 16 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Scene
                active={active}
                advance={() => select(1)}
                compact={!staticLayout && compactScreen}
              />
            </m.div>
            <div className="story-stage-bottom">
              <span>0{active + 1} / 04</span>
              <span>{current.title}</span>
              <ArrowRight size={18} />
            </div>
            <m.div
              className="story-scroll-line"
              style={{ scaleX: staticLayout ? (active + 1) / 4 : lineScale }}
            />
          </div>
          <div className="story-caption">
            <p>{current.text}</p>
            <GuideLink to={current.guide}>{current.link}</GuideLink>
          </div>
          {soundError && (
            <p role="status" className="sound-error">
              Sound is unavailable in this browser. The walkthrough still works.
            </p>
          )}
        </div>
      </section>
      <div className="no-script-story">
        <StaticStory />
      </div>
      <div className="story-extras feature-panel">
        <div className="story-extras-heading">
          <h2>Take a closer look.</h2>
          <p>Open an example. Then try it with your own project.</p>
        </div>
        <div className="example-grid">
          {chapters.map((item, index) => (
            <details className="example-expand" key={item.id}>
              <summary>
                <span>
                  {
                    [
                      "Explore a feature",
                      "Explore the code",
                      "Explore a scenario",
                      "Explore a result",
                    ][index]
                  }
                  <span className="example-summary-description">
                    {
                      [
                        "Find one familiar action to start with.",
                        "Inspect the matching search route.",
                        "Compare the failed request with the success path.",
                        "Read observations before drawing conclusions.",
                      ][index]
                    }
                  </span>
                </span>
                <ArrowRight size={17} />
              </summary>
              <Scene active={index} expanded />
              <GuideLink to={item.guide}>{item.link}</GuideLink>
            </details>
          ))}
        </div>
        <GuideLink to="product-tour">Read the complete walkthrough</GuideLink>
      </div>
    </>
  );
}
