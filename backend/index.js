const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import our routes
const authRoutes = require('./routes/authRoutes');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// --- MIDDLEWARES ---
// Allows our frontend (HTML/JS) to make requests to this backend
app.use(cors()); 
// Tells our server to understand JSON data sent in the body of requests
app.use(express.json()); 

// --- ROUTES ---
// Mount the auth routes. All endpoints in authRoutes.js will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// A simple test route to check if the server is running
app.get('/', (req, res) => {
    res.send('ClimbUp API is running smoothly...');
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});