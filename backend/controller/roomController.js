const {
    createRoomService,
    getRoomService,
    submitScoreService,
    getRoomScoresService,
    getTeacherRoomsService
} = require('../services/roomServices');

// ────────────────────────────────────────────
// CREATE QUIZ ROOM (Teacher only)
// POST /api/room/create
// ────────────────────────────────────────────
const createRoom = async (req, res) => {
    try {
        const room = await createRoomService(req.body);

        res.status(201).json({
            message: 'Quiz room created successfully',
            roomCode: room.roomCode,
            shareableLink: `/quiz-room.html?room=${room.roomCode}`,
            room
        });
    } catch (error) {
        console.error('CREATE ROOM ERROR:', error);
        res.status(400).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// GET ROOM BY CODE (Public — student access)
// GET /api/room/:roomCode
// ────────────────────────────────────────────
const getRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = await getRoomService(roomCode);
        res.json(room);
    } catch (error) {
        console.error('GET ROOM ERROR:', error);
        res.status(error.message === 'Quiz room not found' ? 404 : 500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// SUBMIT STUDENT SCORE
// POST /api/room/:roomCode/score
// ────────────────────────────────────────────
const submitScore = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const studentScore = await submitScoreService(roomCode, req.body);

        res.status(201).json({
            message: 'Score submitted successfully',
            studentScore
        });
    } catch (error) {
        console.error('SUBMIT SCORE ERROR:', error);
        res.status(error.message === 'Quiz room not found' ? 404 : 400).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// GET ROOM SCORES (Leaderboard)
// GET /api/room/:roomCode/scores
// ────────────────────────────────────────────
const getRoomScores = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const scores = await getRoomScoresService(roomCode);
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
        const rooms = await getTeacherRoomsService(teacherId);
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
