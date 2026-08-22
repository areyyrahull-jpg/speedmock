import { useState } from "react";
import SyllabusPage from "./SyllabusPage";
import ExamPatternPage from "./ExamPatternPage";

const EXAM_OPTIONS = [
  { id: "cgl",    icon: "📋", label: "SSC CGL" },
  { id: "cpo",    icon: "🛡️", label: "SSC CPO" },
  { id: "mts",    icon: "📝", label: "SSC MTS" },
  { id: "chsl",   icon: "📄", label: "SSC CHSL" },
  { id: "gd",     icon: "⭐", label: "SSC GD" },
  { id: "ntpc",   icon: "🚂", label: "NTPC" },
  { id: "alp",    icon: "⚙️", label: "ALP" },
  { id: "je",     icon: "🔧", label: "JE" },
  { id: "groupd", icon: "📦", label: "Group D" },
];

/**
 * Demo wrapper — shows how SyllabusPage and ExamPatternPage both
 * respond to the SAME selectedExam state (e.g. from your navbar).
 * In your real app, both pages receive `examId={selectedExam}`
 * wherever selectedExam lives in your app's state/router.
 */
export default function ExamInfoPreview() {
  const [examId, setExamId] = useState("cgl");
  const [page, setPage] = useState("syllabus"); // "syllabus" | "pattern"

  return (
    <div>
      {/* preview-only switcher */}
      <div style={{
        position: "fixed", top: 12, right: 12, zIndex: 2000,
        display: "flex", flexDirection: "column", gap: 8, background: "#13131a",
        border: "1px solid #1e1e2c", borderRadius: 10, padding: 8, maxWidth: 300,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["syllabus", "pattern"].map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 11.5, fontWeight: 700, fontFamily: "Outfit,sans-serif",
                background: page===p ? "#e91e8c" : "transparent",
                color: page===p ? "#fff" : "#7a7a90",
              }}>
              {p === "syllabus" ? "📚 Syllabus" : "📐 Pattern"}
            </button>
          ))}
        </div>
        <div style={{ height: 1, background: "#1e1e2c" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {EXAM_OPTIONS.map(e => (
            <button key={e.id} onClick={() => setExamId(e.id)}
              style={{
                padding: "6px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600, fontFamily: "Outfit,sans-serif",
                background: examId===e.id ? "#0ea5e9" : "transparent",
                color: examId===e.id ? "#fff" : "#7a7a90",
              }}>
              {e.icon} {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* both pages driven by the SAME examId */}
      {page === "syllabus" ? (
        <SyllabusPage examId={examId} onBack={() => alert("Back to dashboard")} />
      ) : (
        <ExamPatternPage examId={examId} onBack={() => alert("Back to dashboard")} />
      )}
    </div>
  );
}
