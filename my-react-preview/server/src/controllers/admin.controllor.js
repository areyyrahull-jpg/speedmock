// controllers/admin.controller.js
// ════════════════════════════════════════════════════════
//  Rewritten against the REAL Supabase schema (confirmed via CSV export).
//  Key differences from the previous version:
//   - No "tests" table — 4 separate tables: pyq_tests, full_tests,
//     subject_wise_tests, topic_wise_tests
//   - No "practice_questions" table — questions table has is_pyq flag
//   - questions use option_a/b/c/d columns (not jsonb), correct_option
//     is a varchar 'A'/'B'/'C'/'D' (not a 0-based int index)
//   - Admin check uses "users" table (not "profiles")
//   - Questions link to tests via junction tables:
//     pyq_test_questions, full_test_questions,
//     subject_wise_test_questions, topic_wise_test_questions
// ════════════════════════════════════════════════════════

const { supabaseAdmin: supabase } = require("../config/supabaseAdmin");

/* ── helpers ───────────────────────────────────────────── */
const idxToOption = (i) => ['A','B','C','D'][i] ?? 'A';
const optionToIdx = (o) => ['A','B','C','D'].indexOf((o||'A').toUpperCase());

// Build bilingual options array from flat columns for the frontend
const rowToOptions = (q) => [
  { text: q.option_a, textHi: q.option_a_hi, imageUrl: q.option_a_image },
  { text: q.option_b, textHi: q.option_b_hi, imageUrl: q.option_b_image },
  { text: q.option_c, textHi: q.option_c_hi, imageUrl: q.option_c_image },
  { text: q.option_d, textHi: q.option_d_hi, imageUrl: q.option_d_image },
].filter(o => o.text || o.textHi || o.imageUrl);

// Shape a full question row for API response
const shapeQuestion = (q) => ({
  ...q,
  options: rowToOptions(q),
  correctAnswer: optionToIdx(q.correct_option),
});

// ─────────────────────────────────────────────────────────
//  STATS — Overview tab
// ─────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      { count: totalQuestions },
      { count: totalUsers },
      { count: pyqCount },
      { count: fullCount },
      { count: subjectCount },
      { count: topicCount },
      { count: attemptsToday },
    ] = await Promise.all([
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('pyq_tests').select('id', { count: 'exact', head: true }),
      supabase.from('full_tests').select('id', { count: 'exact', head: true }),
      supabase.from('subject_wise_tests').select('id', { count: 'exact', head: true }),
      supabase.from('topic_wise_tests').select('id', { count: 'exact', head: true }),
      supabase.from('user_test_attempts').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    ]);

    // questions per exam
    const { data: qByExam } = await supabase
      .from('questions').select('exam_id');
    const byExam = {};
    (qByExam || []).forEach(q => {
      byExam[q.exam_id] = (byExam[q.exam_id] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalQuestions: totalQuestions ?? 0,
        totalTests: (pyqCount ?? 0) + (fullCount ?? 0) + (subjectCount ?? 0) + (topicCount ?? 0),
        pyqTests: pyqCount ?? 0,
        fullTests: fullCount ?? 0,
        subjectTests: subjectCount ?? 0,
        topicTests: topicCount ?? 0,
        totalUsers: totalUsers ?? 0,
        attemptsToday: attemptsToday ?? 0,
        byExam,
      },
    });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to load stats.' });
  }
};

// ─────────────────────────────────────────────────────────
//  EXAMS — read-only lookup (for dropdowns)
// ─────────────────────────────────────────────────────────
const listExams = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exams').select('id, exam_name, exam_code').order('exam_name');
    if (error) throw error;
    res.json({ success: true, exams: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load exams.' });
  }
};

// ─────────────────────────────────────────────────────────
//  SUBJECTS — read-only lookup (filter by exam)
// ─────────────────────────────────────────────────────────
const listSubjects = async (req, res) => {
  try {
    const { examId } = req.query;
    let query = supabase.from('subjects').select('id, subject_name, subject_code, exam_id').order('display_order');
    if (examId) query = query.eq('exam_id', examId);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, subjects: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load subjects.' });
  }
};

