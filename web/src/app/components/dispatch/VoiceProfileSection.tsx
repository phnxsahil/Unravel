import React, { useState } from "react";
import {
  IconMicrophone, IconLoader2, IconCheck, IconAlertTriangle,
} from "@tabler/icons-react";
import { createVoiceProfile, getVoiceProfile, type VoiceProfileRead } from "../../api";

// ─── Text analysis utils ────────────────────────────────────────────────────

function avgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0);
  return Math.round(totalWords / sentences.length);
}

function paragraphDensity(text: string): number {
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paras.length === 0) return 0;
  return Math.round(paras.reduce((sum, p) => sum + p.trim().split(/\s+/).length, 0) / paras.length);
}

function vocabRichness(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return parseFloat(((unique.size / words.length) * 100).toFixed(1));
}

function formalityScore(text: string): number {
  const formal = /\b(therefore|however|furthermore|nevertheless|consequently|regarding|implementation|utilize|demonstrate|significant|establish|accordingly)\b/gi;
  const casual = /\b(gonna|wanna|gotta|kinda|sorta|yeah|nah|cool|awesome|hey|ok|btw|imo|tbh)\b/gi;
  const formalMatches = (text.match(formal) || []).length;
  const casualMatches = (text.match(casual) || []).length;
  const total = formalMatches + casualMatches;
  if (total === 0) return 50;
  return Math.round((formalMatches / total) * 100);
}

function overusedPhrases(text: string): string[] {
  const signals = [
    "in order to", "at the end of the day", "it's worth noting", "when it comes to",
    "the fact that", "in terms of", "as well as", "delve", "leverage", "game-changer",
    "synergy", "excited to announce", "humbled", "thrilled to share", "landscape",
  ];
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const phrase of signals) {
    if (lower.includes(phrase)) found.push(phrase);
  }
  return found;
}

function neverUsedPhrases(text: string): string[] {
  const tech = [
    "implemented", "deployed", "refactored", "shipped", "debugged",
    "optimized", "migrated", "containerized", "orchestrated", "provisioned",
  ];
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const word of tech) {
    if (!lower.includes(word)) found.push(word);
  }
  return found.slice(0, 5);
}

function voiceMatchScore(draft: string, profileText: string): { score: number; flags: string[] } {
  const flags: string[] = [];
  const draftSentences = draft.split(/[.!?]+/).filter(Boolean);
  const profileSentences = profileText.split(/[.!?]+/).filter(Boolean);

  // Check sentence length mismatch
  const draftAvgLen = avgSentenceLength(draft);
  const profileAvgLen = avgSentenceLength(profileText);
  if (profileAvgLen > 0 && Math.abs(draftAvgLen - profileAvgLen) > 10) {
    flags.push(`Your sentences average ${draftAvgLen} words, but your profile averages ${profileAvgLen}. Try shorter/longer sentences.`);
  }

  // Check for banned phrases
  const banned = ["excited to announce", "humbled", "thrilled to share", "game-changer", "synergy", "leverage", "at the end of the day", "in today's landscape"];
  for (const phrase of banned) {
    if (draft.toLowerCase().includes(phrase)) {
      flags.push(`"${phrase}" — this phrase doesn't sound like you.`);
    }
  }

  // Check formality mismatch
  const formality = formalityScore(draft);
  if (formality > 70) {
    flags.push("This reads too formal. Your style is more direct and conversational.");
  } else if (formality < 25) {
    flags.push("This might be too casual — try adding more concrete detail.");
  }

  // Compute score based on flags
  const baseScore = 10;
  const penalty = Math.min(flags.length * 1.5, 8);
  const score = parseFloat(Math.max(baseScore - penalty, 2).toFixed(1));

  return { score, flags };
}

// ─── Metric bar ─────────────────────────────────────────────────────────────

