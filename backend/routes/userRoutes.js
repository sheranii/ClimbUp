const express = require('express');
const router = express.Router();
const { updateUser, getAllUsers } = require('../controller/userController');
router.get('/', getAllUsers);
router.put('/:id', updateUser);
module.exports = router;