// ─────────────────────────────────────────────────────────
//  TOPICS — read-only lookup (filter by subject)
// ─────────────────────────────────────────────────────────
const listTopics = async (req, res) => {
  try {
    const { subjectId } = req.query;
    let query = supabase.from('topics').select('id, topic_name, topic_code, subject_id').order('display_order');
    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, topics: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load topics.' });
  }
};

// ─────────────────────────────────────────────────────────
//  TESTS — list across all 4 types
// ─────────────────────────────────────────────────────────
const listTests = async (req, res) => {
  try {
    const { examId, testType, search } = req.query;

    // Per-table ordering: PYQ tests have a real exam date, so sort by
    // that. Full/subject/topic tests don't carry a real exam date
    // (they're admin-authored or auto-generated batches), so created_at
    // (upload time) is the most meaningful "newest first" for those.
    const ORDER_CONFIG = {
      pyq_tests:          [{ col: 'test_date', asc: false }, { col: 'test_year', asc: false }, { col: 'created_at', asc: false }],
      full_tests:         [{ col: 'created_at', asc: false }],
      subject_wise_tests: [{ col: 'created_at', asc: false }],
      topic_wise_tests:   [{ col: 'created_at', asc: false }],
    };

    const runQuery = async (table, category) => {
      if (testType && testType !== category) return [];
      let q = supabase.from(table).select('*');
      (ORDER_CONFIG[table] || [{ col: 'created_at', asc: false }]).forEach(({ col, asc }) => {
        q = q.order(col, { ascending: asc, nullsFirst: false });
      });
      if (examId) q = q.eq('exam_id', examId);
      if (search) q = q.ilike('test_name', `%${search}%`);
      const { data } = await q.limit(100);
      return (data || []).map(r => ({ ...r, _type: category, _table: table }));
    };

    const [pyq, full, subject, topic] = await Promise.all([
      runQuery('pyq_tests', 'pyq'),
      runQuery('full_tests', 'mock'),
      runQuery('subject_wise_tests', 'subject'),
      runQuery('topic_wise_tests', 'topic'),
    ]);

    // Merge sort across all 4 types: use each row's most meaningful
    // date — real exam date for PYQ, upload time for everything else.
    const dateOf = (r) => r._type === 'pyq'
      ? new Date(r.test_date || (r.test_year ? `${r.test_year}-01-01` : r.created_at))
      : new Date(r.created_at);

    const all = [...pyq, ...full, ...subject, ...topic]
      .sort((a, b) => dateOf(b) - dateOf(a));

    res.json({ success: true, tests: all });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to load tests.' });
  }
};

const createTest = async (req, res) => {
  try {
    const { testType, examId, subjectId, topicId, testName, testYear,
      totalQuestions, durationMinutes, displayOrder, description, testDate } = req.body;

    if (!testType || !examId || !testName || !totalQuestions || !durationMinutes) {
      return res.status(400).json({ success: false, message: 'testType, examId, testName, totalQuestions and durationMinutes are required.' });
    }

    let table, payload;
    if (testType === 'pyq') {
      table = 'pyq_tests';
      payload = { exam_id: examId, test_name: testName, test_year: testYear || new Date().getFullYear(),
        total_questions: totalQuestions, duration_minutes: durationMinutes,
        display_order: displayOrder || 0, description, test_date: testDate || null, is_active: true };
    } else if (testType === 'mock') {
      table = 'full_tests';
      payload = { exam_id: examId, test_name: testName, test_number: displayOrder || 1,
        total_questions: totalQuestions, duration_minutes: durationMinutes,
        display_order: displayOrder || 0, description, is_active: true };
    } else if (testType === 'subject') {
      if (!subjectId) return res.status(400).json({ success: false, message: 'subjectId required for subject-wise test.' });
      table = 'subject_wise_tests';
      payload = { exam_id: examId, subject_id: subjectId, test_name: testName, test_number: displayOrder || 1,
        total_questions: totalQuestions, duration_minutes: durationMinutes,
        display_order: displayOrder || 0, is_active: true };
    } else if (testType === 'topic') {
      if (!subjectId || !topicId) return res.status(400).json({ success: false, message: 'subjectId and topicId required for topic-wise test.' });
      table = 'topic_wise_tests';
      payload = { exam_id: examId, subject_id: subjectId, topic_id: topicId, test_name: testName, test_number: displayOrder || 1,
        total_questions: totalQuestions, duration_minutes: durationMinutes,
        display_order: displayOrder || 0, is_active: true };
    } else {
      return res.status(400).json({ success: false, message: `Unknown testType: ${testType}` });
    }

    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) throw error;
    res.json({ success: true, test: { ...data, _type: testType, _table: table } });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to create test.' });
  }
};