function MetricBar({ label, value, min = 0, max = 100, unit = "" }: { label: string; value: number; min?: number; max?: number; unit?: string }) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "#8B949E", minWidth: 100, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", backgroundColor: "#F0A500", borderRadius: 3, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#E6EDF3", minWidth: 30, textAlign: "right" }}>{value}{unit}</span>
    </div>
  );
}

// ─── Voice Profile Page ─────────────────────────────────────────────────────

export function VoiceProfileSection({ onBack }: { onBack: () => void }) {
  const [rawPosts, setRawPosts] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState<VoiceProfileRead | null>(null);
  const [profileText, setProfileText] = useState("");
  const [sentenceLength, setSentenceLength] = useState(0);
  const [density, setDensity] = useState(0);
  const [richness, setRichness] = useState(0);
  const [formality, setFormality] = useState(0);
  const [overused, setOverused] = useState<string[]>([]);
  const [neverUsed, setNeverUsed] = useState<string[]>([]);

  // Voice check state
  const [checkDraft, setCheckDraft] = useState("");
  const [checkResult, setCheckResult] = useState<{ score: number; flags: string[] } | null>(null);

  const handleAnalyze = async () => {
    if (!rawPosts.trim()) return;
    setAnalyzing(true);
    setCheckResult(null);
    try {
      const result = await createVoiceProfile({ raw_posts: rawPosts });
      setProfile(result);
      setProfileText(result.body);
      setSentenceLength(avgSentenceLength(rawPosts));
      setDensity(paragraphDensity(rawPosts));
      setRichness(vocabRichness(rawPosts));
      setFormality(formalityScore(rawPosts));
      setOverused(overusedPhrases(rawPosts));
      setNeverUsed(neverUsedPhrases(rawPosts));
    } catch {
      // Fallback: compute metrics even if API fails
      setProfile(null);
      setProfileText("Using local analysis (API unavailable).");
      setSentenceLength(avgSentenceLength(rawPosts));
      setDensity(paragraphDensity(rawPosts));
      setRichness(vocabRichness(rawPosts));
      setFormality(formalityScore(rawPosts));
      setOverused(overusedPhrases(rawPosts));
      setNeverUsed(neverUsedPhrases(rawPosts));
    }
    setAnalyzing(false);
  };

  const handleVoiceCheck = () => {
    if (!checkDraft.trim() || !profileText) return;
    const result = voiceMatchScore(checkDraft, profileText);
    setCheckResult(result);
  };

  const hasProfile = sentenceLength > 0 || overused.length > 0;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ── Section 1: Train your voice ─────────────────────────────── */}
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", marginBottom: 4 }}>Train Your Voice</div>
        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#8B949E", marginBottom: 14 }}>Paste 5+ past posts (LinkedIn, X, or Reddit) so Byline learns your writing style.</div>
        <div style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea
            value={rawPosts}
            onChange={(e) => setRawPosts(e.target.value)}
            placeholder="Paste your posts here...\n\nPro tip: Include a mix of platforms for best results."
            rows={6}
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12, lineHeight: 1.65, resize: "vertical" }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58" }}>{rawPosts.split(/\n\s*\n/).filter(Boolean).length} posts detected</span>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !rawPosts.trim()}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", backgroundColor: !rawPosts.trim() ? "rgba(240,165,0,0.3)" : "#F0A500", border: "none", borderRadius: 5, cursor: !rawPosts.trim() ? "default" : "pointer", color: "#0D1117", fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 500 }}
            >
              {analyzing ? <IconLoader2 size={13} className="byline-spin" /> : <IconMicrophone size={13} />}
              {analyzing ? "Analyzing..." : "Analyze Posts"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Your voice fingerprint ───────────────────────── */}
      {hasProfile && (
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", marginBottom: 14 }}>Your Voice Fingerprint</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Profile text */}
            {profile && (
              <div style={{ padding: "12px 14px", backgroundColor: "rgba(240,165,0,0.04)", border: "0.5px solid rgba(240,165,0,0.1)", borderRadius: 6 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#F0A500", marginBottom: 4, letterSpacing: "0.06em" }}>Profile v{profile.version}</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#E6EDF3", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{profile.body}</div>
              </div>
            )}

            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", letterSpacing: "0.06em", textTransform: "uppercase" }}>Sentence Structure</div>
                <MetricBar label="Avg Length" value={sentenceLength} min={5} max={35} unit=" words" />
                <MetricBar label="Para Density" value={density} min={10} max={100} unit=" words" />
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", letterSpacing: "0.06em", textTransform: "uppercase" }}>Style Metrics</div>
                <MetricBar label="Vocab Richness" value={richness} min={20} max={70} unit="%" />
                <MetricBar label="Formality" value={formality} min={0} max={100} unit="%" />
              </div>
            </div>

            {/* Phrases */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 14 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#F85149", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Phrases You Overuse</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {overused.length === 0 && <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "#484F58" }}>None detected</span>}
                  {overused.map((p) => (
                    <span key={p} style={{ padding: "2px 6px", borderRadius: 3, backgroundColor: "rgba(248,81,73,0.1)", border: "0.5px solid rgba(248,81,73,0.2)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#F85149" }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 14 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#3FB950", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Phrases You Never Use</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {neverUsed.length === 0 && <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "#484F58" }}>All key terms present</span>}
                  {neverUsed.map((p) => (
                    <span key={p} style={{ padding: "2px 6px", borderRadius: 3, backgroundColor: "rgba(63,185,80,0.1)", border: "0.5px solid rgba(63,185,80,0.2)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#3FB950" }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Voice check ──────────────────────────────────── */}
      {hasProfile && (
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, color: "#E6EDF3", letterSpacing: "-0.03em", marginBottom: 14 }}>Voice Check</div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea
              value={checkDraft}
              onChange={(e) => setCheckDraft(e.target.value)}
              placeholder="Paste a draft here to check if it sounds like you..."
              rows={4}
              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 5, outline: "none", color: "#E6EDF3", fontFamily: "'IBM Plex Sans'", fontSize: 12, lineHeight: 1.65, resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleVoiceCheck}
                disabled={!checkDraft.trim()}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", backgroundColor: !checkDraft.trim() ? "rgba(240,165,0,0.3)" : "#F0A500", border: "none", borderRadius: 5, cursor: !checkDraft.trim() ? "default" : "pointer", color: "#0D1117", fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 500 }}
              >
                <IconCheck size={13} /> Check Draft
              </button>
            </div>

            {checkResult && (
              <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Score */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 6 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: checkResult.score >= 8 ? "rgba(63,185,80,0.15)" : checkResult.score >= 6 ? "rgba(240,165,0,0.15)" : "rgba(248,81,73,0.15)", border: "1px solid " + (checkResult.score >= 8 ? "rgba(63,185,80,0.3)" : checkResult.score >= 6 ? "rgba(240,165,0,0.3)" : "rgba(248,81,73,0.3)") }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: checkResult.score >= 8 ? "#3FB950" : checkResult.score >= 6 ? "#F0A500" : "#F85149" }}>{checkResult.score}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 500, color: checkResult.score >= 8 ? "#3FB950" : checkResult.score >= 6 ? "#F0A500" : "#F85149" }}>
                      {checkResult.score >= 8 ? "Strong voice match" : checkResult.score >= 6 ? "Needs adjustment" : "Doesn't sound like you"}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "#8B949E" }}>Voice match score</div>
                  </div>
                </div>

                {/* Flags */}
                {checkResult.flags.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#484F58", letterSpacing: "0.06em", textTransform: "uppercase" }}>Flags</div>
                    {checkResult.flags.map((flag, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "6px 10px", borderRadius: 4, backgroundColor: "rgba(248,81,73,0.06)", border: "0.5px solid rgba(248,81,73,0.1)" }}>
                        <IconAlertTriangle size={12} color="#F85149" stroke={1.5} style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: "#E6EDF3", lineHeight: 1.4 }}>{flag}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
