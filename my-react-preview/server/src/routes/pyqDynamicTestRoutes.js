const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/validate.middleware');
const { generateDynamicPyqTest } = require('../controllers/pyqDynamicTestController');

// Student-facing: generate a fresh, non-repeating subject-wise or
// topic-wise PYQ practice test from the existing question pool.
router.post('/pyq-dynamic-test', authenticateToken, generateDynamicPyqTest);

module.exports = router;
