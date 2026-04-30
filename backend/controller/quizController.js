const { generateQuizService } = require('../services/quizServices');

// @desc    Generate a quiz based on a topic
// @route   POST /api/quiz/generate
const generateQuiz = async (req, res) => {
    let topic = req.body.topic;
    let count = req.body.count || 4; // Default to 4
    let difficulty = req.body.difficulty || 'medium'; // Default to medium

    try {
        const quizData = await generateQuizService(topic, count, difficulty);
        res.status(200).json({ quizData });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    generateQuiz
};