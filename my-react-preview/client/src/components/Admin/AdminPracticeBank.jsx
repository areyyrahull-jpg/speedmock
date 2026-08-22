import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../../services/apiFetch";
import { AdminModal, ConfirmDialog, Toast, useToast } from "./AdminPanel";

const PAGE_SIZE = 50;
const DIFFICULTIES = ["EASY","MEDIUM","HARD"];

// `questions.correct_option` is stored as a letter ('a'|'b'|'c'|'d'); the
// form works with a 0-based index. Convert on read so edit shows the real
// stored answer instead of always defaulting to Option A.
const LETTER_TO_INDEX = { a:0, b:1, c:2, d:3 };
const optionIndexFromRow = (q) => {
  if (Number.isInteger(q?.correctAnswer)) return q.correctAnswer;
  const letter = (q?.correct_option || "").toString().trim().toLowerCase();
  return LETTER_TO_INDEX[letter] ?? 0;
};

const SAMPLE_JSON = `[
  {
    "text": "What is the square root of 144?",
    "options": ["10","12","14","16"],
    "correctAnswer": 1,
    "difficulty": "EASY"
  },
  {
    "text": "A train travels 60 km in 45 minutes. Speed in km/h?",
    "options": ["75","80","85","90"],
    "correctAnswer": 1,
    "difficulty": "MEDIUM"
  }
]`;

function validateRows(rows) {
  return rows.map((q, i) => {
    const errors = [];
    const opts = Array.isArray(q.options) ? q.options.map(o=>typeof o==="string"?o:o?.text||"") : [];
    if (opts.length < 2)          errors.push("needs at least 2 options");
    if (!opts.every(o=>o.trim())) errors.push("blank option found");
    if (q.correctAnswer === undefined) errors.push("missing correctAnswer");
    else if (q.correctAnswer < 0 || q.correctAnswer >= opts.length) errors.push("correctAnswer out of range");
    if (!q.text && !q.imageUrl)   errors.push("needs text or imageUrl");
    return { ...q, _row: i + 1, _errors: errors, _opts: opts };
  });
}

export default function AdminPracticeBank() {
  const { toast, show } = useToast();
  const [mode, setMode]       = useState("manage"); // "manage" | "bulk"

  const [exams, setExams]         = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [topics, setTopics]       = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);

  const [examId, setExamId]       = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId]     = useState("");

  useEffect(() => {
    apiFetch("/api/admin/exams").then(({data})=>{ if(data.success) setExams(data.exams||[]); });
  }, []);
  useEffect(() => {
    if (!examId) { setSubjects([]); return; }
    apiFetch(`/api/admin/subjects?examId=${examId}`).then(({data})=>{ if(data.success) setSubjects(data.subjects||[]); });
  }, [examId]);
  useEffect(() => {
    if (!subjectId) { setTopics([]); return; }
    apiFetch(`/api/admin/topics?subjectId=${subjectId}`).then(({data})=>{ if(data.success) setTopics(data.topics||[]); });
  }, [subjectId]);

  // topics that already have practice questions (for the topic picker)
  const fetchAvailableTopics = useCallback(async () => {
    if (!examId || !subjectId) { setAvailableTopics([]); return; }
    const { data } = await apiFetch(`/api/admin/practice-questions/topics?examId=${examId}&subjectId=${subjectId}`);
    if (data.success) setAvailableTopics(data.topics||[]);
  }, [examId, subjectId]);
  useEffect(() => { fetchAvailableTopics(); }, [fetchAvailableTopics]);

  return (
    <>
      {/* SELECTORS */}
      <div className="adm-toolbar">
        <select className="adm-select" value={examId} onChange={e=>{setExamId(e.target.value);setSubjectId("");setTopicId("");}}>
          <option value="">Select exam *</option>
          {exams.map(e=><option key={e.id} value={e.id}>{e.exam_name}</option>)}
        </select>
        <select className="adm-select" value={subjectId} onChange={e=>{setSubjectId(e.target.value);setTopicId("");}}>
          <option value="">Select subject *</option>
          {subjects.map(s=><option key={s.id} value={s.id}>{s.subject_name}</option>)}
        </select>
        <select className="adm-select" value={topicId} onChange={e=>setTopicId(e.target.value)}>
          <option value="">All Topics</option>
          {availableTopics.map(t=><option key={t.topicId} value={t.topicId}>{t.topicName} ({t.count})</option>)}
        </select>
        <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
          <button className={`adm-btn adm-btn-sm ${mode==="manage"?"adm-btn-primary":"adm-btn-ghost"}`} onClick={()=>setMode("manage")}>📋 Manage</button>
          <button className={`adm-btn adm-btn-sm ${mode==="bulk"?"adm-btn-primary":"adm-btn-ghost"}`} onClick={()=>setMode("bulk")}>📤 Bulk Upload</button>
        </div>
      </div>

      {!examId || !subjectId ? (
        <div className="adm-empty" style={{padding:40}}>
          <div className="adm-empty-icon">👆</div>
          <div className="adm-empty-title">Select exam &amp; subject</div>
          <div className="adm-empty-sub">Choose an exam and subject to manage practice questions.</div>
        </div>
      ) : mode === "manage" ? (
        <ManageView examId={examId} subjectId={subjectId} topicId={topicId}
          topics={topics} show={show} onChanged={fetchAvailableTopics}/>
      ) : (
        <BulkView examId={examId} subjectId={subjectId} topics={topics} show={show} onChanged={fetchAvailableTopics}/>
      )}

      <Toast toast={toast}/>
    </>
  );
}

