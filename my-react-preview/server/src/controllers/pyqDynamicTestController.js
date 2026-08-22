const { supabaseAdmin: supabase } = require('../config/supabaseAdmin');

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

// Identifies "the same custom set" — everything except quantity, since
// changing quantity is what triggers replacing the old set.
function buildFilterKey({ examId, testType, subjectIds, topicIds, yearMin, yearMax, tier }) {
  const parts = [
    examId, testType,
    [...subjectIds].sort().join(','),
    (topicIds || []).slice().sort().join(','),
    yearMin ?? '', yearMax ?? '', tier ?? '',
  ];
  return parts.join('|');
}

// Split `quantity` evenly across `groupCount` groups, remainder going to
// the first groups in order (e.g. 25 across 2 groups → 13, 12).
function evenSplit(quantity, groupCount) {
  const base = Math.floor(quantity / groupCount);
  const remainder = quantity % groupCount;
  return Array.from({ length: groupCount }, (_, i) => base + (i < remainder ? 1 : 0));
}

/* ────────────────────────────────────────────────────────────────
   POST /api/practice/pyq-dynamic-test
   Body: {
     examId, testType: 'subject'|'topic',
     subjectIds: [uuid,...],   // 1+ for testType='subject'; the single
                               // containing subject for testType='topic'
     topicIds: [uuid,...],     // only for testType='topic', 1+
     yearMin, yearMax,         // PYQ year range (inclusive)
     quantity,                 // questions per batch (25/50/custom)
     durationMinutes,
     tier,
   }

   Splits the WHOLE matching PYQ pool into `quantity`-sized batches (e.g.
   1000 questions / 25 per batch → 40 numbered batches), private to this
   user, shown in the normal subject/topic-wise listing. Re-running with
   the same subjects/topics/tier/year-range but a different quantity
   replaces the previous set entirely rather than adding to it.

   No per-question marks here — UseTestQuestion.js's TYPE_CFG marks
   subject/topic tests `perQMarks: false`, so ALL subject-wise/topic-wise
   tests site-wide score at a flat 1 mark / 0.25 negative regardless of
   what's stored in the junction row.
   ──────────────────────────────────────────────────────────────── */
