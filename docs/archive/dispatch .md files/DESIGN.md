# Dispatch — Design direction

## Concept

Dispatch is, functionally, a wire service: one report goes out, multiple outlets pick it
up. The design leans into that directly instead of looking like another generic AI-SaaS
dashboard (no purple-to-blue gradients, no glassy cards, no floating blob shapes, no
"Inter + rounded-2xl + soft shadow everywhere" defaults).

The reference point is a **wire room**: a live feed of incoming reports on one side, a
desk where each report gets adapted and stamped for distribution on the other. Two
real-world artifacts carry the visual language:

- **The teletype feed** — a continuous, timestamped, monospaced stream of dispatches.
- **The outlet stamp** — each platform (LinkedIn/X/Reddit/Threads) is represented as a
  small stamp/seal that gets "punched" onto a dispatch once that platform's draft is
  ready. This is the signature element (see Motion below).

## Token system

### Color

Two ramps, six named colors, defined for both light and dark mode. No gradients.

| Name | Role | Light | Dark |
|---|---|---|---|
| `paper` | Background | `#F6F4EF` | `#17161A` |
| `ink` | Primary text | `#1F1E1B` | `#F2F0EB` |
| `carbon` | Secondary text, borders, dividers | `#6B6A66` | `#9C9A95` |
| `wire` | Primary accent — active states, links, "transmitting" indicator | `#5B5BD6` | `#9C97F2` |
| `stamp` | Secondary accent — "live", urgent, the stamp-ink color | `#D4572A` | `#F08A5D` |
| `mint` | Tertiary — posted/success states | `#3F7D5C` | `#7FCBA4` |

`wire` (a muted indigo, not a SaaS-gradient blue) and `stamp` (a burnt-orange "rubber
stamp ink" tone) are the two colors that carry meaning — `wire` for "in progress / this
is the system thinking," `stamp` for "this just landed." `mint` is used sparingly, only
for confirmed-posted states. Everything else is `paper`/`ink`/`carbon`.

### Typography

Three roles, deliberately not the Inter-for-everything default:

- **Display/UI headings** — `Space Grotesk`. Geometric, slightly mechanical, reads well
  at small sizes for labels and section headers.
- **Body/UI text** — `IBM Plex Sans`. Pairs cleanly with Space Grotesk, has more
  character than Inter without being loud.
- **Data/feed/mono** — `IBM Plex Mono`. Used for timestamps, the wire feed itself,
  platform tags, and anything that should feel like a printed log line.

Type scale: 12px (mono, captions/tags) / 14px (body) / 16px (body large) / 20px (section
headers, Space Grotesk medium) / 28px (page title, Space Grotesk medium). Avoid heavier
than medium weight anywhere — this is a tool, not a landing page.

### Layout

Two primary views, both desk-metaphor:

**The Wire** (left rail, ~320px, mono feed)
```
+----------------------------+
| THE WIRE                    |
| ---------------------------- |
| 14:02  fltrd.tech            |
| Shipped semantic search      |
| o . o o   <- outlet stamps   |
| ---------------------------- |
| 09:40  Miryn                 |
| Fixed memory leak in RAG     |
| . . . o                       |
| ---------------------------- |
| [+ New dispatch]              |
+----------------------------+
```

**The Desk** (main area — the open dispatch)
```
+------------------------------------------------+
| fltrd.tech . shipped semantic search             |
| Angle: technical deep-dive . Arc: Building       |
| -------------------------------------------------|
| [LinkedIn] [X] [Reddit] [Threads]                 |
| -------------------------------------------------|
| <editable draft text>                             |
|                                                    |
| Critic 8/10 - tighten the opening line            |
| -------------------------------------------------|
| [Approve & queue]      [Regenerate]               |
+------------------------------------------------+
```

On mobile, The Wire collapses to a top scroll list; tapping a dispatch opens The Desk
full-screen with platform tabs.

### Signature element: the stamp sequence

When a dispatch is generated, each outlet appears as a small circular badge (the
"stamp"), initially outlined and empty (`carbon` stroke, `paper` fill). As each
platform's writer agent finishes — streamed from the backend as results come in, not all
at once — its badge animates: scale from 1 to 0.92 to 1.04 to 1 over ~180ms (a "thud"),
fill transitions from `paper` to `wire` (or `stamp` if the critic flagged it), and a 1px
ring briefly flashes outward and fades. No spinners, no skeleton shimmer — the badges
themselves *are* the loading state, going from empty outlines to filled stamps one at a
time.

This is the one orchestrated animation moment in the product. Keep everything else
quiet.

## Motion principles

- **One signature moment** (the stamp sequence above). Resist adding more — extra
  animation is what makes AI-built UIs feel AI-built.
- **Hover**: outlet badges and dispatch cards lift 1-2px with a subtle shadow increase,
  150ms ease-out. Nothing else animates on hover.
- **Page transitions**: none/instant. This is a tool used many times a day; speed beats
  delight here.
- **Reduced motion**: the stamp sequence becomes an instant state change (no
  scale/ring), respecting `prefers-reduced-motion`.

## Component patterns

- **Dispatch card** (in The Wire): timestamp (mono, `carbon`), project name (Space
  Grotesk, `ink`), one-line summary (IBM Plex Sans, truncated), row of 4 outlet stamps.
- **Outlet stamp**: 20px circle, platform initial inside (LI / X / R / T), states:
  `pending` (outline only), `writing` (pulsing outline — only this state may use a subtle
  opacity pulse, 1.5s loop, paused under reduced-motion), `ready` (filled `wire`),
  `flagged` (filled `stamp`, critic score below threshold), `posted` (filled `mint`).
- **Composing desk tabs**: platform tabs use the mono font for the platform name (`LI`,
  `X`, `RD`, `TH`) — reinforces the "wire" framing rather than using brand logos, which
  also avoids any IP/trademark concerns.
- **Critic readout**: shown inline below the draft, mono font, score plus one-line
  instruction — written like a margin note from an editor, not a "score card" UI
  component.

## Copy & voice guidelines

- Buttons name the action and its result consistently: "Approve & queue" always leads to
  a status that says "Queued," never "Submitted" or "Done."
- Empty states are invitations, not apologies: The Wire with nothing in it says "Nothing
  logged yet - ship something and log it here," not "No dispatches found."
- Critic feedback is written like an editor's note: direct, specific, no hedging ("Cuts
  the first two sentences - they restate the title" rather than "This could possibly be
  improved by considering a shorter opening").
- No filler enthusiasm anywhere in the UI copy ("Awesome!", "Great job!"). The tone is a
  newsroom desk, not a cheerleader.

## Accessibility & responsive

- All colors above meet WCAG AA for text-on-`paper`/`ink` pairs in both modes.
- Keyboard focus rings use `wire` at 2px, visible on all interactive elements.
- Stamp states are distinguished by fill *and* a secondary cue (the platform-initial
  label), not color alone.
- Mobile: single-column, The Desk opens as a full-screen view with a back affordance to
  The Wire.