const updateTest = async (req, res) => {
  try {
    const { testId, testType } = req.params;
    const tableMap = { pyq: 'pyq_tests', mock: 'full_tests', subject: 'subject_wise_tests', topic: 'topic_wise_tests' };
    const table = tableMap[testType];
    if (!table) return res.status(400).json({ success: false, message: `Unknown testType: ${testType}` });

    const allowed = ['test_name','total_questions','duration_minutes','display_order','is_active','description','test_year','test_date','test_number'];
    const updates = {};
    Object.entries(req.body).forEach(([k, v]) => { if (allowed.includes(k)) updates[k] = v; });

    const { data, error } = await supabase.from(table).update(updates).eq('id', testId).select().single();
    if (error) throw error;
    res.json({ success: true, test: data });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to update test.' });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { testId, testType } = req.params;
    const tableMap = { pyq: 'pyq_tests', mock: 'full_tests', subject: 'subject_wise_tests', topic: 'topic_wise_tests' };
    const junctionMap = { pyq: 'pyq_test_questions', mock: 'full_test_questions', subject: 'subject_wise_test_questions', topic: 'topic_wise_test_questions' };
    const table = tableMap[testType];
    const jTable = junctionMap[testType];
    const fkCol = testType === 'pyq' ? 'pyq_test_id' : testType === 'mock' ? 'full_test_id' : testType === 'subject' ? 'subject_wise_test_id' : 'topic_wise_test_id';

    if (!table) return res.status(400).json({ success: false, message: `Unknown testType: ${testType}` });

    // delete junction rows first, then the test itself
    if (jTable) await supabase.from(jTable).delete().eq(fkCol, testId);
    const { error } = await supabase.from(table).delete().eq('id', testId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to delete test.' });
  }
};

// ─────────────────────────────────────────────────────────
//  BATCH GENERATOR — chunk a subject's (or topic's) PYQ
//  question pool into 20-question/20-minute subject_wise_tests
//  or topic_wise_tests rows, sorted oldest→newest by pyq_year.
//  Additive: existing admin-authored tests are untouched; running
//  this again only adds batches for questions not yet covered.
// ─────────────────────────────────────────────────────────
const BATCH_SIZE = 20;
const BATCH_DURATION_MINUTES = 20;

const generateTestBatches = async (req, res) => {
  try {
    const { testType, examId, subjectId, topicId } = req.body;

    if (!['subject', 'topic'].includes(testType)) return res.status(400).json({ success: false, message: "testType must be 'subject' or 'topic'." });
    if (!examId)    return res.status(400).json({ success: false, message: 'examId is required.' });
    if (!subjectId) return res.status(400).json({ success: false, message: 'subjectId is required.' });
    if (testType === 'topic' && !topicId) return res.status(400).json({ success: false, message: 'topicId is required for topic-wise batches.' });

    const table = testType === 'subject' ? 'subject_wise_tests' : 'topic_wise_tests';
    const junctionTable = testType === 'subject' ? 'subject_wise_test_questions' : 'topic_wise_test_questions';
    const fkColumn = testType === 'subject' ? 'subject_wise_test_id' : 'topic_wise_test_id';

    // Full PYQ pool for this subject/topic, oldest → newest.
    let poolQuery = supabase
      .from('questions')
      .select('id, pyq_year')
      .eq('exam_id', examId)
      .eq('subject_id', subjectId)
      .eq('is_pyq', true)
      .order('pyq_year', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true });
    if (testType === 'topic') poolQuery = poolQuery.eq('topic_id', topicId);

    const { data: poolRows, error: poolErr } = await poolQuery;
    if (poolErr) throw poolErr;
    const poolIds = (poolRows || []).map(r => r.id);
    if (poolIds.length === 0) {
      return res.json({ success: true, batchesCreated: 0, message: 'No PYQ questions found for this selection.' });
    }

    // Skip questions already covered by a previously-generated batch,
    // so re-running this only fills in newly-added questions.
    const { data: existingBatches, error: existingErr } = await (async () => {
      let q = supabase.from(table).select('id, test_number')
        .eq('exam_id', examId).eq('subject_id', subjectId).like('test_name', 'Batch %');
      if (testType === 'topic') q = q.eq('topic_id', topicId);
      return q;
    })();
    if (existingErr) throw existingErr;

    let alreadyCoveredIds = new Set();
    let startBatchNumber = 1;
    if (existingBatches && existingBatches.length > 0) {
      startBatchNumber = Math.max(...existingBatches.map(b => b.test_number || 0)) + 1;
      const batchIds = existingBatches.map(b => b.id);
      const { data: coveredRows, error: coveredErr } = await supabase
        .from(junctionTable).select('question_id').in(fkColumn, batchIds);
      if (coveredErr) throw coveredErr;
      alreadyCoveredIds = new Set((coveredRows || []).map(r => r.question_id));
    }

    const remainingIds = poolIds.filter(id => !alreadyCoveredIds.has(id));
    if (remainingIds.length === 0) {
      return res.json({ success: true, batchesCreated: 0, message: 'All available questions are already covered by existing batches.' });
    }

    const chunks = [];
    for (let i = 0; i < remainingIds.length; i += BATCH_SIZE) chunks.push(remainingIds.slice(i, i + BATCH_SIZE));

    const createdTests = [];
    for (let i = 0; i < chunks.length; i++) {
      const batchNumber = startBatchNumber + i;
      const testRow = testType === 'subject'
        ? { exam_id: examId, subject_id: subjectId, test_name: `Batch ${batchNumber}`, test_number: batchNumber,
            total_questions: chunks[i].length, duration_minutes: BATCH_DURATION_MINUTES, display_order: batchNumber, is_active: true }
        : { exam_id: examId, subject_id: subjectId, topic_id: topicId, test_name: `Batch ${batchNumber}`, test_number: batchNumber,
            total_questions: chunks[i].length, duration_minutes: BATCH_DURATION_MINUTES, display_order: batchNumber, is_active: true };

      const { data: createdTest, error: testErr } = await supabase.from(table).insert(testRow).select().single();
      if (testErr) throw testErr;

      const junctionRows = chunks[i].map((qId, idx) => ({ [fkColumn]: createdTest.id, question_id: qId, question_order: idx + 1 }));
      const { error: junctionErr } = await supabase.from(junctionTable).insert(junctionRows);
      if (junctionErr) throw junctionErr;

      createdTests.push(createdTest);
    }

    res.json({ success: true, batchesCreated: createdTests.length, tests: createdTests });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to generate batches.' });
  }
};


