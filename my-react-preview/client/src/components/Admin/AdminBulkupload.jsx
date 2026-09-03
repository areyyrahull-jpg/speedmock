import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../services/apiFetch";
import { Toast, useToast } from "./AdminPanel";

const SAMPLE_JSON = `[
  {
    "text": "What is 25% of 200?",
    "textHi": "200 का 25% क्या है?",
    "options": [
      { "text": "40",  "textHi": "40" },
      { "text": "50",  "textHi": "50" },
      { "text": "45",  "textHi": "45" },
      { "text": "55",  "textHi": "55" }
    ],
    "correctAnswer": 1,
    "explanation": "25% of 200 = 200 × 25/100 = 50",
    "explanationHi": "200 का 25% = 200 × 25/100 = 50",
    "difficulty": "EASY",
    "marks": 1,
    "negativeMarking": 0.25,
    "isPyq": true,
    "pyqYear": 2023,
    "tier": "TIER_1"
  }
]`;

// options may be strings or {text} objects — normalise to strings
const normaliseOptions = (opts) =>
  Array.isArray(opts) ? opts.map(o => (typeof o === "string" ? o : o?.text || "")) : [];

function validateRows(rows) {
  return rows.map((q, i) => {
    const errors = [];
    const opts = normaliseOptions(q.options);
    if (opts.length < 2)        errors.push("needs at least 2 options");
    if (!opts.every(o=>o.trim())) errors.push("option text cannot be blank");
    if (q.correctAnswer === undefined || q.correctAnswer === null) errors.push("missing correctAnswer");
    else if (q.correctAnswer < 0 || q.correctAnswer >= opts.length) errors.push("correctAnswer out of range");
    if (!q.text && !q.imageUrl) errors.push("needs text or imageUrl");
    return { ...q, _row: i + 1, _errors: errors, _opts: opts };
  });
}

