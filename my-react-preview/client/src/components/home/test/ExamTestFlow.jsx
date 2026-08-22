import { useState } from "react";
import TestInstructions from "./TestInstructions";
import TestScreen from "./TestScreen";
import TestResult from "./TestResult";
import { calculateResult } from "./calculateResult";

/**
 * Demo wrapper showing the FULL flow:
 *   Instructions → Test Screen → Result
 *
 * In your real app, replace this with your router:
 *   /test/:id/instructions  → TestInstructions
 *   /test/:id/attempt       → TestScreen
 *   /test/:id/result        → TestResult
 *
 * SECURITY NOTE: `correctAnswer` is included in these demo questions
 * for client-side scoring convenience. In production, either:
 *   (a) score on the server using scoreFromRows() from
 *       calculateResult.js, and only send the final `result` object
 *       to the client, OR
 *   (b) fetch the answer key from a protected endpoint only AFTER
 *       the test is submitted.
 */

const SECTION_DEFS = [
  { id: "gi", name: "General Intelligence & Reasoning", color: "#0ea5e9", count: 5 },
  { id: "ga", name: "General Awareness",                color: "#f59e0b", count: 5 },
  { id: "qa", name: "Quantitative Aptitude",            color: "#22c55e", count: 5 },
  { id: "en", name: "English Comprehension",            color: "#e91e8c", count: 5 },
];

function buildDemoQuestionsWithAnswers() {
  const qs = [];
  let n = 1;
  SECTION_DEFS.forEach(sec => {
    for (let i = 1; i <= sec.count; i++) {
      const id = `${sec.id}-${i}`;

      // Demo: make question #1 of each section an "image question"
      // to show how Cloudflare-hosted images render in TestScreen.
      const isImageQuestion = i === 1;

      qs.push({
        id,
        number: n++,
        sectionId: sec.id,
        ...(isImageQuestion
          ? {
              text: "Refer to the image below and choose the correct answer:",
              imageUrl: `https://picsum.photos/seed/${id}/800/300`, // ← replace with your Cloudflare R2 URL
            }
          : {
              text: `[${sec.name}] Sample question ${i} — placeholder statement.`,
            }
        ),
        options: isImageQuestion
          ? [
              { imageUrl: `https://picsum.photos/seed/${id}-a/200/100` },
              { imageUrl: `https://picsum.photos/seed/${id}-b/200/100` },
              { imageUrl: `https://picsum.photos/seed/${id}-c/200/100` },
              { imageUrl: `https://picsum.photos/seed/${id}-d/200/100` },
            ]
          : ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: i % 4, // demo answer key (0-3)
      });
    }
  });
  return qs;
}

const TEST_CONFIG = {
  testName: "SSC CGL Mock Test #14",
  durationMins: 60,
  marksPerQ: 2,
  negativeMarking: 0.5,
  sections: SECTION_DEFS,
  questions: buildDemoQuestionsWithAnswers(),
};

export default function ExamTestFlow() {
  const [stage, setStage] = useState("instructions"); // instructions | test | result
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState(null);

  if (stage === "instructions") {
    return (
      <TestInstructions
        test={TEST_CONFIG}
        onStart={({ language }) => {
          setLanguage(language);
          setStage("test");
        }}
      />
    );
  }

  if (stage === "test") {
    return (
      <TestScreen
        test={TEST_CONFIG}
        language={language}
        onSubmit={(payload) => {
          // ── Compute result from raw payload + answer key ──────
          const computed = calculateResult({
            payload,
            questions: TEST_CONFIG.questions,
            sections: TEST_CONFIG.sections,
            testName: TEST_CONFIG.testName,
            marksPerQ: TEST_CONFIG.marksPerQ,
            negativeMarking: TEST_CONFIG.negativeMarking,
            totalTimeSecs: TEST_CONFIG.durationMins * 60,
            rank: 142,             // ← replace with real leaderboard query
            totalCandidates: 4380, // ← replace with real count
          });
          setResult(computed);
          setStage("result");
        }}
        onPause={(payload) => {
          
          // e.g. await supabase.from('test_attempts').update({ progress: payload, status: 'paused' })
        }}
        onResume={() => {}}
      />
    );
  }

  // stage === "result"
  return (
    <TestResult
      result={result}
      onBackToDashboard={() => setStage("instructions")}
      onViewSolutions={() => alert("Open solutions/review page")}
      onRetake={() => setStage("instructions")}
    />
  );
}
