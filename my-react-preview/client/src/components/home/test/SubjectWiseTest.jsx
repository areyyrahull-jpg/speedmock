import { useState, useMemo } from "react";
import { useInjectCSS, PageHeader, FilterBar, TestCard, EmptyState, useTestFilters } from "./TestListShared";
import { useTestsList, examDisplayName } from "./UseTestList";
import { useExam } from "../../../context/ExamContext"; // ← adjust path to match your project structure
import PyqCustomTestBuilder from "./PyqCustomTestBuilder";

const SUBJECT_ORDER = ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"];

/**
 * Props:
 *  examId, examName (optional override), userId, isSubscribed
 *  onBack, onStart, onResume, onReview
 */
export default function SubjectWiseTests({
  examId,
  examName,
  userId,
  isSubscribed = false,
  onBack, onStart, onResume, onReview,
}) {
  const { selectedExam } = useExam();
  const activeExamId = examId || selectedExam;
  const displayExamName = examName || examDisplayName(activeExamId);

  const [showBuilder, setShowBuilder] = useState(false);

  useInjectCSS();
  const { tests, loading, error, refetch } = useTestsList(activeExamId, "subject", userId);
  const { search, setSearch, statusFilter, setStatusFilter, filterFn } = useTestFilters();

  const filtered = tests.filter(filterFn);

  const groups = useMemo(() => {
    const map = {};
    filtered.forEach(t => { (map[t.category] ||= []).push(t); });
    const keys = Object.keys(map).sort((a,b) => {
      const ia = SUBJECT_ORDER.indexOf(a), ib = SUBJECT_ORDER.indexOf(b);
      return (ia===-1?99:ia) - (ib===-1?99:ib);
    });
    return keys.map(k => ({ key: k, items: map[k] }));
  }, [filtered]);

  if (showBuilder) {
    return (
      <PyqCustomTestBuilder
        examId={activeExamId}
        examName={displayExamName}
        userId={userId}
        testType="subject"
        onBack={() => setShowBuilder(false)}
        onGenerated={() => { refetch(); setShowBuilder(false); }}
      />
    );
  }

  return (
    <div className="tl-page">
      <PageHeader
        eyebrow="Practice Library"
        title={`${displayExamName} — Subject-wise Tests`}
        subtitle="20-question focused practice sets for each subject"
        onBack={onBack}
      >
        <button className="tl-custom-cta" onClick={() => setShowBuilder(true)}>
          🎯 Build a Custom Set
        </button>
      </PageHeader>

      <div className="tl-body">
        <FilterBar
          search={search} onSearch={setSearch}
          statusFilter={statusFilter} onStatusChange={setStatusFilter}
          placeholder="Search by subject, topic..."
        />

        {loading ? (
          <EmptyState title="Loading..." sub="Fetching tests from the database." />
        ) : error ? (
          <EmptyState title="Couldn't load tests" sub={error} />
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : groups.map(g => (
          <div className="tl-group" key={g.key}>
            <div className="tl-group-label">
              {g.key}
              <span className="tl-group-count">{g.items.length} tests</span>
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
