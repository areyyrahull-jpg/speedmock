export function countPublishedQuestionsBySubject(questionRows = []) {
  const counts = {};

  for (const row of questionRows || []) {
    const subjectId = row?.subject_id;
    if (!subjectId) continue;

    const status = String(row?.status || '').trim().toUpperCase();
    if (status !== 'PUBLISHED') continue;

    counts[subjectId] = (counts[subjectId] || 0) + 1;
  }

  return counts;
}

export function buildSubjectSummary(subjects = [], questionRows = [], topicRows = []) {
  const counts = countPublishedQuestionsBySubject(questionRows);
  const topicCounts = {};

  for (const row of topicRows || []) {
    const subjectId = row?.subject_id;
    if (!subjectId) continue;
    topicCounts[subjectId] = (topicCounts[subjectId] || 0) + 1;
  }

  return (subjects || [])
    .map((subject) => ({
      id: subject.id,
      code: subject.subject_code || subject.code || null,
      name: subject.subject_name || subject.name || null,
      marks: subject.marks ?? null,
      question_count: counts[subject.id] || 0,
      topic_count: topicCounts[subject.id] || 0,
      display_order: subject.display_order ?? 0,
    }))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}
