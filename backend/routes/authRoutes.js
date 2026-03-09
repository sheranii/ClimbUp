const express = require('express');
const router = express.Router();

// Import the logic from our controller
const { registerUser, loginUser } = require('../controller/authController');

// Route for User Registration: POST http://localhost:5000/api/auth/register
router.post('/register', registerUser);

// Route for User Login: POST http://localhost:5000/api/auth/login
router.post('/login', loginUser);

module.exports = router;