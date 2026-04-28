const { updateUserById } = require('../controller/authController');

// Add this:
router.put('/update/:id', updateUserById);