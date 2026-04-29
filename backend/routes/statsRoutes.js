const express = require('express');
const router = express.Router();

// Import controller functions
const { updateUserStats, updateUserById, getUserStats, deleteUserStats } = require('../controller/statsController');

// POST → update stats
router.post('/update', updateUserStats);

// PUT → update any user field by ID
router.put('/:userId', updateUserById);

// GET → fetch stats
router.get('/:userId', getUserStats);

// DELETE → remove user stats
router.delete('/:userId', deleteUserStats);

module.exports = router;