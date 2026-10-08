# Dispatch — The Handbook
# Version 1.0 · June 2025
# Everything that governs how this product looks, feels, and grows.
# Treat this as the single source of truth — update it when the product changes.

---

## 0. What this document is

This handbook covers four things in one place: the design system, the landing
page blueprint, the open-source weekend build plan, and the full product
roadmap. The goal is that anyone who picks up this repo — including a future
version of you after a 3-week sprint on something else — can read this and know
exactly what's being built, why it looks the way it does, and what comes next.

---

## 1. The product in one paragraph

Dispatch is a wire service for builders. You ship something. You log a 30-second
update. Dispatch's agent pipeline decides whether it's worth posting, picks the
angle, writes it in your voice for LinkedIn / X / Reddit / Threads, runs a critic
over every draft, and (eventually) sends it out via Composio. The entire product
exists because the gap between shipping and being visible about shipping is where
most builders' personal brand dies — not from laziness, but from the friction of
reformatting and re-explaining context four times across four platforms.

---

## 2. Color theory — the full rationale

### 2.1 Why the current palette is right, and where it needs depth

The current palette (paper cream + black ink + orange stamp) is doing something
unusual in a SaaS world dominated by dark backgrounds and indigo-to-violet
gradients: it looks editorial. That's correct for this product. Dispatch is not
a dashboard tool. It's a publishing tool. It should feel like a newsroom, not a
dev console. The risk is that it tips into "plain" rather than "editorial" if
the sections don't have enough contrast rhythm.

### 2.2 The full token system (final)

The palette has two modes and three temperature zones:

ZONE A — PAPER (light base, editorial warmth)
  --paper         #F5F2EC   light bg       Warm white, not stark. Think Economist print.
  --paper-raised  #EDEAE2   card surface   Slightly darker for cards on paper background.
  --ink           #1A1916   primary text   Near-black, slightly warm. Avoids the coldness
                                            of pure #000.
  --carbon        #6B6960   secondary      Muted warm gray for timestamps, meta, labels.
  --rule          rgba(26,25,22,.1)         Dividers, borders. Single weight, never doubled.

ZONE B — WIRE (the accent that means "the system is thinking")
  --wire          #5247CC   primary accent  Muted indigo, not electric blue. Serious, not
                                            playful. Used for: active states, links, the stamp
                                            badge fill when a draft is ready.
  --wire-light    #EAE9F8   wire on paper   Background tint for wire-colored chips/tags.

ZONE C — STAMP (the accent that means "something just landed" or "urgent")
  --stamp         #D9501A   secondary acct  Burnt orange. The signature color. Used for: the
                                            stamp animation, the YC badge, error states,
                                            Reddit's badge (appropriate — Reddit is orange).
  --stamp-light   #FBF0EB   stamp on paper  Background tint for stamp-colored chips.

ZONE D — MINT (success / posted / done)
  --mint          #2D7A55   tertiary        Deep green, not neon. Used only for: posted status,
                                            critic pass checkmark, success toasts.
  --mint-light    #EAF4EF   mint on paper   Background tint.

ZONE E — DARK SURFACE (for product demo sections only)
  --dark-bg       #131210   dark base       Very slightly warm near-black. Not #000 or #111.
  --dark-surface  #1D1C1A   elevated cards  For cards that sit on the dark background.
  --dark-ink      #F0EDE8   text on dark    Warm white, matches --paper but inverted.
  --dark-carbon   #9C9896   secondary dark  Muted warm gray for secondary text on dark.
  --dark-rule     rgba(240,237,232,.08)      Borders on dark background.

Dark zone is ONLY used in product demo sections and the "built in public" section.
Every other section uses Zone A (paper).

### 2.3 Why these specific colors

