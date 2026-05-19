const { v4: uuidv4 } = require('uuid');
const { GoogleGenAI } = require('@google/genai');
const QuizRoom = require('../models/QuizRoom');
const StudentScore = require('../models/StudentScore');
const createRoomService = async (data) => {
    const { subject, topic, numQuestions, difficulty, teacherId, teacherName } = data;
    if (!subject || !topic || !numQuestions || !difficulty || !teacherId) {
        throw new Error('Please provide all room details');
    }
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
    const roomCode = uuidv4().split('-')[0].toUpperCase();
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
    return room;
};
const getRoomService = async (roomCode) => {
    const room = await QuizRoom.findOne({ roomCode });
    if (!room) {
        throw new Error('Quiz room not found');
    }
    return room;
};
const submitScoreService = async (roomCode, data) => {
    const { studentName, email, score, timeTaken } = data;
    if (!studentName || !email || score === undefined) {
        throw new Error('Student name, email, and score are required');
    }
    const room = await QuizRoom.findOne({ roomCode });
    if (!room) {
        throw new Error('Quiz room not found');
    }
    const studentScore = await StudentScore.create({
        quizRoom: room._id,
        roomCode,
        studentName,
        email,
        score,
        timeTaken: timeTaken || 0
    });
    return studentScore;
};
const getRoomScoresService = async (roomCode) => {
    const scores = await StudentScore.find({ roomCode })
        .sort({ score: -1, timeTaken: 1 });
    return scores;
};
const getTeacherRoomsService = async (teacherId) => {
    const rooms = await QuizRoom.find({ createdBy: teacherId })
        .sort({ createdAt: -1 });
    return rooms;
};
module.exports = {
    createRoomService,
    getRoomService,
    submitScoreService,
    getRoomScoresService,
    getTeacherRoomsService
};
