/**
 * Unit Tests — authServices.js
 *
 * Strategy: Jest mocks (jest.mock) replace all DB and crypto calls.
 * No real DB connection is needed — these are pure unit tests.
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ---------- Mock Dependencies ----------
jest.mock('../../models/User');
jest.mock('../../models/Teacher');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const User    = require('../../models/User');
const Teacher = require('../../models/Teacher');

const {
    registerStudentService,
    loginStudentService,
    registerTeacherService,
    loginTeacherService,
    updateProfileByIdService,
} = require('../../services/authServices');

// Provide a JWT_SECRET for the token helper inside the service
process.env.JWT_SECRET = 'test_secret';

// ─────────────────────────────────────────────
// registerStudentService
// ─────────────────────────────────────────────
describe('registerStudentService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws if any required field is missing', async () => {
        await expect(registerStudentService({ email: 'a@b.com', password: '123' }))
            .rejects.toThrow('Please provide all fields');
    });

    it('throws if user already exists', async () => {
        User.findOne.mockResolvedValue({ email: 'a@b.com' });
        await expect(registerStudentService({ name: 'Ali', email: 'a@b.com', password: '123' }))
            .rejects.toThrow('User already exists');
    });

    it('returns user and token on success', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashed_pw');
        const fakeUser = { _id: 'uid1', name: 'Ali', email: 'a@b.com', role: 'student' };
        User.create.mockResolvedValue(fakeUser);
        jwt.sign.mockReturnValue('fake_token');

        const result = await registerStudentService({ name: 'Ali', email: 'a@b.com', password: '123' });

        expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
        expect(result).toEqual({ user: fakeUser, token: 'fake_token' });
    });
});

// ─────────────────────────────────────────────
// loginStudentService
// ─────────────────────────────────────────────
describe('loginStudentService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws if email or password is missing', async () => {
        await expect(loginStudentService('', 'pass')).rejects.toThrow('Please provide email and password');
        await expect(loginStudentService('email@x.com', '')).rejects.toThrow('Please provide email and password');
    });

    it('throws on invalid credentials', async () => {
        User.findOne.mockResolvedValue({ password: 'hashed' });
        bcrypt.compare.mockResolvedValue(false);
        await expect(loginStudentService('a@b.com', 'wrong')).rejects.toThrow('Invalid email or password');
    });

    it('returns user and token on valid credentials', async () => {
        const fakeUser = { _id: 'uid1', name: 'Ali', email: 'a@b.com', password: 'hashed', role: 'student' };
        User.findOne.mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('jwt_token');

        const result = await loginStudentService('a@b.com', 'correct');
        expect(result).toEqual({ user: fakeUser, token: 'jwt_token' });
    });
});

// ─────────────────────────────────────────────
// registerTeacherService
// ─────────────────────────────────────────────
describe('registerTeacherService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws if any required field is missing', async () => {
        await expect(registerTeacherService({ name: 'Bob', email: 'b@c.com', password: '123' }))
            .rejects.toThrow('Please provide Employee ID, name, email, and password');
    });

    it('throws if email already registered', async () => {
        Teacher.findOne.mockResolvedValueOnce({ email: 'b@c.com' });
        await expect(registerTeacherService({ empId: 'T01', name: 'Bob', email: 'b@c.com', password: '123' }))
            .rejects.toThrow('Teacher with this email already exists');
    });

    it('throws if empId already registered', async () => {
        Teacher.findOne
            .mockResolvedValueOnce(null)          // email check → not found
            .mockResolvedValueOnce({ empId: 'T01' }); // empId check → found
        await expect(registerTeacherService({ empId: 'T01', name: 'Bob', email: 'new@c.com', password: '123' }))
            .rejects.toThrow('Employee ID already registered');
    });

    it('returns teacher and token on success', async () => {
        Teacher.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('h_pw');
        const fakeTeacher = { _id: 'tid1', empId: 'T01', name: 'Bob', email: 'b@c.com', role: 'teacher' };
        Teacher.create.mockResolvedValue(fakeTeacher);
        jwt.sign.mockReturnValue('teacher_token');

        const result = await registerTeacherService({ empId: 'T01', name: 'Bob', email: 'b@c.com', password: '123' });
        expect(result).toEqual({ teacher: fakeTeacher, token: 'teacher_token' });
    });
});

// ─────────────────────────────────────────────
// loginTeacherService
// ─────────────────────────────────────────────
describe('loginTeacherService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws on missing fields', async () => {
        await expect(loginTeacherService('', 'pw')).rejects.toThrow('Please provide email and password');
    });

    it('throws on invalid credentials', async () => {
        Teacher.findOne.mockResolvedValue({ password: 'hash' });
        bcrypt.compare.mockResolvedValue(false);
        await expect(loginTeacherService('b@c.com', 'bad')).rejects.toThrow('Invalid email or password');
    });

    it('returns teacher and token on success', async () => {
        const fakeTeacher = { _id: 'tid1', empId: 'T01', name: 'Bob', email: 'b@c.com', password: 'hash' };
        Teacher.findOne.mockResolvedValue(fakeTeacher);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('t_jwt');

        const result = await loginTeacherService('b@c.com', 'correct');
        expect(result).toEqual({ teacher: fakeTeacher, token: 't_jwt' });
    });
});

// ─────────────────────────────────────────────
// updateProfileByIdService
// ─────────────────────────────────────────────
describe('updateProfileByIdService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws if neither User nor Teacher found', async () => {
        User.findById.mockResolvedValue(null);
        Teacher.findById.mockResolvedValue(null);
        await expect(updateProfileByIdService('bad_id', { name: 'X' })).rejects.toThrow('User not found');
    });

    it('updates a student and returns role=student', async () => {
        const saveMock = jest.fn().mockResolvedValue({ _id: 'uid1', name: 'New', email: 'a@b.com' });
        User.findById.mockResolvedValue({ _id: 'uid1', name: 'Old', email: 'a@b.com', save: saveMock });
        bcrypt.hash.mockResolvedValue('new_hash');

        const result = await updateProfileByIdService('uid1', { name: 'New', password: 'pw' });
        expect(result.role).toBe('student');
        expect(saveMock).toHaveBeenCalled();
    });

    it('updates a teacher and returns role=teacher', async () => {
        const saveMock = jest.fn().mockResolvedValue({ _id: 'tid1', name: 'TeacherNew', email: 't@c.com' });
        User.findById.mockResolvedValue(null);
        Teacher.findById.mockResolvedValue({ _id: 'tid1', name: 'Teacher', email: 't@c.com', save: saveMock });

        const result = await updateProfileByIdService('tid1', { name: 'TeacherNew' });
        expect(result.role).toBe('teacher');
    });
});
