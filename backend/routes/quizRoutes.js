const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../controller/quizController');
router.post('/generate', generateQuiz);
module.exports = router;