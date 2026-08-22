// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.controllor");
const { authenticateToken } = require("../middleware/validate.middleware");
const { isAdmin } = require("../middleware/admin.middleware");

router.use(authenticateToken, isAdmin);

// Stats
router.get("/stats", ctrl.getStats);

// Lookups (dropdowns)
router.get("/exams",    ctrl.listExams);
router.get("/subjects", ctrl.listSubjects);
router.get("/topics",   ctrl.listTopics);

// Tests — update/delete need :testType so controller knows which table to touch
router.get("/tests",                        ctrl.listTests);
router.post("/tests",                       ctrl.createTest);
router.put("/tests/:testType/:testId",      ctrl.updateTest);
router.delete("/tests/:testType/:testId",   ctrl.deleteTest);
router.post("/tests/generate-batches",      ctrl.generateTestBatches);

// Test questions (with junction table linking)
router.get("/questions",               ctrl.listQuestions);
router.post("/questions",              ctrl.createQuestion);
router.put("/questions/:questionId",   ctrl.updateQuestion);
router.delete("/questions/:questionId", ctrl.deleteQuestion);
router.post("/questions/bulk",         ctrl.bulkImportQuestions);

// Practice bank (is_pyq=false questions)
router.get("/practice-questions",                 ctrl.listPracticeQuestions);
router.get("/practice-questions/stats",           ctrl.getPracticeStats);
router.get("/practice-questions/topics",          ctrl.listPracticeTopics);
router.post("/practice-questions",                ctrl.createPracticeQuestion);
router.put("/practice-questions/:questionId",     ctrl.updatePracticeQuestion);
router.delete("/practice-questions/:questionId",  ctrl.deletePracticeQuestion);
router.post("/practice-questions/bulk",           ctrl.bulkImportPracticeQuestions);

// Typing test passages (English & Hindi, PYQ & Extra)
router.get("/typing-passages",                ctrl.listTypingPassages);
router.post("/typing-passages",               ctrl.createTypingPassage);
router.put("/typing-passages/:passageId",     ctrl.updateTypingPassage);
router.delete("/typing-passages/:passageId",  ctrl.deleteTypingPassage);

module.exports = router;
