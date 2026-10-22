import React, { useEffect, useState } from "react";
import "./components/dispatch/animations.css";
import { Navbar } from "./components/dispatch/Navbar";
import { Hero } from "./components/dispatch/Hero";
import { ProblemSection } from "./components/dispatch/ProblemSection";
import { HowItWorksSection } from "./components/dispatch/HowItWorks";
import { FeatureSection } from "./components/dispatch/FeatureSection";
import { DemoSection } from "./components/dispatch/DemoSection";
import { IntegrationsSection } from "./components/dispatch/IntegrationsSection";
import { SocialProofSection } from "./components/dispatch/SocialProofSection";
import { PricingSection } from "./components/dispatch/PricingSection";
import { CTASection } from "./components/dispatch/CTASection";
import { Footer } from "./components/dispatch/Footer";
import { DocsSection } from "./components/dispatch/DocsSection";
import { DashboardSection } from "./components/dispatch/DashboardSection";

export default function App() {
  const [view, setView] = useState<"landing" | "docs" | "dashboard">(
    window.location.hash.startsWith("#docs") ? "docs" :
    window.location.hash.startsWith("#dashboard") ? "dashboard" :
    "landing"
  );

  useEffect(() => {
    const handleHashChange = () => {
      const isDocs = window.location.hash.startsWith("#docs");
      const isDash = window.location.hash.startsWith("#dashboard");
      setView(isDocs ? "docs" : isDash ? "dashboard" : "landing");
      
      if (!isDocs && !isDash && window.location.hash) {
        // Wait a brief tick for render, then scroll to element
        setTimeout(() => {
          const id = window.location.hash.substring(1);
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 50);
      } else if (isDocs || isDash) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // ── Scroll-triggered reveals ──────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Unobserve after first reveal so it doesn't flicker on scroll-back
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe all section-reveal and bento-card targets
    document
      .querySelectorAll(".dispatch-reveal, .dispatch-bento-card")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [view]);

  return (
    <div
      style={{
        backgroundColor: "var(--bg)",
        minHeight: "100vh",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        transition: "background-color 0.3s ease",
      }}
    >
      <style>{`
        /* ── Global editorial overrides ────────────────────────────────── */

        /* Warm body font */
        body {
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Display headings use Space Grotesk */
        h1, h2, h3 {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          letter-spacing: -0.04em;
        }

        /* Sharper inputs/buttons — editorial, not SaaS-rounded */
        input, textarea, button, select {
          border-radius: 2px !important;
        }

        /* Monospace labels keep their stack */
        .dispatch-mono {
          font-family: 'IBM Plex Mono', monospace;
        }

        @media (max-width: 767px) {
          .dispatch-main { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Navbar />

      {view === "docs" ? (
        <DocsSection />
      ) : view === "dashboard" ? (
        <DashboardSection />
      ) : (
        <>
          {/* ── Hero ───────────────────────────────────────────────────────────── */}
          <Hero />

          {/* ── Problem ────────────────────────────────────────────────────────── */}
          <ProblemSection />

          {/* ── How it works ───────────────────────────────────────────────────── */}
          <HowItWorksSection />

          {/* ── Features ───────────────────────────────────────────────────────── */}
          <FeatureSection />

          {/* ── Demo ───────────────────────────────────────────────────────────── */}
          <DemoSection />

          {/* ── Integrations ───────────────────────────────────────────────────── */}
          <IntegrationsSection />

          {/* ── Social proof ───────────────────────────────────────────────────── */}
          <SocialProofSection />

          {/* ── Pricing ────────────────────────────────────────────────────────── */}
          <PricingSection />

          {/* ── Final CTA ──────────────────────────────────────────────────────── */}
          <CTASection />
        </>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
