const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    registerTeacher,
    loginTeacher,
    updateUserById
} = require('../controller/authController');
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update/:id', updateUserById);
router.post('/teacher/register', registerTeacher);
router.post('/teacher/login', loginTeacher);
module.exports = router;