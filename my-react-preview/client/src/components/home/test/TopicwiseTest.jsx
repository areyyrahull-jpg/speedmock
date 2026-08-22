import { useState, useMemo, useEffect } from "react";
import { useInjectCSS, PageHeader, FilterBar, TestCard, EmptyState, useTestFilters } from "./TestListShared";
import { useTopicsBySubject, examDisplayName } from "./UseTestList";
import PyqCustomTestBuilder from "./PyqCustomTestBuilder";

/**
 * Props:
 *  examId, examName (optional override), userId, isSubscribed
 *  onBack, onStart, onResume, onReview
 */
export default function TopicWiseTests({
  examId,
  examName,
  userId,
  isSubscribed = false,
  onBack, onStart, onResume, onReview,
}) {
  const displayExamName = examName || examDisplayName(examId);
  useInjectCSS();
  const { data: topicsBySubject, subjects: SUBJECTS, loading, error, refetch } = useTopicsBySubject(examId, userId);
  const [activeSubject, setActiveSubject] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const { search, setSearch, statusFilter, setStatusFilter, filterFn } = useTestFilters();

  // default to the first subject once they load
  useEffect(() => {
    if (!activeSubject && SUBJECTS.length) setActiveSubject(SUBJECTS[0].id);
  }, [SUBJECTS, activeSubject]);

  const tests = topicsBySubject[activeSubject] || [];
  const filtered = useMemo(() => tests.filter(filterFn), [tests, filterFn]); // eslint-disable-line

  const activeSub = SUBJECTS.find(s => s.id === activeSubject) || { name: "", color: "#e91e8c", icon: "🔬" };
  const completedCount = tests.filter(t => t.status === "completed").length;

  if (showBuilder) {
    return (
      <PyqCustomTestBuilder
        examId={examId}
        examName={displayExamName}
        userId={userId}
        testType="topic"
        onBack={() => setShowBuilder(false)}
        onGenerated={() => { refetch(); setShowBuilder(false); }}
      />
    );
  }

  return (
    <div className="tl-page">
      <PageHeader
        eyebrow="Practice Library"
        title={`${displayExamName} — Topic-wise Tests`}
        subtitle="Drill down into specific topics, 15 questions each"
        onBack={onBack}
      >
        <button className="tl-custom-cta" onClick={() => setShowBuilder(true)}>
          🎯 Build a Custom Set
        </button>

        {/* SUBJECT CHIPS */}
        <div className="tl-chip-tabs">
          {SUBJECTS.map(sub => {
            const subTests = topicsBySubject[sub.id] || [];
            const done = subTests.filter(t => t.status === "completed").length;
            return (
              <div key={sub.id}
                className={`tl-chip${activeSubject===sub.id?" active":""}`}
                onClick={() => setActiveSubject(sub.id)}>
                <span className="tl-chip-dot" style={{ background: sub.color }}/>
                {sub.icon} {sub.name}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--m2)" }}>
                  {done}/{subTests.length}
                </span>
              </div>
            );
          })}
        </div>
      </PageHeader>

      <div className="tl-body">
        <FilterBar
          search={search} onSearch={setSearch}
          statusFilter={statusFilter} onStatusChange={setStatusFilter}
          placeholder={`Search ${activeSub?.name} topics...`}
        />

        {loading ? (
          <EmptyState title="Loading..." sub="Fetching topics from the database." />
        ) : error ? (
          <EmptyState title="Couldn't load topics" sub={error} />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="tl-group">
            <div className="tl-group-label">
              <span className="tl-chip-dot" style={{ background: activeSub.color, display:"inline-block" }}/>
              {activeSub.name} Topics
              <span className="tl-group-count">{filtered.length} topics · {completedCount} completed</span>
            </div>
            <div className="tl-grid cols-4">
              {filtered.map(test => (
                <TestCard
                  key={test.id}
                  test={{ ...test, category: activeSub.name, icon: test.icon || activeSub.icon }}
                  isSubscribed={isSubscribed}
                  onStart={onStart} onResume={onResume} onReview={onReview}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
