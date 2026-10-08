import React, { useState, useEffect, useRef } from "react";

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "demo",       href: "#demo" },
  { label: "features",   href: "#features" },
  { label: "pricing",    href: "#pricing" },
  { label: "changelog",  href: "#changelog" },
  { label: "github",     href: "#github" },
];

// Sections that carry a dark background — navbar goes dark when they're active
const DARK_SECTION_IDS = ["demo", "footer-dark"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function NavLink({
  label,
  href,
  dark,
}: {
  label: string;
  href: string;
  dark: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 400,
        color: dark
          ? hov
            ? "rgba(245,242,236,0.9)"
            : "rgba(245,242,236,0.5)"
          : hov
          ? "#1A1916"
          : "#5C5852",
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
      href="#github"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 11px",
        border: `0.5px solid ${
          dark
            ? "rgba(245,242,236,0.15)"
            : "rgba(26,25,22,0.18)"
        }`,
        borderRadius: 2,
        textDecoration: "none",
        backgroundColor: hov
          ? dark
            ? "rgba(245,242,236,0.06)"
            : "rgba(26,25,22,0.04)"
          : "transparent",
        transition: "background-color 0.12s ease",
        flexShrink: 0,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: dark ? "rgba(245,242,236,0.55)" : "#5C5852",
          letterSpacing: "0.02em",
        }}
      >
        ★ 847
      </span>
    </a>
  );
}

function CTABtn({ dark }: { dark: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="#waitlist"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 14px",
        backgroundColor: hov ? "#C7501E" : "#E85E2C",
        borderRadius: 2,
        textDecoration: "none",
        transition: "background-color 0.12s ease",
        flexShrink: 0,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          color: "#F5F2EC",
          letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}
      >
        get early access
      </span>
    </a>
  );
}

function HamburgerIcon({ open, dark }: { open: boolean; dark: boolean }) {
  const color = dark ? "rgba(245,242,236,0.7)" : "#1A1916";
  return (
    <div
      style={{
        width: 18,
        height: 12,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
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
              open && i === 0
                ? "translateY(5.5px) rotate(45deg)"
                : open && i === 2
                ? "translateY(-5.5px) rotate(-45deg)"
                : "none",
            opacity: open && i === 1 ? 0 : 1,
          }}
        />
      ))}
    </div>
  );
}

// ─── Mobile menu ─────────────────────────────────────────────────────────────

