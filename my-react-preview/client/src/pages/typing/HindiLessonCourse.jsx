import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import {
  HINDI_MODULES, TIERS, FINGER_COLORS, FINGER_LABELS, KEYBOARD_LAYOUT,
  UNLOCK_THRESHOLD, flattenLessons, renderHindi,
} from "./hindiLessonData";

/* ─── helpers ─────────────────────────────────────────────────────── */
const STORAGE_KEY = "speedmock_typing_progress_hi";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}
function calcWPM(correctChars, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((correctChars / 5) / (elapsedSeconds / 60));
}
function calcAcc(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

/* ─── AD SLOTS ─────────────────────────────────────────────────────── */
function AdSlot({ label, style }) {
  const navigate = useNavigate();
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8,
      background:"var(--g8)", border:"1px dashed var(--g6)", borderRadius:12,
      color:"var(--g4)", fontSize:"0.7rem", fontWeight:600, letterSpacing:1,
      textTransform:"uppercase", ...style,
    }}>
      <span>{label}</span>
      <button
        onClick={() => navigate("/subscription")}
        style={{
          background:"none", border:"1px solid var(--hinb)55", borderRadius:50,
          padding:"4px 12px", color:"var(--hinb)", fontSize:"0.6rem", fontWeight:700,
          textTransform:"none", letterSpacing:"normal", cursor:"pointer",
        }}
      >
        ⭐ Premium से विज्ञापन हटाएं
      </button>
    </div>
  );
}

