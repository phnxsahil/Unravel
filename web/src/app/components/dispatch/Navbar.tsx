import React, { useState, useEffect } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { Logo } from "./Logo";

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "demo",      href: "#demo" },
  { label: "features",  href: "#features" },
  { label: "docs",      href: "#docs" },
  { label: "pricing",   href: "#pricing" },
  { label: "github",    href: "https://github.com/sahil/byline" },
];

// Fix #4: no pulsing dot — plain bordered button
function DashboardPill({ dark }: { dark: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="#dashboard"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 11px", borderRadius: 4,
        backgroundColor: "transparent",
        border: dark
          ? `0.5px solid ${hov ? "rgba(250,250,248,0.25)" : "rgba(250,250,248,0.1)"}`
          : `0.5px solid ${hov ? "rgba(15,15,13,0.25)" : "var(--border)"}`,
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: dark ? "rgba(250,250,248,0.7)" : "var(--text-secondary)",
        textDecoration: "none", letterSpacing: "0.04em",
        transition: "all 0.12s ease", whiteSpace: "nowrap",
      }}
    >
      dashboard
    </a>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function NavLink({ label, href, dark }: { label: string; href: string; dark: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 400,
        color: dark
          ? hov ? "#FAFAF8" : "rgba(250,250,248,0.55)"
          : hov ? "#0F0F0D" : "#6B6960",
        textDecoration: "none",
        letterSpacing: "0.04em",
        transition: "color 0.12s ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </a>
  );
}

function StarPill({ dark }: { dark: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="https://github.com/sahil/byline"
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: hov
            ? dark ? "#FAFAF8" : "#0F0F0D"
            : dark ? "rgba(250,250,248,0.55)" : "#6B6960",
          letterSpacing: "0.02em",
          transition: "color 0.12s ease",
        }}
      >
        ★ 847
      </span>
    </a>
  );
}


function CTABtn() {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="#docs"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 14px",
        backgroundColor: hov ? "#C7501E" : "#E85E2C",
        borderRadius: 4,
        textDecoration: "none",
        transition: "background-color 0.12s ease",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          color: "#FAFAF8",
          letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}
      >
        read docs
      </span>
    </a>
  );
}

function HamburgerIcon({ open, dark }: { open: boolean; dark: boolean }) {
  const color = dark ? "rgba(250,250,248,0.7)" : "#0F0F0D";
  return (
    <div style={{ width: 16, height: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: open && i === 1 ? 0 : "100%",
            height: 1,
            backgroundColor: color,
            transition: "all 0.18s ease",
            transformOrigin: "center",
            transform:
              open && i === 0 ? "translateY(4.5px) rotate(45deg)"
              : open && i === 2 ? "translateY(-4.5px) rotate(-45deg)"
              : "none",
            opacity: open && i === 1 ? 0 : 1,
          }}
        />
      ))}
    </div>
  );
}

// ─── Mobile menu ─────────────────────────────────────────────────────────────

function MobileMenu({ open, dark, onClose }: { open: boolean; dark: boolean; onClose: () => void }) {
  const bg = dark ? "rgba(26, 26, 24, 0.94)" : "rgba(250, 250, 248, 0.94)";
  const border = dark ? "0.5px solid rgba(255,255,255,0.08)" : "0.5px solid var(--border)";
  return (
    <div
      style={{
        position: "fixed",
        top: 64,
        left: "5%",
        right: "5%",
        backgroundColor: bg,
        border,
        borderRadius: 8,
        padding: "8px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transform: open ? "translateY(0)" : "translateY(-6px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "transform 0.16s ease, opacity 0.16s ease, background-color 0.3s ease, border-color 0.3s ease",
        zIndex: 49,
        boxShadow: "0 12px 30px rgba(0,0,0,0.07)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      } as React.CSSProperties}
    >
      {NAV_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          onClick={onClose}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            fontWeight: 400,
            color: dark ? "rgba(245, 244, 240, 0.82)" : "var(--text-primary)",
            textDecoration: "none",
            padding: "13px 0",
            borderBottom: dark ? "0.5px solid rgba(255,255,255,0.06)" : "0.5px solid var(--border)",
            letterSpacing: "0.02em",
            transition: "color 0.12s ease",
          }}
        >
          {link.label}
        </a>
      ))}
      <div style={{ paddingTop: 16 }}>
        <StarPill dark={dark} />
      </div>
    </div>
  );
}

// ─── Theme Toggle Component ──────────────────────────────────────────────────

