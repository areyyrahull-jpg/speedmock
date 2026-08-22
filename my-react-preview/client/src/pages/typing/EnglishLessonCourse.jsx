import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import {
  ENGLISH_MODULES, TIERS, FINGER_COLORS, FINGER_LABELS, KEYBOARD_LAYOUT,
  UNLOCK_THRESHOLD, flattenLessons,
} from "./englishLessonData";

/* ─── helpers ─────────────────────────────────────────────────────── */
const STORAGE_KEY = "speedmock_typing_progress_en";

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
const OPPOSITE_SHIFT = { left: "right_pinky", right: "left_pinky" };
function fingerSideOf(finger) {
  return finger && finger.startsWith("left") ? "left" : "right";
}

/* ─── AD SLOTS (placeholders — wire up your ad provider here) ─────── */
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
          background:"none", border:"1px solid var(--fb)55", borderRadius:50,
          padding:"4px 12px", color:"var(--fb)", fontSize:"0.6rem", fontWeight:700,
          textTransform:"none", letterSpacing:"normal", cursor:"pointer",
        }}
      >
        ⭐ Remove ads with Premium
      </button>
    </div>
  );
}

// Shown instead of ads for subscribed users — a real, useful screen
// rather than empty space where an ad would otherwise sit.
function PremiumSidePanel({ doneCount, totalLessons, bestWpm, bestAccuracy }) {
  return (
    <div style={{
      background:"linear-gradient(160deg,var(--g8),var(--g75))", border:"1px solid var(--fb)55",
      borderRadius:14, padding:"18px 16px", display:"flex", flexDirection:"column", gap:14,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:"1.1rem" }}>⭐</span>
        <span style={{ fontSize:"0.78rem", fontWeight:800, color:"var(--fb)", letterSpacing:0.5 }}>Premium Active</span>
      </div>
      <div style={{ fontSize:"0.68rem", color:"var(--g4)", lineHeight:1.6 }}>
        No ads, and every lesson is unlocked — jump to whatever you want to practice.
      </div>
      <div style={{ height:1, background:"var(--g6)" }} />
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:"0.62rem", color:"var(--g4)", textTransform:"uppercase", letterSpacing:0.5 }}>Lessons Done</span>
          <span style={{ fontSize:"0.68rem", fontWeight:700, color:"var(--w)" }}>{doneCount}/{totalLessons}</span>
        </div>
        <div style={{ height:4, background:"var(--g7)", borderRadius:50, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${totalLessons ? (doneCount/totalLessons)*100 : 0}%`, background:"linear-gradient(90deg,var(--fd),var(--fb))" }} />
        </div>
      </div>
      {bestWpm != null && (
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1, textAlign:"center", background:"var(--g8)", borderRadius:10, padding:"8px 4px" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", color:"var(--fb)" }}>{bestWpm}</div>
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

/* ─── TYPING GUIDE: keyboard + hand/finger indicator, per-keystroke ── */
function TypingGuide({ nextChar, lessonKeys }) {
  const lower = (nextChar || "").toLowerCase();
  const isUpper = nextChar && nextChar !== lower && /[a-z]/i.test(nextChar);
  const mainFinger = KEYBOARD_LAYOUT.keyFinger[lower] || null;
  const shiftFinger = isUpper && mainFinger ? OPPOSITE_SHIFT[fingerSideOf(mainFinger)] : null;

  // order = visual left-to-right for each hand; angle fans fingers outward from the palm
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
  const SKIN = "224,172,133"; // warm translucent base tone for inactive fingers/palm

  const renderHand = (fingers, thumbSide) => (
    <div style={{ position:"relative", width:150, height:128 }}>
      {/* palm */}
      <div style={{
        position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:104, height:58, borderRadius:"46% 46% 34% 34%",
        background:`linear-gradient(160deg, rgba(${SKIN},0.5), rgba(${SKIN},0.32))`,
        border:`1px solid rgba(${SKIN},0.6)`, boxShadow:"0 6px 14px rgba(0,0,0,0.25)",
      }} />
      {/* thumb */}
      <div style={{
        position:"absolute", bottom:8, [thumbSide]:-2,
        width:24, height:42, borderRadius:50,
        transformOrigin:"bottom center", transform:`rotate(${thumbSide==="left"?-48:48}deg)`,
        background: mainFinger==="thumbs" ? `linear-gradient(180deg, ${FINGER_COLORS.thumbs}, ${FINGER_COLORS.thumbs}dd)` : `rgba(${SKIN},0.4)`,
        border: mainFinger==="thumbs" ? `1.5px solid ${FINGER_COLORS.thumbs}` : `1px solid rgba(${SKIN},0.55)`,
        boxShadow: mainFinger==="thumbs" ? `0 0 14px ${FINGER_COLORS.thumbs}bb` : "none",
        transition:"all 0.18s ease",
      }} />
      {/* fingers */}
      <div style={{ position:"absolute", bottom:34, left:0, right:0, display:"flex", justifyContent:"center", gap:5 }}>
        {fingers.map(({ f, len, angle }) => {
          const active = f === mainFinger || f === shiftFinger;
          const isShiftFinger = f === shiftFinger;
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
              boxShadow: active ? `0 0 16px ${color}${isShiftFinger?"88":"cc"}` : "0 2px 4px rgba(0,0,0,0.15)",
              transition:"all 0.18s ease",
              position:"relative",
            }}>
              {/* nail highlight */}
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
            Use: {FINGER_LABELS[mainFinger]}{shiftFinger ? ` + ${FINGER_LABELS[shiftFinger]} (Shift)` : ""}
          </span>
        )}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"clamp(3px,1vw,5px)", alignItems:"center", width:"100%" }}>
        {KEYBOARD_LAYOUT.rows.map((row, ri) => (
          <div key={ri} style={{ display:"flex", gap:"clamp(2px,0.7vw,5px)" }}>
            {row.map(k => {
              const finger = KEYBOARD_LAYOUT.keyFinger[k] || "thumbs";
              const color = FINGER_COLORS[finger];
              const isNext = k === lower;
              const inLesson = lessonKeys.includes(k);
              return (
                <div key={k} style={{
                  width:"clamp(19px,6.2vw,30px)", height:"clamp(19px,6.2vw,30px)", borderRadius:"clamp(4px,1.2vw,7px)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  fontSize:"clamp(0.5rem,1.8vw,0.7rem)", fontWeight:700, fontFamily:"'Outfit',sans-serif", textTransform:"uppercase",
                  background: isNext ? color : inLesson ? color+"33" : color+"14",
                  color: isNext ? "#fff" : color,
                  border: isNext ? `1.5px solid ${color}` : `1px solid ${color}22`,
                  boxShadow: isNext ? `0 0 11px ${color}bb` : "none",
                  transition:"all 0.15s",
                }}>{k === " " ? "" : k}</div>
              );
            })}
          </div>
        ))}
        <div style={{
          width:"min(190px,80%)", height:"clamp(16px,4.5vw,22px)", marginTop:3, borderRadius:6,
          background: lower === " " ? FINGER_COLORS.thumbs : FINGER_COLORS.thumbs+"18",
          border: lower === " " ? `1.5px solid ${FINGER_COLORS.thumbs}` : `1px solid ${FINGER_COLORS.thumbs}33`,
          boxShadow: lower === " " ? `0 0 11px ${FINGER_COLORS.thumbs}bb` : "none",
        }} />
      </div>
    </div>
  );
}

/* ─── DRILL TYPING ENGINE (one drill string within a lesson) ─────── */
const DRILL_WINDOW_WORDS = 14; // how many words stay visible ahead of the cursor

function DrillRunner({ drill, moduleColor, lessonKeys, onComplete, onFirstKeystroke }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const content = drill.content;
  const startedRef = useRef(false);

  useEffect(() => { setInput(""); startedRef.current = false; setTimeout(() => inputRef.current?.focus(), 60); }, [drill]);

  // Tokenize into words (each token keeps its trailing space so natural
  // spacing is preserved) with each token's absolute start index into
  // `content`, so per-character correctness checks still work against
  // the full string regardless of which words are actually rendered.
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

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length > content.length) return;
    if (val.length > 0 && !startedRef.current) { startedRef.current = true; onFirstKeystroke?.(); }
    setInput(val);
    if (val.length === content.length) {
      let ok = 0;
      for (let i = 0; i < val.length; i++) if (val[i] === content[i]) ok++;
      onComplete({ ok, total: val.length });
    }
  };

  const nextChar = content[input.length] || "";

  // Treadmill: only the current word onward is ever rendered — words
  // fully behind the cursor simply aren't in the window, so they
  // physically disappear rather than requiring the user to scroll.
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
            fontFamily:"'Courier Prime',monospace", fontSize:"1.5rem", lineHeight:2.1,
          }}>{ch}</span>
        );
      })}
    </span>
  ));

  const progress = content.length ? Math.round((input.length / content.length) * 100) : 0;

  return (
    <div>
      <TypingGuide nextChar={nextChar} lessonKeys={lessonKeys} />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontSize:"0.6rem", fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", color: moduleColor, background: moduleColor+"18", border:`1px solid ${moduleColor}33`, borderRadius:50, padding:"2px 10px" }}>
          {drill.label}
        </span>
        <div style={{ flex:1, height:4, background:"var(--g7)", borderRadius:50, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${moduleColor}88,${moduleColor})`, transition:"width 0.15s" }} />
        </div>
      </div>
      <div style={{ background:"var(--g8)", border:"1.5px solid var(--g6)", borderRadius:14, padding:"22px 24px", marginBottom:14, minHeight:"6.2em", overflow:"hidden" }}>
        <div style={{ lineHeight:2, wordBreak:"break-word", userSelect:"none" }}>{rendered}</div>
      </div>
      <textarea ref={inputRef} rows={3} value={input} onChange={handleChange}
        spellCheck={false} autoCorrect="off" autoCapitalize="off" autoComplete="off"
        placeholder="Start typing here..."
        style={{ width:"100%", background:"var(--g8)", border:"1.5px solid var(--g6)", borderRadius:12,
          padding:"16px 18px", color:"#fff", fontFamily:"'Courier Prime',monospace", fontSize:"1.3rem",
          resize:"none", outline:"none" }} />
    </div>
  );
}

