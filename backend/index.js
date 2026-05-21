const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
dotenv.config();
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const statsRoutes = require('./routes/statsRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/quiz-room', async (req, res) => {
    let user = null;
    if (req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            user = await User.findById(decoded.id).select('-password') || await Teacher.findById(decoded.id).select('-password');
        } catch (error) {
            console.error("Token verification failed in SSR", error);
        }
    }
    res.render('quiz-room', { user });
});
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('join-room', ({ roomCode, userName, role }) => {
        socket.join(roomCode);
        console.log(`${role} "${userName}" joined room ${roomCode}`);
        if (role === 'student') {
            socket.to(roomCode).emit('student-joined', { userName, socketId: socket.id });
        }
    });
    socket.on('start-quiz', ({ roomCode }) => {
        console.log(`Quiz started in room ${roomCode}`);
        io.to(roomCode).emit('quiz-started', { roomCode });
    });
    socket.on('score-submitted', ({ roomCode, studentName, score, timeTaken }) => {
        io.to(roomCode).emit('score-update', { studentName, score, timeTaken });
    });
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
const { errorMiddleware } = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');
connectDB();
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});