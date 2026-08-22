import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HindiLessonCourse from "./HindiLessonCourse";
import HindiPractice from "./hindipractice";
import HindiTypingTips from "./hinditypingtips";

/* ─────────────────────────────────────────────────────────────────
   HindiPracticeHub — destination for the "Practice" card on
   hindihome.jsx. Tabs: Lesson Course / Timed Practice / Finger Tips.
   Route state (from hindihome.jsx): { tab, duration, layout }
════════════════════════════════════════════════════════════════ */

const TABS = [
  { id: "lessons", label: "Lesson Course",  icon: "📚" },
  { id: "timed",   label: "Timed Practice", icon: "⏱️" },
  { id: "tips",    label: "Finger Tips",    icon: "⌨️" },
];

export default function HindiPracticeHub({ isSubscribed = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(location.state?.tab || "lessons");
  const duration = location.state?.duration || 1;
  const layout = location.state?.layout || "kruti";

  const handleExit = () => navigate("/hindihome");

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e12" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');
        .hph-tab{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:50px;
          font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;
          transition:all 0.2s;white-space:nowrap;background:transparent;border:1px solid #32323f;color:#7a7a90;}
        .hph-tab:hover{color:#f0f0f0;border-color:#4a4a5c;}
        .hph-tab--active{background:rgba(255,111,0,0.12);border-color:#ffa726;color:#ffa726;}
        .hph-tabbar{position:sticky;top:0;z-index:50;display:flex;gap:8px;padding:14px 5%;
          background:rgba(14,14,18,0.92);backdrop-filter:blur(10px);border-bottom:1px solid #252532;overflow-x:auto;}
      `}</style>

      <div className="hph-tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`hph-tab${tab === t.id ? " hph-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === "lessons" && <HindiLessonCourse onBack={handleExit} layout={layout} isSubscribed={isSubscribed} />}
      {tab === "timed" && <HindiPractice duration={duration} onBack={handleExit} layout={layout} />}
      {tab === "tips" && <HindiTypingTips onBack={handleExit} />}
    </div>
  );
}
