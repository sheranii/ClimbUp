const express = require('express');
const router = express.Router();

const {
    createRoom,
    getRoom,
    submitScore,
    getRoomScores,
    getTeacherRooms
} = require('../controller/roomController');

// Teacher — create a quiz room
router.post('/create', createRoom);

// Teacher — get all rooms they created
router.get('/teacher/:teacherId', getTeacherRooms);

// Public — get a room by code (student enters via link)
router.get('/:roomCode', getRoom);

// Student — submit score after finishing quiz
router.post('/:roomCode/score', submitScore);

// Teacher — view leaderboard for a room
router.get('/:roomCode/scores', getRoomScores);

module.exports = router;
