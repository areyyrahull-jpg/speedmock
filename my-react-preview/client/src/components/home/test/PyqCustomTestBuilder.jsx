import { useState, useEffect, useCallback } from "react";
import { useInjectCSS, PageHeader, EmptyState } from "./TestListShared";
import { resolveExamId, examDisplayName } from "./UseTestList";
import { supabase } from "../../../services/supabaseClient"; // ← adjust path to match your project structure
import { apiFetch } from "../../../services/apiFetch";        // ← adjust path to match your project structure

const QUANTITY_PRESETS = [25, 50];

const CSS = `
.cb-form{max-width:640px}
.cb-field{margin-bottom:22px}
.cb-label{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--m);margin-bottom:10px;display:block}
.cb-hint{font-size:11.5px;color:var(--m2);margin-top:6px}

.cb-check-grid{display:flex;flex-wrap:wrap;gap:8px}
.cb-check{
  display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:10px;
  background:var(--bg2);border:1px solid var(--b);cursor:pointer;font-size:12.5px;font-weight:600;
  color:var(--m);transition:all .15s;user-select:none;
}
.cb-check.selected{background:rgba(233,30,140,.1);border-color:rgba(233,30,140,.35);color:var(--f)}
.cb-check input{accent-color:var(--f)}

.cb-pill-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.cb-pill{
  padding:9px 18px;border-radius:100px;border:1px solid var(--b);background:var(--bg2);
  color:var(--m);font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s;font-family:'Outfit',sans-serif;
}
.cb-pill.active{background:var(--f);border-color:var(--f);color:#fff}
.cb-custom-input{
  width:90px;padding:9px 12px;border-radius:100px;border:1px solid var(--b);background:var(--bg2);
  color:var(--t);font-size:12.5px;font-weight:700;font-family:'Outfit',sans-serif;outline:none;
}
.cb-custom-input:focus{border-color:var(--f)}

.cb-row-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.cb-input{
  width:100%;padding:11px 14px;border-radius:10px;border:1px solid var(--b);background:var(--bg2);
  color:var(--t);font-size:13px;font-family:'Outfit',sans-serif;outline:none;
}
.cb-input:focus{border-color:var(--f)}

.cb-submit{
  width:100%;padding:15px;border-radius:12px;border:none;font-size:14px;font-weight:700;cursor:pointer;
  font-family:'Outfit',sans-serif;background:linear-gradient(135deg,var(--f),var(--fl));color:#fff;
  transition:all .2s;margin-top:8px;
}
.cb-submit:hover{box-shadow:0 8px 24px rgba(233,30,140,.35);transform:translateY(-1px)}
.cb-submit:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.cb-error{font-size:12.5px;color:var(--red);margin-bottom:16px;padding:12px 14px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:10px}
`;
const inject = () => {
  if (document.getElementById("cb-css")) return;
  const s = document.createElement("style");
  s.id = "cb-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/**
 * Props:
 *  examId, examName (optional), userId
 *  testType: "subject" | "topic"
 *  onBack
 *  onGenerated(batchCount) — called once batches are created; the parent
 *                            should refetch its list and return to it, so
 *                            the user sees the new numbered batches rather
 *                            than being dropped straight into TestRunner.
 */
export default function PyqCustomTestBuilder({
  examId, examName, userId, testType, onBack, onGenerated,
}) {
  useInjectCSS();
  useEffect(() => { inject(); }, []);
  const displayExamName = examName || examDisplayName(examId);

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [yearBounds, setYearBounds] = useState({ min: null, max: null });
  const [tiers, setTiers] = useState([]);
  const [tier, setTier] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [topicSubjectId, setTopicSubjectId] = useState(""); // topic-wise draws from ONE subject
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);

  const [quantity, setQuantity] = useState(25);
  const [customQuantity, setCustomQuantity] = useState("");
  const [duration, setDuration] = useState(30);
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");

  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState(null);

  // ── Load subjects + (for topic-wise) topics + the available PYQ year range ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const examUuid = await resolveExamId(examId);

        const { data: subjRows, error: subjErr } = await supabase
          .from("subjects")
          .select("id, subject_name, display_order")
          .eq("exam_id", examUuid)
          .order("display_order", { ascending: true });
        if (subjErr) throw subjErr;

        const { data: yearRows, error: yearErr } = await supabase
          .from("questions")
          .select("pyq_year")
          .eq("exam_id", examUuid)
          .eq("is_pyq", true)
          .not("pyq_year", "is", null);
        if (yearErr) throw yearErr;
        const years = (yearRows || []).map(r => r.pyq_year).filter(Boolean);
        const bounds = years.length ? { min: Math.min(...years), max: Math.max(...years) } : { min: null, max: null };

        const { data: tierRows, error: tierErr } = await supabase
          .from("questions")
          .select("tier")
          .eq("exam_id", examUuid)
          .eq("is_pyq", true)
          .not("tier", "is", null);
        if (tierErr) throw tierErr;
        const tierOptions = [...new Set((tierRows || []).map(r => r.tier))].sort();

        if (cancelled) return;
        setSubjects(subjRows || []);
        setYearBounds(bounds);
        setYearMin(bounds.min ? String(bounds.min) : "");
        setYearMax(bounds.max ? String(bounds.max) : "");
        setTiers(tierOptions);
      } catch (err) {
        if (!cancelled) setOptionsError(err.message);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    })();
    return () => { cancelled = true; };
  }, [examId]);

  // Topics load only once a subject is chosen (topic-wise mode)
  useEffect(() => {
    if (testType !== "topic" || !topicSubjectId) { setTopics([]); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("id, topic_name, display_order")
        .eq("subject_id", topicSubjectId)
        .order("display_order", { ascending: true });
      if (!cancelled && !error) setTopics(data || []);
      setSelectedTopicIds([]);
    })();
    return () => { cancelled = true; };
  }, [testType, topicSubjectId]);

  const toggleSubject = (id) => {
    setSelectedSubjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleTopic = (id) => {
    setSelectedTopicIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const finalQuantity = quantity === "custom" ? Number(customQuantity) || 0 : quantity;

  const [batchResult, setBatchResult] = useState(null);

  const handleGenerate = useCallback(async () => {
    setFormError(null);
    setBatchResult(null);

    if (testType === "subject" && selectedSubjectIds.length === 0)
      return setFormError("Select at least one subject.");
    if (testType === "topic" && (!topicSubjectId || selectedTopicIds.length === 0))
      return setFormError("Select a subject and at least one topic.");
    if (!finalQuantity || finalQuantity < 1)
      return setFormError("Enter a valid number of questions.");
    if (!duration || duration < 1)
      return setFormError("Enter a valid time limit.");
    if (tiers.length > 0 && !tier)
      return setFormError("This exam has multiple tiers — pick one.");

    setGenerating(true);
    try {
      const examUuid = await resolveExamId(examId);
      const { ok, data } = await apiFetch("/api/practice/pyq-dynamic-test", {
        method: "POST",
        body: JSON.stringify({
          examId: examUuid,
          testType,
          subjectIds: testType === "subject" ? selectedSubjectIds : [topicSubjectId],
          topicIds: testType === "topic" ? selectedTopicIds : undefined,
          yearMin: yearMin ? Number(yearMin) : undefined,
          yearMax: yearMax ? Number(yearMax) : undefined,
          quantity: finalQuantity,
          durationMinutes: duration,
          tier: tier || undefined,
        }),
      });
      if (!ok || !data.success) throw new Error(data.message || "Failed to generate test.");
      setBatchResult(data.batchesCreated);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [examId, testType, selectedSubjectIds, topicSubjectId, selectedTopicIds, finalQuantity, duration, yearMin, yearMax, tier]);

  return (
    <div className="tl-page">
      <PageHeader
        eyebrow="Practice Library"
        title={`${displayExamName} — Build a Custom ${testType === "subject" ? "Subject-wise" : "Topic-wise"} Set`}
        subtitle="Pick your subjects, year range and quantity — you'll never get the same batch twice"
        onBack={onBack}
      />

      <div className="tl-body">
        {loadingOptions ? (
          <EmptyState title="Loading..." sub="Fetching subjects and available years." />
        ) : optionsError ? (
          <EmptyState title="Couldn't load options" sub={optionsError} />
        ) : (
          <div className="cb-form">
            {formError && <div className="cb-error">⚠️ {formError}</div>}

            {testType === "subject" ? (
              <div className="cb-field">
                <label className="cb-label">Subjects — pick 1 or more</label>
                <div className="cb-check-grid">
                  {subjects.map(s => (
                    <label key={s.id} className={`cb-check${selectedSubjectIds.includes(s.id) ? " selected" : ""}`}>
                      <input type="checkbox" checked={selectedSubjectIds.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                      {s.subject_name}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="cb-field">
                  <label className="cb-label">Subject</label>
                  <select className="cb-input" value={topicSubjectId} onChange={e => setTopicSubjectId(e.target.value)}>
                    <option value="">Select a subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                  </select>
                </div>
                {topicSubjectId && (
                  <div className="cb-field">
                    <label className="cb-label">Topics — pick 1 or more</label>
                    {topics.length === 0 ? (
                      <div className="cb-hint">No topics found for this subject.</div>
                    ) : (
                      <div className="cb-check-grid">
                        {topics.map(t => (
                          <label key={t.id} className={`cb-check${selectedTopicIds.includes(t.id) ? " selected" : ""}`}>
                            <input type="checkbox" checked={selectedTopicIds.includes(t.id)} onChange={() => toggleTopic(t.id)} />
                            {t.topic_name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {tiers.length > 0 && (
              <div className="cb-field">
                <label className="cb-label">Tier</label>
                <div className="cb-pill-row">
                  {tiers.map(t => (
                    <button key={t} type="button" className={`cb-pill${tier === t ? " active" : ""}`} onClick={() => setTier(t)}>
                      {t.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="cb-field">
              <label className="cb-label">Number of questions</label>
              <div className="cb-pill-row">
                {QUANTITY_PRESETS.map(q => (
                  <button key={q} type="button" className={`cb-pill${quantity === q ? " active" : ""}`} onClick={() => setQuantity(q)}>
                    {q}
                  </button>
                ))}
                <button type="button" className={`cb-pill${quantity === "custom" ? " active" : ""}`} onClick={() => setQuantity("custom")}>
                  Custom
                </button>
                {quantity === "custom" && (
                  <input className="cb-custom-input" type="number" min="1" placeholder="e.g. 40"
                    value={customQuantity} onChange={e => setCustomQuantity(e.target.value)} />
                )}
              </div>
            </div>

            <div className="cb-row-2">
              <div className="cb-field">
                <label className="cb-label">Time limit (minutes)</label>
                <input className="cb-input" type="number" min="1" value={duration}
                  onChange={e => setDuration(Number(e.target.value))} />
              </div>
              <div className="cb-field">
                <label className="cb-label">
                  PYQ year range {yearBounds.min && yearBounds.max ? `(${yearBounds.min}–${yearBounds.max} available)` : ""}
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input className="cb-input" type="number" placeholder="From" value={yearMin}
                    onChange={e => setYearMin(e.target.value)} />
                  <span style={{ color: "var(--m)" }}>–</span>
                  <input className="cb-input" type="number" placeholder="To" value={yearMax}
                    onChange={e => setYearMax(e.target.value)} />
                </div>
              </div>
            </div>

            {batchResult !== null && (
              <div className="cb-field" style={{
                padding: "16px 18px", borderRadius: 12, background: "rgba(34,197,94,.08)",
                border: "1px solid rgba(34,197,94,.25)", textAlign: "center",
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--green)", marginBottom: 10 }}>
                  ✅ {batchResult} batch{batchResult === 1 ? "" : "es"} created
                </div>
                <button className="cb-submit" style={{ marginTop: 0 }} onClick={() => onGenerated?.(batchResult)}>
                  ← View in Listing
                </button>
              </div>
            )}

            <button className="cb-submit" onClick={handleGenerate} disabled={generating}>
              {generating ? "Building your batches..." : "🚀 Generate Batches"}
            </button>
            <div className="cb-hint" style={{ textAlign: "center" }}>
              Your whole matching PYQ pool gets split into numbered batches of {finalQuantity || "…"} — they'll appear in your list below.
              Rebuilding with a different quantity replaces this set.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
