const express = require("express");
const router = express.Router();

const practiceController = require("../controllers/practiceController");
const { authenticateToken } = require("../middleware/validate.middleware");

router.get("/subjects",  practiceController.getSubjects);
router.get("/topics",    authenticateToken, practiceController.getTopics);
router.get("/questions", authenticateToken, practiceController.getQuestions);
router.post("/attempt",  authenticateToken, practiceController.logAttempt);

router.get("/bookmarks",      authenticateToken, practiceController.getBookmarks);
router.post("/bookmarks",     authenticateToken, practiceController.addBookmark);
router.delete("/bookmarks",   authenticateToken, practiceController.removeBookmark);

module.exports = router;

// In server.js / app.js:
// const practiceRoutes = require('./routes/practiceRoutes');
// app.use('/api/practice', practiceRoutes);
