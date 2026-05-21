const express = require('express');
const router = express.Router();
const {
    createMatchHistory,
    getMatchHistoriesByUser,
    getLeaderboard,
    deleteMatchHistory
} = require('../controller/matchController');

router.post('/', createMatchHistory);
router.get('/user/:userId', getMatchHistoriesByUser);
router.get('/leaderboard', getLeaderboard);
router.delete('/:id', deleteMatchHistory);

module.exports = router;
