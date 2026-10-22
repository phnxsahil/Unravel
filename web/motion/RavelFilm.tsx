import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  registerRoot,
  useCurrentFrame,
} from "remotion";
import "@fontsource-variable/dm-sans/index.css";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "@fontsource/ibm-plex-mono/latin-400.css";

const ink = "#2c2824",
  paper = "#fdf1d7",
  orange = "#ff6600";
const ease = (frame: number, start: number, duration = 16) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 4),
  });
function Sheet({
  children,
  frame,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  frame: number;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const p = ease(Math.floor(frame / 2) * 2, delay);
  return (
    <div
      style={{
        background: "#fff8e9",
        border: "1px solid #d9cdb4",
        borderRadius: 12,
        padding: 38,
        boxShadow: "0 10px 0 -5px #e5d8bb",
        opacity: p,
        transform: `translateY(${(1 - p) * 35}px) rotate(${(1 - p) * -2}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
export function RavelFilm() {
  const frame = useCurrentFrame();
  const scene = Math.min(3, Math.floor(frame / 120)),
    local = frame % 120;
  const exit =
    scene === 3
      ? 1
      : interpolate(local, [106, 119], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const titles = [
    "Follow a feature.",
    "Ask why it works.",
    "Understand the next change.",
    "Keep the discovery.",
  ];
  return (
    <AbsoluteFill
      style={{
        background: paper,
        color: ink,
        fontFamily: "DM Sans Variable",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(#cbbb9a 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 54,
          right: 54,
          top: 34,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 17,
          color: "#6c5f4a",
        }}
      >
        <span>RAVEL / WRITING APP</span>
        <span>PREPARED PRODUCT EXAMPLE</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 54,
          top: 80,
          fontFamily: "Bricolage Grotesque Variable",
          fontSize: 43,
          letterSpacing: "-1.5px",
        }}
      >
        {titles[scene]}
      </div>
      <div
        key={scene}
        style={{
          position: "absolute",
          left: 76,
          right: 76,
          top: 164,
          bottom: 75,
          opacity: exit,
        }}
      >
        {scene === 0 && (
          <>
            <Sheet
              frame={local}
              style={{ width: 430, position: "absolute", left: 0, top: 25 }}
            >
              <div style={{ fontSize: 17, color: "#75664e", marginBottom: 18 }}>
                YOUR FEATURE
              </div>
              <div style={{ fontSize: 29, fontWeight: 600 }}>Save a draft</div>
              <p style={{ fontSize: 20, lineHeight: 1.5, marginBottom: 30 }}>
                What happens after I click Save?
              </p>
              <div
                style={{
                  display: "inline-block",
                  background: orange,
                  padding: "14px 26px",
                  borderRadius: 6,
                  fontSize: 18,
                }}
              >
                Follow the source ↗
              </div>
            </Sheet>
            <svg
              style={{
                position: "absolute",
                left: 408,
                top: 95,
                width: 260,
                height: 230,
              }}
              viewBox="0 0 260 230"
            >
              <path
                d="M0 30H85V165H255"
                fill="none"
                stroke={orange}
                strokeWidth="3"
                strokeDasharray="400"
                strokeDashoffset={400 * (1 - ease(local, 22, 44))}
              />
              <circle
                cx={85}
                cy={30 + 135 * ease(local, 30, 35)}
                r="7"
                fill={orange}
                opacity={ease(local, 24)}
              />
            </svg>
            {["DraftEditor.tsx", "saveDraft() → API", "store.py → SQLite"].map(
              (s, i) => (
                <Sheet
                  key={s}
                  frame={local}
                  delay={30 + i * 16}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: i * 103,
                    width: 420,
                    padding: 23,
                  }}
                >
                  <span style={{ color: orange, marginRight: 16 }}>
                    0{i + 1}
                  </span>
                  <span style={{ fontFamily: "IBM Plex Mono", fontSize: 20 }}>
                    {s}
                  </span>
                </Sheet>
              ),
            )}
          </>
        )}
        {scene === 1 && (
          <>
            <Sheet
              frame={local}
              style={{
                position: "absolute",
                left: 0,
                top: 5,
                width: 850,
                padding: 24,
              }}
            >
              <span style={{ color: orange, marginRight: 18 }}>↳</span>
              <span style={{ fontSize: 25 }}>
                {"Why doesn’t React state survive a refresh?".slice(
                  0,
                  Math.floor(ease(local, 6, 42) * 47),
                )}
                <span style={{ opacity: Math.floor(local / 8) % 2 }}>│</span>
              </span>
            </Sheet>
            <Sheet
              frame={local}
              delay={35}
              style={{ position: "absolute", left: 70, right: 0, top: 113 }}
            >
              <div style={{ fontSize: 16, color: "#75664e", marginBottom: 19 }}>
                ANSWER WITH SOURCE
              </div>
              <div style={{ fontSize: 27, lineHeight: 1.6 }}>
                React holds the text in memory.
                <br />
                The save request writes it to the database.
              </div>
              <div
                style={{
                  marginTop: 27,
                  borderTop: "1px solid #dfd0b5",
                  paddingTop: 19,
                  color: "#963900",
                  fontSize: 19,
                  opacity: ease(local, 65),
                }}
              >
                DraftEditor.tsx · lines 8–16 ↗
              </div>
            </Sheet>
          </>
        )}
        {scene === 2 && (
          <>
            <Sheet
              frame={local}
              style={{
                position: "absolute",
                left: 0,
                top: 30,
                width: 500,
                background: "#1c1b1a",
                color: "#edeae3",
              }}
            >
              <div style={{ fontSize: 16, color: "#c4b8a2", marginBottom: 25 }}>
                WEB / API.TS
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono",
                  fontSize: 23,
                  lineHeight: 2,
                }}
              >
                <span style={{ color: "#eeaaa0" }}>− BASE = '/api'</span>
                <br />
                <span style={{ color: "#a8d3aa", opacity: ease(local, 22) }}>
                  + BASE = '/v2/api'
                </span>
              </div>
            </Sheet>
            <Sheet
              frame={local}
              delay={40}
              style={{ position: "absolute", right: 0, top: 90, width: 420 }}
            >
              <div style={{ fontSize: 17, color: "#963900", marginBottom: 17 }}>
                ILLUSTRATIVE COMPARISON
              </div>
              <div style={{ fontSize: 26, lineHeight: 1.4 }}>
                Does the server expose
                <br />
                the same prefix?
              </div>
              <div
                style={{
                  fontSize: 19,
                  lineHeight: 1.6,
                  marginTop: 24,
                  opacity: ease(local, 60),
                }}
              >
                Inspect the route.
                <br />
                Then run a trusted local check.
              </div>
            </Sheet>
          </>
        )}
        {scene === 3 && (
          <>
            <div
              style={{
                position: "absolute",
                left: 85,
                right: 85,
                top: 35,
                height: 300,
                border: "1px solid #d9cdb4",
                background: "#ead9b3",
                borderRadius: 12,
                transform: "rotate(-3deg)",
              }}
            />
            <Sheet
              frame={local}
              style={{
                position: "absolute",
                left: 65,
                right: 65,
                top: 18,
                padding: 42,
              }}
            >
              <div style={{ fontSize: 17, color: "#75664e", marginBottom: 24 }}>
                YOUR NOTEBOOK
              </div>
              <div
                style={{
                  fontFamily: "Bricolage Grotesque Variable",
                  fontSize: 33,
                }}
              >
                The browser and database have different state.
              </div>
              <p style={{ fontSize: 23, lineHeight: 1.6, margin: "22px 0" }}>
                I followed the Save button into the API.
                <br />
                React state alone won’t keep my draft.
              </p>
              <div
                style={{
                  borderTop: "1px solid #dfd0b5",
                  paddingTop: 22,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                }}
              >
                <span>Source attached · ready to revisit</span>
                <span style={{ color: "#306c37", opacity: ease(local, 55) }}>
                  ✓ Discovery saved
                </span>
              </div>
            </Sheet>
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 54,
          right: 54,
          bottom: 30,
          display: "flex",
          gap: 12,
        }}
      >
        {titles.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, background: "#dfd0b5" }}>
            <div
              style={{
                height: "100%",
                background: orange,
                transformOrigin: "left",
                transform: `scaleX(${scene > i ? 1 : scene === i ? local / 119 : 0})`,
              }}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}
function RavelPhoneFilm() {
  const frame = useCurrentFrame();
  const scene = Math.min(3, Math.floor(frame / 120)),
    local = frame % 120;
  const titles = [
    "Follow the source.",
    "Ask why it works.",
    "Compare a change.",
    "Keep the discovery.",
  ];
  return (
    <AbsoluteFill
      style={{
        background: paper,
        color: ink,
        fontFamily: "DM Sans Variable",
        padding: 44,
      }}
    >
      <div style={{ fontSize: 20, color: "#6c5f4a", marginBottom: 30 }}>
        RAVEL / PREPARED EXAMPLE
      </div>
      <div
        style={{
          fontFamily: "Bricolage Grotesque Variable",
          fontSize: 48,
          letterSpacing: "-1.5px",
          marginBottom: 44,
        }}
      >
        {titles[scene]}
      </div>
      <div key={scene}>
        {scene === 0 &&
          [
            "Save a draft",
            "DraftEditor.tsx",
            "saveDraft() → API",
            "store.py → SQLite",
          ].map((title, i) => (
            <React.Fragment key={title}>
              <Sheet
                frame={local}
                delay={i * 18}
                style={{ padding: 25, fontSize: 29 }}
              >
                <span
                  style={{ fontSize: 18, color: "#963900", marginRight: 20 }}
                >
                  0{i + 1}
                </span>
                {title}
              </Sheet>
              {i < 3 && (
                <div
                  style={{
                    padding: "10px 0 10px 40px",
                    fontSize: 24,
                    color: "#963900",
                    opacity: ease(local, i * 18 + 8),
                  }}
                >
                  ↓
                </div>
              )}
            </React.Fragment>
          ))}
        {scene === 1 && (
          <>
            <Sheet frame={local} style={{ fontSize: 29, lineHeight: 1.5 }}>
              Why doesn’t React state
              <br />
              survive a refresh?
            </Sheet>
            <div style={{ height: 24 }} />
            <Sheet
              frame={local}
              delay={32}
              style={{ fontSize: 29, lineHeight: 1.6 }}
            >
              React holds text in memory.
              <br />
              The save request writes
              <br />
              it to the database.
              <div style={{ fontSize: 20, color: "#963900", marginTop: 24 }}>
                DraftEditor.tsx · lines 8–16
              </div>
            </Sheet>
          </>
        )}
        {scene === 2 && (
          <>
            <Sheet
              frame={local}
              style={{
                background: "#1c1b1a",
                color: "#edeae3",
                fontFamily: "IBM Plex Mono",
                fontSize: 29,
                lineHeight: 2,
              }}
            >
              <span style={{ color: "#eeaaa0" }}>− '/api'</span>
              <br />
              <span style={{ color: "#a8d3aa", opacity: ease(local, 22) }}>
                + '/v2/api'
              </span>
            </Sheet>
            <div style={{ height: 28 }} />
            <Sheet
              frame={local}
              delay={35}
              style={{ fontSize: 29, lineHeight: 1.5 }}
            >
              Does the server expose
              <br />
              the same prefix?
              <div style={{ fontSize: 21, color: "#963900", marginTop: 28 }}>
                Illustrative comparison
              </div>
            </Sheet>
          </>
        )}
        {scene === 3 && (
          <Sheet frame={local} style={{ fontSize: 29, lineHeight: 1.6 }}>
            <div style={{ fontSize: 18, color: "#6c5f4a", marginBottom: 24 }}>
              YOUR NOTEBOOK
            </div>
            I followed the Save button
            <br />
            into the API.
            <br />
            <br />
            React state alone won’t
            <br />
            keep my draft.
            <div
              style={{
                marginTop: 32,
                fontSize: 23,
                color: "#306c37",
                opacity: ease(local, 45),
              }}
            >
              ✓ Discovery saved
            </div>
          </Sheet>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 44,
          right: 44,
          display: "flex",
          gap: 10,
        }}
      >
        {titles.map((_, i) => (
          <div
            key={i}
            style={{
              height: 4,
              flex: 1,
              background: scene >= i ? orange : "#dfd0b5",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}
registerRoot(() => (
  <>
    <Composition
      id="RavelFilm"
      component={RavelFilm}
      width={1200}
      height={750}
      fps={24}
      durationInFrames={480}
    />
    <Composition
      id="RavelPhoneFilm"
      component={RavelPhoneFilm}
      width={720}
      height={900}
      fps={24}
      durationInFrames={480}
    />
  </>
));
