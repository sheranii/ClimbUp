const { v4: uuidv4 } = require('uuid');
const { GoogleGenAI } = require('@google/genai');
const QuizRoom = require('../models/QuizRoom');
const StudentScore = require('../models/StudentScore');

// ────────────────────────────────────────────
// CREATE QUIZ ROOM (Teacher only)
// POST /api/room/create
// ────────────────────────────────────────────
const createRoom = async (req, res) => {
    try {
        const { subject, topic, numQuestions, difficulty, teacherId, teacherName } = req.body;

        if (!subject || !topic || !numQuestions || !difficulty || !teacherId) {
            return res.status(400).json({ message: 'Please provide all room details' });
        }

        // Generate quiz questions using Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = 'gemma-3-27b-it';

        const prompt = `Generate a ${numQuestions}-question multiple-choice quiz about "${topic}" (Subject: ${subject}). The difficulty level should be ${difficulty}.
Return ONLY a raw, valid JSON array of objects. Do not use markdown blocks or backticks.
Each object should have this exact structure:
{
  "q": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "answer": 0
}`;

        let quizData = [];

        try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            let text = response.text.trim();
            if (text.startsWith('```json')) text = text.substring(7);
            if (text.startsWith('```')) text = text.substring(3);
            if (text.endsWith('```')) text = text.substring(0, text.length - 3);
            text = text.trim();
            quizData = JSON.parse(text);
        } catch (aiErr) {
            console.error('AI generation failed, using fallback:', aiErr.message);
            quizData = Array.from({ length: numQuestions }, (_, i) => ({
                q: `[${difficulty.toUpperCase()}] Question ${i + 1} about ${topic}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                answer: 0
            }));
        }

        const roomCode = uuidv4().split('-')[0].toUpperCase(); // Short 8-char code

        const room = await QuizRoom.create({
            roomCode,
            subject,
            topic,
            numQuestions,
            difficulty,
            createdBy: teacherId,
            createdByName: teacherName || 'Teacher',
            quizData,
            isActive: true
        });

        res.status(201).json({
            message: 'Quiz room created successfully',
            roomCode: room.roomCode,
            shareableLink: `/quiz-room.html?room=${room.roomCode}`,
            room
        });

    } catch (error) {
        console.error('CREATE ROOM ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// GET ROOM BY CODE (Public — student access)
// GET /api/room/:roomCode
// ────────────────────────────────────────────
const getRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = await QuizRoom.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({ message: 'Quiz room not found' });
        }

        res.json(room);
    } catch (error) {
        console.error('GET ROOM ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// SUBMIT STUDENT SCORE
// POST /api/room/:roomCode/score
// ────────────────────────────────────────────
const submitScore = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { studentName, email, score, timeTaken } = req.body;

        if (!studentName || !email || score === undefined) {
            return res.status(400).json({ message: 'Student name, email, and score are required' });
        }

        const room = await QuizRoom.findOne({ roomCode });
        if (!room) {
            return res.status(404).json({ message: 'Quiz room not found' });
        }

        const studentScore = await StudentScore.create({
            quizRoom: room._id,
            roomCode,
            studentName,
            email,
            score,
            timeTaken: timeTaken || 0
        });

        res.status(201).json({
            message: 'Score submitted successfully',
            studentScore
        });

    } catch (error) {
        console.error('SUBMIT SCORE ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// GET ROOM SCORES (Leaderboard)
// GET /api/room/:roomCode/scores
// ────────────────────────────────────────────
const getRoomScores = async (req, res) => {
    try {
        const { roomCode } = req.params;

        const scores = await StudentScore.find({ roomCode })
            .sort({ score: -1, timeTaken: 1 }); // Sort by score desc, time asc

        res.json({ roomCode, scores });
    } catch (error) {
        console.error('GET SCORES ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// GET ALL ROOMS BY TEACHER
// GET /api/room/teacher/:teacherId
// ────────────────────────────────────────────
const getTeacherRooms = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const rooms = await QuizRoom.find({ createdBy: teacherId })
            .sort({ createdAt: -1 });

        res.json({ rooms });
    } catch (error) {
        console.error('GET TEACHER ROOMS ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRoom,
    getRoom,
    submitScore,
    getRoomScores,
    getTeacherRooms
};
