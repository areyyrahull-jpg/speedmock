import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../services/apiFetch";
import { AdminModal, ConfirmDialog, Toast, useToast } from "./AdminPanel";

const TEST_TYPES = [
  { id:"pyq",     label:"PYQ Paper",      icon:"📜" },
  { id:"mock",    label:"Full Mock Test",  icon:"🎯" },
  { id:"subject", label:"Subject-wise",    icon:"📚" },
  { id:"topic",   label:"Topic-wise",      icon:"🔬" },
];

const emptyForm = () => ({
  testType:"pyq", examId:"", subjectId:"", topicId:"",
  testName:"", testYear: new Date().getFullYear(),
  totalQuestions:100, durationMinutes:60, displayOrder:0,
  description:"", testDate:"", testNumber:1,
});

export default function AdminTests({ onViewQuestions }) {
  const { toast, show } = useToast();
  const [tests, setTests]         = useState([]);
  const [exams, setExams]         = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [topics, setTopics]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [examFilter, setExamFilter]   = useState("");
  const [typeFilter, setTypeFilter]   = useState("");
  const [search, setSearch]           = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(emptyForm());
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  // ── BATCH GENERATOR ──────────────────────────────────────────
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({ testType: "subject", examId: "", subjectId: "", topicId: "" });
  const [batchSubjects, setBatchSubjects] = useState([]);
  const [batchTopics, setBatchTopics] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [batchError, setBatchError] = useState(null);
  const [batchResult, setBatchResult] = useState(null);

  useEffect(() => {
    if (!batchForm.examId) { setBatchSubjects([]); return; }
    apiFetch(`/api/admin/subjects?examId=${batchForm.examId}`).then(({ data }) => {
      if (data.success) setBatchSubjects(data.subjects || []);
    });
  }, [batchForm.examId]);
  useEffect(() => {
    if (!batchForm.subjectId) { setBatchTopics([]); return; }
    apiFetch(`/api/admin/topics?subjectId=${batchForm.subjectId}`).then(({ data }) => {
      if (data.success) setBatchTopics(data.topics || []);
    });
  }, [batchForm.subjectId]);

  const openBatchModal = () => {
    setBatchForm({ testType: "subject", examId: "", subjectId: "", topicId: "" });
    setBatchError(null); setBatchResult(null); setBatchModalOpen(true);
  };

  const handleGenerateBatches = async () => {
    if (!batchForm.examId)    return setBatchError("Exam is required.");
    if (!batchForm.subjectId) return setBatchError("Subject is required.");
    if (batchForm.testType === "topic" && !batchForm.topicId) return setBatchError("Topic is required.");

    setGenerating(true); setBatchError(null); setBatchResult(null);
    try {
      const { ok, data } = await apiFetch("/api/admin/tests/generate-batches", {
        method: "POST",
        body: JSON.stringify({
          testType: batchForm.testType, examId: batchForm.examId,
          subjectId: batchForm.subjectId, topicId: batchForm.topicId || undefined,
        }),
      });
      if (!ok || !data.success) throw new Error(data.message || "Failed to generate batches");
      setBatchResult(data);
      if (data.batchesCreated > 0) { show(`${data.batchesCreated} batch(es) created`, "success"); fetchTests(); }
    } catch (err) { setBatchError(err.message); }
    finally { setGenerating(false); }
  };

  // load exam list for dropdowns
  useEffect(() => {
    apiFetch("/api/admin/exams").then(({ data }) => {
      if (data.success) setExams(data.exams || []);
    });
  }, []);

  // load subjects when exam changes in form
  useEffect(() => {
    if (!form.examId) { setSubjects([]); return; }
    apiFetch(`/api/admin/subjects?examId=${form.examId}`).then(({ data }) => {
      if (data.success) setSubjects(data.subjects || []);
    });
  }, [form.examId]);

  // load topics when subject changes in form
  useEffect(() => {
    if (!form.subjectId) { setTopics([]); return; }
    apiFetch(`/api/admin/topics?subjectId=${form.subjectId}`).then(({ data }) => {
      if (data.success) setTopics(data.topics || []);
    });
  }, [form.subjectId]);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (examFilter) params.set("examId", examFilter);
      if (typeFilter) params.set("testType", typeFilter);
      if (search) params.set("search", search);
      const { ok, data } = await apiFetch(`/api/admin/tests?${params}`);
      if (!ok || !data.success) throw new Error(data.message);
      setTests(data.tests || []);
    } catch (err) { show(err.message || "Failed to load tests", "error"); }
    finally { setLoading(false); }
  }, [examFilter, typeFilter, search, show]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setFormError(null); setModalOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      testType: t._type, examId: t.exam_id, subjectId: t.subject_id || "",
      topicId: t.topic_id || "", testName: t.test_name,
      testYear: t.test_year || new Date().getFullYear(),
      totalQuestions: t.total_questions, durationMinutes: t.duration_minutes,
      displayOrder: t.display_order || 0, description: t.description || "",
      testDate: t.test_date || "", testNumber: t.test_number || 1,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.testName.trim()) return setFormError("Test name is required.");
    if (!form.examId)          return setFormError("Exam is required.");
    if (!form.totalQuestions)  return setFormError("Total questions is required.");
    if (!form.durationMinutes) return setFormError("Duration is required.");
    if ((form.testType === "subject") && !form.subjectId) return setFormError("Subject is required for subject-wise test.");
    if ((form.testType === "topic")   && !form.topicId)   return setFormError("Topic is required for topic-wise test.");

    setSaving(true); setFormError(null);
    try {
      const body = {
        testType: form.testType, examId: form.examId, subjectId: form.subjectId || undefined,
        topicId: form.topicId || undefined, testName: form.testName,
        testYear: Number(form.testYear), totalQuestions: Number(form.totalQuestions),
        durationMinutes: Number(form.durationMinutes), displayOrder: Number(form.displayOrder),
        description: form.description || undefined, testDate: form.testDate || undefined,
        testNumber: Number(form.testNumber),
      };

      const { ok, data } = editing
        ? await apiFetch(`/api/admin/tests/${editing._type}/${editing.id}`, { method:"PUT", body:JSON.stringify(body) })
        : await apiFetch("/api/admin/tests", { method:"POST", body:JSON.stringify(body) });

      if (!ok || !data.success) throw new Error(data.message || "Failed to save test");
      show(editing ? "Test updated" : "Test created", "success");
      setModalOpen(false);
      fetchTests();
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { ok, data } = await apiFetch(`/api/admin/tests/${deleteTarget._type}/${deleteTarget.id}`, { method:"DELETE" });
      if (!ok || !data.success) throw new Error(data.message);
      show("Test deleted", "success");
      setDeleteTarget(null);
      fetchTests();
    } catch (err) { show(err.message || "Failed to delete", "error"); }
    finally { setDeleting(false); }
  };

  const typeLabel = (type) => TEST_TYPES.find(t=>t.id===type)?.label || type;
  const typeIcon  = (type) => TEST_TYPES.find(t=>t.id===type)?.icon  || "📝";

  return (
    <>
      <div className="adm-toolbar">
        <input className="adm-search" placeholder="Search tests..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="adm-select" value={examFilter} onChange={e=>setExamFilter(e.target.value)}>
          <option value="">All Exams</option>
          {exams.map(e=><option key={e.id} value={e.id}>{e.exam_name}</option>)}
        </select>
        <select className="adm-select" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TEST_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <button className="adm-btn adm-btn-ghost" onClick={openBatchModal}>⚡ Generate Batches</button>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>+ New Test</button>
      </div>

      <div className="adm-table-wrap">
        {loading ? <div className="adm-loading"><div className="adm-spinner"/>Loading tests...</div>
        : tests.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">📭</div>
            <div className="adm-empty-title">No tests found</div>
            <div className="adm-empty-sub">Create your first test to start adding questions.</div>
          </div>
        ) : (
          <table className="adm-table">
            <thead><tr><th>Test Name</th><th>Exam</th><th>Type</th><th>Questions</th><th>Duration</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {tests.map(t => (
                <tr key={`${t._type}-${t.id}`} className="clickable" onClick={()=>openEdit(t)}>
                  <td>{typeIcon(t._type)} {t.test_name}{t.test_year ? ` (${t.test_year})` : ""}</td>
                  <td><span className="adm-badge grey">{t.exam_id}</span></td>
                  <td><span className="adm-badge purple">{typeLabel(t._type)}</span></td>
                  <td className="adm-mono">{t.total_questions}</td>
                  <td className="adm-mono">{t.duration_minutes}m</td>
                  <td><span className={`adm-badge ${t.is_active ? "green" : "grey"}`}>{t.is_active ? "Yes" : "No"}</span></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="adm-row-actions">
                      <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={()=>onViewQuestions?.(t)}>❓ Qs</button>
                      <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={()=>setDeleteTarget(t)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AdminModal open={modalOpen} onClose={()=>setModalOpen(false)} wide
        title={editing ? "Edit Test" : "New Test"}
        footer={<>
          <button className="adm-btn adm-btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
          <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editing ? "Save Changes" : "Create Test"}
          </button>
        </>}>
        {formError && <div className="adm-error-text" style={{marginBottom:14}}>⚠️ {formError}</div>}

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Test Type</label>
            <select className="adm-select" style={{width:"100%"}} value={form.testType}
              onChange={e=>setForm(f=>({...f, testType:e.target.value, subjectId:"", topicId:""}))}>
              {TEST_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Exam</label>
            <select className="adm-select" style={{width:"100%"}} value={form.examId}
              onChange={e=>setForm(f=>({...f, examId:e.target.value, subjectId:"", topicId:""}))}>
              <option value="">Select exam...</option>
              {exams.map(e=><option key={e.id} value={e.id}>{e.exam_name}</option>)}
            </select>
          </div>
        </div>

        {(form.testType === "subject" || form.testType === "topic") && (
          <div className="adm-row-2">
            <div className="adm-field">
              <label className="adm-label">Subject</label>
              <select className="adm-select" style={{width:"100%"}} value={form.subjectId}
                onChange={e=>setForm(f=>({...f, subjectId:e.target.value, topicId:""}))}>
                <option value="">Select subject...</option>
                {subjects.map(s=><option key={s.id} value={s.id}>{s.subject_name}</option>)}
              </select>
            </div>
            {form.testType === "topic" && (
              <div className="adm-field">
                <label className="adm-label">Topic</label>
                <select className="adm-select" style={{width:"100%"}} value={form.topicId}
                  onChange={e=>setForm(f=>({...f, topicId:e.target.value}))}>
                  <option value="">Select topic...</option>
                  {topics.map(t=><option key={t.id} value={t.id}>{t.topic_name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="adm-field">
          <label className="adm-label">Test Name</label>
          <input className="adm-input" value={form.testName} onChange={e=>setForm(f=>({...f, testName:e.target.value}))}
            placeholder="e.g. SSC CGL Tier I — 2024 Shift 1"/>
        </div>

        <div className="adm-row-3">
          <div className="adm-field">
            <label className="adm-label">Total Questions</label>
            <input className="adm-input" type="number" value={form.totalQuestions} onChange={e=>setForm(f=>({...f, totalQuestions:e.target.value}))}/>
          </div>
          <div className="adm-field">
            <label className="adm-label">Duration (mins)</label>
            <input className="adm-input" type="number" value={form.durationMinutes} onChange={e=>setForm(f=>({...f, durationMinutes:e.target.value}))}/>
          </div>
          {form.testType === "pyq" && (
            <div className="adm-field">
              <label className="adm-label">Year</label>
              <input className="adm-input" type="number" value={form.testYear} onChange={e=>setForm(f=>({...f, testYear:e.target.value}))}/>
            </div>
          )}
        </div>

        <div className="adm-field">
          <label className="adm-label">Description (optional)</label>
          <textarea className="adm-textarea" value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))}/>
        </div>
      </AdminModal>

      {/* GENERATE BATCHES MODAL */}
      <AdminModal open={batchModalOpen} onClose={()=>setBatchModalOpen(false)}
        title="Generate PYQ Batches"
        footer={<>
          <button className="adm-btn adm-btn-ghost" onClick={()=>setBatchModalOpen(false)}>Close</button>
          <button className="adm-btn adm-btn-primary" onClick={handleGenerateBatches} disabled={generating}>
            {generating ? "Generating..." : "⚡ Generate"}
          </button>
        </>}>
        <div className="adm-hint" style={{marginBottom:16}}>
          Splits every PYQ question for the selected subject (or topic), sorted oldest→newest by year,
          into 20-question / 20-minute test batches. Existing tests are untouched — running this again
          only adds batches for questions not already covered.
        </div>

        {batchError && <div className="adm-error-text" style={{marginBottom:14}}>⚠️ {batchError}</div>}
        {batchResult && !batchError && (
          <div className="adm-hint" style={{marginBottom:14, color: batchResult.batchesCreated>0 ? "var(--green)" : "var(--m)"}}>
            {batchResult.batchesCreated > 0 ? `✅ Created ${batchResult.batchesCreated} batch(es).` : `ℹ️ ${batchResult.message || "Nothing new to generate."}`}
          </div>
        )}

        <div className="adm-field">
          <label className="adm-label">Test Type</label>
          <select className="adm-select" style={{width:"100%"}} value={batchForm.testType}
            onChange={e=>setBatchForm(f=>({...f, testType:e.target.value, topicId:""}))}>
            <option value="subject">📚 Subject-wise</option>
            <option value="topic">🔬 Topic-wise</option>
          </select>
        </div>

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Exam</label>
            <select className="adm-select" style={{width:"100%"}} value={batchForm.examId}
              onChange={e=>setBatchForm(f=>({...f, examId:e.target.value, subjectId:"", topicId:""}))}>
              <option value="">Select exam...</option>
              {exams.map(e=><option key={e.id} value={e.id}>{e.exam_name}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Subject</label>
            <select className="adm-select" style={{width:"100%"}} value={batchForm.subjectId}
              onChange={e=>setBatchForm(f=>({...f, subjectId:e.target.value, topicId:""}))}>
              <option value="">Select subject...</option>
              {batchSubjects.map(s=><option key={s.id} value={s.id}>{s.subject_name}</option>)}
            </select>
          </div>
        </div>

        {batchForm.testType === "topic" && (
          <div className="adm-field">
            <label className="adm-label">Topic</label>
            <select className="adm-select" style={{width:"100%"}} value={batchForm.topicId}
              onChange={e=>setBatchForm(f=>({...f, topicId:e.target.value}))}>
              <option value="">Select topic...</option>
              {batchTopics.map(t=><option key={t.id} value={t.id}>{t.topic_name}</option>)}
            </select>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}
        onConfirm={handleDelete} confirming={deleting} title="Delete Test?"
        message={<>Permanently delete <strong>{deleteTarget?.test_name}</strong>? This also removes it from all junction tables.</>}/>

      <Toast toast={toast}/>
    </>
  );
}