function ThemeToggle({
  theme,
  onChange,
  isDarkSection,
}: {
  theme: "light" | "dark";
  onChange: (t: "light" | "dark") => void;
  isDarkSection: boolean;
}) {
  const [hov, setHov] = useState(false);
  const isDarkTheme = theme === "dark";

  return (
    <button
      onClick={() => onChange(isDarkTheme ? "light" : "dark")}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 4,
        border: "0.5px solid var(--nav-border)",
        background: hov
          ? isDarkTheme ? "rgba(255,255,255,0.06)" : "rgba(15,15,13,0.04)"
          : "transparent",
        cursor: "pointer",
        transition: "all 0.12s ease",
        color: isDarkSection
          ? "rgba(250,250,248,0.75)"
          : "var(--text-primary)",
        flexShrink: 0,
      }}
      title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {isDarkTheme ? (
        <IconSun size={14} stroke={1.75} />
      ) : (
        <IconMoon size={14} stroke={1.75} />
      )}
    </button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [isDark,   setIsDark]     = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  // State for theme: read from localStorage, or match system preferences
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("byline-theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  // Apply data-theme attribute and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("byline-theme", theme);
  }, [theme]);

  // Track scroll depth
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track dark sections
  useEffect(() => {
    const darkSections = document.querySelectorAll("[data-section-dark]");
    if (!darkSections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setIsDark(true); });
        const anyDark = Array.from(darkSections).some((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top <= 60 && rect.bottom > 0;
        });
        setIsDark(anyDark);
      },
      { threshold: 0, rootMargin: "-52px 0px -80% 0px" }
    );
    darkSections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Close on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isNavbarDark = isDark || theme === "dark";
  const bgColor     = isNavbarDark ? "rgba(15,15,13,0.82)"    : "var(--bg-nav)";
  const borderColor = isNavbarDark ? "rgba(255,255,255,0.08)" : "var(--border)";

  return (
    <>
      <style>{`
        /* ── Navbar ─────────────────────────────────── */
        .dispatch-nav {
          position: fixed;
          z-index: 50;
          height: 44px;
          display: flex;
          align-items: stretch;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 960px;
          border-radius: 8px;
          border: 0.5px solid var(--nav-border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition:
            width 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            max-width 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.3s ease,
            box-shadow 0.4s ease,
            border-color 0.3s ease,
            background-color 0.3s ease;
        }

        .dispatch-nav.narrow {
          max-width: 420px;
          height: 38px;
          border-radius: 50px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
        }

        /* ── Inner flex row ─────────────────────────── */
        .dispatch-nav-inner {
          width: 100%;
          display: flex;
          align-items: stretch;
        }

        /* ── Grid cells ─────────────────────────────── */
        .dispatch-nav-cell {
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 14px;
          border-right: 0.5px solid var(--nav-border);
          transition: border-color 0.3s ease;
        }
        .dispatch-nav-cell:last-child { border-right: none; }

        .dispatch-nav-brand { flex-shrink: 0; }
        .dispatch-nav-links { flex: 1; justify-content: center; gap: 20px; }
        .dispatch-nav-star  { flex-shrink: 0; }
        .dispatch-nav-cta   { flex-shrink: 0; }

        .dispatch-hamburger-cell { display: none; flex-shrink: 0; }

        /* ── Responsive ─────────────────────────────── */
        @media (max-width: 767px) {
          .dispatch-nav           { width: 92%; max-width: 480px; }
          .dispatch-nav.narrow    { max-width: 260px; }
          .dispatch-nav-links     { display: none !important; }
          .dispatch-nav-star      { display: none !important; }
          .dispatch-hamburger-cell {
            display: flex !important;
            padding: 0 12px;
          }
          .dispatch-nav-brand { flex: 1; padding-left: 14px; padding-right: 14px; }
          .dispatch-nav-cta   { border-right: 0.5px solid var(--nav-border); padding: 0 10px; }
        }
      `}</style>

      <header
        className={`dispatch-nav ${scrolled ? "narrow" : ""}`}
        style={{
          backgroundColor: bgColor,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          "--nav-border": borderColor,
        } as React.CSSProperties}
      >
        <div className="dispatch-nav-inner">

          {/* Cell 1 — Brand */}
          <div className="dispatch-nav-cell dispatch-nav-brand" style={{ display: "flex", alignItems: "center", borderRight: scrolled ? "none" : "0.5px solid var(--nav-border)" }}>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
              <Logo size={14} dark={isNavbarDark} />
            </a>
          </div>

          {/* Cell 2 — Links */}
          {!scrolled && (
            <nav className="dispatch-nav-cell dispatch-nav-links">
              {NAV_LINKS.map((l) => <NavLink key={l.label} {...l} dark={isNavbarDark} />)}
            </nav>
          )}

          {/* Cell 3 — Star */}
          {!scrolled && (
            <div className="dispatch-nav-cell dispatch-nav-star">
              <StarPill dark={isNavbarDark} />
            </div>
          )}

          {/* Cell 4 — CTA cluster: ThemeToggle · StarPill · DashboardPill · CTABtn */}
          {/* Fix #3: ThemeToggle is leftmost, never sandwiched between action buttons */}
          <div className="dispatch-nav-cell dispatch-nav-cta" style={{ display: "flex", alignItems: "center", gap: scrolled ? 4 : 8 }}>
            {!scrolled && <ThemeToggle theme={theme} onChange={setTheme} isDarkSection={isNavbarDark} />}
            {!scrolled && <DashboardPill dark={isNavbarDark} />}
            <CTABtn />
          </div>

          {/* Cell 5 — Mobile burger */}
          <div className="dispatch-nav-cell dispatch-hamburger-cell">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{ background: "none", border: "none", padding: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <HamburgerIcon open={menuOpen} dark={isNavbarDark} />
            </button>
          </div>

        </div>
      </header>

      <MobileMenu open={menuOpen} dark={isNavbarDark} onClose={() => setMenuOpen(false)} />
    </>
  );
}
