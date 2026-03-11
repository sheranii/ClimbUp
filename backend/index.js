const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');


const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const statsRoutes = require('./routes/statsRoutes');


dotenv.config();


const app = express();


app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')))

// Log incoming API requests to the terminal
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stats', statsRoutes);

// A simple test route to check if the server is running
app.get('/', (req, res) => {
    // res.send('ClimbUp API is running smoothly...');
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});