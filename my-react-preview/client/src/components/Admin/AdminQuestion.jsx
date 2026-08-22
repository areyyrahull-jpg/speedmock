import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../../services/apiFetch";
import { AdminModal, ConfirmDialog, Toast, useToast } from "./AdminPanel";

const PAGE_SIZE = 50;
const DIFFICULTIES = ["EASY","MEDIUM","HARD"];

// `questions.correct_option` is stored as a letter ('a'|'b'|'c'|'d'), but the
// form/UI works with a 0-based index (0=A). Convert both ways so editing
// reflects the real stored answer instead of always defaulting to Option A.
const LETTER_TO_INDEX = { a:0, b:1, c:2, d:3 };
const INDEX_TO_LETTER = ["a","b","c","d"];
const optionIndexFromRow = (q) => {
  if (Number.isInteger(q?.correctAnswer)) return q.correctAnswer; // already an index, if ever provided
  const letter = (q?.correct_option || "").toString().trim().toLowerCase();
  return LETTER_TO_INDEX[letter] ?? 0;
};

const emptyOption = () => "";
const emptyForm = () => ({
  examId:"", subjectId:"", topicId:"",
  text:"", textHi:"", imageUrl:"",
  options:["","","",""],
  optionsHi:["","","",""],
  optionImages:["","","",""],
  correctAnswer:0,
  explanation:"", explanationHi:"",
  difficulty:"MEDIUM", marks:1, negativeMarking:0.25,
  isPyq:true, pyqYear: new Date().getFullYear(),
  testId:"", testType:"",
});

