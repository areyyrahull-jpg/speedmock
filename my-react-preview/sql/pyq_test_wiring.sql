-- ============================================================================
-- PYQ / TEST WIRING MIGRATION
-- Run this in the Supabase SQL editor. It is idempotent (safe to re-run).
--
-- Adds:
--   1. is_free flag on the three test catalogs        (gap #3)
--   2. status / saved_state / progress_pct on attempts (gap #2 — resume)
--   3. submit_test_attempt() scoring RPC               (gap #1 — scoring)
--   4. INSERT/UPDATE RLS policies that were missing     (createAttempt/pause)
-- ============================================================================

-- ── 1. FREE-SAMPLE FLAG ─────────────────────────────────────────────────────
ALTER TABLE pyq_tests          ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE subject_wise_tests ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE topic_wise_tests   ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- ── 2. RESUME SUPPORT ON user_test_attempts ─────────────────────────────────
ALTER TABLE user_test_attempts ADD COLUMN IF NOT EXISTS status       VARCHAR(20) DEFAULT 'in-progress';
ALTER TABLE user_test_attempts ADD COLUMN IF NOT EXISTS saved_state  JSONB;
ALTER TABLE user_test_attempts ADD COLUMN IF NOT EXISTS progress_pct INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_test_attempts_status
  ON user_test_attempts(user_id, test_id, status);

-- ── 3. RLS WRITE POLICIES (the schema only had SELECT policies) ──────────────
-- user_test_attempts: let a user create/update their own attempt rows.
DROP POLICY IF EXISTS "Users can insert own test attempts" ON user_test_attempts;
CREATE POLICY "Users can insert own test attempts" ON user_test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own test attempts" ON user_test_attempts;
CREATE POLICY "Users can update own test attempts" ON user_test_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- user_question_responses: writes happen inside the SECURITY DEFINER RPC, but
-- allow direct inserts too in case you need them client-side.
DROP POLICY IF EXISTS "Users can insert own question responses" ON user_question_responses;
CREATE POLICY "Users can insert own question responses" ON user_question_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- bookmarks write policies (used by the question bank / review flows)
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can insert own bookmarks" ON user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can delete own bookmarks" ON user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ── 4. SCORING RPC ──────────────────────────────────────────────────────────
-- Scores an attempt entirely server-side so the answer key (questions.correct_option)
-- never has to reach the browser. Works for ANY test type — it scores by the
-- list of question ids passed in, not by which catalog they came from.
--
--   p_answers     : { "<question_id>": "A" }   (option LETTER, not index)
--   p_time_per_q  : { "<question_id>": 42 }     (seconds)
--   p_question_ids: every question id in the test (so unanswered = skipped)
--
-- Returns a JSON result shaped for TestResult.jsx.
CREATE OR REPLACE FUNCTION submit_test_attempt(
  p_attempt_id      uuid,
  p_question_ids    uuid[],
  p_answers         jsonb,
  p_time_per_q      jsonb,
  p_time_taken_secs int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   uuid;
  v_correct   int := 0;
  v_wrong     int := 0;
  v_skipped   int := 0;
  v_attempted int := 0;
  v_score     numeric := 0;
  v_max_score numeric := 0;
  v_total     int := COALESCE(array_length(p_question_ids, 1), 0);
  v_sections  jsonb;
  v_acc       numeric := 0;
  rec         record;
  v_sel       text;
  v_correct_q boolean;
  v_time      int;
BEGIN
  -- ownership check
  SELECT user_id INTO v_user_id FROM user_test_attempts WHERE id = p_attempt_id;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'attempt % not found', p_attempt_id; END IF;
  IF auth.uid() IS NOT NULL AND v_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'not authorized for this attempt';
  END IF;

  -- idempotent re-submit
  DELETE FROM user_question_responses WHERE test_attempt_id = p_attempt_id;

  FOR rec IN
    SELECT q.id,
           q.correct_option,
           q.subject_id,
           COALESCE(q.marks, 1)              AS marks,
           COALESCE(q.negative_marking, 0.25) AS neg
    FROM questions q
    WHERE q.id = ANY(p_question_ids)
  LOOP
    v_sel  := p_answers ->> rec.id::text;
    v_time := COALESCE((p_time_per_q ->> rec.id::text)::int, 0);
    v_max_score := v_max_score + rec.marks;

    IF v_sel IS NULL OR v_sel = '' THEN
      v_skipped := v_skipped + 1;
      INSERT INTO user_question_responses
        (user_id, test_attempt_id, question_id, selected_option, is_correct, marks_obtained, time_spent_seconds)
      VALUES (v_user_id, p_attempt_id, rec.id, NULL, NULL, 0, v_time);
    ELSE
      v_attempted := v_attempted + 1;
      v_correct_q := (upper(v_sel) = upper(rec.correct_option));
      IF v_correct_q THEN
        v_correct := v_correct + 1;
        v_score   := v_score + rec.marks;
      ELSE
        v_wrong := v_wrong + 1;
        v_score := v_score - rec.neg;
      END IF;
      INSERT INTO user_question_responses
        (user_id, test_attempt_id, question_id, selected_option, is_correct, marks_obtained, time_spent_seconds)
      VALUES (v_user_id, p_attempt_id, rec.id, upper(v_sel), v_correct_q,
              CASE WHEN v_correct_q THEN rec.marks ELSE -rec.neg END, v_time);
    END IF;
  END LOOP;

  v_acc := CASE WHEN v_attempted > 0 THEN round((v_correct::numeric / v_attempted) * 100, 2) ELSE 0 END;

  -- per-subject breakdown for the result charts
  SELECT COALESCE(jsonb_agg(sec), '[]'::jsonb) INTO v_sections FROM (
    SELECT jsonb_build_object(
      'subject_id',      s.id,
      'name',            COALESCE(s.subject_name, 'Section'),
      'total',           count(*),
      'correct',         count(*) FILTER (WHERE r.is_correct IS TRUE),
      'wrong',           count(*) FILTER (WHERE r.is_correct IS FALSE),
      'unattempted',     count(*) FILTER (WHERE r.is_correct IS NULL),
      'time_taken_secs', COALESCE(sum(r.time_spent_seconds), 0)
    ) AS sec
    FROM user_question_responses r
    JOIN questions q ON q.id = r.question_id
    LEFT JOIN subjects s ON s.id = q.subject_id
    WHERE r.test_attempt_id = p_attempt_id
    GROUP BY s.id, s.subject_name
  ) t;

  UPDATE user_test_attempts SET
    attempted_questions = v_attempted,
    correct_answers     = v_correct,
    wrong_answers       = v_wrong,
    skipped             = v_skipped,
    score               = v_score,
    max_score           = v_max_score,
    accuracy            = v_acc,
    duration_seconds    = p_time_taken_secs,
    completed_at        = now(),
    status              = 'completed',
    progress_pct        = 100
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'correct',        v_correct,
    'wrong',          v_wrong,
    'unattempted',    v_skipped,
    'attempted',      v_attempted,
    'totalQuestions', v_total,
    'score',          v_score,
    'maxScore',       v_max_score,
    'accuracy',       v_acc,
    'sections',       v_sections
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_test_attempt(uuid, uuid[], jsonb, jsonb, int) TO anon, authenticated;

-- ============================================================================
-- END
-- ============================================================================
