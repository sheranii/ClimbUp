const express = require('express');
const router = express.Router();
const { updateUser } = require('../controller/userController');

// PUT /api/users/:id  — update any user field by ID
router.put('/:id', updateUser);

module.exports = router;