// ─────────────────────────────────────────────────────────
//  QUESTIONS — CRUD against real questions table
//  options array from frontend: [{text:'...'}, ...] (2-4 items)
//  maps to option_a/b/c/d + correct_option 'A'/'B'/'C'/'D'
// ─────────────────────────────────────────────────────────
const listQuestions = async (req, res) => {
  try {
    const { examId, subjectId, topicId, isPyq, search, page = 1, limit = 50 } = req.query;
    let query = supabase.from('questions')
      .select(`id, exam_id, subject_id, topic_id,
        question_text, question_text_hi, question_type, image_url,
        option_a, option_b, option_c, option_d,
        option_a_hi, option_b_hi, option_c_hi, option_d_hi,
        option_a_image, option_b_image, option_c_image, option_d_image,
        correct_option, correct_answer,
        explanation, explanation_hi,
        difficulty, is_pyq, pyq_year, pyq_exam_date,
        marks, negative_marking, status`, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (examId)    query = query.eq('exam_id', examId);
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (topicId)   query = query.eq('topic_id', topicId);
    if (isPyq !== undefined) query = query.eq('is_pyq', isPyq === 'true');
    if (search)    query = query.ilike('question_text', `%${search}%`);

    const from = (Number(page) - 1) * Number(limit);
    query = query.range(from, from + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, questions: (data || []).map(shapeQuestion), total: count ?? 0 });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to load questions.' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const {
      examId, subjectId, topicId,
      text, textHi, imageUrl, questionType,
      options, correctAnswer,
      explanation, explanationHi,
      difficulty = 'MEDIUM', marks = 1, negativeMarking = 0.25,
      isPyq = false, pyqYear, pyqExamDate,
      testId, testType,
    } = req.body;

    if (!examId || !subjectId) return res.status(400).json({ success: false, message: 'examId and subjectId are required.' });
    if (!Array.isArray(options) || options.length < 2) return res.status(400).json({ success: false, message: 'At least 2 options required.' });
    if (correctAnswer === undefined) return res.status(400).json({ success: false, message: 'correctAnswer is required.' });
    if (!text && !imageUrl) return res.status(400).json({ success: false, message: 'question_text or imageUrl is required.' });

    const payload = {
      exam_id: examId, subject_id: subjectId, topic_id: topicId || null,
      question_text: text || '(image question)',
      question_text_hi: textHi || null,
      question_type: questionType || null,
      image_url: imageUrl || null,
      option_a: options[0]?.text || options[0] || null,
      option_b: options[1]?.text || options[1] || null,
      option_c: options[2]?.text || options[2] || null,
      option_d: options[3]?.text || options[3] || null,
      option_a_hi: options[0]?.textHi || null,
      option_b_hi: options[1]?.textHi || null,
      option_c_hi: options[2]?.textHi || null,
      option_d_hi: options[3]?.textHi || null,
      option_a_image: options[0]?.imageUrl || null,
      option_b_image: options[1]?.imageUrl || null,
      option_c_image: options[2]?.imageUrl || null,
      option_d_image: options[3]?.imageUrl || null,
      correct_option: idxToOption(Number(correctAnswer)),
      correct_answer: options[Number(correctAnswer)]?.text || options[Number(correctAnswer)] || null,
      explanation: explanation || null,
      explanation_hi: explanationHi || null,
      difficulty: difficulty.toUpperCase(),
      marks: Number(marks), negative_marking: Number(negativeMarking),
      is_pyq: Boolean(isPyq), pyq_year: pyqYear || null,
      pyq_exam_date: pyqExamDate || null,
      status: 'PUBLISHED',
    };

    const { data: q, error } = await supabase.from('questions').insert(payload).select().single();
    if (error) throw error;

    if (testId && testType) {
      const junctionMap = { pyq:'pyq_test_questions', mock:'full_test_questions', subject:'subject_wise_test_questions', topic:'topic_wise_test_questions' };
      const fkMap = { pyq:'pyq_test_id', mock:'full_test_id', subject:'subject_wise_test_id', topic:'topic_wise_test_id' };
      const jTable = junctionMap[testType];
      const fkCol = fkMap[testType];
      if (jTable) {
        const { count: qCount } = await supabase.from(jTable).select('id', { count: 'exact', head: true }).eq(fkCol, testId);
        const jRow = { [fkCol]: testId, question_id: q.id, question_order: (qCount || 0) + 1 };
        if (testType === 'pyq' || testType === 'mock') {
          jRow.marks = Number(marks); jRow.negative_marking = Number(negativeMarking);
        }
        await supabase.from(jTable).insert(jRow);
      }
    }

    res.json({ success: true, question: shapeQuestion(q) });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to create question.' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      subjectId, topicId,
      text, textHi, imageUrl, questionType,
      options, correctAnswer,
      explanation, explanationHi,
      difficulty, marks, negativeMarking,
      isPyq, pyqYear, pyqExamDate,
    } = req.body;

    const updates = {};
    if (subjectId !== undefined)      updates.subject_id = subjectId;
    if (topicId !== undefined)        updates.topic_id = topicId;
    if (text !== undefined)           updates.question_text = text || '(image question)';
    if (textHi !== undefined)         updates.question_text_hi = textHi;
    if (imageUrl !== undefined)       updates.image_url = imageUrl;
    if (questionType !== undefined)   updates.question_type = questionType;
    if (explanation !== undefined)    updates.explanation = explanation;
    if (explanationHi !== undefined)  updates.explanation_hi = explanationHi;
    if (difficulty !== undefined)     updates.difficulty = difficulty.toUpperCase();
    if (marks !== undefined)          updates.marks = Number(marks);
    if (negativeMarking !== undefined) updates.negative_marking = Number(negativeMarking);
    if (isPyq !== undefined)          updates.is_pyq = Boolean(isPyq);
    if (pyqYear !== undefined)        updates.pyq_year = pyqYear;
    if (pyqExamDate !== undefined)    updates.pyq_exam_date = pyqExamDate;

    if (options !== undefined) {
      updates.option_a = options[0]?.text || options[0] || null;
      updates.option_b = options[1]?.text || options[1] || null;
      updates.option_c = options[2]?.text || options[2] || null;
      updates.option_d = options[3]?.text || options[3] || null;
      updates.option_a_hi = options[0]?.textHi || null;
      updates.option_b_hi = options[1]?.textHi || null;
      updates.option_c_hi = options[2]?.textHi || null;
      updates.option_d_hi = options[3]?.textHi || null;
      updates.option_a_image = options[0]?.imageUrl || null;
      updates.option_b_image = options[1]?.imageUrl || null;
      updates.option_c_image = options[2]?.imageUrl || null;
      updates.option_d_image = options[3]?.imageUrl || null;
    }
    if (correctAnswer !== undefined) {
      updates.correct_option = idxToOption(Number(correctAnswer));
      if (options) updates.correct_answer = options[Number(correctAnswer)]?.text || options[Number(correctAnswer)] || null;
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('questions').update(updates).eq('id', questionId).select().single();
    if (error) throw error;
    res.json({ success: true, question: shapeQuestion(data) });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to update question.' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    // remove from all junction tables first
    await Promise.all([
      supabase.from('pyq_test_questions').delete().eq('question_id', questionId),
      supabase.from('full_test_questions').delete().eq('question_id', questionId),
      supabase.from('subject_wise_test_questions').delete().eq('question_id', questionId),
      supabase.from('topic_wise_test_questions').delete().eq('question_id', questionId),
    ]);
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to delete question.' });
  }
};

