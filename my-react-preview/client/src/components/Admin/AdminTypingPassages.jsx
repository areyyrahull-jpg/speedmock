import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../services/apiFetch"; // ← adjust path to match your project structure
import { AdminModal, ConfirmDialog, Toast, useToast } from "./AdminPanel";

const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "hindi",   label: "Hindi" },
];
const CATEGORIES = [
  { id: "pyq",   label: "PYQ" },
  { id: "extra", label: "Extra" },
];

const emptyForm = () => ({
  language: "english", category: "pyq",
  label: "", passage: "", year: "", source: "", icon: "",
  displayOrder: 0, isActive: true,
});

export default function AdminTypingPassages() {
  const { toast, show } = useToast();

  const [language, setLanguage] = useState("english");
  const [category, setCategory] = useState("pyq");
  const [passages, setPassages] = useState([]);
  const [loading, setLoading]   = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const fetchPassages = useCallback(async () => {
    setLoading(true);
    try {
      const { ok, data } = await apiFetch(`/api/admin/typing-passages?language=${language}&category=${category}`);
      if (!ok || !data.success) throw new Error(data.message || "Failed to load");
      setPassages(data.passages || []);
    } catch (err) { show(err.message, "error"); }
    finally { setLoading(false); }
  }, [language, category, show]);

  useEffect(() => { fetchPassages(); }, [fetchPassages]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), language, category });
    setFormError(null); setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      language: p.language, category: p.category,
      label: p.label || "", passage: p.passage || "",
      year: p.year ?? "", source: p.source || "", icon: p.icon || "",
      displayOrder: p.display_order ?? 0, isActive: p.is_active ?? true,
    });
    setFormError(null); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.label.trim())   return setFormError("Label is required.");
    if (!form.passage.trim()) return setFormError("Passage text is required.");

    setSaving(true); setFormError(null);
    try {
      const payload = {
        language: form.language, category: form.category,
        label: form.label.trim(), passage: form.passage.trim(),
        year: form.category === "pyq" && form.year ? Number(form.year) : undefined,
        source: form.source || undefined, icon: form.icon || undefined,
        displayOrder: Number(form.displayOrder) || 0, isActive: !!form.isActive,
      };
      const { ok, data } = editing
        ? await apiFetch(`/api/admin/typing-passages/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiFetch("/api/admin/typing-passages", { method: "POST", body: JSON.stringify(payload) });
      if (!ok || !data.success) throw new Error(data.message || "Failed to save");
      show(editing ? "Passage updated" : "Passage added", "success");
      setModalOpen(false); fetchPassages();
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { ok, data } = await apiFetch(`/api/admin/typing-passages/${deleteTarget.id}`, { method: "DELETE" });
      if (!ok || !data.success) throw new Error(data.message);
      show("Deleted", "success"); setDeleteTarget(null); fetchPassages();
    } catch (err) { show(err.message, "error"); }
    finally { setDeleting(false); }
  };

  const wordCount = (text) => (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);

  return (
    <>
      <div className="adm-toolbar">
        <div style={{ display: "flex", gap: 6 }}>
          {LANGUAGES.map(l => (
            <button key={l.id}
              className={`adm-btn adm-btn-sm ${language === l.id ? "adm-btn-primary" : "adm-btn-ghost"}`}
              onClick={() => setLanguage(l.id)}>{l.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {CATEGORIES.map(c => (
            <button key={c.id}
              className={`adm-btn adm-btn-sm ${category === c.id ? "adm-btn-primary" : "adm-btn-ghost"}`}
              onClick={() => setCategory(c.id)}>{c.label}</button>
          ))}
        </div>
        <button className="adm-btn adm-btn-primary" style={{ marginLeft: "auto" }} onClick={openCreate}>
          + Add Passage
        </button>
      </div>

      <div className="adm-table-wrap">
        {loading ? (
          <div className="adm-loading"><div className="adm-spinner" />Loading...</div>
        ) : passages.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">📝</div>
            <div className="adm-empty-title">No passages yet</div>
            <div className="adm-empty-sub">Add a {language} / {category} passage to get started.</div>
          </div>
        ) : (
          <table className="adm-table">
            <thead><tr><th>Label</th><th>Year</th><th>Source</th><th>Words</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {passages.map(p => (
                <tr key={p.id} className="clickable" onClick={() => openEdit(p)}>
                  <td style={{ maxWidth: 320 }}>{p.icon ? `${p.icon} ` : ""}{p.label}</td>
                  <td>{p.year || <em style={{ color: "var(--m)" }}>—</em>}</td>
                  <td>{p.source || <em style={{ color: "var(--m)" }}>—</em>}</td>
                  <td className="adm-mono">{wordCount(p.passage)}</td>
                  <td><span className={`adm-badge ${p.is_active ? "green" : "grey"}`}>{p.is_active ? "Active" : "Hidden"}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setDeleteTarget(p)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} wide
        title={editing ? "Edit Passage" : "New Passage"}
        footer={<>
          <button className="adm-btn adm-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Passage"}
          </button>
        </>}>
        {formError && <div className="adm-error-text" style={{ marginBottom: 14 }}>⚠️ {formError}</div>}

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Language</label>
            <select className="adm-select" style={{ width: "100%" }} value={form.language}
              onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label">Category</label>
            <select className="adm-select" style={{ width: "100%" }} value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Label</label>
          <input className="adm-input" value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder="e.g. SSC CGL 2024 — Shift 1" />
        </div>

        <div className="adm-row-2">
          {form.category === "pyq" && (
            <div className="adm-field">
              <label className="adm-label">Year</label>
              <input className="adm-input" type="number" value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2024" />
            </div>
          )}
          <div className="adm-field">
            <label className="adm-label">Source (optional)</label>
            <input className="adm-input" value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. SSC CGL" />
          </div>
          <div className="adm-field">
            <label className="adm-label">Icon (optional)</label>
            <input className="adm-input" value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="📜" />
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Passage text ({wordCount(form.passage)} words)</label>
          <textarea className="adm-textarea" style={{ minHeight: 220 }} value={form.passage}
            onChange={e => setForm(f => ({ ...f, passage: e.target.value }))}
            placeholder="Type or paste the typing-test passage..." />
        </div>

        <div className="adm-row-2">
          <div className="adm-field">
            <label className="adm-label">Display order</label>
            <input className="adm-input" type="number" value={form.displayOrder}
              onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} />
          </div>
          <div className="adm-field" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
            <input type="checkbox" checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            <label className="adm-label" style={{ margin: 0 }}>Active (visible to students)</label>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} confirming={deleting} title="Delete Passage?"
        message="Permanently delete this typing passage?" />

      <Toast toast={toast} />
    </>
  );
}
