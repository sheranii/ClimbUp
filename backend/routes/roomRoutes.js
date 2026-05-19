const express = require('express');
const router = express.Router();
const {
    createRoom,
    getRoom,
    submitScore,
    getRoomScores,
    getTeacherRooms
} = require('../controller/roomController');
router.post('/create', createRoom);
router.get('/teacher/:teacherId', getTeacherRooms);
router.get('/:roomCode', getRoom);
router.post('/:roomCode/score', submitScore);
router.get('/:roomCode/scores', getRoomScores);
module.exports = router;
