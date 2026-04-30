const express = require('express');
const router = express.Router();
// Import your new function
const { updateUser, getAllUsers } = require('../controller/userController');

// GET /api/users — get all users
router.get('/', getAllUsers);

// PUT /api/users/:id  — update any user field by ID
router.put('/:id', updateUser);

module.exports = router;

