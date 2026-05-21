/**
 * Unit Tests — matchController.js
 *
 * Mocks the matchServices service layer to isolate testing of HTTP request/response handling.
 */

jest.mock('../../services/matchServices');

const {
    createMatchHistoryService,
    getMatchHistoriesByUserService,
    getLeaderboardService,
    deleteMatchHistoryService
} = require('../../services/matchServices');

const {
    createMatchHistory,
    getMatchHistoriesByUser,
    getLeaderboard,
    deleteMatchHistory
} = require('../../controller/matchController');

// Helper to mock Express Response
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('matchController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // createMatchHistory
    // ─────────────────────────────────────────────
    describe('createMatchHistory', () => {
        it('returns 201 and created match data on success', async () => {
            const mockMatch = { id: 1, userId: 'u1', score: 100 };
            createMatchHistoryService.mockResolvedValue(mockMatch);

            const req = { body: { userId: 'u1', score: 100 } };
            const res = mockRes();
            const next = jest.fn();

            await createMatchHistory(req, res, next);

            expect(createMatchHistoryService).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Match history logged in PostgreSQL successfully',
                match: mockMatch
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('calls next with error if service throws', async () => {
            const error = new Error('Database Error');
            createMatchHistoryService.mockRejectedValue(error);

            const req = { body: {} };
            const res = mockRes();
            const next = jest.fn();

            await createMatchHistory(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ─────────────────────────────────────────────
    // getMatchHistoriesByUser
    // ─────────────────────────────────────────────
    describe('getMatchHistoriesByUser', () => {
        it('returns 200 and matches for user', async () => {
            const mockMatches = [{ id: 1, userId: 'u1' }];
            getMatchHistoriesByUserService.mockResolvedValue(mockMatches);

            const req = { params: { userId: 'u1' } };
            const res = mockRes();
            const next = jest.fn();

            await getMatchHistoriesByUser(req, res, next);

            expect(getMatchHistoriesByUserService).toHaveBeenCalledWith('u1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                matches: mockMatches
            });
        });

        it('calls next with error on service failure', async () => {
            const error = new Error('Retrieval failed');
            getMatchHistoriesByUserService.mockRejectedValue(error);

            const req = { params: { userId: 'u1' } };
            const res = mockRes();
            const next = jest.fn();

            await getMatchHistoriesByUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ─────────────────────────────────────────────
    // getLeaderboard
    // ─────────────────────────────────────────────
    describe('getLeaderboard', () => {
        it('returns 200 and leaderboard entries', async () => {
            const mockLeaderboard = [{ userName: 'Ali', score: 100 }];
            getLeaderboardService.mockResolvedValue(mockLeaderboard);

            const req = { query: { limit: '5' } };
            const res = mockRes();
            const next = jest.fn();

            await getLeaderboard(req, res, next);

            expect(getLeaderboardService).toHaveBeenCalledWith('5');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                leaderboard: mockLeaderboard
            });
        });

        it('defaults to limit 10 if query parameter is missing', async () => {
            getLeaderboardService.mockResolvedValue([]);

            const req = { query: {} };
            const res = mockRes();
            const next = jest.fn();

            await getLeaderboard(req, res, next);

            expect(getLeaderboardService).toHaveBeenCalledWith(10);
        });
    });

    // ─────────────────────────────────────────────
    // deleteMatchHistory
    // ─────────────────────────────────────────────
    describe('deleteMatchHistory', () => {
        it('returns 200 and success message on successful deletion', async () => {
            deleteMatchHistoryService.mockResolvedValue({});

            const req = { params: { id: '5' } };
            const res = mockRes();
            const next = jest.fn();

            await deleteMatchHistory(req, res, next);

            expect(deleteMatchHistoryService).toHaveBeenCalledWith('5');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Match history deleted from PostgreSQL successfully',
                deletedId: '5'
            });
        });

        it('calls next with error on deletion failure', async () => {
            const error = new Error('Record not found');
            deleteMatchHistoryService.mockRejectedValue(error);

            const req = { params: { id: '999' } };
            const res = mockRes();
            const next = jest.fn();

            await deleteMatchHistory(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
