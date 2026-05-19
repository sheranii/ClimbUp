/**
 * Unit Tests — statsController.js
 *
 * Mocks the service layer; uses req/res stubs. No HTTP or DB needed.
 */

jest.mock('../../services/statsServices');

// Silence controller catch-block logs during error-path tests
beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

const {
    updateUserStatsService,
    getUserStatsService,
    updateStatsByIdService,
    deleteUserStatsService,
} = require('../../services/statsServices');

const {
    updateUserStats,
    getUserStats,
    updateUserById,
    deleteUserStats,
} = require('../../controller/statsController');

// ---------- Helpers ----------
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};
const mockNext = () => jest.fn();

// ─────────────────────────────────────────────
// updateUserStats
// ─────────────────────────────────────────────
describe('updateUserStats controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 200 with updated stats on success', async () => {
        const fakeUser = { _id: 'u1', name: 'Ali', totalScore: 150, matchesPlayed: 6, topicsChosen: ['Math'] };
        updateUserStatsService.mockResolvedValue(fakeUser);

        const req = { body: { userId: 'u1', score: 50, topic: 'Math' } };
        const res = mockRes();

        await updateUserStats(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Stats updated successfully',
        }));
    });

    it('responds 404 when user not found', async () => {
        updateUserStatsService.mockRejectedValue(new Error('User not found'));

        const req = { body: { userId: 'bad', score: 10, topic: 'X' } };
        const res = mockRes();

        await updateUserStats(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('responds 400 on other service errors', async () => {
        updateUserStatsService.mockRejectedValue(new Error('User ID and score are required'));

        const req = { body: {} };
        const res = mockRes();

        await updateUserStats(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─────────────────────────────────────────────
// getUserStats
// ─────────────────────────────────────────────
describe('getUserStats controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 200 with user stats', async () => {
        const fakeUser = {
            _id: 'u1', name: 'Ali', email: 'a@b.com',
            totalScore: 200, matchesPlayed: 8,
            topicsChosen: ['Science'], createdAt: new Date(),
        };
        getUserStatsService.mockResolvedValue(fakeUser);

        const req = { params: { userId: 'u1' } };
        const res = mockRes();

        await getUserStats(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1', name: 'Ali' }));
    });

    it('responds 404 if user not found', async () => {
        getUserStatsService.mockRejectedValue(new Error('User not found'));

        const req = { params: { userId: 'bad' } };
        const res = mockRes();

        await getUserStats(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

// ─────────────────────────────────────────────
// updateUserById (stats controller version)
// ─────────────────────────────────────────────
describe('updateUserById (stats) controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 200 with updated user', async () => {
        const updatedUser = { _id: 'u1', name: 'Ali', totalScore: 300 };
        updateStatsByIdService.mockResolvedValue(updatedUser);

        const req = { params: { userId: 'u1' }, body: { totalScore: 300 } };
        const res = mockRes();

        await updateUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('responds 404 if user not found', async () => {
        updateStatsByIdService.mockRejectedValue(new Error('User not found'));

        const req = { params: { userId: 'none' }, body: { totalScore: 10 } };
        const res = mockRes();

        await updateUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

// ─────────────────────────────────────────────
// deleteUserStats
// ─────────────────────────────────────────────
describe('deleteUserStats controller', () => {
    afterEach(() => jest.clearAllMocks());

    it('responds 200 with deleted user id on success', async () => {
        deleteUserStatsService.mockResolvedValue({ _id: 'u1' });

        const req = { params: { userId: 'u1' } };
        const res = mockRes();

        await deleteUserStats(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ deletedUserId: 'u1' }));
    });

    it('responds 404 if user not found', async () => {
        deleteUserStatsService.mockRejectedValue(new Error('User not found'));

        const req = { params: { userId: 'bad' } };
        const res = mockRes();

        await deleteUserStats(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
