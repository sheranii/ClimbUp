const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Import our routes
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// --- MIDDLEWARES ---
// Allows our frontend (HTML/JS) to make requests to this backend
app.use(cors());
// Tells our server to understand JSON data sent in the body of requests
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')))

// --- ROUTES ---
// Mount the auth routes. All endpoints in authRoutes.js will be prefixed with /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

// A simple test route to check if the server is running
app.get('/', (req, res) => {
    // res.send('ClimbUp API is running smoothly...');
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- START SERVER ---
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});