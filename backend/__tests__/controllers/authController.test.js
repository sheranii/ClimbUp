/**
 * Unit Tests — authController.js
 *
 * Controllers are tested in complete isolation: we mock the service layer
 * and create lightweight req/res/next stubs — no HTTP server required.
 */

jest.mock('../../services/authServices');

// Silence controller catch-block logs during error-path tests
beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

const {
    registerStudentService,
    loginStudentService,
    registerTeacherService,
    loginTeacherService,
    updateProfileByIdService,
} = require('../../services/authServices');

const {
    registerUser,
    loginUser,
    registerTeacher,
    loginTeacher,
    updateUserById,
} = require('../../controller/authController');

// ---------- Helpers ----------
const mockRes = () => {
    const res = {};
    res.status  = jest.fn().mockReturnValue(res);
    res.json    = jest.fn().mockReturnValue(res);
    res.cookie  = jest.fn().mockReturnValue(res);
    return res;
};
const mockNext = () => jest.fn();

// ─────────────────────────────────────────────
// registerUser
// ─────────────────────────────────────────────
describe('registerUser controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 201 with user data on success', async () => {
        const fakeUser  = { _id: 'u1', name: 'Ali', email: 'a@b.com', role: 'student' };
        registerStudentService.mockResolvedValue({ user: fakeUser, token: 'tok' });

        const req = { body: { name: 'Ali', email: 'a@b.com', password: '123' } };
        const res = mockRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'u1', token: 'tok' }));
        expect(res.cookie).toHaveBeenCalledWith('token', 'tok', expect.any(Object));
    });

    it('responds 400 if service throws', async () => {
        registerStudentService.mockRejectedValue(new Error('User already exists'));

        const req = { body: {} };
        const res = mockRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
});

// ─────────────────────────────────────────────
// loginUser
// ─────────────────────────────────────────────
describe('loginUser controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 200 with user data on valid credentials', async () => {
        const fakeUser = { _id: 'u1', name: 'Ali', email: 'a@b.com', role: 'student' };
        loginStudentService.mockResolvedValue({ user: fakeUser, token: 'tok' });

        const req = { body: { email: 'a@b.com', password: 'pw' } };
        const res = mockRes();

        await loginUser(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'u1', role: 'student' }));
    });

    it('responds 401 on invalid credentials', async () => {
        loginStudentService.mockRejectedValue(new Error('Invalid email or password'));

        const req = { body: { email: 'x@y.com', password: 'bad' } };
        const res = mockRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });
});

// ─────────────────────────────────────────────
// registerTeacher
// ─────────────────────────────────────────────
describe('registerTeacher controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 201 with teacher data on success', async () => {
        const fakeTeacher = { _id: 't1', empId: 'T01', name: 'Bob', email: 'b@c.com', role: 'teacher' };
        registerTeacherService.mockResolvedValue({ teacher: fakeTeacher, token: 'ttok' });

        const req = { body: { empId: 'T01', name: 'Bob', email: 'b@c.com', password: 'pw' } };
        const res = mockRes();

        await registerTeacher(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ role: 'teacher', empId: 'T01' }));
    });

    it('responds 400 if service throws', async () => {
        registerTeacherService.mockRejectedValue(new Error('Employee ID already registered'));

        const req = { body: {} };
        const res = mockRes();

        await registerTeacher(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────
// loginTeacher
// ─────────────────────────────────────────────
describe('loginTeacher controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 200 with teacher data on success', async () => {
        const fakeTeacher = { _id: 't1', empId: 'T01', name: 'Bob', email: 'b@c.com' };
        loginTeacherService.mockResolvedValue({ teacher: fakeTeacher, token: 'ttok' });

        const req = { body: { email: 'b@c.com', password: 'pw' } };
        const res = mockRes();

        await loginTeacher(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ role: 'teacher' }));
    });

    it('responds 401 on invalid credentials', async () => {
        loginTeacherService.mockRejectedValue(new Error('Invalid email or password'));

        const req = { body: { email: 'bad@c.com', password: 'nope' } };
        const res = mockRes();

        await loginTeacher(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});

// ─────────────────────────────────────────────
// updateUserById
// ─────────────────────────────────────────────
describe('updateUserById controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 200 with updated user', async () => {
        const updated = { _id: 'u1', name: 'New', email: 'a@b.com' };
        updateProfileByIdService.mockResolvedValue({ updatedUser: updated, role: 'student' });

        const req = { params: { id: 'u1' }, body: { name: 'New' } };
        const res = mockRes();

        await updateUserById(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ role: 'student' }));
    });

    it('responds 404 when user not found', async () => {
        updateProfileByIdService.mockRejectedValue(new Error('User not found'));

        const req = { params: { id: 'bad_id' }, body: {} };
        const res = mockRes();

        await updateUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