// ─────────────────────────────────────────────────────────
//  BULK IMPORT — maps frontend format to real schema
// ─────────────────────────────────────────────────────────
const bulkImportQuestions = async (req, res) => {
  try {
    const { examId, subjectId, topicId, isPyq = false, testId, testType, questions } = req.body;

    if (!examId || !subjectId) return res.status(400).json({ success: false, message: 'examId and subjectId are required.' });
    if (!Array.isArray(questions) || questions.length === 0) return res.status(400).json({ success: false, message: 'questions array is required.' });
    if (questions.length > 500) return res.status(400).json({ success: false, message: 'Max 500 per batch.' });

    const errors = [];
    const rows = questions.map((q, i) => {
      const rowNum = i + 1;
      if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`Row ${rowNum}: needs at least 2 options`);
      if (q.correctAnswer === undefined) errors.push(`Row ${rowNum}: missing correctAnswer`);
      if (!q.text && !q.imageUrl) errors.push(`Row ${rowNum}: needs text or imageUrl`);
      return {
        exam_id: examId, subject_id: subjectId, topic_id: topicId || null,
        question_text: q.text || '(image question)',
        question_text_hi: q.textHi || null,
        question_type: q.questionType || null,
        image_url: q.imageUrl || null,
        option_a: q.options[0]?.text || q.options[0] || null,
        option_b: q.options[1]?.text || q.options[1] || null,
        option_c: q.options[2]?.text || q.options[2] || null,
        option_d: q.options[3]?.text || q.options[3] || null,
        option_a_hi: q.options[0]?.textHi || null,
        option_b_hi: q.options[1]?.textHi || null,
        option_c_hi: q.options[2]?.textHi || null,
        option_d_hi: q.options[3]?.textHi || null,
        option_a_image: q.options[0]?.imageUrl || null,
        option_b_image: q.options[1]?.imageUrl || null,
        option_c_image: q.options[2]?.imageUrl || null,
        option_d_image: q.options[3]?.imageUrl || null,
        correct_option: idxToOption(Number(q.correctAnswer)),
        correct_answer: q.options[Number(q.correctAnswer)]?.text || q.options[Number(q.correctAnswer)] || null,
        explanation: q.explanation || null,
        explanation_hi: q.explanationHi || null,
        difficulty: (q.difficulty || 'MEDIUM').toUpperCase(),
        marks: Number(q.marks || 1), negative_marking: Number(q.negativeMarking || 0.25),
        is_pyq: Boolean(isPyq), pyq_year: q.pyqYear || null,
        pyq_exam_date: q.pyqExamDate || null,
        tier: q.tier || null,
        status: 'PUBLISHED',
      };
    });

    if (errors.length > 0) return res.status(400).json({ success: false, message: 'Validation failed.', errors });

    const { data, error } = await supabase.from('questions').insert(rows).select('id');
    if (error) throw error;

    // link to test via junction table if provided
    if (testId && testType && data?.length) {
      const junctionMap = { pyq:'pyq_test_questions', mock:'full_test_questions', subject:'subject_wise_test_questions', topic:'topic_wise_test_questions' };
      const fkMap = { pyq:'pyq_test_id', mock:'full_test_id', subject:'subject_wise_test_id', topic:'topic_wise_test_id' };
      const jTable = junctionMap[testType];
      const fkCol = fkMap[testType];
      if (jTable) {
        const { count: existingCount } = await supabase.from(jTable).select('id', { count: 'exact', head: true }).eq(fkCol, testId);
        const jRows = data.map((q, i) => {
          const row = { [fkCol]: testId, question_id: q.id, question_order: (existingCount || 0) + i + 1 };
          if (testType === 'pyq' || testType === 'mock') {
            row.marks = 1; row.negative_marking = 0.25;
          }
          return row;
        });
        await supabase.from(jTable).insert(jRows);
      }
    }

    res.json({ success: true, imported: data?.length ?? rows.length });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Import failed.' });
  }
};