/* ─── LESSON PLAYER ───────────────────────────────────────────────── */
function LessonPlayer({ lesson, moduleColor, moduleTitle, onFinish }) {
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
    : (lesson.drills[drillIndex]?.content.split("").filter((c,i,a)=>a.indexOf(c)===i) || []);

  const handleRestart = () => {
    setDrillIndex(0); setFinished(false); setResult(null);
    cumRef.current = { ok:0, total:0 }; t0Ref.current = null;
  };

  return (
    <div>
      {/* topbar — mirrors the "Lesson Name - Screen X of N" strip */}
      <div style={{
        display:"flex", alignItems:"center", gap:10, background:"var(--g75)", border:"1px solid var(--g6)",
        borderRadius:12, padding:"9px 14px", marginBottom:14,
      }}>
        <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--w)" }}>{moduleTitle}</span>
        <span style={{ color:"var(--g4)", fontSize:"0.7rem" }}>—</span>
        <span style={{ fontSize:"0.72rem", color:"var(--g4)" }}>
          {finished ? "Complete" : `Screen ${drillIndex+1} of ${lesson.drills.length}`}
        </span>
        <button onClick={handleRestart} title="Restart lesson" style={{
          marginLeft:"auto", background:"none", border:"1px solid var(--g6)", borderRadius:8,
          padding:"4px 10px", color:"var(--g3)", fontSize:"0.7rem", fontWeight:600, cursor:"pointer",
          display:"flex", alignItems:"center", gap:5,
        }}>↺ Restart</button>
      </div>

      {finished && result ? (
        (() => {
          const pass = result.accuracy >= UNLOCK_THRESHOLD.accuracy;
          return (
            <div style={{ textAlign:"center", padding:"20px 10px" }}>
              <div style={{ fontSize:"2.6rem", marginBottom:8 }}>{pass ? "✅" : "💪"}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.6rem", letterSpacing:2, color: pass ? "#22c55e" : "#ef4444", marginBottom:16 }}>
                {pass ? "Lesson Complete" : "Almost There"}
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
                  Aim for {UNLOCK_THRESHOLD.accuracy}%+ accuracy to unlock the next lesson.
                </div>
              )}
              <button onClick={handleRestart} style={{
                background: moduleColor+"18", border:`1px solid ${moduleColor}55`, color: moduleColor,
                borderRadius:10, padding:"9px 18px", fontSize:"0.8rem", fontWeight:700, cursor:"pointer",
              }}>↺ Try Again</button>
            </div>
          );
        })()
      ) : (
        <>
          <p style={{ fontSize:"0.8rem", color:"var(--g3)", lineHeight:1.6, marginBottom:14 }}>{lesson.instruction}</p>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {lesson.drills.map((d,i) => (
              <div key={i} style={{ flex:1, height:4, borderRadius:50, background: i < drillIndex ? moduleColor : i === drillIndex ? moduleColor+"55" : "var(--g6)" }} />
            ))}
          </div>
          <DrillRunner key={drillIndex} drill={lesson.drills[drillIndex]} moduleColor={moduleColor} lessonKeys={lessonKeys} onComplete={handleDrillComplete} onFirstKeystroke={handleFirstKeystroke} />
        </>
      )}
    </div>
  );
}