export default function AdminQuestions({ initialTest }) {
  const { toast, show } = useToast();

  const [exams, setExams]       = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics]     = useState([]);
  const [tests, setTests]       = useState([]);

  // filters
  const [examFilter, setExamFilter]     = useState(initialTest?.exam_id || "");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [topicFilter, setTopicFilter]   = useState("");
  const [isPyqFilter, setIsPyqFilter]   = useState("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);

  const [questions, setQuestions] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  // load lookups
  useEffect(() => {
    apiFetch("/api/admin/exams").then(({data}) => { if(data.success) setExams(data.exams||[]); });
    apiFetch("/api/admin/tests").then(({data}) => { if(data.success) setTests(data.tests||[]); });
  }, []);

  useEffect(() => {
    if (!examFilter) { setSubjects([]); return; }
    apiFetch(`/api/admin/subjects?examId=${examFilter}`).then(({data}) => {
      if(data.success) setSubjects(data.subjects||[]);
    });
  }, [examFilter]);

  useEffect(() => {
    if (!subjectFilter) { setTopics([]); return; }
    apiFetch(`/api/admin/topics?subjectId=${subjectFilter}`).then(({data}) => {
      if(data.success) setTopics(data.topics||[]);
    });
  }, [subjectFilter]);

  // load subjects/topics for form
  const [formSubjects, setFormSubjects] = useState([]);
  const [formTopics, setFormTopics]     = useState([]);
  useEffect(() => {
    if (!form.examId) { setFormSubjects([]); return; }
    apiFetch(`/api/admin/subjects?examId=${form.examId}`).then(({data}) => {
      if(data.success) setFormSubjects(data.subjects||[]);
    });
  }, [form.examId]);
  useEffect(() => {
    if (!form.subjectId) { setFormTopics([]); return; }
    apiFetch(`/api/admin/topics?subjectId=${form.subjectId}`).then(({data}) => {
      if(data.success) setFormTopics(data.topics||[]);
    });
  }, [form.subjectId]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:String(page), limit:String(PAGE_SIZE) });
      if (examFilter)    params.set("examId", examFilter);
      if (subjectFilter) params.set("subjectId", subjectFilter);
      if (topicFilter)   params.set("topicId", topicFilter);
      if (isPyqFilter !== "") params.set("isPyq", isPyqFilter);
      if (search)        params.set("search", search);
      const { ok, data } = await apiFetch(`/api/admin/questions?${params}`);
      if (!ok || !data.success) throw new Error(data.message);
      setQuestions(data.questions||[]);
      setTotal(data.total||0);
    } catch(err) { show(err.message||"Failed to load questions","error"); }
    finally { setLoading(false); }
  }, [examFilter, subjectFilter, topicFilter, isPyqFilter, search, page, show]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
  useEffect(() => { setPage(1); }, [examFilter, subjectFilter, topicFilter, isPyqFilter, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), examId: examFilter, subjectId: subjectFilter,
      testId: initialTest?.id || "", testType: initialTest?._type || "" });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      examId: q.exam_id, subjectId: q.subject_id||"", topicId: q.topic_id||"",
      text: q.question_text||"", textHi: q.question_text_hi||"",
      imageUrl: q.image_url||"",
      options: [q.option_a||"", q.option_b||"", q.option_c||"", q.option_d||""],
      optionsHi: [q.option_a_hi||"", q.option_b_hi||"", q.option_c_hi||"", q.option_d_hi||""],
      optionImages: [q.option_a_image||"", q.option_b_image||"", q.option_c_image||"", q.option_d_image||""],
      correctAnswer: optionIndexFromRow(q),
      explanation: q.explanation||"", explanationHi: q.explanation_hi||"",
      difficulty: q.difficulty||"MEDIUM", marks: q.marks||1,
      negativeMarking: q.negative_marking||0.25,
      isPyq: q.is_pyq, pyqYear: q.pyq_year || new Date().getFullYear(),
      testId:"", testType:"",
    });
    setFormError(null);
    setModalOpen(true);
  };

  // ── KEYBOARD NAVIGATION ─────────────────────────────────────────
  // fieldRefs order matches the visual form top-to-bottom:
  //   [0] question EN, [1] question HI, [2] imageUrl,
  //   [3..6] optionEn A-D, [7..10] optionHi A-D, [11..14] optionImg A-D,
  //   [15] explanation EN, [16] explanation HI
  //
  // GRID maps every arrow-navigable field to a [row, col] position so
  // ArrowUp/Down move between rows and ArrowLeft/Right move between the
  // English / Hindi / Image columns of the same option row.
  const GRID = [
    [2],           // row 0: image URL
    [3, 7, 11],    // row 1: option A  (EN, HI, IMG)
    [4, 8, 12],    // row 2: option B
    [5, 9, 13],    // row 3: option C
    [6, 10, 14],   // row 4: option D
  ];
  const fieldRefs = useRef([]);
  const setRef = (el, idx) => { fieldRefs.current[idx] = el; };

  const gridPos = (idx) => {
    for (let r = 0; r < GRID.length; r++) {
      const c = GRID[r].indexOf(idx);
      if (c !== -1) return [r, c];
    }
    return null;
  };
  const focusIdx = (idx) => { const el = fieldRefs.current[idx]; if (el) el.focus(); };

  const handleKeyNav = useCallback((e, currentIdx) => {
    if (e.target.tagName === "TEXTAREA") return;

    if (e.key === "Enter") {
      e.preventDefault();
      focusIdx(currentIdx + 1);
      return;
    }

    const pos = gridPos(currentIdx);
    if (!pos) return;
    const [row, col] = pos;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextRow = GRID[row + 1];
      if (nextRow) focusIdx(nextRow[Math.min(col, nextRow.length - 1)]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevRow = GRID[row - 1];
      if (prevRow) focusIdx(prevRow[Math.min(col, prevRow.length - 1)]);
    } else if (e.key === "ArrowRight") {
      const input = e.target;
      const atEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
      if (atEnd && GRID[row][col + 1] !== undefined) {
        e.preventDefault();
        focusIdx(GRID[row][col + 1]);
      }
    } else if (e.key === "ArrowLeft") {
      const input = e.target;
      const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
      if (atStart && col > 0) {
        e.preventDefault();
        focusIdx(GRID[row][col - 1]);
      }
    }
  }, []);

  const handleSave = async () => {
    const cleanOptions = form.options.filter(o => o.trim());
    if (!form.examId)              return setFormError("Exam is required.");
    if (!form.subjectId)           return setFormError("Subject is required.");
    if (cleanOptions.length < 2)   return setFormError("At least 2 options required.");
    if (!form.text && !form.imageUrl) return setFormError("Question text or image URL required.");

    setSaving(true); setFormError(null);
    try {
      const payload = {
        examId: form.examId, subjectId: form.subjectId, topicId: form.topicId||undefined,
        text: form.text||undefined, textHi: form.textHi||undefined,
        imageUrl: form.imageUrl||undefined,
        options: cleanOptions.map((o, i) => ({
          text: o,
          textHi: form.optionsHi[i]||undefined,
          imageUrl: form.optionImages[i]||undefined,
        })),
        correctAnswer: Number(form.correctAnswer),
        explanation: form.explanation||undefined,
        explanationHi: form.explanationHi||undefined,
        difficulty: form.difficulty, marks: Number(form.marks),
        negativeMarking: Number(form.negativeMarking),
        isPyq: form.isPyq, pyqYear: form.isPyq ? Number(form.pyqYear) : undefined,
        testId: form.testId||undefined, testType: form.testType||undefined,
      };

      const { ok, data } = editing
        ? await apiFetch(`/api/admin/questions/${editing.id}`, { method:"PUT", body:JSON.stringify(payload) })
        : await apiFetch("/api/admin/questions", { method:"POST", body:JSON.stringify(payload) });

      if (!ok||!data.success) throw new Error(data.message||"Failed to save");
      show(editing ? "Question updated" : "Question added","success");
      setModalOpen(false);
      fetchQuestions();
    } catch(err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { ok, data } = await apiFetch(`/api/admin/questions/${deleteTarget.id}`,{ method:"DELETE" });
      if (!ok||!data.success) throw new Error(data.message);
      show("Question deleted","success");
      setDeleteTarget(null);
      fetchQuestions();
    } catch(err) { show(err.message||"Delete failed","error"); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total/PAGE_SIZE));

  return (
    <>
      {/* FILTERS */}
      <div className="adm-toolbar">
        <select className="adm-select" value={examFilter} onChange={e=>{setExamFilter(e.target.value);setSubjectFilter("");setTopicFilter("");}}>
          <option value="">All Exams</option>
          {exams.map(e=><option key={e.id} value={e.id}>{e.exam_name}</option>)}
        </select>
        <select className="adm-select" value={subjectFilter} onChange={e=>{setSubjectFilter(e.target.value);setTopicFilter("");}}>
          <option value="">All Subjects</option>
          {subjects.map(s=><option key={s.id} value={s.id}>{s.subject_name}</option>)}
        </select>
        <select className="adm-select" value={topicFilter} onChange={e=>setTopicFilter(e.target.value)}>
          <option value="">All Topics</option>
          {topics.map(t=><option key={t.id} value={t.id}>{t.topic_name}</option>)}
        </select>
        <select className="adm-select" value={isPyqFilter} onChange={e=>setIsPyqFilter(e.target.value)}>
          <option value="">PYQ + Practice</option>
          <option value="true">PYQ Only</option>
          <option value="false">Practice Only</option>
        </select>
        <input className="adm-search" style={{minWidth:160}} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>+ Add Question</button>
      </div>

      <div className="adm-table-wrap">
        {loading ? <div className="adm-loading"><div className="adm-spinner"/>Loading...</div>
        : questions.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">📭</div>
            <div className="adm-empty-title">No questions found</div>
            <div className="adm-empty-sub">Add a question or adjust filters.</div>
          </div>
        ) : (
          <>
            <table className="adm-table">
              <thead>
                <tr><th>Question</th><th>Subject</th><th>Difficulty</th><th>Correct</th><th>Type</th><th>Marks</th><th></th></tr>
              </thead>
              <tbody>
                {questions.map(q=>(
                  <tr key={q.id} className="clickable" onClick={()=>openEdit(q)}>
                    <td style={{maxWidth:320}}>
                      {q.image_url && <span style={{marginRight:6}}>🖼️</span>}
                      {q.question_text ? (q.question_text.length>70 ? q.question_text.slice(0,70)+"…" : q.question_text) : <em style={{color:"var(--m)"}}>(image only)</em>}
                    </td>
                    <td className="adm-mono" style={{fontSize:11}}>{q.subject_id}</td>
                    <td><span className={`adm-badge ${q.difficulty==="EASY"?"green":q.difficulty==="HARD"?"amber":"grey"}`}>{q.difficulty}</span></td>
                    <td><span className="adm-badge green">{q.correct_option}</span></td>
                    <td><span className={`adm-badge ${q.is_pyq?"purple":"grey"}`}>{q.is_pyq?"PYQ":"Practice"}</span></td>
                    <td className="adm-mono">{q.marks}</td>
                    <td onClick={e=>e.stopPropagation()}>
                      <div className="adm-row-actions">
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={()=>setDeleteTarget(q)}>🗑️</button>
                      </div>
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

      {/* CREATE / EDIT MODAL */}
      <AdminModal open={modalOpen} onClose={()=>setModalOpen(false)} wide
        title={editing ? `Edit Question` : "New Question"}
        footer={<>
          <button className="adm-btn adm-btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
          <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving?"Saving...":editing?"Save Changes":"Add Question"}
          </button>
        </>}>
        {formError && <div className="adm-error-text" style={{marginBottom:14}}>⚠️ {formError}</div>}

        <div className="adm-row-3">
          <div className="adm-field">
            <label className="adm-label">Exam</label>
            <select className="adm-select" style={{width:"100%"}} value={form.examId}
              onChange={e=>setForm(f=>({...f,examId:e.target.value,subjectId:"",topicId:""}))}>
              <option value="">Select exam...</option>
              {exams.map(e=><option key={e.id} value={e.id}>{e.exam_name}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Subject</label>
            <select className="adm-select" style={{width:"100%"}} value={form.subjectId}
              onChange={e=>setForm(f=>({...f,subjectId:e.target.value,topicId:""}))}>
              <option value="">Select subject...</option>
              {formSubjects.map(s=><option key={s.id} value={s.id}>{s.subject_name}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Topic (optional)</label>
            <select className="adm-select" style={{width:"100%"}} value={form.topicId}
              onChange={e=>setForm(f=>({...f,topicId:e.target.value}))}>
              <option value="">No specific topic</option>
              {formTopics.map(t=><option key={t.id} value={t.id}>{t.topic_name}</option>)}
            </select>
          </div>
        </div>

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Question Text (English)</label>
            <textarea className="adm-textarea" value={form.text}
              ref={el=>setRef(el,0)}
              onChange={e=>setForm(f=>({...f,text:e.target.value}))}
              onKeyDown={e=>{ if(e.key==="Tab"){ e.preventDefault(); fieldRefs.current[1]?.focus(); }}}
              placeholder="Type the question here..."/>
          </div>
          <div className="adm-field">
            <label className="adm-label">Question Text (Hindi)</label>
            <textarea className="adm-textarea" value={form.textHi}
              ref={el=>setRef(el,1)}
              onChange={e=>setForm(f=>({...f,textHi:e.target.value}))}
              onKeyDown={e=>{ if(e.key==="Tab"){ e.preventDefault(); fieldRefs.current[2]?.focus(); }}}
              placeholder="प्रश्न यहाँ लिखें (वैकल्पिक)"/>
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Question Image URL (optional)</label>
          <input className="adm-input" value={form.imageUrl}
            ref={el=>setRef(el,2)}
            onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))}
            onKeyDown={e=>handleKeyNav(e,2)}
            placeholder="https://..."/>
        </div>

        <div className="adm-field">
          <label className="adm-label">Options — click ● to mark correct · Enter or ↓↑ to navigate between rows</label>
          {["A","B","C","D"].map((letter,i) => (
            <div key={i} style={{marginBottom:10,padding:"10px 12px",background:"var(--bg3)",borderRadius:10,border:"1px solid var(--b)"}}>
              <div className="adm-option-row" style={{marginBottom:6}}>
                <div className={`adm-option-radio${form.correctAnswer===i?" selected":""}`}
                  onClick={()=>setForm(f=>({...f,correctAnswer:i}))} title="Mark as correct"/>
                <span style={{fontSize:11,fontWeight:700,color:"var(--m)",width:18,flexShrink:0}}>{letter}</span>
                <input className="adm-input adm-option-input"
                  ref={el=>setRef(el, 3+i)}
                  placeholder={`Option ${letter} (English)`}
                  value={form.options[i]}
                  onKeyDown={e=>handleKeyNav(e, 3+i)}
                  onChange={e=>{
                    const opts=[...form.options];opts[i]=e.target.value;
                    setForm(f=>({...f,options:opts}));
                  }}/>
              </div>
              <div className="adm-row-2" style={{marginLeft:40}}>
                <input className="adm-input"
                  ref={el=>setRef(el, 7+i)}
                  placeholder={`Option ${letter} Hindi (वैकल्पिक)`}
                  value={form.optionsHi[i]}
                  onKeyDown={e=>handleKeyNav(e, 7+i)}
                  onChange={e=>{const h=[...form.optionsHi];h[i]=e.target.value;setForm(f=>({...f,optionsHi:h}));}}/>
                <input className="adm-input"
                  ref={el=>setRef(el, 11+i)}
                  placeholder="Image URL (optional)"
                  value={form.optionImages[i]}
                  onKeyDown={e=>handleKeyNav(e, 11+i)}
                  onChange={e=>{const im=[...form.optionImages];im[i]=e.target.value;setForm(f=>({...f,optionImages:im}));}}/>
              </div>
            </div>
          ))}
        </div>

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Explanation (English, optional)</label>
            <textarea className="adm-textarea" value={form.explanation}
              ref={el=>setRef(el,15)}
              onChange={e=>setForm(f=>({...f,explanation:e.target.value}))}
              onKeyDown={e=>{ if(e.key==="Tab"){ e.preventDefault(); fieldRefs.current[16]?.focus(); }}}
              placeholder="Explanation for correct answer..."/>
          </div>
          <div className="adm-field">
            <label className="adm-label">Explanation (Hindi, optional)</label>
            <textarea className="adm-textarea" value={form.explanationHi}
              ref={el=>setRef(el,16)}
              onChange={e=>setForm(f=>({...f,explanationHi:e.target.value}))}
              placeholder="हिंदी में व्याख्या (वैकल्पिक)"/>
          </div>
        </div>

        <div className="adm-row-3">
          <div className="adm-field">
            <label className="adm-label">Difficulty</label>
            <select className="adm-select" style={{width:"100%"}} value={form.difficulty}
              onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}>
              {DIFFICULTIES.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Marks</label>
            <input className="adm-input" type="number" step="0.5" value={form.marks}
              onChange={e=>setForm(f=>({...f,marks:e.target.value}))}/>
          </div>
          <div className="adm-field">
            <label className="adm-label">Negative Marking</label>
            <input className="adm-input" type="number" step="0.25" value={form.negativeMarking}
              onChange={e=>setForm(f=>({...f,negativeMarking:e.target.value}))}/>
          </div>
        </div>

        <div className="adm-row-2">
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12.5,cursor:"pointer"}}>
            <input type="checkbox" checked={form.isPyq} onChange={e=>setForm(f=>({...f,isPyq:e.target.checked}))}/>
            This is a PYQ question
          </label>
          {form.isPyq && (
            <div className="adm-field">
              <label className="adm-label">PYQ Year</label>
              <input className="adm-input" type="number" value={form.pyqYear}
                onChange={e=>setForm(f=>({...f,pyqYear:e.target.value}))}/>
            </div>
          )}
        </div>

        {!editing && (
          <div className="adm-row-2">
            <div className="adm-field">
              <label className="adm-label">Link to Test (optional)</label>
              <select className="adm-select" style={{width:"100%"}} value={form.testId}
                onChange={e=>{
                  const t = tests.find(x=>String(x.id)===e.target.value);
                  setForm(f=>({...f,testId:e.target.value,testType:t?._type||""}));
                }}>
                <option value="">No test link</option>
                {tests.map(t=><option key={`${t._type}-${t.id}`} value={t.id}>{t.test_name} ({t._type})</option>)}
              </select>
              <div className="adm-hint">If selected, this question will also be added to that test's junction table.</div>
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}
        onConfirm={handleDelete} confirming={deleting} title="Delete Question?"
        message={<>Permanently delete this question? It will also be removed from all tests.</>}/>

      <Toast toast={toast}/>
    </>
  );
}
