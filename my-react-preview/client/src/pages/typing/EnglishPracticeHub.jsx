import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EnglishLessonCourse from "./EnglishLessonCourse";
import EnglishPractice from "./englishpractice";
import EnglishTypingTips from "./englishtypingtips";

/* ─────────────────────────────────────────────────────────────────
   EnglishPracticeHub — the single destination for the "Practice"
   card on englishhome.jsx. Houses three tabs:
     • Lesson Course   (EnglishLessonCourse — key-by-key foundation)
     • Timed Practice  (EnglishPractice — free-typing, any duration)
     • Finger Tips     (EnglishTypingTips — the old standalone card)

   Route state (passed from englishhome.jsx):
     { tab: "lessons" | "timed", duration: <minutes> }
════════════════════════════════════════════════════════════════ */

const TABS = [
  { id: "lessons", label: "Lesson Course", icon: "📚" },
  { id: "timed",   label: "Timed Practice", icon: "⏱️" },
  { id: "tips",    label: "Finger Tips",   icon: "⌨️" },
];

export default function EnglishPracticeHub({ isSubscribed = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(location.state?.tab || "lessons");
  const duration = location.state?.duration || 1;

  const handleExit = () => navigate("/englishhome");

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e12" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');
        .eph-tab{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:50px;
          font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;
          transition:all 0.2s;white-space:nowrap;background:transparent;border:1px solid #32323f;color:#7a7a90;}
        .eph-tab:hover{color:#f0f0f0;border-color:#4a4a5c;}
        .eph-tab--active{background:rgba(233,30,140,0.12);border-color:#ff3aaa;color:#ff3aaa;}
        .eph-tabbar{position:sticky;top:0;z-index:50;display:flex;gap:8px;padding:14px 5%;
          background:rgba(14,14,18,0.92);backdrop-filter:blur(10px);border-bottom:1px solid #252532;overflow-x:auto;}
      `}</style>

      <div className="eph-tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`eph-tab${tab === t.id ? " eph-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === "lessons" && <EnglishLessonCourse onBack={handleExit} isSubscribed={isSubscribed} />}
      {tab === "timed" && <EnglishPractice duration={duration} onBack={handleExit} />}
      {tab === "tips" && <EnglishTypingTips onBack={handleExit} />}
    </div>
  );
}