// Shown instead of ads for subscribed users — a real, useful screen
// rather than empty space where an ad would otherwise sit.
function PremiumSidePanel({ doneCount, totalLessons, bestWpm, bestAccuracy }) {
  return (
    <div style={{
      background:"linear-gradient(160deg,var(--g8),var(--g75))", border:"1px solid var(--hinb)55",
      borderRadius:14, padding:"18px 16px", display:"flex", flexDirection:"column", gap:14,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:"1.1rem" }}>⭐</span>
        <span style={{ fontSize:"0.78rem", fontWeight:800, color:"var(--hinb)", letterSpacing:0.5 }}>प्रीमियम सक्रिय</span>
      </div>
      <div style={{ fontSize:"0.68rem", color:"var(--g4)", lineHeight:1.6 }}>
        कोई विज्ञापन नहीं, और हर lesson unlocked है — जो चाहें वह पहले practice करें।
      </div>
      <div style={{ height:1, background:"var(--g6)" }} />
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:"0.62rem", color:"var(--g4)", textTransform:"uppercase", letterSpacing:0.5 }}>Lessons Done</span>
          <span style={{ fontSize:"0.68rem", fontWeight:700, color:"var(--w)" }}>{doneCount}/{totalLessons}</span>
        </div>
        <div style={{ height:4, background:"var(--g7)", borderRadius:50, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${totalLessons ? (doneCount/totalLessons)*100 : 0}%`, background:"linear-gradient(90deg,var(--hind),var(--hinb))" }} />
        </div>
      </div>
      {bestWpm != null && (
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1, textAlign:"center", background:"var(--g8)", borderRadius:10, padding:"8px 4px" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", color:"var(--hinb)" }}>{bestWpm}</div>
            <div style={{ fontSize:"0.56rem", color:"var(--g4)", textTransform:"uppercase" }}>Best WPM</div>
          </div>
          <div style={{ flex:1, textAlign:"center", background:"var(--g8)", borderRadius:10, padding:"8px 4px" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", color:"#22c55e" }}>{bestAccuracy}%</div>
            <div style={{ fontSize:"0.56rem", color:"var(--g4)", textTransform:"uppercase" }}>Best Acc</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PERMANENT KEYBOARD REFERENCE (always visible, not tied to a drill) ─
   Full key→character chart for the active layout, like the reference
   chart on kbdlayout.info — every key labelled with what it produces,
   colour-coded by finger, visible any time (not just while typing). */
function FullKeyboardReference({ layout, collapsible = false }) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <div style={{ background:"var(--g8)", border:"1.5px solid var(--g6)", borderRadius:16, overflow:"hidden" }}>
      <div
        onClick={() => collapsible && setOpen(o => !o)}
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 16px", cursor: collapsible ? "pointer" : "default",
          borderBottom: open ? "1px solid var(--g6)" : "none",
        }}
      >
        <span style={{ fontSize:"0.82rem", fontWeight:700, color:"var(--w)" }}>
          ⌨️ पूरा कीबोर्ड गाइड — {layout === "mangal" ? "Mangal / Inscript" : "Kruti Dev"}
        </span>
        {collapsible && <span style={{ color:"var(--g4)", fontSize:"0.75rem" }}>{open ? "▲" : "▼"}</span>}
      </div>
      {open && (
        <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:"clamp(3px,1vw,6px)", alignItems:"center", width:"100%" }}>
          {KEYBOARD_LAYOUT.rows.map((row, ri) => (
            <div key={ri} style={{ display:"flex", gap:"clamp(2px,0.7vw,6px)" }}>
              {row.map(k => {
                const finger = KEYBOARD_LAYOUT.keyFinger[k] || "left_index";
                const color = FINGER_COLORS[finger];
                const hindiChar = renderHindi(k, layout);
                return (
                  <div key={k} title={FINGER_LABELS[finger]} style={{
                    width:"clamp(19px,6vw,46px)", height:"clamp(19px,6vw,46px)", borderRadius:"clamp(4px,1.2vw,9px)", display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center", gap:2, flexShrink:0,
                    background: color+"16", border:`1px solid ${color}44`,
                  }}>
                    <span style={{ fontSize:"clamp(0.6rem,2vw,1.1rem)", fontWeight:700, color, lineHeight:1 }}>{hindiChar}</span>
                    <span style={{ fontSize:"clamp(0.35rem,1vw,0.55rem)", fontWeight:600, fontFamily:"'Outfit',sans-serif", color:"var(--g4)", lineHeight:1 }}>{k}</span>
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginTop:8 }}>
            {Object.entries(FINGER_LABELS).map(([f, label]) => (
              <span key={f} style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.62rem", color:"var(--g4)" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:FINGER_COLORS[f], display:"inline-block" }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TYPING GUIDE: keyboard + hand/finger indicator ──────────────── */
function TypingGuide({ nextKey, lessonKeys, layout }) {
  const mainFinger = nextKey ? KEYBOARD_LAYOUT.keyFinger[nextKey] || null : null;

  const LEFT_FINGERS  = [
    { f:"left_pinky",  len:50, angle:-18 },
    { f:"left_ring",   len:62, angle:-7  },
    { f:"left_middle", len:68, angle:3   },
    { f:"left_index",  len:60, angle:13  },
  ];
  const RIGHT_FINGERS = [
    { f:"right_index",  len:60, angle:-13 },
    { f:"right_middle", len:68, angle:-3  },
    { f:"right_ring",   len:62, angle:7   },
    { f:"right_pinky",  len:50, angle:18  },
  ];
  const SKIN = "224,172,133";

  const renderHand = (fingers, thumbSide) => (
    <div style={{ position:"relative", width:150, height:128 }}>
      <div style={{
        position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:104, height:58, borderRadius:"46% 46% 34% 34%",
        background:`linear-gradient(160deg, rgba(${SKIN},0.5), rgba(${SKIN},0.32))`,
        border:`1px solid rgba(${SKIN},0.6)`, boxShadow:"0 6px 14px rgba(0,0,0,0.25)",
      }} />
      <div style={{
        position:"absolute", bottom:8, [thumbSide]:-2,
        width:24, height:42, borderRadius:50,
        transformOrigin:"bottom center", transform:`rotate(${thumbSide==="left"?-48:48}deg)`,
        background:`rgba(${SKIN},0.4)`, border:`1px solid rgba(${SKIN},0.55)`,
        transition:"all 0.18s ease",
      }} />
      <div style={{ position:"absolute", bottom:34, left:0, right:0, display:"flex", justifyContent:"center", gap:5 }}>
        {fingers.map(({ f, len, angle }) => {
          const active = f === mainFinger;
          const color = FINGER_COLORS[f];
          const liftedLen = active ? len + 10 : len;
          return (
            <div key={f} title={FINGER_LABELS[f]} style={{
              width:19, height: liftedLen, borderRadius:50,
              transformOrigin:"bottom center",
              transform:`rotate(${angle}deg) translateY(${active ? -6 : 0}px)`,
              background: active
                ? `linear-gradient(180deg, ${color}, ${color}cc)`
                : `linear-gradient(180deg, rgba(${SKIN},0.55), rgba(${SKIN},0.32))`,
              border: active ? `1.5px solid ${color}` : `1px solid rgba(${SKIN},0.6)`,
              boxShadow: active ? `0 0 16px ${color}cc` : "0 2px 4px rgba(0,0,0,0.15)",
              transition:"all 0.18s ease",
              position:"relative",
            }}>
              <div style={{
                position:"absolute", top:3, left:"50%", transform:"translateX(-50%)",
                width:9, height:9, borderRadius:"50%",
                background: active ? "rgba(255,255,255,0.55)" : `rgba(${SKIN},0.7)`,
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ background:"var(--g8)", border:"1.5px solid var(--g6)", borderRadius:16, padding:"20px 22px", marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:10, marginBottom:8 }}>
        {renderHand(LEFT_FINGERS, "right")}
        {renderHand(RIGHT_FINGERS, "left")}
      </div>
      <div style={{ textAlign:"center", marginBottom:16, minHeight:22 }}>
        {mainFinger && (
          <span style={{ fontSize:"0.86rem", fontWeight:700, color: FINGER_COLORS[mainFinger] }}>
            "{renderHindi(nextKey, layout)}" के लिए — {FINGER_LABELS[mainFinger]} ({nextKey} कुंजी)
          </span>
        )}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"clamp(3px,1vw,5px)", alignItems:"center", width:"100%" }}>
        {KEYBOARD_LAYOUT.rows.map((row, ri) => (
          <div key={ri} style={{ display:"flex", gap:"clamp(2px,0.7vw,5px)" }}>
            {row.map(k => {
              const finger = KEYBOARD_LAYOUT.keyFinger[k] || "left_index";
              const color = FINGER_COLORS[finger];
              const isNext = k === nextKey;
              const inLesson = lessonKeys.includes(k);
              const hindiChar = renderHindi(k, layout);
              return (
                <div key={k} style={{
                  width:"clamp(19px,6vw,44px)", height:"clamp(19px,6vw,44px)", borderRadius:"clamp(4px,1.1vw,8px)", display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", gap:1, flexShrink:0,
                  background: isNext ? color : inLesson ? color+"33" : color+"14",
                  color: isNext ? "#fff" : color,
                  border: isNext ? `1.5px solid ${color}` : `1px solid ${color}22`,
                  boxShadow: isNext ? `0 0 11px ${color}bb` : "none",
                  transition:"all 0.15s",
                }}>
                  <span style={{ fontSize:"clamp(0.55rem,1.9vw,1.05rem)", fontWeight:700, lineHeight:1 }}>{hindiChar}</span>
                  <span style={{ fontSize:"clamp(0.32rem,0.95vw,0.52rem)", fontWeight:600, fontFamily:"'Outfit',sans-serif", opacity:0.7, lineHeight:1 }}>{k}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── DRILL TYPING ENGINE ──────────────────────────────────────────── */
const DRILL_WINDOW_WORDS = 14;

function DrillRunner({ drill, layout, moduleColor, lessonKeys, onComplete, onFirstKeystroke }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const keysStr = drill.keys;                       // physical keys (e.g. "AAA SSS")
  const content = renderHindi(keysStr, layout);      // rendered Devanagari, same length
  const startedRef = useRef(false);

  useEffect(() => { setInput(""); startedRef.current = false; setTimeout(() => inputRef.current?.focus(), 60); }, [drill, layout]);

  const tokens = useMemo(() => {
    const re = /\S+\s*/g;
    const out = [];
    let m;
    while ((m = re.exec(content)) !== null) out.push({ text: m[0], start: m.index });
    return out;
  }, [content]);

  const currentWordIdx = useMemo(() => {
    for (let i = 0; i < tokens.length; i++) {
      if (input.length < tokens[i].start + tokens[i].text.length) return i;
    }
    return Math.max(0, tokens.length - 1);
  }, [tokens, input.length]);

  // Standard onChange diffing instead of raw keydown interception — e.key is
  // unreliable across browsers/mobile keyboards ("Unidentified" etc). Here we
  // just let the browser insert whatever it wants, then remap the newly-typed
  // tail through our own key→Devanagari table and overwrite the field with
  // the mapped result. Backspace/shrinking is handled by just accepting the
  // shorter value directly (it's already valid mapped text).
  const handleChange = (e) => {
    const raw = e.target.value;

    if (raw.length > 0 && !startedRef.current) { startedRef.current = true; onFirstKeystroke?.(); }

    if (raw.length <= input.length) {
      // deletion (backspace, select+delete, etc.) — already-mapped prefix
      setInput(raw);
      return;
    }

    // one or more new characters appended at the end — map only the new tail
    const typedTail = raw.slice(input.length);
    const mappedTail = renderHindi(typedTail, layout);
    let next = input + mappedTail;
    if (next.length > content.length) next = next.slice(0, content.length);

    setInput(next);

    if (next.length === content.length) {
      let ok = 0;
      for (let i = 0; i < next.length; i++) if (next[i] === content[i]) ok++;
      onComplete({ ok, total: next.length });
    }
  };

  const nextKey = keysStr[input.length] === " " ? null : (keysStr[input.length] || "").toUpperCase();

  // Treadmill: only render from the current word onward — completed
  // words physically leave the DOM instead of requiring the user to scroll.
  const visibleTokens = tokens.slice(currentWordIdx, currentWordIdx + DRILL_WINDOW_WORDS);
  const rendered = visibleTokens.map(tok => (
    <span key={tok.start} style={{ display:"inline" }}>
      {tok.text.split("").map((ch, ci) => {
        const i = tok.start + ci;
        let color = "var(--g4)", bg = "transparent";
        if (i < input.length) { color = input[i] === ch ? "#22c55e" : "#fff"; bg = input[i] === ch ? "transparent" : "rgba(239,68,68,0.3)"; }
        const cursor = i === input.length;
        return (
          <span key={i} style={{
            color, background: bg,
            borderBottom: cursor ? `2px solid ${moduleColor}` : "none",
            fontSize:"1.6rem", lineHeight:2.2,
          }}>{ch}</span>
        );
      })}
    </span>
  ));

  const progress = content.length ? Math.round((input.length / content.length) * 100) : 0;

  return (
    <div>
      <TypingGuide nextKey={nextKey} lessonKeys={lessonKeys} layout={layout} />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontSize:"0.6rem", fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", color: moduleColor, background: moduleColor+"18", border:`1px solid ${moduleColor}33`, borderRadius:50, padding:"2px 10px" }}>
          {drill.label}
        </span>
        <div style={{ flex:1, height:4, background:"var(--g7)", borderRadius:50, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${moduleColor}88,${moduleColor})`, transition:"width 0.15s" }} />
        </div>
      </div>
      <div style={{ background:"var(--g8)", border:"1.5px solid var(--g6)", borderRadius:14, padding:"22px 24px", marginBottom:14, minHeight:"6.6em", overflow:"hidden" }}>
        <div style={{ lineHeight:2.2, wordBreak:"break-word", userSelect:"none" }}>{rendered}</div>
      </div>
      <input
        ref={inputRef} type="text" value={input} onChange={handleChange}
        inputMode="text" autoCorrect="off" autoCapitalize="off" autoComplete="off" spellCheck={false}
        placeholder="यहाँ टाइप करना शुरू करें..."
        style={{ width:"100%", minHeight:64, background:"var(--g8)", border:"1.5px solid var(--g6)", borderRadius:12,
          padding:"16px 18px", color:"#fff", fontSize:"1.3rem", outline:"none" }}
      />
    </div>
  );
}