export default function AdminBulkUpload() {
  const { toast, show } = useToast();

  const [exams, setExams]         = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [topics, setTopics]       = useState([]);
  const [tests, setTests]         = useState([]);

  const [examId, setExamId]       = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId]     = useState("");
  const [isPyq, setIsPyq]         = useState(true);
  const [linkTestId, setLinkTestId] = useState("");
  const [linkTestType, setLinkTestType] = useState("");

  const [raw, setRaw]         = useState("");
  const [parsed, setParsed]   = useState(null);
  const [parseError, setParseError] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/exams").then(({data}) => { if(data.success) setExams(data.exams||[]); });
    apiFetch("/api/admin/tests").then(({data}) => { if(data.success) setTests(data.tests||[]); });
  }, []);

  useEffect(() => {
    if (!examId) { setSubjects([]); return; }
    apiFetch(`/api/admin/subjects?examId=${examId}`).then(({data}) => {
      if(data.success) setSubjects(data.subjects||[]);
    });
  }, [examId]);

  useEffect(() => {
    if (!subjectId) { setTopics([]); return; }
    apiFetch(`/api/admin/topics?subjectId=${subjectId}`).then(({data}) => {
      if(data.success) setTopics(data.topics||[]);
    });
  }, [subjectId]);

  const handleParse = () => {
    setParseError(null); setParsed(null);
    if (!raw.trim()) return setParseError("Paste some JSON first.");
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error("JSON must be an array.");
      if (data.length === 0)    throw new Error("No rows found.");
      if (data.length > 500)    throw new Error(`${data.length} rows — max 500 per batch.`);
      setParsed(validateRows(data));
    } catch(err) { setParseError(`Parse error: ${err.message}`); }
  };

  const validCount = parsed?.filter(r=>r._errors.length===0).length ?? 0;
  const errorCount = (parsed?.length ?? 0) - validCount;

  const handleImport = async () => {
    if (!examId)    return show("Select an exam first","error");
    if (!subjectId) return show("Select a subject first","error");
    if (!parsed || errorCount > 0) return;

    setImporting(true);
    try {
      const questions = parsed.map(({_row,_errors,_opts,...q})=>({
        ...q,
        options: _opts.map(o=>({text:o})),
      }));
      const { ok, data } = await apiFetch("/api/admin/questions/bulk",{
        method:"POST",
        body:JSON.stringify({
          examId, subjectId, topicId:topicId||undefined,
          isPyq, testId:linkTestId||undefined, testType:linkTestType||undefined,
          questions,
        }),
      });
      if (!ok||!data.success) {
        if (data.errors) return show(`Import failed: ${data.errors.slice(0,3).join("; ")}${data.errors.length>3?" …":""}`, "error");
        throw new Error(data.message||"Import failed");
      }
      show(`${data.imported} questions imported successfully`,"success");
      setParsed(null); setRaw("");
    } catch(err) { show(err.message||"Import failed","error"); }
    finally { setImporting(false); }
  };

  return (
    <>
      {/* TARGET SELECTORS */}
      <div className="adm-toolbar" style={{flexWrap:"wrap"}}>
        <select className="adm-select" value={examId} onChange={e=>{setExamId(e.target.value);setSubjectId("");setTopicId("");}}>
          <option value="">Select exam *</option>
          {exams.map(e=><option key={e.id} value={e.id}>{e.exam_name}</option>)}
        </select>
        <select className="adm-select" value={subjectId} onChange={e=>{setSubjectId(e.target.value);setTopicId("");}}>
          <option value="">Select subject *</option>
          {subjects.map(s=><option key={s.id} value={s.id}>{s.subject_name}</option>)}
        </select>
        <select className="adm-select" value={topicId} onChange={e=>setTopicId(e.target.value)}>
          <option value="">Topic (optional)</option>
          {topics.map(t=><option key={t.id} value={t.id}>{t.topic_name}</option>)}
        </select>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12.5,cursor:"pointer",whiteSpace:"nowrap"}}>
          <input type="checkbox" checked={isPyq} onChange={e=>setIsPyq(e.target.checked)}/> PYQ questions
        </label>
      </div>

      <div className="adm-field" style={{marginBottom:12}}>
        <label className="adm-label">Link to Test (optional)</label>
        <select className="adm-select" style={{width:"100%",maxWidth:420}} value={linkTestId}
          onChange={e=>{
            const t = tests.find(x=>String(x.id)===e.target.value);
            setLinkTestId(e.target.value); setLinkTestType(t?._type||"");
          }}>
          <option value="">Don't link to any test</option>
          {tests.map(t=><option key={`${t._type}-${t.id}`} value={t.id}>{t.test_name} ({t._type})</option>)}
        </select>
        <div className="adm-hint">If selected, questions are also added to that test's junction table after import.</div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:10}}>
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={()=>{setRaw(SAMPLE_JSON);setParsed(null);}}>📋 Load Sample</button>
      </div>

      <div className="adm-field">
        <textarea className="adm-textarea" style={{minHeight:220}} value={raw}
          onChange={e=>{setRaw(e.target.value);setParsed(null);setParseError(null);}}
          placeholder={`Paste JSON array. Each item:\n{\n  "text": "Question (English)",\n  "textHi": "प्रश्न (Hindi, optional)",\n  "options": [{"text":"A","textHi":"क"},{"text":"B"},{"text":"C"},{"text":"D"}],\n  "correctAnswer": 0,\n  "explanation": "...",\n  "explanationHi": "... (optional)",\n  "difficulty": "EASY|MEDIUM|HARD",\n  "marks": 1,\n  "negativeMarking": 0.25,\n  "isPyq": true,\n  "pyqYear": 2023,\n  "tier": "TIER_1 (optional)"\n}`}/>
        <div className="adm-hint">
          correctAnswer is 0-based (0=A). Options can be strings or objects with text/textHi/imageUrl. Hindi fields are optional. Max 500 per batch.
        </div>
      </div>

      {parseError && <div className="adm-error-text" style={{marginBottom:14}}>⚠️ {parseError}</div>}

      <button className="adm-btn adm-btn-primary" onClick={handleParse} disabled={!examId||!subjectId}>
        🔍 Parse &amp; Preview
      </button>
      {(!examId||!subjectId) && <span style={{fontSize:11.5,color:"var(--m)",marginLeft:12}}>Select exam &amp; subject first</span>}

      {parsed && (
        <div style={{marginTop:22}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14,flexWrap:"wrap"}}>
            <span className="adm-badge green">{validCount} valid</span>
            {errorCount>0 && <span className="adm-badge" style={{background:"rgba(239,68,68,.1)",color:"var(--red)",border:"1px solid rgba(239,68,68,.25)"}}>{errorCount} with errors</span>}
            <button className="adm-btn adm-btn-primary" onClick={handleImport} disabled={errorCount>0||importing}>
              {importing ? "Importing..." : `✅ Import ${parsed.length} Question${parsed.length===1?"":"s"}`}
            </button>
            {errorCount>0 && <span style={{fontSize:11.5,color:"var(--red)"}}>Fix all errors before importing.</span>}
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Row</th><th>Question</th><th>Options</th><th>Correct</th><th>Difficulty</th><th>Status</th></tr>
              </thead>
              <tbody>
                {parsed.map(q=>(
                  <tr key={q._row} style={q._errors.length>0?{background:"rgba(239,68,68,.05)"}:undefined}>
                    <td className="adm-mono">{q._row}</td>
                    <td style={{maxWidth:260}}>{q.text?(q.text.length>50?q.text.slice(0,50)+"…":q.text):<em style={{color:"var(--m)"}}>—</em>}</td>
                    <td className="adm-mono">{q._opts?.length ?? (q.options?.length ?? 0)}</td>
                    <td>{Number.isInteger(q.correctAnswer) ? ["A","B","C","D"][q.correctAnswer]??q.correctAnswer : "—"}</td>
                    <td>{q.difficulty||"MEDIUM"}</td>
                    <td>{q._errors.length===0
                      ? <span className="adm-badge green">✓ Valid</span>
                      : <span style={{fontSize:10.5,color:"var(--red)"}}>{q._errors.join(", ")}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Toast toast={toast}/>
    </>
  );
}
