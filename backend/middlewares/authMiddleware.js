const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract token
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Get user from DB (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Move to next middleware/controller
            next();

        } catch (error) {
            console.error("AUTH ERROR:", error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = protect;