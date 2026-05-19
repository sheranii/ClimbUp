const express = require('express');
const router = express.Router();
const { updateUserStats, updateUserById, getUserStats, deleteUserStats } = require('../controller/statsController');
router.post('/update', updateUserStats);
router.put('/:userId', updateUserById);
router.get('/:userId', getUserStats);
router.delete('/:userId', deleteUserStats);
module.exports = router;