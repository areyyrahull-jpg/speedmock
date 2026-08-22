import { useState, useEffect, useRef } from "react";
import { useGoal } from "../../../context/GoalContext"; // client/src/components/home/test/ → client/src/context/
import TestInstructions from "./TestInstructions";
import TestScreen from "./TestScreen";
import TestResult from "./TestResult";
import { useTestQuestions, createAttempt, savePauseState, submitTestAttempt } from "./UseTestQuestion";
import { fetchAttemptDetail } from "../../../services/testApi";

/**
 * Mirrors the same review transform used in TestHistory's "View Solutions"
 * flow — turns a completed attempt's detail (sections/questions with
 * userAnswer + correct + explanation, now safe to reveal since it's
 * already submitted) into { test, reviewData } for TestScreen's
 * mode="review".
 */
function transformAttemptForReview(detail) {
  const sections = detail.sections.map((sec, sIdx) => ({
    id: `sec-${sIdx}`, name: sec.name, color: sec.color, count: sec.total,
  }));
  const questions = detail.sections.flatMap((sec, sIdx) =>
    sec.questions.map(q => ({
      id: `${sIdx}-${q.number}`, number: q.number, sectionId: `sec-${sIdx}`,
      text: q.text, options: q.options, explanation: q.explanation, correctIndex: q.correct,
    }))
  );
  const answers = {}, correctAnswers = {};
  detail.sections.forEach((sec, sIdx) => {
    sec.questions.forEach(q => {
      const qId = `${sIdx}-${q.number}`;
      answers[qId] = q.userAnswer;
      correctAnswers[qId] = q.correct;
    });
  });
  return {
    test: { testName: detail.title, durationMins: 0, sections, questions },
    reviewData: { answers, correctAnswers, timePerQ: detail.timePerQ || {} },
  };
}

/**
 * TestRunner.jsx — production version of ExamTestFlow.jsx (which was
 * a static demo with hardcoded questions). This fetches a REAL test
 * by id and wires the full pipeline:
 *
 *   Instructions → TestScreen → [secure backend scoring] → TestResult
 *
 * Resume support: if the user has an in-progress attempt for this
 * test, it skips straight into TestScreen with their saved progress
 * instead of showing Instructions again.
 *
 * Usage (e.g. in your router):
 *   <TestRunner
 *     testId={params.testId}
 *     userId={user.id}
 *     candidate={{ name: user.name, id: user.rollNumber }}
 *     onExit={() => navigate(-1)}
 *   />
 */
