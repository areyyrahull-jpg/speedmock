import { useMemo, useState } from "react";
import { useInjectCSS, PageHeader, FilterBar, TestCard, EmptyState, useTestFilters } from "./TestListShared";
import { useTestsList, examDisplayName, TIERED_EXAMS } from "./UseTestList";
import { useExam } from "../../../context/ExamContext"; // ← adjust path to match your project structure

/**
 * Props:
 *  examId: string         optional — overrides context (rarely needed)
 *  examName: string       optional — overrides the auto-resolved name (rarely needed)
 *  userId: string
 *  isSubscribed: boolean
 *  onBack, onStart, onResume, onReview: fn
 */
export default function PYQPapers({
  examId,
  examName,
  userId,
  isSubscribed = false,
  onBack, onStart, onResume, onReview,
}) {
  // ── EXAM SCOPING ──────────────────────────────────────────────
  // Always reflects whatever exam is selected in the navbar.
  // `examId` prop (if passed) takes priority — useful for previews/tests.
  const { selectedExam } = useExam();
  const activeExamId = examId || selectedExam;
  // examName prop (rarely passed) takes priority; otherwise resolve the
  // real display name from whichever exam is actually selected — this used
  // to always show "SSC CGL" regardless of what was selected on the
  // dashboard, since no examName was ever passed down from App.jsx.
  const displayExamName = examName || examDisplayName(activeExamId);

  // ── TIER TOGGLE — CGL/CHSL only ─────────────────────────────────
  // Other exams (GD, MTS, CPO, NTPC, Group D...) don't have a Tier 1/
  // Tier 2 PYQ split, so the toggle only renders for exams listed in
  // TIERED_EXAMS. Defaults to Tier 1.
  const showTierToggle = TIERED_EXAMS.includes((activeExamId || "").toLowerCase());
  const [tier, setTier] = useState("TIER_1");
  const activeTier = showTierToggle ? tier : undefined;

  useInjectCSS();
  const { tests, loading, error, refetch } = useTestsList(activeExamId, "pyq", userId, activeTier);
  const { search, setSearch, statusFilter, setStatusFilter, filterFn } = useTestFilters();

  const filtered = tests.filter(filterFn);

  // group by year, descending
  const groups = useMemo(() => {
    const map = {};
    filtered.forEach(p => { (map[p.year] ||= []).push(p); });
    return Object.keys(map).map(Number).sort((a,b)=>b-a).map(year => ({ year, items: map[year] }));
  }, [filtered]);

  return (
    <div className="tl-page">
      <PageHeader
        eyebrow="Practice Library"
        title={`${displayExamName} — Previous Year Papers`}
        subtitle="Authentic PYQs from past shifts, organized by year"
        onBack={onBack}
      />

      <div className="tl-body">
        {showTierToggle && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { id: "TIER_1", label: "Tier 1" },
              { id: "TIER_2", label: "Tier 2" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 9,
                  border: tier === t.id ? "1px solid rgba(217,70,239,.4)" : "1px solid var(--b2)",
                  background: tier === t.id ? "rgba(217,70,239,.12)" : "var(--bg3)",
                  color: tier === t.id ? "var(--f)" : "var(--m)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <FilterBar
          search={search} onSearch={setSearch}
          statusFilter={statusFilter} onStatusChange={setStatusFilter}
          placeholder="Search by date, shift..."
        />

        {loading ? (
          <EmptyState title="Loading..." sub="Fetching papers from the database." />
        ) : error ? (
          <EmptyState title="Couldn't load papers" sub={error} />
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : groups.map(g => (
          <div className="tl-group" key={g.year}>
            <div className="tl-group-label">
              {g.year}
              <span className="tl-group-count">{g.items.length} papers</span>
            </div>
            <div className="tl-grid">
              {g.items.map(test => (
                <TestCard key={test.id} test={test} isSubscribed={isSubscribed}
                  onStart={onStart} onResume={onResume} onReview={onReview}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