// ─────────────────────────────────────────────────────────
//  PRACTICE BANK — uses questions table with is_pyq=false
//  Real schema: question_bank_subjects / question_bank_topics
//  are stat-tracking tables only (easy/medium/hard counts) —
//  actual questions still live in "questions" table
// ─────────────────────────────────────────────────────────
const listPracticeQuestions = async (req, res) => {
  try {
    const { examId, subjectId, topicId, difficulty, search, page = 1, limit = 50 } = req.query;
    let query = supabase.from('questions')
      .select(`id, exam_id, subject_id, topic_id,
        question_text, question_text_hi, image_url,
        option_a, option_b, option_c, option_d,
        option_a_hi, option_b_hi, option_c_hi, option_d_hi,
        option_a_image, option_b_image, option_c_image, option_d_image,
        correct_option, difficulty, marks`, { count: 'exact' })
      .eq('is_pyq', false).order('created_at', { ascending: false });

    if (examId)    query = query.eq('exam_id', examId);
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (topicId)   query = query.eq('topic_id', topicId);
    if (difficulty) query = query.eq('difficulty', difficulty.toUpperCase());
    if (search)    query = query.ilike('question_text', `%${search}%`);

    const from = (Number(page) - 1) * Number(limit);
    query = query.range(from, from + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    const questions = (data || []).map(shapeQuestion);
    res.json({ success: true, questions, total: count ?? 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load practice questions.' });
  }
};

const getPracticeStats = async (req, res) => {
  try {
    const { data } = await supabase.from('questions').select('exam_id, subject_id, topic_id').eq('is_pyq', false);
    const byExamSubject = {}, byTopic = {};
    (data || []).forEach(q => {
      const k = `${q.exam_id}::${q.subject_id}`;
      byExamSubject[k] = (byExamSubject[k] || 0) + 1;
      const tk = `${q.exam_id}::${q.subject_id}::${q.topic_id}`;
      byTopic[tk] = (byTopic[tk] || 0) + 1;
    });
    res.json({ success: true, byExamSubject, byExamSubjectTopic: byTopic, total: data?.length ?? 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load stats.' });
  }
};

const listPracticeTopics = async (req, res) => {
  try {
    const { examId, subjectId } = req.query;
    if (!examId || !subjectId) return res.status(400).json({ success: false, message: 'examId and subjectId required.' });
    const { data } = await supabase.from('questions').select('topic_id').eq('exam_id', examId).eq('subject_id', subjectId).eq('is_pyq', false);
    const counts = {};
    (data || []).forEach(q => { if (q.topic_id) counts[q.topic_id] = (counts[q.topic_id] || 0) + 1; });

    // fetch topic names
    const topicIds = Object.keys(counts);
    let topicNames = {};
    if (topicIds.length) {
      const { data: tRows } = await supabase.from('topics').select('id, topic_name').in('id', topicIds);
      (tRows || []).forEach(t => { topicNames[t.id] = t.topic_name; });
    }

    const topics = Object.entries(counts).map(([id, count]) => ({ topicId: id, topicName: topicNames[id] || id, count })).sort((a,b) => b.count - a.count);
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load topics.' });
  }
};

// createPracticeQuestion, updatePracticeQuestion, deletePracticeQuestion
// reuse createQuestion/updateQuestion/deleteQuestion with isPyq=false
const createPracticeQuestion = async (req, res) => {
  req.body.isPyq = false;
  return createQuestion(req, res);
};
const updatePracticeQuestion = updateQuestion;
const deletePracticeQuestion = deleteQuestion;

const bulkImportPracticeQuestions = async (req, res) => {
  req.body.isPyq = false;
  return bulkImportQuestions(req, res);
};

// ─────────────────────────────────────────────────────────
//  TYPING PASSAGES — English & Hindi, PYQ & Extra
//  Content for typing-test papers (englishtest.jsx / hinditest.jsx),
//  separate from typing_sessions/typing_history which store RESULTS.
// ─────────────────────────────────────────────────────────
const listTypingPassages = async (req, res) => {
  try {
    const { language, category } = req.query;
    let query = supabase.from('typing_passages')
      .select('id, language, category, label, passage, year, source, icon, display_order, is_active, created_at')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (language) query = query.eq('language', language);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, passages: data || [] });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to load typing passages.' });
  }
};

const createTypingPassage = async (req, res) => {
  try {
    const {
      language, category, label, passage,
      year, source, icon, displayOrder = 0, isActive = true,
    } = req.body;

    if (!language || !['english','hindi'].includes(language)) return res.status(400).json({ success: false, message: 'language must be english or hindi.' });
    if (!category || !['pyq','extra'].includes(category))     return res.status(400).json({ success: false, message: 'category must be pyq or extra.' });
    if (!label)   return res.status(400).json({ success: false, message: 'label is required.' });
    if (!passage) return res.status(400).json({ success: false, message: 'passage text is required.' });

    const payload = {
      language, category, label,
      passage,
      year: category === 'pyq' && year ? Number(year) : null,
      source: source || null,
      icon: icon || null,
      display_order: Number(displayOrder) || 0,
      is_active: Boolean(isActive),
    };

    const { data, error } = await supabase.from('typing_passages').insert(payload).select().single();
    if (error) throw error;
    res.json({ success: true, passage: data });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to create typing passage.' });
  }
};

const updateTypingPassage = async (req, res) => {
  try {
    const { passageId } = req.params;
    const {
      language, category, label, passage,
      year, source, icon, displayOrder, isActive,
    } = req.body;

    const updates = {};
    if (language !== undefined) updates.language = language;
    if (category !== undefined) updates.category = category;
    if (label !== undefined)    updates.label = label;
    if (passage !== undefined)  updates.passage = passage;
    if (year !== undefined)     updates.year = year ? Number(year) : null;
    if (source !== undefined)   updates.source = source || null;
    if (icon !== undefined)     updates.icon = icon || null;
    if (displayOrder !== undefined) updates.display_order = Number(displayOrder) || 0;
    if (isActive !== undefined) updates.is_active = Boolean(isActive);
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('typing_passages').update(updates).eq('id', passageId).select().single();
    if (error) throw error;
    res.json({ success: true, passage: data });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to update typing passage.' });
  }
};

const deleteTypingPassage = async (req, res) => {
  try {
    const { passageId } = req.params;
    const { error } = await supabase.from('typing_passages').delete().eq('id', passageId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to delete typing passage.' });
  }
};

module.exports = {
  getStats,
  listExams, listSubjects, listTopics,
  listTests, createTest, updateTest, deleteTest, generateTestBatches,
  listQuestions, createQuestion, updateQuestion, deleteQuestion, bulkImportQuestions,
  listPracticeQuestions, getPracticeStats, listPracticeTopics,
  createPracticeQuestion, updatePracticeQuestion, deletePracticeQuestion, bulkImportPracticeQuestions,
  listTypingPassages, createTypingPassage, updateTypingPassage, deleteTypingPassage,
};