export default function TestRunner({ testId, userId, testType = "pyq", candidate, onExit, reviewAttemptId = null }) {
  const [language, setLanguage] = useState("en");
  const { refresh: refreshGoal } = useGoal();
  // True from the moment handleStart begins until createAttempt resolves
  // (success or failure). Needed because setLanguage() inside handleStart
  // triggers useTestQuestions to re-fetch (language is one of its deps) —
  // if that re-fetch finishes before the separate createAttempt() network
  // call does, the stage-decision effect below would see attemptId still
  // null and wrongly conclude "no attempt yet" and revert to
  // "instructions", even though a start is actively in progress.
  const startingRef = useRef(false);

  // Hook re-fetches automatically when language changes (picks correct _hi columns)
  const { test, questions, existingAttempt, loading, error, refetch } = useTestQuestions(testId, userId, testType, language);

  const [stage, setStage] = useState(reviewAttemptId ? "reviewLoading" : "loading"); // loading | instructions | test | result | submitting | reviewLoading | review
  const [attemptId, setAttemptId] = useState(null);
  const [resumeState, setResumeState] = useState(null);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Attempt we just finished — used to stop the resume effect below from
  // racing with retake (see onRetake / effect comment).
  const [justSubmittedAttemptId, setJustSubmittedAttemptId] = useState(null);

  const [reviewData, setReviewData] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  // Coming from "View Solutions" on an already-completed test in the papers
  // list — reviewAttemptId is passed straight in via the URL. Skip the whole
  // instructions/resume/start flow entirely and load review data directly.
  // (Previously the papers list routed View Solutions to the exact same URL
  // as Start/Resume with no way to tell TestRunner it should be a review —
  // so it always fell through to starting a brand new attempt instead.)
  useEffect(() => {
    if (!reviewAttemptId) return;
    let cancelled = false;
    (async () => {
      setReviewError(null);
      setStage("reviewLoading");
      try {
        const detail = await fetchAttemptDetail(reviewAttemptId, language);
        if (cancelled) return;
        setReviewData(transformAttemptForReview(detail));
        setStage("review");
      } catch (err) {
        if (cancelled) return;
        
        setReviewError("Couldn't load your solutions. Check your connection and try again.");
        setStage("review");
      }
    })();
    return () => { cancelled = true; };
  }, [reviewAttemptId]); // language changes are handled by onLanguageChange below, not this effect

  // once data loads, decide what stage to show
  useEffect(() => {
    if (reviewAttemptId) return; // handled by the effect above instead
    if (loading || !test) return;
    // Only decide the stage during initial load. Without this guard, ANY
    // later refetch of `test`/`loading` — e.g. switching language while
    // viewing solutions in review mode (setLanguage triggers useTestQuestions
    // to re-fetch, since language is one of its dependencies) — re-runs this
    // effect. Since `attemptId` is still set from the completed attempt,
    // it would then unconditionally setStage("test"), silently kicking the
    // user out of review and into what looks like a retake. Stages other
    // than "loading" are all owned by explicit handlers (handleStart,
    // handleSubmit, onViewSolutions, onRetake) — this effect shouldn't
    // second-guess them.
    if (stage !== "loading") return;

    if (attemptId) {
      // Language was switched mid-test — questions re-fetched, stay on test screen
      setStage("test");
    } else if (startingRef.current) {
      // handleStart is actively in-flight: its setLanguage() call made this
      // hook re-fetch (loading/test just changed, which is why this effect
      // re-ran), but the separate createAttempt() network call it's also
      // waiting on hasn't resolved yet, so attemptId is still null. That's
      // NOT the same as "no attempt exists" — it's just not created yet.
      // Stay on "loading" and wait; handleStart will setAttemptId() shortly,
      // which re-triggers this effect and takes the branch above.
      return;
    } else if (existingAttempt && existingAttempt.id !== justSubmittedAttemptId) {
      // Resume an in-progress attempt, skip instructions.
      // The justSubmittedAttemptId check guards against a race on retake:
      // refetch() is async, so `existingAttempt` can still briefly hold the
      // attempt we just finished (fetched before it was marked complete).
      // Without this check, retake would silently resume that stale,
      // already-completed attempt instead of starting a clean test.
      setAttemptId(existingAttempt.id);
      setResumeState(existingAttempt.saved_state || null);
      setStage("test");
    } else {
      setStage("instructions");
    }
  }, [loading, test, existingAttempt, attemptId, justSubmittedAttemptId, stage]);

  const handleStart = async ({ language: lang } = {}) => {
    const chosenLang = lang || "en";
    startingRef.current = true;
    setLanguage(chosenLang);   // triggers re-fetch in useTestQuestions with _hi cols if needed
    setStage("loading");       // show spinner while questions reload with correct language

    try {
      const id = await createAttempt({
        userId,
        examId: test.examId,
        testId: test.id,
        testType: test.testType || testType,
        totalQuestions: questions.length,
        // max marks = sum of per-question marks (falls back to 1/q)
        maxScore: questions.length * (test.marksPerQ || 1),
      });
      startingRef.current = false;
      setAttemptId(id);
      // Stage will flip to "test" via useEffect once the re-fetch completes
    } catch (err) {
      startingRef.current = false;
      setSubmitError("Couldn't start the test. Please check your connection and try again.");
      setStage("instructions"); // go back so user can retry
    }
  };

  const handlePause = async (payload) => {
    try {
      await savePauseState({ attemptId, payload, totalQuestions: questions.length });
    } catch (err) {
      
      // non-fatal — the user can still keep going locally this session
    }
  };

  const handleSubmit = async (payload) => {
    setStage("submitting");
    setSubmitError(null);
    try {
      const result = await submitTestAttempt({ attemptId, test, questions, payload });
      setResult(result);
      setStage("result");
      // The backend writes daily_goal_logs on successful submit (PYQ/full/
      // subject/topic all update it now), but GoalContext only ever
      // fetched /api/goal/today on initial mount or via incrementGoal()
      // from practice screens — nothing told it a TEST had also moved the
      // needle. Without this, the navbar/analytics goal ring would keep
      // showing stale progress until a full page reload.
      refreshGoal();
    } catch (err) {
      
      setSubmitError("Couldn't submit your test. Check your connection and try again — your answers are safe.");
      setStage("test"); // let them retry submit without losing progress
    }
  };

  /* ── LOADING ── */
  if (stage === "loading" || loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
        background: "#0b0b10", color: "#7a7a90", fontFamily: "Outfit, sans-serif",
      }}>
        <div style={{ fontSize: 28 }}>⏳</div>
        <div style={{ fontSize: 13 }}>Loading your test...</div>
      </div>
    );
  }

  /* ── ERROR (failed to load test/questions) ── */
  if (error || !test) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center",
        background: "#0b0b10", color: "#f0f0f0", fontFamily: "Outfit, sans-serif",
      }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Couldn't load this test</div>
        <div style={{ fontSize: 12.5, color: "#7a7a90", maxWidth: 320 }}>{error || "Test not found."}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={refetch} style={btnStyle("#1a1a24", "#f0f0f0")}>↻ Retry</button>
          <button onClick={onExit} style={btnStyle("linear-gradient(135deg,#e91e8c,#ff3aaa)", "#fff")}>← Go Back</button>
        </div>
      </div>
    );
  }

  /* ── INSTRUCTIONS ── */
  if (stage === "instructions") {
    return (
      <TestInstructions
        test={{
          testName: test.testName,
          durationMins: test.durationMins,
          marksPerQ: test.marksPerQ,
          negativeMarking: test.negativeMarking,
          sections: test.sections,
          sectional: test.sectional,
          examId: test.examId,
          questions,
        }}
        onStart={handleStart}
        // NOTE: TestInstructions.jsx doesn't currently accept an onBack/exit
        // prop — add one if you want a "back to listing" button on this screen.
      />
    );
  }

  /* ── SUBMITTING (brief transition state) ── */
  if (stage === "submitting") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
        background: "#0b0b10", color: "#7a7a90", fontFamily: "Outfit, sans-serif",
      }}>
        <div style={{ fontSize: 28 }}>📤</div>
        <div style={{ fontSize: 13 }}>Submitting &amp; scoring your test...</div>
      </div>
    );
  }

  /* ── REVIEW LOADING (fetching solutions) ── */
  if (stage === "reviewLoading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
        background: "#0b0b10", color: "#7a7a90", fontFamily: "Outfit, sans-serif",
      }}>
        <div style={{ fontSize: 28 }}>📄</div>
        <div style={{ fontSize: 13 }}>Loading solutions...</div>
      </div>
    );
  }

  /* ── REVIEW (view solutions, read-only) ── */
  if (stage === "review") {
    if (reviewError || !reviewData) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center",
          background: "#0b0b10", color: "#f0f0f0", fontFamily: "Outfit, sans-serif",
        }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Couldn't load solutions</div>
          <div style={{ fontSize: 12.5, color: "#7a7a90", maxWidth: 320 }}>{reviewError || "Please try again."}</div>
          <button onClick={() => reviewAttemptId ? onExit?.() : setStage("result")} style={btnStyle("#1a1a24", "#f0f0f0")}>← Back{reviewAttemptId ? "" : " to result"}</button>
        </div>
      );
    }
    return (
      <TestScreen
        test={reviewData.test}
        reviewData={reviewData.reviewData}
        mode="review"
        candidate={candidate}
        language={language}
        onLanguageChange={async (lang) => {
          setLanguage(lang);
          setReviewError(null);
          try {
            const detail = await fetchAttemptDetail(reviewAttemptId || attemptId, lang);
            setReviewData(transformAttemptForReview(detail));
          } catch (err) {
            
            setReviewError("Couldn't reload solutions. Check your connection and try again.");
          }
        }}
        onBack={() => reviewAttemptId ? onExit?.() : setStage("result")}
      />
    );
  }

  /* ── TEST (fresh start or resumed) ── */
  if (stage === "test") {
    return (
      <>
        {submitError && (
          <div style={{
            position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
            zIndex: 1500, background: "#1a1a24", border: "1px solid rgba(239,68,68,.35)",
            color: "#ef4444", fontSize: 12.5, padding: "10px 18px", borderRadius: 10,
            maxWidth: "90vw", textAlign: "center", fontFamily: "Outfit, sans-serif",
          }}>
            {submitError}
          </div>
        )}
        <TestScreen
          test={{
            testName: test.testName,
            durationMins: test.durationMins,
            marksPerQ: test.marksPerQ,
            negativeMarking: test.negativeMarking,
            sections: test.sections,
            sectional: test.sectional,
            examId: test.examId,
            questions,
          }}
          candidate={candidate}
          language={language}
          onLanguageChange={(lang) => {
            setLanguage(lang); // triggers re-fetch in useTestQuestions via hook dep
          }}
          resumeState={resumeState}
          onPause={handlePause}
          onSubmit={handleSubmit}
          onResume={() => {}}
        />
      </>
    );
  }

  /* ── RESULT ── */
  return (
    <TestResult
      result={result}
      onBackToDashboard={onExit}
      onViewSolutions={async () => {
        setReviewError(null);
        setStage("reviewLoading");
        try {
          const detail = await fetchAttemptDetail(attemptId, language);
          setReviewData(transformAttemptForReview(detail));
          setStage("review");
        } catch (err) {
          
          setReviewError("Couldn't load your solutions. Check your connection and try again.");
          setStage("review");
        }
      }}
      onRetake={() => {
        setJustSubmittedAttemptId(attemptId); // see resume-effect comment above
        setAttemptId(null);
        setResumeState(null);
        setResult(null);
        setSubmitError(null);
        setStage("instructions");
        refetch();
      }}
    />
  );
}

function btnStyle(bg, color) {
  return {
    padding: "11px 22px", borderRadius: 10, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 700, background: bg, color, fontFamily: "Outfit, sans-serif",
  };
}
