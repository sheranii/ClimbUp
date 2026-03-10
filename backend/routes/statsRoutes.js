const express = require('express');
const router = express.Router();

// Import the logic from our controller
const { updateUserStats, getUserStats } = require('../controller/statsController');

// Route for updating stats: POST http://localhost:5001/api/stats/update
router.post('/update', updateUserStats);

// Route for getting stats: GET http://localhost:5001/api/stats/:userId
router.get('/:userId', getUserStats);

module.exports = router;
