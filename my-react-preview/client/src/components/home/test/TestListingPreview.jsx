import { useState } from "react";
import PYQPapers from "./PYQPapers";
import SubjectWiseTests from "./SubjectWiseTests";
import TopicWiseTests from "./TopicWiseTests";
import MockTests from "./MockTests";
import NewSyllabusTests from "./NewSyllabusTests";

const PAGES = {
  pyq: { label: "📜 PYQ Papers", Comp: PYQPapers },
  subject: { label: "🎯 Subject-wise", Comp: SubjectWiseTests },
  topic: { label: "🔬 Topic-wise", Comp: TopicWiseTests },
  mock: { label: "📝 Mock Tests", Comp: MockTests },
  syllabus: { label: "✨ New Syllabus", Comp: NewSyllabusTests },
};

export default function Preview() {
  const [page, setPage] = useState("pyq");
  const Comp = PAGES[page].Comp;

  return (
    <div>
      {/* page switcher — for preview only */}
      <div style={{
        position: "fixed", top: 12, right: 12, zIndex: 2000,
        display: "flex", gap: 6, background: "#13131a", border: "1px solid #1e1e2c",
        borderRadius: 10, padding: 6, flexWrap: "wrap", maxWidth: 260,
      }}>
        {Object.entries(PAGES).map(([key, { label }]) => (
          <button key={key} onClick={() => setPage(key)}
            style={{
              padding: "6px 10px", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, fontFamily: "Outfit,sans-serif",
              background: page===key ? "#e91e8c" : "transparent",
              color: page===key ? "#fff" : "#7a7a90",
            }}>
            {label}
          </button>
        ))}
      </div>

      <Comp
        examId="ssc-cgl"
        examName="SSC CGL"
        userId={null}
        isSubscribed={false}
        onBack={() => alert("Back to dashboard")}
        onStart={(t) => alert(`Start: ${t.title}`)}
        onResume={(t) => alert(`Resume: ${t.title}`)}
        onReview={(t) => alert(`Review: ${t.title}`)}
      />
    </div>
  );
}
