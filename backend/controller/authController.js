const User = require('../models/User');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// ────────────────────────────────────────────
// STUDENT REGISTER
// ────────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student'
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, 'student')
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// STUDENT LOGIN
// ────────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: 'student',
                token: generateToken(user._id, 'student')
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// TEACHER REGISTER
// ────────────────────────────────────────────
const registerTeacher = async (req, res) => {
    try {
        const { empId, name, email, password } = req.body;

        if (!empId || !name || !email || !password) {
            return res.status(400).json({ message: 'Please provide Employee ID, name, email, and password' });
        }

        const teacherExistsByEmail = await Teacher.findOne({ email });
        if (teacherExistsByEmail) {
            return res.status(400).json({ message: 'Teacher with this email already exists' });
        }

        const teacherExistsByEmpId = await Teacher.findOne({ empId });
        if (teacherExistsByEmpId) {
            return res.status(400).json({ message: 'Employee ID already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = await Teacher.create({
            empId,
            name,
            email,
            password: hashedPassword,
            role: 'teacher'
        });

        res.status(201).json({
            _id: teacher._id,
            empId: teacher.empId,
            name: teacher.name,
            email: teacher.email,
            role: 'teacher',
            token: generateToken(teacher._id, 'teacher')
        });

    } catch (error) {
        console.error("TEACHER REGISTER ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// TEACHER LOGIN
// ────────────────────────────────────────────
const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const teacher = await Teacher.findOne({ email });

        if (teacher && (await bcrypt.compare(password, teacher.password))) {
            res.json({
                _id: teacher._id,
                empId: teacher.empId,
                name: teacher.name,
                email: teacher.email,
                role: 'teacher',
                token: generateToken(teacher._id, 'teacher')
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error("TEACHER LOGIN ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// UPDATE USER BY ID
// ────────────────────────────────────────────
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email
        });

    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// EXPORT
module.exports = {
    registerUser,
    loginUser,
    registerTeacher,
    loginTeacher,
    updateUserById
};
