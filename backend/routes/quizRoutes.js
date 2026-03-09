const express = require('express');
const router = express.Router();

// Import the logic from our controller
const { generateQuiz } = require('../controller/quizController');

// Route for Generating Quiz: POST http://localhost:5001/api/quiz/generate
router.post('/generate', generateQuiz);

module.exports = router;
