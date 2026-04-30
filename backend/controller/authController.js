const {
    registerStudentService,
    loginStudentService,
    registerTeacherService,
    loginTeacherService,
    updateProfileByIdService
} = require('../services/authServices');

// ────────────────────────────────────────────
// STUDENT REGISTER
// ────────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { user, token } = await registerStudentService(req.body);

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(400).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// STUDENT LOGIN
// ────────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await loginStudentService(email, password);

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: 'student',
            token: token
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(401).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// TEACHER REGISTER
// ────────────────────────────────────────────
const registerTeacher = async (req, res) => {
    try {
        const { teacher, token } = await registerTeacherService(req.body);

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        res.status(201).json({
            _id: teacher._id,
            empId: teacher.empId,
            name: teacher.name,
            email: teacher.email,
            role: 'teacher',
            token: token
        });
    } catch (error) {
        console.error("TEACHER REGISTER ERROR:", error);
        res.status(400).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// TEACHER LOGIN
// ────────────────────────────────────────────
const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { teacher, token } = await loginTeacherService(email, password);

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        res.json({
            _id: teacher._id,
            empId: teacher.empId,
            name: teacher.name,
            email: teacher.email,
            role: 'teacher',
            token: token
        });
    } catch (error) {
        console.error("TEACHER LOGIN ERROR:", error);
        res.status(401).json({ message: error.message });
    }
};

// ────────────────────────────────────────────
// UPDATE USER BY ID
// ────────────────────────────────────────────
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { updatedUser, role } = await updateProfileByIdService(id, req.body);

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: role
        });
    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
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
