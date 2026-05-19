const User = require('../models/User');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
const registerStudentService = async (data) => {
    const { name, email, password } = data;
    if (!name || !email || !password) {
        throw new Error('Please provide all fields');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'student'
    });
    const token = generateToken(user._id, 'student');
    return { user, token };
};
const loginStudentService = async (email, password) => {
    if (!email || !password) {
        throw new Error('Please provide email and password');
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateToken(user._id, 'student');
        return { user, token };
    } else {
        throw new Error('Invalid email or password');
    }
};
const registerTeacherService = async (data) => {
    const { empId, name, email, password } = data;
    if (!empId || !name || !email || !password) {
        throw new Error('Please provide Employee ID, name, email, and password');
    }
    const teacherExistsByEmail = await Teacher.findOne({ email });
    if (teacherExistsByEmail) {
        throw new Error('Teacher with this email already exists');
    }
    const teacherExistsByEmpId = await Teacher.findOne({ empId });
    if (teacherExistsByEmpId) {
        throw new Error('Employee ID already registered');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await Teacher.create({
        empId,
        name,
        email,
        password: hashedPassword,
        role: 'teacher'
    });
    const token = generateToken(teacher._id, 'teacher');
    return { teacher, token };
};
const loginTeacherService = async (email, password) => {
    if (!email || !password) {
        throw new Error('Please provide email and password');
    }
    const teacher = await Teacher.findOne({ email });
    if (teacher && (await bcrypt.compare(password, teacher.password))) {
        const token = generateToken(teacher._id, 'teacher');
        return { teacher, token };
    } else {
        throw new Error('Invalid email or password');
    }
};
const updateProfileByIdService = async (id, data) => {
    let user = await User.findById(id);
    let role = 'student';
    if (!user) {
        user = await Teacher.findById(id);
        role = 'teacher';
    }
    if (!user) {
        throw new Error('User not found');
    }
    user.name = data.name || user.name;
    user.email = data.email || user.email;
    if (data.password) {
        user.password = await bcrypt.hash(data.password, 10);
    }
    const updatedUser = await user.save();
    return { updatedUser, role };
};
module.exports = {
    registerStudentService,
    loginStudentService,
    registerTeacherService,
    loginTeacherService,
    updateProfileByIdService
};
