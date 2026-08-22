import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSubjectSummary, countPublishedQuestionsBySubject } from './questionBankSummary.js';

test('countPublishedQuestionsBySubject counts only published questions by subject', () => {
  const rows = [
    { subject_id: 's1', status: 'PUBLISHED' },
    { subject_id: 's1', status: 'PUBLISHED' },
    { subject_id: 's1', status: 'DRAFT' },
    { subject_id: 's2', status: 'published' },
    { subject_id: 's2', status: 'ARCHIVED' },
    { subject_id: 's3', status: 'PUBLISHED' },
    { subject_id: null, status: 'PUBLISHED' },
  ];

  assert.deepEqual(countPublishedQuestionsBySubject(rows), {
    s1: 2,
    s2: 1,
    s3: 1,
  });
});

test('buildSubjectSummary normalizes subject data and keeps the real database counts', () => {
  const subjects = [
    { id: 's1', subject_code: 'QUANT', subject_name: 'Quantitative Aptitude', display_order: 1 },
    { id: 's2', subject_code: 'ENGLISH', subject_name: 'English Comprehension', display_order: 2 },
    { id: 's3', subject_code: 'GA', subject_name: 'General Awareness', display_order: 3 },
  ];

  const questionRows = [
    { subject_id: 's1', status: 'PUBLISHED' },
    { subject_id: 's1', status: 'PUBLISHED' },
    { subject_id: 's2', status: 'PUBLISHED' },
    { subject_id: 's3', status: 'PUBLISHED' },
    { subject_id: 's3', status: 'PUBLISHED' },
    { subject_id: 's3', status: 'PUBLISHED' },
  ];

  const topicRows = [
    { subject_id: 's1', id: 't1' },
    { subject_id: 's1', id: 't2' },
    { subject_id: 's2', id: 't3' },
  ];

  assert.deepEqual(buildSubjectSummary(subjects, questionRows, topicRows), [
    { id: 's1', code: 'QUANT', name: 'Quantitative Aptitude', marks: null, question_count: 2, topic_count: 2, display_order: 1 },
    { id: 's2', code: 'ENGLISH', name: 'English Comprehension', marks: null, question_count: 1, topic_count: 1, display_order: 2 },
    { id: 's3', code: 'GA', name: 'General Awareness', marks: null, question_count: 3, topic_count: 0, display_order: 3 },
  ]);
});