/* ── MANAGE VIEW ─────────────────────────────────────────────────── */
function ManageView({ examId, subjectId, topicId, topics, show, onChanged }) {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({
    text:"", textHi:"", imageUrl:"",
    options:["","","",""], optionsHi:["","","",""], optionImages:["","","",""],
    correctAnswer:0, explanation:"", explanationHi:"",
    difficulty:"MEDIUM", topicId:"",
  });
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  // ── KEYBOARD NAVIGATION ───────────────────────────────────────
  // field indices: [0..3] option EN A-D, [4..7] option HI A-D, [8..11] option IMG A-D
  const GRID = [
    [0, 4, 8],   // option A: EN, HI, IMG
    [1, 5, 9],   // option B
    [2, 6, 10],  // option C
    [3, 7, 11],  // option D
  ];
  const fieldRefs = useRef([]);
  const setRef = (el, idx) => { fieldRefs.current[idx] = el; };
  const focusIdx = (idx) => { const el = fieldRefs.current[idx]; if (el) el.focus(); };
  const gridPos = (idx) => {
    for (let r = 0; r < GRID.length; r++) {
      const c = GRID[r].indexOf(idx);
      if (c !== -1) return [r, c];
    }
    return null;
  };
  const handleKeyNav = useCallback((e, currentIdx) => {
    if (e.target.tagName === "TEXTAREA") return;
    if (e.key === "Enter") { e.preventDefault(); focusIdx(currentIdx + 1); return; }
    const pos = gridPos(currentIdx);
    if (!pos) return;
    const [row, col] = pos;
    if (e.key === "ArrowDown") { e.preventDefault(); if (GRID[row+1]) focusIdx(GRID[row+1][col]); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (GRID[row-1]) focusIdx(GRID[row-1][col]); }
    else if (e.key === "ArrowRight") {
      const el = e.target;
      if (el.selectionStart === el.value.length && GRID[row][col+1] !== undefined) { e.preventDefault(); focusIdx(GRID[row][col+1]); }
    } else if (e.key === "ArrowLeft") {
      const el = e.target;
      if (el.selectionStart === 0 && col > 0) { e.preventDefault(); focusIdx(GRID[row][col-1]); }
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ examId, subjectId, isPyq:"false", page:String(page), limit:String(PAGE_SIZE) });
      if (topicId)    params.set("topicId", topicId);
      if (difficulty) params.set("difficulty", difficulty);
      if (search)     params.set("search", search);
      const { ok, data } = await apiFetch(`/api/admin/practice-questions?${params}`);
      if (!ok||!data.success) throw new Error(data.message);
      setQuestions(data.questions||[]);
      setTotal(data.total||0);
    } catch(err) { show(err.message,"error"); }
    finally { setLoading(false); }
  }, [examId, subjectId, topicId, difficulty, search, page, show]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
  useEffect(() => { setPage(1); }, [examId, subjectId, topicId, difficulty, search]);

  const emptyForm = (tid) => ({
    text:"", textHi:"", imageUrl:"",
    options:["","","",""], optionsHi:["","","",""], optionImages:["","","",""],
    correctAnswer:0, explanation:"", explanationHi:"",
    difficulty:"MEDIUM", topicId: tid||"",
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(topicId));
    setFormError(null); setModalOpen(true);
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      text: q.question_text||"", textHi: q.question_text_hi||"",
      imageUrl: q.image_url||"",
      options:     [q.option_a||"",    q.option_b||"",    q.option_c||"",    q.option_d||""],
      optionsHi:   [q.option_a_hi||"", q.option_b_hi||"", q.option_c_hi||"", q.option_d_hi||""],
      optionImages:[q.option_a_image||"",q.option_b_image||"",q.option_c_image||"",q.option_d_image||""],
      correctAnswer: optionIndexFromRow(q),
      explanation: q.explanation||"", explanationHi: q.explanation_hi||"",
      difficulty: q.difficulty||"MEDIUM", topicId: q.topic_id||"",
    });
    setFormError(null); setModalOpen(true);
  };

  const handleSave = async () => {
    const cleanOpts = form.options.filter(o=>o.trim());
    if (cleanOpts.length < 2)        return setFormError("At least 2 options required.");
    if (!form.text && !form.imageUrl) return setFormError("Question text or image URL required.");

    setSaving(true); setFormError(null);
    try {
      const payload = {
        examId, subjectId, topicId: form.topicId||undefined,
        text: form.text||undefined, textHi: form.textHi||undefined,
        imageUrl: form.imageUrl||undefined,
        options: cleanOpts.map((o,i) => ({
          text: o,
          textHi: form.optionsHi[i]||undefined,
          imageUrl: form.optionImages[i]||undefined,
        })),
        correctAnswer: Number(form.correctAnswer),
        explanation: form.explanation||undefined,
        explanationHi: form.explanationHi||undefined,
        difficulty: form.difficulty, isPyq: false,
      };
      const { ok, data } = editing
        ? await apiFetch(`/api/admin/practice-questions/${editing.id}`,{method:"PUT",body:JSON.stringify(payload)})
        : await apiFetch("/api/admin/practice-questions",{method:"POST",body:JSON.stringify(payload)});
      if (!ok||!data.success) throw new Error(data.message||"Failed to save");
      show(editing?"Question updated":"Question added","success");
      setModalOpen(false); fetchQuestions(); onChanged?.();
    } catch(err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { ok, data } = await apiFetch(`/api/admin/practice-questions/${deleteTarget.id}`,{method:"DELETE"});
      if (!ok||!data.success) throw new Error(data.message);
      show("Deleted","success"); setDeleteTarget(null); fetchQuestions(); onChanged?.();
    } catch(err) { show(err.message,"error"); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.max(1,Math.ceil(total/PAGE_SIZE));

  return (
    <>
      <div className="adm-toolbar">
        <input className="adm-search" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="adm-select" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>+ Add Question</button>
      </div>

      <div className="adm-table-wrap">
        {loading ? <div className="adm-loading"><div className="adm-spinner"/>Loading...</div>
        : questions.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">📭</div>
            <div className="adm-empty-title">No practice questions yet</div>
            <div className="adm-empty-sub">Add individually or use Bulk Upload.</div>
          </div>
        ) : (
          <>
            <table className="adm-table">
              <thead><tr><th>Question</th><th>Hindi</th><th>Difficulty</th><th>Correct</th><th></th></tr></thead>
              <tbody>
                {questions.map(q=>(
                  <tr key={q.id} className="clickable" onClick={()=>openEdit(q)}>
                    <td style={{maxWidth:280}}>
                      {q.image_url&&<span style={{marginRight:6}}>🖼️</span>}
                      {q.question_text?(q.question_text.length>60?q.question_text.slice(0,60)+"…":q.question_text):<em style={{color:"var(--m)"}}>image only</em>}
                    </td>
                    <td style={{maxWidth:180,color:"var(--m)",fontSize:11.5}}>
                      {q.question_text_hi ? (q.question_text_hi.length>40?q.question_text_hi.slice(0,40)+"…":q.question_text_hi) : <em>—</em>}
                    </td>
                    <td><span className={`adm-badge ${q.difficulty==="EASY"?"green":q.difficulty==="HARD"?"amber":"grey"}`}>{q.difficulty}</span></td>
                    <td><span className="adm-badge green">{q.correct_option}</span></td>
                    <td onClick={e=>e.stopPropagation()}>
                      <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={()=>setDeleteTarget(q)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="adm-pagination">
              <span>{total} question{total===1?"":"s"}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      <AdminModal open={modalOpen} onClose={()=>setModalOpen(false)} wide
        title={editing?"Edit Practice Question":"New Practice Question"}
        footer={<>
          <button className="adm-btn adm-btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
          <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving?"Saving...":editing?"Save Changes":"Add Question"}
          </button>
        </>}>
        {formError && <div className="adm-error-text" style={{marginBottom:14}}>⚠️ {formError}</div>}

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Topic (optional)</label>
            <select className="adm-select" style={{width:"100%"}} value={form.topicId} onChange={e=>setForm(f=>({...f,topicId:e.target.value}))}>
              <option value="">No specific topic</option>
              {topics.map(t=><option key={t.id} value={t.id}>{t.topic_name}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Difficulty</label>
            <select className="adm-select" style={{width:"100%"}} value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}>
              {DIFFICULTIES.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Question Text (English)</label>
            <textarea className="adm-textarea" value={form.text}
              onChange={e=>setForm(f=>({...f,text:e.target.value}))}
              placeholder="Type question..."/>
          </div>
          <div className="adm-field">
            <label className="adm-label">Question Text (Hindi)</label>
            <textarea className="adm-textarea" value={form.textHi}
              onChange={e=>setForm(f=>({...f,textHi:e.target.value}))}
              placeholder="प्रश्न यहाँ लिखें (वैकल्पिक)"/>
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Image URL (optional)</label>
          <input className="adm-input" value={form.imageUrl}
            onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))}
            placeholder="https://..."/>
        </div>

        <div className="adm-field">
          <label className="adm-label">Options — click ● to mark correct · English + Hindi + Image per option</label>
          {["A","B","C","D"].map((letter,i)=>(
            <div key={i} style={{marginBottom:10,padding:"10px 12px",background:"var(--bg3)",borderRadius:10,border:"1px solid var(--b)"}}>
              <div className="adm-option-row" style={{marginBottom:6}}>
                <div className={`adm-option-radio${form.correctAnswer===i?" selected":""}`}
                  onClick={()=>setForm(f=>({...f,correctAnswer:i}))} title="Mark as correct"/>
                <span style={{fontSize:11,fontWeight:700,color:"var(--m)",width:18,flexShrink:0}}>{letter}</span>
                <input className="adm-input adm-option-input"
                  ref={el=>setRef(el, i)}
                  placeholder={`Option ${letter} (English)`}
                  value={form.options[i]}
                  onKeyDown={e=>handleKeyNav(e, i)}
                  onChange={e=>{const o=[...form.options];o[i]=e.target.value;setForm(f=>({...f,options:o}));}}/>
              </div>
              <div className="adm-row-2" style={{marginLeft:40}}>
                <input className="adm-input"
                  ref={el=>setRef(el, 4+i)}
                  placeholder={`Option ${letter} Hindi (वैकल्पिक)`}
                  value={form.optionsHi[i]}
                  onKeyDown={e=>handleKeyNav(e, 4+i)}
                  onChange={e=>{const h=[...form.optionsHi];h[i]=e.target.value;setForm(f=>({...f,optionsHi:h}));}}/>
                <input className="adm-input"
                  ref={el=>setRef(el, 8+i)}
                  placeholder="Image URL (optional)"
                  value={form.optionImages[i]}
                  onKeyDown={e=>handleKeyNav(e, 8+i)}
                  onChange={e=>{const im=[...form.optionImages];im[i]=e.target.value;setForm(f=>({...f,optionImages:im}));}}/>
              </div>
            </div>
          ))}
        </div>

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Explanation (English, optional)</label>
            <textarea className="adm-textarea" value={form.explanation}
              onChange={e=>setForm(f=>({...f,explanation:e.target.value}))}
              placeholder="Explanation for correct answer..."/>
          </div>
          <div className="adm-field">
            <label className="adm-label">Explanation (Hindi, optional)</label>
            <textarea className="adm-textarea" value={form.explanationHi}
              onChange={e=>setForm(f=>({...f,explanationHi:e.target.value}))}
              placeholder="हिंदी में व्याख्या (वैकल्पिक)"/>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}
        onConfirm={handleDelete} confirming={deleting} title="Delete Question?"
        message="Permanently delete this practice question?"/>
    </>
  );
}

/* ── BULK VIEW ───────────────────────────────────────────────────── */
function BulkView({ examId, subjectId, topics, show, onChanged }) {
  const [topicId, setTopicId]   = useState("");
  const [raw, setRaw]           = useState("");
  const [parsed, setParsed]     = useState(null);
  const [parseError, setParseError] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleParse = () => {
    setParseError(null); setParsed(null);
    if (!raw.trim()) return setParseError("Paste some JSON first.");
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error("JSON must be an array.");
      if (data.length === 0)    throw new Error("No rows found.");
      if (data.length > 500)    throw new Error(`${data.length} rows — max 500.`);
      setParsed(validateRows(data));
    } catch(err) { setParseError(`Parse error: ${err.message}`); }
  };

  const validCount = parsed?.filter(r=>r._errors.length===0).length ?? 0;
  const errorCount = (parsed?.length ?? 0) - validCount;

  const handleImport = async () => {
    if (!parsed||errorCount>0) return;
    setImporting(true);
    try {
      const questions = parsed.map(({_row,_errors,_opts,...q})=>({
        ...q, options:_opts.map(o=>({text:o})),
      }));
      const { ok, data } = await apiFetch("/api/admin/practice-questions/bulk",{
        method:"POST",
        body:JSON.stringify({ examId, subjectId, topicId:topicId||undefined, questions }),
      });
      if (!ok||!data.success) throw new Error(data.message||"Import failed");
      show(`${data.imported} questions imported`,"success");
      setParsed(null); setRaw(""); onChanged?.();
    } catch(err) { show(err.message,"error"); }
    finally { setImporting(false); }
  };

  return (
    <>
      <div className="adm-field" style={{marginBottom:12,maxWidth:340}}>
        <label className="adm-label">Topic (optional — applies to all imported rows)</label>
        <select className="adm-select" style={{width:"100%"}} value={topicId} onChange={e=>setTopicId(e.target.value)}>
          <option value="">No specific topic</option>
          {topics.map(t=><option key={t.id} value={t.id}>{t.topic_name}</option>)}
        </select>
      </div>

      <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{marginBottom:10}}
        onClick={()=>{setRaw(SAMPLE_JSON);setParsed(null);}}>📋 Load Sample</button>

      <div className="adm-field">
        <textarea className="adm-textarea" style={{minHeight:200}} value={raw}
          onChange={e=>{setRaw(e.target.value);setParsed(null);setParseError(null);}}
          placeholder={`Paste JSON array. Each item:\n{ "text":"...", "options":["A","B","C","D"], "correctAnswer":0, "difficulty":"EASY" }`}/>
        <div className="adm-hint">correctAnswer is 0-based (0=A). Difficulty: EASY / MEDIUM / HARD. Max 500 per batch.</div>
      </div>

      {parseError && <div className="adm-error-text" style={{marginBottom:14}}>⚠️ {parseError}</div>}
      <button className="adm-btn adm-btn-primary" onClick={handleParse}>🔍 Parse &amp; Preview</button>

      {parsed && (
        <div style={{marginTop:20}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14,flexWrap:"wrap"}}>
            <span className="adm-badge green">{validCount} valid</span>
            {errorCount>0 && <span className="adm-badge" style={{background:"rgba(239,68,68,.1)",color:"var(--red)",border:"1px solid rgba(239,68,68,.25)"}}>{errorCount} with errors</span>}
            <button className="adm-btn adm-btn-primary" onClick={handleImport} disabled={errorCount>0||importing}>
              {importing?"Importing...":`✅ Import ${parsed.length} Question${parsed.length===1?"":"s"}`}
            </button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Row</th><th>Question</th><th>Options</th><th>Correct</th><th>Difficulty</th><th>Status</th></tr></thead>
              <tbody>
                {parsed.map(q=>(
                  <tr key={q._row} style={q._errors.length>0?{background:"rgba(239,68,68,.05)"}:undefined}>
                    <td className="adm-mono">{q._row}</td>
                    <td style={{maxWidth:260}}>{q.text?(q.text.length>50?q.text.slice(0,50)+"…":q.text):"—"}</td>
                    <td className="adm-mono">{q._opts?.length??0}</td>
                    <td>{Number.isInteger(q.correctAnswer)?["A","B","C","D"][q.correctAnswer]??"—":"—"}</td>
                    <td>{q.difficulty||"MEDIUM"}</td>
                    <td>{q._errors.length===0
                      ?<span className="adm-badge green">✓ Valid</span>
                      :<span style={{fontSize:10.5,color:"var(--red)"}}>{q._errors.join(", ")}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
