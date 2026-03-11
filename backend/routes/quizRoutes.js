const express = require('express');
const router = express.Router();

const { generateQuiz } = require('../controller/quizController');

// Route for Generating Quiz: POST http://localhost:5001/api/quiz/generate
router.post('/generate', generateQuiz);

module.exports = router;
