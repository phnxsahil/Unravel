import React, { useState } from "react";
import { ArrowRight, ChevronDown, GitBranch, Play } from "lucide-react";
import { Link } from "react-router";
import { LazyMotion, domAnimation } from "motion/react";
import { SiteFooter, SiteHeader, GuideLink } from "./SiteChrome";
import SearchJourney from "./SearchJourney";
import ScrollStory from "./ScrollStory";
import "./marketing.css";
import "./public-design.css";
import "./unravel.css";
import "./grid-design.css";
import "./refinement.css";

function FaqItem({
  id,
  question,
  children,
  defaultOpen = false,
}: {
  id: string;
  question: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      className="faq-item"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="faq-trigger" aria-expanded={open} aria-controls={id}>
        <span>{question}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div id={id} className="faq-panel">
        <p>{children}</p>
      </div>
    </details>
  );
}

export default function Landing() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="marketing unravel-marketing grid-marketing">
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          <section className="product-hero">
            <div className="hero-inner">
              <div className="hero-message">
                <span className="hero-eyebrow">
                  Built with AI. Understood by you.
                </span>
                <h1>
                  Understand the app <br />
                  you built.
                </h1>
                <p className="hero-description">
                  Follow a feature from button to API. Test a failure.
                  Understand what happened.
                </p>
                <div className="product-hero-actions">
                  <Link className="button primary" to="/projects/demo">
                    Explore the demo <ArrowRight size={17} />
                  </Link>
                  <Link className="button secondary" to="/projects">
                    Connect a project <ArrowRight size={16} />
                  </Link>
                </div>
                <p className="hero-note">
                  Runs on your computer. Opens in your browser.
                </p>
              </div>
              <div className="hero-product">
                <div className="workspace-heading">
                  <span>200 OK. Broken UI.</span>
                  <span>Interactive example</span>
                </div>
                <SearchJourney compact id="hero-search" />
                <Link className="preview-open" to="/projects/demo">
                  Open the full exploration <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div
              className="support-rail public-container"
              aria-label="Supported project types"
            >
              <div className="support-stack support-technologies">
                <span className="support-label">Works with</span>
                <span>React, TypeScript, Python, FastAPI</span>
              </div>
              <div className="support-stack support-claims">
                <span>Start with your own source</span>
                <span>Local by default</span>
              </div>
            </div>
          </section>
          <section id="how-it-works" className="unravel-intro public-container">
            <div>
              <span className="section-eyebrow">01 / EXPLORE</span>
              <h2>
                Start with what{" "}
                <br />
                you recognize.
              </h2>
            </div>
            <div className="section-description">
              <p>
                A photo upload. A search field. A button you built yesterday.
                Follow one action into its source, then explore what happens
                when the request takes a different path.
              </p>
              <GuideLink to="exploring">Follow a feature</GuideLink>
            </div>
          </section>
          <section className="launch-film public-container" aria-label="Unravel launch film">
            <LaunchFilm />
          </section>
          <ScrollStory />
          <section className="return-section public-container">
            <div>
              <span className="section-eyebrow">02 / REVISIT</span>
              <h2>
                Your code moves.{" "}
                <br />
                Your context stays.
              </h2>
              <p>
                Keep building in your editor. Return to compare the source,
                revisit an explanation and rerun a configured experiment.
              </p>
              <GuideLink to="snapshots">Understand changes</GuideLink>
            </div>
            <div className="change-specimen">
              <div>
                <GitBranch size={16} />
                <span>Illustrative change review</span>
              </div>
              <h3>Search response changed</h3>
              <p>The response is still 200 OK. The UI expects a different field.</p>
              <ol>
                <li>
                  <span>01</span>Compare the captured source
                </li>
                <li>
                  <span>02</span>Revisit the affected exploration
                </li>
                <li>
                  <span>03</span>Rerun the approved scenario
                </li>
              </ol>
              <p className="micro-label">
                See what changed since your last exploration.
              </p>
            </div>
          </section>
          <section id="setup" className="setup-section public-container">
            <div>
              <span className="section-eyebrow">03 / GET STARTED</span>
              <h2>
                Your project.{" "}
                <br />
                On your computer.
              </h2>
              <p>
                Install and connect folders on your development computer. Explore the demo from any screen. 
                Python 3.12+ is required. The package includes the interface and
                local storage. Source exploration works before you connect AI or
                install browser experiments.
              </p>
              <Link className="button secondary" to="/docs/quick-start">
                Read the setup guide <ArrowRight size={16} />
              </Link>
            </div>
            <ol className="unravel-setup">
              <li>
                <span>01</span>
                <div>
                  <h3>Install and open</h3>
                  <p>
                    Get the Python installation package from the project owner.
                    There is no public download yet; the setup guide explains
                    installation.
                  </p>
                  <span className="setup-command-label">
                    After installation, run
                  </span>
                  <code>unravel</code>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Connect a project</h3>
                  <p>
                    Enter your folder's absolute path. Unravel captures
                    supported source without changing it.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Explore. Then experiment.</h3>
                  <p>
                    Follow the code first. Browser experiments require your
                    running development app and approved steps.
                  </p>
                </div>
              </li>
            </ol>
          </section>
          <section className="faq-section unravel-faq public-container">
            <h2>A few things to know.</h2>
            <div>
              <FaqItem
                id="faq-ai-key"
                question="Do I need an AI key?"
                defaultOpen
              >
                No key is needed for source maps, comparisons, notes or
                configured experiments. Live explanations use your Anthropic key
                and consent to send selected source.
              </FaqItem>
              <FaqItem id="faq-projects" question="What projects work?">
                Initial discovery supports React/JavaScript/TypeScript and
                Python/FastAPI patterns. Dynamic code or unfamiliar frameworks
                may produce a partial map. Unravel shows what it found and what
                it could not establish.
              </FaqItem>
              <FaqItem id="faq-code" question="Does it change my code?">
                Source exploration is read-only. Browser experiments interact
                with your development app and can change its data. Approve each
                recipe and use disposable data. Make code changes in your
                existing editor.
              </FaqItem>
              <FaqItem id="faq-demo" question="Are these demos live AI runs?">
                The public search example is a labeled simulation backed by
                reference source. Your local experiments record actual browser
                observations. They are shown separately from AI interpretations.
              </FaqItem>
            </div>
          </section>
          <section className="unravel-closing public-container">
            <h2>
              Build it.{" "}
              <br />
              Then unravel it.
            </h2>
            <Link className="button primary" to="/projects/demo">
              Explore the demo <ArrowRight size={17} />
            </Link>
          </section>
        </main>
        <SiteFooter />
      </div>
    </LazyMotion>
  );
}

function LaunchFilm() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="launch-film-frame">
      {playing ? (
        <video
          autoPlay
          controls
          muted
          playsInline
          preload="none"
          poster="/media/unravel-film-poster.jpg"
        >
          <source src="/media/unravel-film.mp4" type="video/mp4" />
          <track
            default
            kind="captions"
            label="English captions"
            src="/media/unravel-film.vtt"
            srcLang="en"
          />
          Your browser does not support the video element.
        </video>
      ) : (
        <button
          className="launch-film-play"
          onClick={() => setPlaying(true)}
          type="button"
          aria-label="Play the 48-second Unravel launch film"
        >
          <img
            src="/media/unravel-film-poster.jpg"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="launch-film-play-icon" aria-hidden="true">
            <Play size={24} fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