function MobileMenu({
  open,
  dark,
  onClose,
}: {
  open: boolean;
  dark: boolean;
  onClose: () => void;
}) {
  const bg = dark ? "#131210" : "#F5F2EC";
  const border = dark
    ? "0.5px solid rgba(245,242,236,0.08)"
    : "0.5px solid rgba(26,25,22,0.1)";

  return (
    <div
      style={{
        position: "fixed",
        top: 52,
        left: 0,
        right: 0,
        backgroundColor: bg,
        borderBottom: border,
        padding: "8px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transform: open ? "translateY(0)" : "translateY(-6px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "transform 0.16s ease, opacity 0.16s ease",
        zIndex: 49,
      }}
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
            color: dark ? "rgba(245,242,236,0.8)" : "#1A1916",
            textDecoration: "none",
            padding: "13px 0",
            borderBottom: dark
              ? "0.5px solid rgba(245,242,236,0.06)"
              : "0.5px solid rgba(26,25,22,0.06)",
            letterSpacing: "0.02em",
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

// ─── Navbar ───────────────────────────────────────────────────────────────────
//
// Two visual states driven by scrollY:
//
//   WIDE  (scrollY < 8) — full-viewport-width rectangle, flush to edges.
//   Announces the site before anything else loads.
//
//   NARROW (scrollY ≥ 8) — inset 16px from each side, 8px from top,
//   with a soft shadow so it appears to float above the content.
//   Snaps to the section color (paper or dark) it's currently over.

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Track scroll depth
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section is beneath the navbar via IntersectionObserver
  useEffect(() => {
    // Observe all sections tagged with data-section-dark
    const darkSections = document.querySelectorAll("[data-section-dark]");
    if (!darkSections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsDark(true);
        });
        // If no dark section is intersecting, switch back to light
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

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Color tokens per state ──────────────────────────────────────────────────
  const paperBase = "#F5F2EC";
  const darkBase = "#131210";

  const bgColor = isDark
    ? scrolled
      ? "rgba(19,18,16,0.92)"
      : "rgba(19,18,16,0.96)"
    : scrolled
    ? "rgba(245,242,236,0.88)"
    : "rgba(245,242,236,0.97)";

  const borderColor = isDark
    ? "rgba(245,242,236,0.08)"
    : "rgba(26,25,22,0.09)";

  return (
    <>
      <style>{`
        /* ── Navbar positioning ──────────────────────────── */
        .dispatch-nav {
          position: fixed;
          z-index: 50;
          height: 52px;
          display: flex;
          align-items: center;
          transition:
            top 0.22s ease,
            left 0.22s ease,
            right 0.22s ease,
            background-color 0.25s ease,
            box-shadow 0.22s ease,
            border-color 0.22s ease;
        }

        /* WIDE — flush, full-width */
        .dispatch-nav.wide {
          top: 0;
          left: 0;
          right: 0;
          border-bottom: 0.5px solid var(--nav-border);
          box-shadow: none;
        }

        /* NARROW — inset, floating */
        .dispatch-nav.narrow {
          top: 10px;
          left: 16px;
          right: 16px;
          border: 0.5px solid var(--nav-border);
          box-shadow: 0 2px 16px rgba(26,25,22,0.08), 0 1px 4px rgba(26,25,22,0.04);
        }

        .dispatch-nav-inner {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          gap: 20px;
        }

        /* ── Responsive ──────────────────────────────────── */
        .dispatch-nav-links   { display: flex; }
        .dispatch-nav-star    { display: flex; }
        .dispatch-hamburger   { display: none; }

        @media (max-width: 767px) {
          .dispatch-nav.narrow {
            left: 8px;
            right: 8px;
          }
          .dispatch-nav-links { display: none !important; }
          .dispatch-nav-star  { display: none !important; }
          .dispatch-hamburger { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>

      <header
        className={`dispatch-nav ${scrolled ? "narrow" : "wide"}`}
        style={{
          backgroundColor: bgColor,
          backdropFilter: scrolled ? "blur(10px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",
          "--nav-border": borderColor,
        } as React.CSSProperties}
      >
        <div className="dispatch-nav-inner">

          {/* Left — wordmark */}
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "Space Grotesk, system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: isDark ? "rgba(245,242,236,0.92)" : "#1A1916",
                letterSpacing: "-0.03em",
                transition: "color 0.2s ease",
              }}
            >
              dispatch
            </span>
            <span style={{ color: "#E85E2C", fontSize: 18, lineHeight: 1, marginTop: -1 }}>
              •
            </span>
          </a>

          {/* Center — nav links */}
          <nav
            className="dispatch-nav-links"
            style={{ alignItems: "center", gap: 24 }}
          >
            {NAV_LINKS.map((l) => (
              <NavLink key={l.label} {...l} dark={isDark} />
            ))}
          </nav>

          {/* Right — star + CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div className="dispatch-nav-star">
              <StarPill dark={isDark} />
            </div>
            <CTABtn dark={isDark} />
            <button
              className="dispatch-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                background: "none",
                border: "none",
                padding: 6,
                cursor: "pointer",
                borderRadius: 2,
              }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <HamburgerIcon open={menuOpen} dark={isDark} />
            </button>
          </div>

        </div>
      </header>

      <MobileMenu open={menuOpen} dark={isDark} onClose={() => setMenuOpen(false)} />
    </>
  );
}