/* ─── LESSON LIST CARD (typing.com-style stat card) ───────────────── */
function LessonCard({ lesson, moduleColor, unlocked, active, stats, onClick }) {
  const done = !!stats?.completed;
  return (
    <div onClick={() => unlocked && onClick()} style={{
      background: active ? moduleColor+"14" : "var(--g8)",
      border: `1.5px solid ${active ? moduleColor+"66" : "var(--g6)"}`,
      borderRadius:14, padding:"12px 14px", marginBottom:8,
      cursor: unlocked ? "pointer" : "not-allowed", opacity: unlocked ? 1 : 0.45,
      transition:"all 0.15s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: stats?.best ? 8 : 0 }}>
        <span style={{ fontSize:"0.9rem" }}>{done ? "✅" : unlocked ? "▶️" : "🔒"}</span>
        <span style={{ fontSize:"0.82rem", fontWeight:700, color: active ? moduleColor : "var(--w)" }}>{lesson.title}</span>
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

/* ─── MAIN COURSE COMPONENT ───────────────────────────────────────── */
export default function EnglishLessonCourse({ onBack, isSubscribed = false }) {
  const [theme, setTheme] = usePqTheme();
  const [progress, setProgress] = useState(() => loadProgress());
  const flat = useMemo(() => flattenLessons(ENGLISH_MODULES), []);
  const [activeTier, setActiveTier] = useState("beginner");
  const [activeModuleId, setActiveModuleId] = useState(
    ENGLISH_MODULES.find(m => m.tier === "beginner")?.id
  );
  const [activeLessonId, setActiveLessonId] = useState(null);

  const completedIds = useMemo(() => Object.keys(progress).filter(id => progress[id]?.completed), [progress]);

  const isUnlocked = useCallback((lessonId) => {
    if (isSubscribed) return true; // premium: jump to any lesson, whenever
    const idx = flat.findIndex(l => l.id === lessonId);
    if (idx <= 0) return true;
    return completedIds.includes(flat[idx-1].id);
  }, [flat, completedIds, isSubscribed]);

  const modulesInTier = ENGLISH_MODULES.filter(m => m.tier === activeTier);
  const activeModule = ENGLISH_MODULES.find(m => m.id === activeModuleId);
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
    const lessons = ENGLISH_MODULES.filter(m => m.tier === tierId).flatMap(m => m.lessons);
    return { done: lessons.filter(l => completedIds.includes(l.id)).length, total: lessons.length };
  };

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --f:#e91e8c;--fb:#ff3aaa;--fd:#b5005f;
      --g9:#0e0e12;--g8:#18181f;--g75:#1e1e28;--g7:#252532;--g6:#32323f;--g4:#7a7a90;--g3:#9a9ab0;--g2:#c8c8d8;--w:#ffffff;
    }
    [data-pqtheme="light"]{--g9:#f5f5f8;--g8:#ffffff;--g75:#eeeef4;--g7:#e4e4ec;--g6:#d4d4df;--g4:#6b6b80;--g3:#5a5a70;--g2:#1a1a2e;--w:#1a1a2e;--f:#c026d3;--fb:#d946ef;--fd:#9c1abf;}
    [data-pqtheme="yellow"]{--g9:#f4ecd8;--g8:#ede0c4;--g75:#e8dab8;--g7:#ddd0a8;--g6:#d0c090;--g4:#7a6a50;--g3:#5a4a34;--g2:#2e1f0a;--w:#2e1f0a;--f:#b45309;--fb:#d97706;--fd:#92400e;}
    body{background:var(--g9);font-family:'Outfit',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:var(--f)44;border-radius:3px}
    .page{min-height:100vh;background:var(--g9);padding-bottom:60px;color:var(--g2);
      background-image:radial-gradient(ellipse 60% 35% at 50% 0%,rgba(233,30,140,0.07) 0%,transparent 55%);}
    .pq-theme-toggle{display:flex;align-items:center;gap:3px;background:var(--g8);border:1px solid var(--g6);border-radius:999px;padding:3px;flex-shrink:0}
    .pq-theme-btn{width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;font-family:sans-serif}
    .pq-theme-btn:hover{opacity:.85}
    .pq-theme-btn.active{opacity:1;background:rgba(255,255,255,.1);box-shadow:0 0 0 1px var(--g6)}
    .lc-browse-shell{display:grid;grid-template-columns:200px 1fr;gap:18px;padding:0 3%;align-items:start;}
    @media(max-width:800px){.lc-browse-shell{grid-template-columns:1fr;}}
    .lc-tier-row{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
    .lc-tier-btn{flex:1;min-width:150px;text-align:left;padding:12px 14px;border-radius:12px;border:1.5px solid var(--g6);
      background:var(--g8);color:var(--g3);font-family:'Outfit',sans-serif;font-weight:700;font-size:0.82rem;
      cursor:pointer;transition:all 0.15s;}
    .lc-tier-btn--active{border-color:var(--fb);color:var(--fb);background:rgba(233,30,140,0.08);}
    .lc-module-card{background:var(--g8);border:1px solid var(--g6);border-radius:16px;margin-bottom:14px;overflow:hidden;}
    .lc-module-head{padding:14px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;}
    .lc-lessons-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;padding:0 14px 14px;}
    .lc-play-topbar{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:12px;padding:12px 4%;
      background:rgba(14,14,18,0.94);backdrop-filter:blur(10px);border-bottom:1px solid var(--g6);}
    [data-pqtheme="light"] .lc-play-topbar{background:rgba(245,245,248,0.94);}
    .lc-play-shell{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:20px 2%;align-items:start;}
    @media(max-width:900px){.lc-play-shell{grid-template-columns:1fr;}}
  `;

  /* ── FULL-SCREEN PLAY VIEW ─────────────────────────────────────── */
  if (activeLesson) {
    const idx = flat.findIndex(l => l.id === activeLesson.id);
    return (
      <>
        <style>{sharedStyles}</style>
        <div className="page" data-pqtheme={theme}>
          <div className="lc-play-topbar">
            <button onClick={() => setActiveLessonId(null)} style={{ background:"none", border:"none", color:"var(--g4)", fontFamily:"'Outfit',sans-serif", fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>
              ← All Lessons
            </button>
            <span style={{ color:"var(--g6)" }}>|</span>
            <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--w)" }}>{activeModule.title}</span>
            <span style={{ fontSize:"0.72rem", color:"var(--g4)" }}>Lesson {idx+1} of {flat.length}</span>
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
              <LessonPlayer key={activeLesson.id} lesson={activeLesson} moduleColor={activeModule.color} moduleTitle={activeLesson.title} onFinish={handleFinish} />
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── BROWSE VIEW (tiers → modules → lessons, no player) ────────── */
  return (
    <>
      <style>{sharedStyles}</style>

      <div className="page" data-pqtheme={theme}>
        <div style={{ padding:"16px 3% 0" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--g4)", fontFamily:"'Outfit',sans-serif", fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>
            ← Back to English Typing
          </button>
        </div>

        <div style={{ padding:"18px 3% 24px", animation:"fadeUp 0.5s ease both" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
            <div>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2.2rem,5vw,3.6rem)", letterSpacing:3, color:"var(--w)", lineHeight:1, marginBottom:8 }}>
                Practice Course
              </h1>
              <p style={{ fontSize:"0.84rem", color:"var(--g4)", maxWidth:460, lineHeight:1.6 }}>
                A lesson-by-lesson foundation, one key at a time — with the correct finger shown on every keystroke.
              </p>
            </div>
            <PqThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <div style={{ marginTop:20, maxWidth:520 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:"0.64rem", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--g4)" }}>Overall Progress</span>
              <span style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--fb)" }}>{doneCount}/{totalLessons}</span>
            </div>
            <div style={{ height:5, background:"var(--g7)", borderRadius:50, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(doneCount/totalLessons)*100}%`, background:"linear-gradient(90deg,var(--fd),var(--fb))", transition:"width 0.4s" }} />
            </div>
          </div>
        </div>

        <div className="lc-browse-shell">
          {/* far-left ad sidebar — replaced with a progress panel for subscribers */}
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
                      const firstMod = ENGLISH_MODULES.find(m => m.tier === t.id);
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
                          active={false}
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
