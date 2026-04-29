const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables FIRST
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const statsRoutes = require('./routes/statsRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express
const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/users', userRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve quiz room page
app.get('/quiz-room', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/quiz-room.html'));
});

// --- SOCKET.IO EVENTS ---
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Student or teacher joins a quiz room
    socket.on('join-room', ({ roomCode, userName, role }) => {
        socket.join(roomCode);
        console.log(`${role} "${userName}" joined room ${roomCode}`);

        if (role === 'student') {
            // Notify the teacher (others in the room)
            socket.to(roomCode).emit('student-joined', { userName, socketId: socket.id });
        }
    });

    // Teacher starts the quiz — broadcast to all students in the room
    socket.on('start-quiz', ({ roomCode }) => {
        console.log(`Quiz started in room ${roomCode}`);
        io.to(roomCode).emit('quiz-started', { roomCode });
    });

    // Student submits their score — notify teacher's room
    socket.on('score-submitted', ({ roomCode, studentName, score, timeTaken }) => {
        io.to(roomCode).emit('score-update', { studentName, score, timeTaken });
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

const { errorMiddleware } = require('./middlewares/errorMiddleware');

app.use(errorMiddleware);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

const connectDB = require('./config/db');
connectDB();

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});