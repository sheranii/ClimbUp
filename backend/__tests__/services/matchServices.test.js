/**
 * Unit Tests — matchServices.js
 *
 * Mocks the Prisma client so no database connection is required during tests.
 */

jest.mock('../../config/prisma', () => ({
    matchHistory: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn()
    }
}));

const prisma = require('../../config/prisma');
const {
    createMatchHistoryService,
    getMatchHistoriesByUserService,
    getLeaderboardService,
    deleteMatchHistoryService
} = require('../../services/matchServices');

describe('matchServices', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // createMatchHistoryService
    // ─────────────────────────────────────────────
    describe('createMatchHistoryService', () => {
        it('throws an error if any required field is missing', async () => {
            await expect(createMatchHistoryService({ userId: 'u1' }))
                .rejects.toThrow('All match fields are required');
        });

        it('returns created match history record on success', async () => {
            const fakeData = {
                userId: 'u123',
                userName: 'Shreya',
                score: 95,
                topic: 'Geography',
                roomCode: 'RM99',
                timeTaken: 120
            };

            const expectedRecord = { id: 1, ...fakeData, createdAt: new Date() };
            prisma.matchHistory.create.mockResolvedValue(expectedRecord);

            const result = await createMatchHistoryService(fakeData);

            expect(prisma.matchHistory.create).toHaveBeenCalledWith({
                data: {
                    userId: 'u123',
                    userName: 'Shreya',
                    score: 95,
                    topic: 'Geography',
                    roomCode: 'RM99',
                    timeTaken: 120
                }
            });
            expect(result).toEqual(expectedRecord);
        });
    });

    // ─────────────────────────────────────────────
    // getMatchHistoriesByUserService
    // ─────────────────────────────────────────────
    describe('getMatchHistoriesByUserService', () => {
        it('throws an error if userId is missing', async () => {
            await expect(getMatchHistoriesByUserService(null))
                .rejects.toThrow('User ID is required');
        });

        it('returns matched records ordered by creation date', async () => {
            const records = [
                { id: 2, userId: 'u1', score: 100 },
                { id: 1, userId: 'u1', score: 80 }
            ];
            prisma.matchHistory.findMany.mockResolvedValue(records);

            const result = await getMatchHistoriesByUserService('u1');

            expect(prisma.matchHistory.findMany).toHaveBeenCalledWith({
                where: { userId: 'u1' },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(records);
        });
    });

    // ─────────────────────────────────────────────
    // getLeaderboardService
    // ─────────────────────────────────────────────
    describe('getLeaderboardService', () => {
        it('fetches top match records sorted by score descending', async () => {
            const expectedLeaderboard = [
                { id: 3, userName: 'Alice', score: 120 },
                { id: 1, userName: 'Bob', score: 100 }
            ];
            prisma.matchHistory.findMany.mockResolvedValue(expectedLeaderboard);

            const result = await getLeaderboardService(5);

            expect(prisma.matchHistory.findMany).toHaveBeenCalledWith({
                orderBy: { score: 'desc' },
                take: 5
            });
            expect(result).toEqual(expectedLeaderboard);
        });
    });

    // ─────────────────────────────────────────────
    // deleteMatchHistoryService
    // ─────────────────────────────────────────────
    describe('deleteMatchHistoryService', () => {
        it('throws an error if match ID is missing', async () => {
            await expect(deleteMatchHistoryService(null))
                .rejects.toThrow('Match ID is required');
        });

        it('throws an error if record to delete is not found', async () => {
            prisma.matchHistory.findUnique.mockResolvedValue(null);

            await expect(deleteMatchHistoryService(999))
                .rejects.toThrow('Match history record not found');
        });

        it('deletes the record if found', async () => {
            const mockRecord = { id: 10, userId: 'u1' };
            prisma.matchHistory.findUnique.mockResolvedValue(mockRecord);
            prisma.matchHistory.delete.mockResolvedValue(mockRecord);

            const result = await deleteMatchHistoryService(10);

            expect(prisma.matchHistory.findUnique).toHaveBeenCalledWith({
                where: { id: 10 }
            });
            expect(prisma.matchHistory.delete).toHaveBeenCalledWith({
                where: { id: 10 }
            });
            expect(result).toEqual(mockRecord);
        });
    });
});