--wire (#5247CC): Indigo communicates intelligence, precision, and calm action.
It's the color of "the pipeline is running." Not purple (too playful) and not
blue (too corporate/fintech). This specific shade sits at the boundary between
confidence and creativity.

--stamp (#D9501A): Burnt orange communicates urgency without aggression. It's
the literal color of a rubber stamp — which is the physical-world metaphor the
entire product visual language is built on. It also happens to be close to YC's
orange, which builds subconscious brand association for the target audience.

--paper (#F5F2EC): Warm cream, not cool white. The warmth matters: it feels
like paper, not like a healthcare app. It differentiates from the default
tailwind bg-white that 90% of SaaS sites use.

--ink (#1A1916): Slightly warm near-black. On screen, pure black (#000) reads as
harsh. This tone reads as "printed" rather than "digital" — which is consistent
with the wire room metaphor.

### 2.4 Color DON'Ts

- Never use gradients on backgrounds. Gradients on individual elements (like
  a subtle gradient on the hero text) are permitted but not required.
- Never use --wire and --stamp together in the same element. They fight.
- Never use --mint for anything other than success/posted states. Green elsewhere
  creates false "go" affordances.
- Never use --stamp for interactive CTAs (buttons). --stamp is for status,
  not action. --ink is for primary buttons; --wire for secondary.
- The dark zone never appears in the app itself, only on the marketing site.

---

## 3. Typography system (final)

Three families, strict roles. The mono font carries more visual weight than
typical developer tools — it's not just for code, it's for anything "wire service."

DISPLAY — Space Grotesk (weights: 400 medium, 500 medium-bold)
  Used for: hero headlines, section headings, project names in the app.
  NOT for: body text, labels, anything under 14px.
  Why: Slightly mechanical, geometric without being cold. Has personality the
  way good editorial type does. Pairs well with IBM Plex's neutrality.

BODY — IBM Plex Sans (weights: 300, 400, 500 · italic 400)
  Used for: paragraph text, descriptions, form labels.
  NOT for: headings, monospaced data.
  Why: IBM Plex has more character than Inter (subtle ink traps, slight warmth)
  without the loudness of something like GT Walsheim. It reads well at 14–16px
  which is where most product UI text sits.

MONO — IBM Plex Mono (weight: 400, 500)
  Used for: timestamps, outlet names (LI/X/RD/TH), platform tags, critic scores,
  CLI examples, keyboard shortcuts, the wire feed timestamps, any "data" label.
  Key insight: Using mono more liberally than most products do is what makes
  the "wire room" aesthetic work. The mono font is not just for code — it's for
  anything that should feel like a log line or a wire report.

SIZE SCALE (px, unitless)
  10  mono / micro labels only
  11  mono / caption / timestamp
  12  body small / secondary
  13  body / default UI text
  14  body large / feature descriptions
  16  section intro text
  20  section headings (Space Grotesk)
  28  large headings (Space Grotesk)
  40  hero subheadings
  56  hero headline (mobile: 36)
  72  hero display (optional, above the fold only, mobile: 42)

LINE HEIGHTS: 1.0 for display, 1.2 for headings, 1.6 for body, 1.5 for mono
LETTER SPACING: -0.04em for display, -0.02em for headings, 0 for body, +0.04em for mono labels

---

## 4. The signature animation — the stamp sequence

This is the ONE orchestrated animation moment in the entire product.
Every other animation is either a hover lift or a state transition.
This one gets special treatment.

TRIGGER: A platform draft completes (streamed from backend via SSE).
ELEMENT: The outlet badge (20px circle with platform initial).

SEQUENCE (180ms total):
  t=0ms     badge is in "writing" state (outline + opacity pulse)
  t=0ms     opacity pulse STOPS immediately
  t=0–60ms  scale: 1 → 0.88 (compress, like pressing a stamp down)
  t=60–120ms scale: 0.88 → 1.1 (release, slight bounce)
  t=120–180ms scale: 1.1 → 1.0 (settle)
  t=0–80ms  fill transitions: transparent → --wire (or --stamp if critic flagged)
  t=80–280ms box-shadow: 0 0 0 0 → 0 0 0 4px rgba(82,71,204,.2) → 0 0 0 0
             (ring expands and fades — the "ink spreading" effect)

CSS (exact):
  @keyframes stamp-press {
    0%   { transform: scale(1); }
    35%  { transform: scale(.88); }
    70%  { transform: scale(1.1); }
    100% { transform: scale(1.0); }
  }
  @keyframes stamp-ring {
    0%   { box-shadow: 0 0 0 0 rgba(82, 71, 204, .35); }
    60%  { box-shadow: 0 0 0 5px rgba(82, 71, 204, .1); }
    100% { box-shadow: 0 0 0 0 rgba(82, 71, 204, 0); }
  }
  .stamp-badge.animating {
    animation: stamp-press 180ms cubic-bezier(.22,.61,.36,1),
               stamp-ring  320ms ease-out;
  }

REDUCED MOTION: Skip the scale animation. Just transition fill color (150ms)
and a single box-shadow flash (0 → 3px → 0, 300ms). No movement.

---

## 5. Landing page blueprint (the right structure)

The current page has the right sections but in the wrong order and with
insufficient visual contrast between sections. This is the correct order and
what each section must do.

### Section 1 — NAV
What it contains: Logo · YC badge · 3 nav links · GitHub stars (live) · CTA
What it does: Establishes credibility in the first 200ms before the hero renders.
Design note: Sticky. Blur+semi-transparent on scroll. YC badge is never optional.

### Section 2 — HERO
What it contains:
  - Kicker: live dot + "247 dispatches sent today" (updates via JS)
  - H1: "Ship things. Dispatch the rest." (keep this — it's strong)
  - Subheadline: 1-2 sentences max
  - Two CTAs: primary "Join waitlist" + ghost "Watch the demo"
  - THE ANIMATED DEMO: Not a screenshot. A live HTML animation showing:
      (a) a dispatch being typed character by character into a log box
      (b) four outlet stamps appearing one by one as if agents are completing
      (c) on loop, ~8 second cycle
  - Trust bar: 3 items only, specific numbers

What it must NOT do: Explain everything. The hero sells the emotion
("my stuff goes out, I didn't have to do all that work") not the mechanism.

CRITICAL MISSING FROM CURRENT PAGE: The hero demo is a static screenshot.
It should be an animated component showing the stamp sequence happening live.
This is the product's signature moment — it should be the FIRST thing people see.

### Section 3 — SOCIAL PROOF BAR (currently missing entirely)
One horizontal strip: "Used by founders from [logos or names of 5-6 real
early users/waitlist people]" OR just GitHub stats if user count is low.
Keep it thin — 1 line of height. This is a credibility signal, not a section.

### Section 4 — THE PROBLEM (3 columns, not 4)
Current page has 4 problem columns. Memory Gap / Voice Decay / Format Fatigue /
Zero Context. The issue: 4 columns is too many to read horizontally.
CHANGE TO: 3 bigger problems with more copy each. Or keep 4 but in a 2×2 grid.

### Section 5 — LIVE DEMO (DARK SECTION)
This is the biggest structural fix needed.
Current page puts the demo near the bottom after 5 other sections.
It should be HIGH UP — immediately after the problem section.
This is "The Wire & The Desk" — the product in action.
MAKE IT DARK: Switch the background to --dark-bg for this section only.
This creates the strongest visual break on the page and makes the product
preview feel like a real application, not a diagram.
MAKE IT INTERACTIVE: Platform tabs should work. Critic note should update.
Add a "Run a dispatch" input field at the top that triggers a fake generation.

### Section 6 — HOW IT WORKS (numbered steps)
5 steps with icons and a short animation/illustration for each.
Already on the page in the features section. Reorganize as a step sequence.

### Section 7 — PLATFORM INTELLIGENCE (2×2 grid of platform cards)
LinkedIn / X / Reddit / Threads each get their own card with the actual rules
the writer agent follows. This is a differentiator — no other tool explains
its platform logic this clearly.

### Section 8 — AGENT PIPELINE VISUALIZATION (currently missing)
A diagram or animated visualization showing:
  Dispatch → [embed] → [Strategist] → [LI Writer] [X Writer] [RD Writer] [TH Writer]
                                              ↓           ↓          ↓           ↓
                                         [Critic] [Critic] [Critic] [Critic]
                                              ↓
                                       [Your Review]
This is a credibility signal for technical founders (the actual target user).
Shows LangGraph. Shows this is not a simple "rewrite" tool.

### Section 9 — TESTIMONIALS (3 cards)
Currently 1 quote with no attribution. This needs:
- 3 testimonials minimum
- Real name + company + role
- A specific, detailed quote (not "this is great!") — the specificity is
  the credibility signal
- Avatar/initial badge for each

### Section 10 — OPEN SOURCE / BUILT IN PUBLIC
Show the GitHub widget (stars, last commit, forks).
Show the build log: last 4-5 commits with dates.
This is a UNIQUE trust signal no other tool has: "we shipped this publicly
and here's the receipts."

### Section 11 — PRICING
3 columns: Self-hosted (free) · Hosted ($12/mo, coming soon) · Teams (TBD)
Currently missing from the page entirely.

### Section 12 — FINAL CTA
Email capture for waitlist.
Currently: "Stop choosing between shipping and being visible." — KEEP THIS.
It's better than the hero headline for the CTA position.

### Section 13 — FOOTER
Standard. Brand · Product links · Developer links · Company links · YC badge.

---

## 6. What the demo must show (specific)

The animated hero demo should run on an 8-second loop:
0s:     Input box fades in. Text starts typing: "shipped semantic search via pgvector—"
2s:     Text complete. "Analyzing..." appears in mono below.
2.5s:   LI stamp animates in (stamp-press sequence)
3.2s:   X stamp animates in
4s:     R stamp animates in (fills --stamp color, critic flagged)
4.8s:   TH stamp animates in
5.5s:   Draft preview appears to the right of the stamps, fades in
7s:     Critic note appears: "9/10 — tighten the opener"
8s:     Loop resets (fade out, repeat)

The "interactive demo" section lower on the page should let users:
- Click platform tabs and see actual different draft text
- See the critic score change per platform
- Click "Regenerate" and see a brief loading state → new draft appears

---

## 7. Creative directions — what makes this MEMORABLE

Beyond the stamp animation, there are 4 creative moments worth building:

### 7A — The "Live Wire" ticker
A horizontal scroll ticker (marquee-style) showing fake-but-plausible dispatch
activity: "fltrd.tech · shipped semantic search · 3 platforms · 847 impressions"
This creates the sensation that the system is alive and in use. Even on a static
marketing site, a ticker makes it feel like something is happening.
ALREADY IN THE V2 LANDING PAGE — keep it.

### 7B — The CLI animation
One section (or a callout within the "capture" feature) shows a terminal window
with text animating in:
  $ dispatch log "shipped semantic search via pgvector. 30% → 8% hallucination rate."
  ✓ Embedded and indexed  (80ms)
  ✓ Strategist: technical deep-dive · targeting linkedin, x, reddit
  ✓ Generating drafts...
  ● linkedin  9/10  ready
  ● x         8/10  ready
  ● reddit    7/10  flagged — tighten anti-promo tone
  ● threads  10/10  ready
  → 3 drafts queued · 1 needs review

This takes ~5 seconds to animate and communicates the entire product flow in
a single terminal window. No prose required.

### 7C — The "voice profile" reveal
One small interactive element: a before/after toggle.
BEFORE: Generic AI LinkedIn post (clearly sounds like ChatGPT)
AFTER: The same dispatch, after voice profile, sounding like a real person
The contrast is the product's core value proposition made visceral.
Don't use real names — invent a persona.

### 7D — The platform post previews
Below the platform section, show mockups of what the actual posts look like:
A LinkedIn post card (with the platform's actual UI styling)
An X post card
A Reddit post with the subreddit shown
A Threads post
These don't need to be real UI copies — just enough chrome to be recognizable.
This answers the question "but what does the output actually look like?" which
every visitor has but most landing pages don't answer.

---

## 8. The weekend open-source build — what's actually shippable in 48 hours

### Saturday (Day 1) — The core loop
Hours 1-3:   Scaffold (monorepo, Next.js, FastAPI, Docker)
Hours 3-5:   DB schema (init.sql, seed data, 5 projects)
Hours 5-8:   LangGraph pipeline (strategist + 2 writers + critic, no posting)
Hours 8-10:  FastAPI routes (/projects, /dispatches, /dispatches/{id}/generate SSE)
Hours 10-12: The Wire UI (left panel, dispatch cards, stamp badges)

### Sunday (Day 2) — The visible product
Hours 1-3:   The Desk UI (platform tabs, editable drafts, critic readout)
Hours 3-5:   SSE integration (stamps animate in real time as each writer completes)
Hours 5-7:   Voice profile import (paste past posts → derive profile → store)
Hours 7-9:   Seed with real projects (fltrd.tech, Miryn, Stash, ChaiPaani, Dispatch)
Hours 9-10:  README + deploy to Fly.io or Railway (free tier)
Hours 10-12: Tweet about it / LinkedIn dispatch about Dispatch (use the tool itself)

### What to cut for the weekend build
- Voice notes (Phase 2)
- GitHub webhooks (Phase 2)
- CLI (Phase 2 — can fake it with a simple Python script for the demo)
- Composio posting (Phase 3)
- Reddit anti-promo gating (implement the logic, disable the hard block)
- Scheduling (Phase 3)
- Engagement feedback (Phase 3)
- The X thread writer (simplify to single post only for now)

### What's non-negotiable for the weekend build
- The stamp animation (this is the product's identity — ship it on day 1)
- All 5 agent prompts (this is where the value is, don't stub them)
- SSE streaming (the real-time stamp updates are the demo moment)
- The voice profile (paste your own past posts and use it for the demo)
- pgvector retrieval (even basic cosine search makes the output significantly better)

---

## 9. Full product roadmap (the honest one)

### Phase 0 — The weekend build (see above)
Core loop: log dispatch → 4 critiqued drafts → approve manually
Target: 100 GitHub stars, 50 people cloning and using it

### Phase 1 — Narrative arcs + review workflow (weeks 3-5)
Approve/edit/reject flows. Arc tagging. Strategist uses arcs. "Hold" state.
Target: 10 founders using it regularly, posting 3x/week each

### Phase 2 — Ambient capture (weeks 6-10)
GitHub webhooks. Voice notes (Whisper). CLI tool.
Target: Daily active use. Users don't have to remember to open the dashboard.

### Phase 3 — Distribution (weeks 11-16)
Composio OAuth. Post to all platforms. Schedule. Engagement feedback.
Target: Full loop — ship → post → measure → improve voice profile → repeat

### Phase 4 — Hosted product (month 5+)
One-command deploy removed. Hosted version. $12/mo pricing.
Target: First 50 paying customers from the open-source waitlist.

### Phase 5 — Teams (month 9+)
Shared project memory. Brand voice profiles. Approval workflows for teams.
Multi-tenant architecture built from scratch (don't backport the single-user code).
Target: Early-stage startups using it as their content infrastructure.

---

## 10. Go-to-market — open source first

The open-source release IS the marketing. Here's the plan:

WEEK OF LAUNCH:
- Post the Dispatch dispatch about Dispatch on LinkedIn, X, Reddit (r/SideProject,
  r/webdev, r/IndieHackers). This is the product being used to market itself.
  This is the story — "I built the tool that posts about itself."
- Post the 48-hour build log as a thread on X. Show commits, show the stamp
  animation being built, show the first real dispatch going through the pipeline.
- FOSS Dehradun community — warm introduction network.
- ProductHunt launch (Phase 1 — after the product is more polished than the weekend build)

CONTENT CADENCE (using Dispatch itself):
- Every feature shipped → dispatch → 4 posts
- Every metric milestone → dispatch → 4 posts
- Every interesting technical lesson → dispatch → 4 posts
This is the flywheel. The product markets itself by being the tool that created
the content used to market the tool.

GITHUB STRATEGY:
- AGENTS.md in the root (signals seriousness to developer audience)
- CONTRIBUTING.md (open to contributors from day 1)
- Good README with a GIF of the stamp animation above the fold
- Issues labeled "good first issue" for the CLI and GitHub webhook features
- Discord or GitHub Discussions for early adopters

---

## 11. Landing page improvement checklist (applied to the Lovable build)

Changes needed on the existing page, in priority order:

P0 — Must fix before launch:
  [ ] Replace static hero demo screenshot with animated HTML component
      (stamp sequence running on loop — this is the most important fix)
  [ ] Move "The Wire & The Desk" demo section UP (currently too late in page)
  [ ] Make demo section dark background (currently blends with page)
  [ ] Make platform tabs in demo interactive (currently appear static)
  [ ] Add pricing section (currently missing entirely)
  [ ] Add 2 more testimonials with real attribution

P1 — Fix in week 1 after launch:
  [ ] Add live ticker (dispatches going out) — creates "alive" sensation
  [ ] Add CLI animation section
  [ ] Add GitHub stars widget (live from GitHub API)
  [ ] Fix the integration logos section (currently confusing — "Framer" appearing)
  [ ] Add platform post previews (what LinkedIn/X/Reddit/Threads posts look like)
  [ ] Add agent pipeline visualization diagram

P2 — Polish after first 100 users:
  [ ] Add voice profile before/after demo
  [ ] Add changelog/build log section
  [ ] Add "open source health" section (commits, contributors, license)
  [ ] Add video demo (Loom recording of the core 30-second flow)
  [ ] Animate section reveals on scroll (subtle, not overdone)

---

## 12. Things NOT to do (the anti-list)

- Don't add a chatbot to the landing page
- Don't use stock photos of people at computers
- Don't add a cookie banner that covers the hero
- Don't A/B test the headline until you have >5k monthly visitors
- Don't add an onboarding wizard for the self-hosted version
- Don't add more social platforms (Discord, Bluehost, etc.) before mastering 4
- Don't build a mobile app before the web product is solid
- Don't open source the hosted infrastructure — only the core application
- Don't add features because users ask for them before understanding why they want them
- Don't call it "AI-powered" in the headline — show it, don't say it