/* ─── LESSON PLAYER ────────────────────────────────────────────────── */
function LessonPlayer({ lesson, layout, moduleColor, moduleTitle, onFinish }) {
  const [drillIndex, setDrillIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const cumRef = useRef({ ok:0, total:0 });
  const t0Ref = useRef(null);

  useEffect(() => {
    setDrillIndex(0); setFinished(false); setResult(null);
    cumRef.current = { ok:0, total:0 }; t0Ref.current = null;
  }, [lesson]);

  const handleDrillComplete = useCallback(({ ok, total }) => {
    cumRef.current.ok += ok;
    cumRef.current.total += total;
    if (drillIndex < lesson.drills.length - 1) {
      setDrillIndex(i => i + 1);
    } else {
      const elapsed = Math.max((Date.now() - (t0Ref.current || Date.now())) / 1000, 1);
      const wpm = calcWPM(cumRef.current.ok, elapsed);
      const accuracy = calcAcc(cumRef.current.ok, cumRef.current.total);
      const r = { wpm, accuracy };
      setResult(r); setFinished(true);
      onFinish(r);
    }
  }, [drillIndex, lesson, onFinish]);

  const handleFirstKeystroke = useCallback(() => {
    if (!t0Ref.current) t0Ref.current = Date.now();
  }, []);

  const lessonKeys = lesson.newKeys && lesson.newKeys.length
    ? lesson.newKeys
    : (lesson.drills[drillIndex]?.keys.split("").filter((c,i,a)=>c!==" "&&a.indexOf(c)===i) || []);

  const handleRestart = () => {
    setDrillIndex(0); setFinished(false); setResult(null);
    cumRef.current = { ok:0, total:0 }; t0Ref.current = null;
  };

  return (
    <div>
      <div style={{
        display:"flex", alignItems:"center", gap:10, background:"var(--g75)", border:"1px solid var(--g6)",
        borderRadius:12, padding:"9px 14px", marginBottom:14,
      }}>
        <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--w)" }}>{moduleTitle}</span>
        <span style={{ color:"var(--g4)", fontSize:"0.7rem" }}>—</span>
        <span style={{ fontSize:"0.72rem", color:"var(--g4)" }}>
          {finished ? "पूर्ण" : `Screen ${drillIndex+1} of ${lesson.drills.length}`}
        </span>
        <button onClick={handleRestart} title="Restart lesson" style={{
          marginLeft:"auto", background:"none", border:"1px solid var(--g6)", borderRadius:8,
          padding:"4px 10px", color:"var(--g3)", fontSize:"0.7rem", fontWeight:600, cursor:"pointer",
        }}>↺ फिर से</button>
      </div>

      {finished && result ? (
        (() => {
          const pass = result.accuracy >= UNLOCK_THRESHOLD.accuracy;
          return (
            <div style={{ textAlign:"center", padding:"20px 10px" }}>
              <div style={{ fontSize:"2.6rem", marginBottom:8 }}>{pass ? "✅" : "💪"}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.6rem", letterSpacing:2, color: pass ? "#22c55e" : "#ef4444", marginBottom:16 }}>
                {pass ? "Lesson Complete" : "फिर कोशिश करें"}
              </div>
              <div style={{ display:"flex", border:"1px solid var(--g6)", borderRadius:12, overflow:"hidden", marginBottom:16 }}>
                <div style={{ flex:1, padding:"14px 6px", borderRight:"1px solid var(--g6)" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", color: moduleColor }}>{result.wpm}</div>
                  <div style={{ fontSize:"0.6rem", color:"var(--g4)", textTransform:"uppercase", letterSpacing:1 }}>WPM</div>
                </div>
                <div style={{ flex:1, padding:"14px 6px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", color:"#22c55e" }}>{result.accuracy}%</div>
                  <div style={{ fontSize:"0.6rem", color:"var(--g4)", textTransform:"uppercase", letterSpacing:1 }}>Accuracy</div>
                </div>
              </div>
              {!pass && (
                <div style={{ fontSize:"0.76rem", color:"var(--g4)", marginBottom:14, lineHeight:1.6 }}>
                  अगली lesson के लिए {UNLOCK_THRESHOLD.accuracy}%+ accuracy चाहिए।
                </div>
              )}
              <button onClick={handleRestart} style={{
                background: moduleColor+"18", border:`1px solid ${moduleColor}55`, color: moduleColor,
                borderRadius:10, padding:"9px 18px", fontSize:"0.8rem", fontWeight:700, cursor:"pointer",
              }}>↺ फिर कोशिश करें</button>
            </div>
          );
        })()
      ) : (
        <>
          <p style={{ fontSize:"0.85rem", color:"var(--g3)", lineHeight:1.7, marginBottom:14 }}>{lesson.instruction}</p>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {lesson.drills.map((d,i) => (
              <div key={i} style={{ flex:1, height:4, borderRadius:50, background: i < drillIndex ? moduleColor : i === drillIndex ? moduleColor+"55" : "var(--g6)" }} />
            ))}
          </div>
          <DrillRunner key={drillIndex} drill={lesson.drills[drillIndex]} layout={layout} moduleColor={moduleColor} lessonKeys={lessonKeys} onComplete={handleDrillComplete} onFirstKeystroke={handleFirstKeystroke} />
        </>
      )}
    </div>
  );
}

/* ─── LESSON LIST CARD ─────────────────────────────────────────────── */
function LessonCard({ lesson, moduleColor, unlocked, stats, onClick }) {
  const done = !!stats?.completed;
  return (
    <div onClick={() => unlocked && onClick()} style={{
      background:"var(--g8)", border:`1.5px solid var(--g6)`, borderRadius:14, padding:"12px 14px", marginBottom:8,
      cursor: unlocked ? "pointer" : "not-allowed", opacity: unlocked ? 1 : 0.45, transition:"all 0.15s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: stats?.best ? 8 : 0 }}>
        <span style={{ fontSize:"0.9rem" }}>{done ? "✅" : unlocked ? "▶️" : "🔒"}</span>
        <span style={{ fontSize:"0.82rem", fontWeight:700, color:"var(--w)" }}>{lesson.title}</span>
      </div>
      {stats?.best && (
        <div style={{ display:"flex", gap:14, paddingLeft:24 }}>
          <span style={{ fontSize:"0.66rem", color:"var(--g4)" }}>Speed: <b style={{ color:"var(--g2)" }}>{stats.best.wpm} WPM</b></span>
          <span style={{ fontSize:"0.66rem", color:"var(--g4)" }}>Acc: <b style={{ color:"var(--g2)" }}>{stats.best.accuracy}%</b></span>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN COURSE COMPONENT ────────────────────────────────────────── */
export default function HindiLessonCourse({ onBack, layout = "kruti", isSubscribed = false }) {
  const [theme, setTheme] = usePqTheme();
  const [progress, setProgress] = useState(() => loadProgress());
  const flat = useMemo(() => flattenLessons(HINDI_MODULES), []);
  const [activeTier, setActiveTier] = useState("beginner");
  const [activeModuleId, setActiveModuleId] = useState(
    HINDI_MODULES.find(m => m.tier === "beginner")?.id
  );
  const [activeLessonId, setActiveLessonId] = useState(null);

  const completedIds = useMemo(() => Object.keys(progress).filter(id => progress[id]?.completed), [progress]);
  const isUnlocked = useCallback((lessonId) => {
    if (isSubscribed) return true; // premium: jump to any lesson, whenever
    const idx = flat.findIndex(l => l.id === lessonId);
    if (idx <= 0) return true;
    return completedIds.includes(flat[idx-1].id);
  }, [flat, completedIds, isSubscribed]);

  const modulesInTier = HINDI_MODULES.filter(m => m.tier === activeTier);
  const activeModule = HINDI_MODULES.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);

  const handleFinish = (result) => {
    const pass = result.accuracy >= UNLOCK_THRESHOLD.accuracy;
    setProgress(prev => {
      const next = { ...prev, [activeLessonId]: { completed: pass || prev[activeLessonId]?.completed, best: result } };
      saveProgress(next);
      return next;
    });
  };

  const totalLessons = flat.length;
  const doneCount = completedIds.length;

  const bestStats = useMemo(() => {
    const bests = Object.values(progress).map(p => p.best).filter(Boolean);
    if (!bests.length) return { bestWpm: null, bestAccuracy: null };
    return {
      bestWpm: Math.max(...bests.map(b => b.wpm)),
      bestAccuracy: Math.max(...bests.map(b => b.accuracy)),
    };
  }, [progress]);

  const tierDoneCount = (tierId) => {
    const lessons = HINDI_MODULES.filter(m => m.tier === tierId).flatMap(m => m.lessons);
    return { done: lessons.filter(l => completedIds.includes(l.id)).length, total: lessons.length };
  };

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --hin:#ff6f00;--hinb:#ffa726;--hind:#e65100;
      --g9:#0e0e12;--g8:#18181f;--g75:#1e1e28;--g7:#252532;--g6:#32323f;--g4:#7a7a90;--g3:#9a9ab0;--g2:#c8c8d8;--w:#ffffff;
    }
    [data-pqtheme="light"]{--g9:#f4f4f7;--g8:#ffffff;--g75:#eeeef3;--g7:#e8e8ef;--g6:#d8d8e4;--g4:#6b6b80;--g3:#5a5a70;--g2:#2a2a3a;--w:#1a1a2e;--hin:#b45309;--hinb:#d97706;--hind:#92400e;}
    [data-pqtheme="yellow"]{--g9:#f4ecd8;--g8:#ede0c4;--g75:#e8dab8;--g7:#ddd0a8;--g6:#d0c090;--g4:#7a6a50;--g3:#5a4a34;--g2:#3a2e1f;--w:#3a2e1f;--hin:#b45309;--hinb:#d97706;--hind:#92400e;}
    [data-pqtheme="light"] .page,[data-pqtheme="yellow"] .page{background:var(--g9);}
    .pq-theme-toggle{display:flex;align-items:center;gap:3px;background:var(--g8);border:1px solid var(--g6);border-radius:999px;padding:3px;flex-shrink:0}
    .pq-theme-btn{width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;font-family:sans-serif}
    .pq-theme-btn:hover{opacity:.85}
    .pq-theme-btn.active{opacity:1;background:rgba(255,255,255,.1);box-shadow:0 0 0 1px var(--g6)}
    body{background:var(--g9);font-family:'Outfit',sans-serif;}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:var(--hin)44;border-radius:3px}
    .page{min-height:100vh;background:var(--g9);padding-bottom:60px;color:var(--g2);
      background-image:radial-gradient(ellipse 60% 35% at 50% 0%,rgba(255,111,0,0.07) 0%,transparent 55%);}
    .lc-browse-shell{display:grid;grid-template-columns:200px 1fr;gap:18px;padding:0 3%;align-items:start;}
    @media(max-width:800px){.lc-browse-shell{grid-template-columns:1fr;}}
    .lc-tier-row{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
    .lc-tier-btn{flex:1;min-width:150px;text-align:left;padding:12px 14px;border-radius:12px;border:1.5px solid var(--g6);
      background:var(--g8);color:var(--g3);font-family:'Outfit',sans-serif;font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.15s;}
    .lc-tier-btn--active{border-color:var(--hinb);color:var(--hinb);background:rgba(255,111,0,0.08);}
    .lc-module-card{background:var(--g8);border:1px solid var(--g6);border-radius:16px;margin-bottom:14px;overflow:hidden;}
    .lc-module-head{padding:14px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;}
    .lc-lessons-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;padding:0 14px 14px;}
    .lc-play-topbar{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:12px;padding:12px 4%;
      background:rgba(14,14,18,0.94);backdrop-filter:blur(10px);border-bottom:1px solid var(--g6);}
    [data-pqtheme="light"] .lc-play-topbar{background:rgba(245,245,248,0.94);}
    .lc-play-shell{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:20px 2%;align-items:start;}
    @media(max-width:900px){.lc-play-shell{grid-template-columns:1fr;}}
  `;

  if (activeLesson) {
    const idx = flat.findIndex(l => l.id === activeLesson.id);
    return (
      <>
        <style>{sharedStyles}</style>
        <div className="page" data-pqtheme={theme}>
          <div className="lc-play-topbar">
            <button onClick={() => setActiveLessonId(null)} style={{ background:"none", border:"none", color:"var(--g4)", fontFamily:"'Outfit',sans-serif", fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>
              ← सभी Lessons
            </button>
            <span style={{ color:"var(--g6)" }}>|</span>
            <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--w)" }}>{activeModule.title}</span>
            <span style={{ fontSize:"0.72rem", color:"var(--g4)" }}>Lesson {idx+1} of {flat.length} · {layout==="mangal"?"Mangal":"Kruti Dev"}</span>
            <div style={{ marginLeft:"auto" }}>
              <PqThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
          <div className="lc-play-shell">
            <div style={{ position:"sticky", top:70, display:"flex", flexDirection:"column", gap:12 }}>
              {isSubscribed ? (
                <PremiumSidePanel doneCount={doneCount} totalLessons={totalLessons} bestWpm={bestStats.bestWpm} bestAccuracy={bestStats.bestAccuracy} />
              ) : (
                <>
                  <AdSlot label="Ad Space" style={{ height:250 }} />
                  <AdSlot label="Ad Space" style={{ height:400 }} />
                </>
              )}
            </div>
            <div style={{ maxWidth:1040, width:"100%", margin:"0 auto" }}>
              <div style={{ marginBottom:16 }}>
                <FullKeyboardReference layout={layout} collapsible={true} />
              </div>
              <LessonPlayer key={activeLesson.id} lesson={activeLesson} layout={layout} moduleColor={activeModule.color} moduleTitle={activeLesson.title} onFinish={handleFinish} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{sharedStyles}</style>
      <div className="page" data-pqtheme={theme}>
        <div style={{ padding:"16px 3% 0" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--g4)", fontFamily:"'Outfit',sans-serif", fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>
            ← Back to Hindi Typing
          </button>
        </div>

        <div style={{ padding:"18px 3% 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
            <div>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2.2rem,5vw,3.6rem)", letterSpacing:3, color:"var(--w)", lineHeight:1, marginBottom:8 }}>
                Practice Course
              </h1>
              <p style={{ fontSize:"0.84rem", color:"var(--g4)", maxWidth:480, lineHeight:1.6 }}>
                एक-एक कुंजी करके सही उंगली सीखें — {layout==="mangal"?"Mangal / Inscript":"Kruti Dev"} layout में, हर keystroke पर सही उंगली दिखाई जाएगी।
              </p>
            </div>
            <PqThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <div style={{ marginTop:20, maxWidth:520 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:"0.64rem", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--g4)" }}>Overall Progress</span>
              <span style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--hinb)" }}>{doneCount}/{totalLessons}</span>
            </div>
            <div style={{ height:5, background:"var(--g7)", borderRadius:50, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(doneCount/totalLessons)*100}%`, background:"linear-gradient(90deg,var(--hind),var(--hinb))", transition:"width 0.4s" }} />
            </div>
          </div>
          <div style={{ marginTop:20 }}>
            <FullKeyboardReference layout={layout} collapsible={true} />
          </div>
        </div>

        <div className="lc-browse-shell">
          <div style={{ position:"sticky", top:16, display:"flex", flexDirection:"column", gap:12 }}>
            {isSubscribed ? (
              <PremiumSidePanel doneCount={doneCount} totalLessons={totalLessons} bestWpm={bestStats.bestWpm} bestAccuracy={bestStats.bestAccuracy} />
            ) : (
              <>
                <AdSlot label="Ad Space" style={{ height:250 }} />
                <AdSlot label="Ad Space" style={{ height:400 }} />
              </>
            )}
          </div>

          <div>
            <div className="lc-tier-row">
              {TIERS.map(t => {
                const c = tierDoneCount(t.id);
                const isActiveTier = t.id === activeTier;
                return (
                  <button
                    key={t.id}
                    className={`lc-tier-btn${isActiveTier ? " lc-tier-btn--active" : ""}`}
                    onClick={() => {
                      setActiveTier(t.id);
                      const firstMod = HINDI_MODULES.find(m => m.tier === t.id);
                      setActiveModuleId(firstMod?.id);
                    }}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span>{t.label}</span>
                      <span style={{ fontSize:"0.66rem", color:"var(--g4)", fontWeight:600 }}>{c.done}/{c.total}</span>
                    </div>
                    <div style={{ fontSize:"0.66rem", color:"var(--g4)", fontWeight:500, marginTop:2 }}>{t.blurb}</div>
                  </button>
                );
              })}
            </div>

            {modulesInTier.map(mod => {
              const isOpen = mod.id === activeModuleId;
              const modDone = mod.lessons.filter(l => completedIds.includes(l.id)).length;
              return (
                <div className="lc-module-card" key={mod.id}>
                  <div className="lc-module-head" onClick={() => setActiveModuleId(isOpen ? null : mod.id)}>
                    <div style={{ width:36, height:36, borderRadius:10, background:mod.color+"18", border:`1px solid ${mod.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.05rem", flexShrink:0 }}>{mod.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:1.5, color:"var(--w)" }}>{mod.title}</div>
                      <div style={{ fontSize:"0.66rem", color:"var(--g4)" }}>{modDone}/{mod.lessons.length} lessons</div>
                    </div>
                    <span style={{ color:"var(--g4)", fontSize:"0.8rem" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                  {isOpen && (
                    <div className="lc-lessons-grid">
                      {mod.lessons.map(l => (
                        <LessonCard
                          key={l.id}
                          lesson={l}
                          moduleColor={mod.color}
                          unlocked={isUnlocked(l.id)}
                          stats={progress[l.id]}
                          onClick={() => setActiveLessonId(l.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