const generateDynamicPyqTest = async (req, res) => {
  try {
    const userId = req.userId; // set by authenticateToken middleware (validate.middleware.js)
    const {
      examId, testType, subjectIds = [], topicIds = [],
      yearMin, yearMax, quantity, durationMinutes, tier,
    } = req.body;

    if (!userId)  return res.status(401).json({ success: false, message: 'Not authenticated.' });
    if (!examId)  return res.status(400).json({ success: false, message: 'examId is required.' });
    if (!['subject', 'topic'].includes(testType)) return res.status(400).json({ success: false, message: "testType must be 'subject' or 'topic'." });
    if (!subjectIds.length) return res.status(400).json({ success: false, message: 'Select at least one subject.' });
    if (testType === 'topic' && !topicIds.length) return res.status(400).json({ success: false, message: 'Select at least one topic.' });
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'quantity must be at least 1.' });
    if (!durationMinutes || durationMinutes < 1) return res.status(400).json({ success: false, message: 'durationMinutes is required.' });

    const table = testType === 'subject' ? 'subject_wise_tests' : 'topic_wise_tests';
    const junctionTable = testType === 'subject' ? 'subject_wise_test_questions' : 'topic_wise_test_questions';
    const fkColumn = testType === 'subject' ? 'subject_wise_test_id' : 'topic_wise_test_id';
    const filterKey = buildFilterKey({ examId, testType, subjectIds, topicIds, yearMin, yearMax, tier });

    // ── Replace any existing set for this exact filter combo ──
    const { data: existingSet, error: existingErr } = await supabase
      .from('pyq_custom_batch_sets')
      .select('id')
      .eq('user_id', userId).eq('filter_key', filterKey)
      .maybeSingle();
    if (existingErr) throw existingErr;

    if (existingSet) {
      const { data: oldTests, error: oldTestsErr } = await supabase
        .from(table).select('id').eq('custom_batch_set_id', existingSet.id);
      if (oldTestsErr) throw oldTestsErr;
      const oldTestIds = (oldTests || []).map(t => t.id);
      if (oldTestIds.length) {
        const { error: delJunctionErr } = await supabase.from(junctionTable).delete().in(fkColumn, oldTestIds);
        if (delJunctionErr) throw delJunctionErr;
        const { error: delTestsErr } = await supabase.from(table).delete().in('id', oldTestIds);
        if (delTestsErr) throw delTestsErr;
      }
      const { error: delSetErr } = await supabase.from('pyq_custom_batch_sets').delete().eq('id', existingSet.id);
      if (delSetErr) throw delSetErr;
    }

    // ── Pull the full sorted pool per group (subject or topic) ──
    const groupIds = testType === 'subject' ? subjectIds : topicIds;
    const perGroupQuantity = evenSplit(quantity, groupIds.length);

    const groupPools = {};
    for (const groupId of groupIds) {
      let poolQuery = supabase
        .from('questions')
        .select('id')
        .eq('exam_id', examId)
        .eq('is_pyq', true)
        .order('pyq_year', { ascending: true, nullsFirst: false })
        .order('id', { ascending: true });
      poolQuery = testType === 'subject' ? poolQuery.eq('subject_id', groupId) : poolQuery.eq('topic_id', groupId);
      if (yearMin) poolQuery = poolQuery.gte('pyq_year', yearMin);
      if (yearMax) poolQuery = poolQuery.lte('pyq_year', yearMax);
      if (tier) poolQuery = poolQuery.eq('tier', tier);

      const { data: rows, error: poolErr } = await poolQuery;
      if (poolErr) throw poolErr;
      groupPools[groupId] = (rows || []).map(r => r.id);
    }

    // ── Slice each group's pool into rounds, one round = one batch ──
    let maxRounds = 0;
    groupIds.forEach((groupId, g) => {
      const need = perGroupQuantity[g];
      if (need === 0) return;
      maxRounds = Math.max(maxRounds, Math.ceil(groupPools[groupId].length / need));
    });

    const batches = [];
    for (let round = 0; round < maxRounds; round++) {
      const batchQuestionIds = [];
      groupIds.forEach((groupId, g) => {
        const need = perGroupQuantity[g];
        if (need === 0) return;
        batchQuestionIds.push(...groupPools[groupId].slice(round * need, (round + 1) * need));
      });
      if (batchQuestionIds.length > 0) batches.push(batchQuestionIds);
    }

    if (batches.length === 0) {
      return res.status(400).json({ success: false, message: 'No PYQ questions found matching those filters.' });
    }

    // ── Descriptive label: subject/topic name(s) + year range ──
    const nameTable = testType === 'subject' ? 'subjects' : 'topics';
    const nameColumn = testType === 'subject' ? 'subject_name' : 'topic_name';
    const { data: nameRows, error: nameErr } = await supabase.from(nameTable).select(`id, ${nameColumn}`).in('id', groupIds);
    if (nameErr) throw nameErr;
    const groupNames = (nameRows || []).map(r => r[nameColumn]).join(' + ') || 'Custom';
    const yearLabel = yearMin && yearMax ? ` (${yearMin}–${yearMax})` : '';

    // ── Create the new set + its batches ──
    const { data: newSet, error: newSetErr } = await supabase
      .from('pyq_custom_batch_sets')
      .insert({
        user_id: userId, exam_id: examId, test_type: testType,
        subject_ids: subjectIds, topic_ids: testType === 'topic' ? topicIds : null,
        tier: tier || null, year_min: yearMin || null, year_max: yearMax || null,
        quantity, filter_key: filterKey,
      })
      .select().single();
    if (newSetErr) throw newSetErr;

    const createdTests = [];
    for (let i = 0; i < batches.length; i++) {
      const batchNumber = i + 1;
      const testName = `${groupNames} — Batch ${batchNumber} of ${batches.length}${yearLabel}`;
      const testRow = testType === 'subject'
        ? { exam_id: examId, subject_id: subjectIds[0], test_name: testName, test_number: batchNumber, tier: tier || null,
            total_questions: batches[i].length, duration_minutes: durationMinutes, display_order: batchNumber, is_active: true,
            generated_by_user_id: userId, custom_batch_set_id: newSet.id }
        : { exam_id: examId, subject_id: subjectIds[0], topic_id: topicIds[0], test_name: testName, test_number: batchNumber, tier: tier || null,
            total_questions: batches[i].length, duration_minutes: durationMinutes, display_order: batchNumber, is_active: true,
            generated_by_user_id: userId, custom_batch_set_id: newSet.id };

      const { data: createdTest, error: testErr } = await supabase.from(table).insert(testRow).select().single();
      if (testErr) throw testErr;

      const junctionRows = batches[i].map((qId, idx) => ({ [fkColumn]: createdTest.id, question_id: qId, question_order: idx + 1 }));
      const { error: junctionErr } = await supabase.from(junctionTable).insert(junctionRows);
      if (junctionErr) throw junctionErr;

      createdTests.push(createdTest);
    }

    res.json({ success: true, testType, batchesCreated: createdTests.length, tests: createdTests });
  } catch (err) {
    
    res.status(500).json({ success: false, message: 'Failed to generate batches.' });
  }
};

module.exports = { generateDynamicPyqTest };
