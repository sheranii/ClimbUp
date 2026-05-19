/**
 * Unit Tests — statsServices.js
 *
 * Mocks the User model so no real DB connection is required.
 */

jest.mock('../../models/User');
const User = require('../../models/User');

const {
    updateUserStatsService,
    getUserStatsService,
    updateStatsByIdService,
    deleteUserStatsService,
} = require('../../services/statsServices');

// ─────────────────────────────────────────────
// updateUserStatsService
// ─────────────────────────────────────────────
describe('updateUserStatsService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws if userId or score is missing', async () => {
        await expect(updateUserStatsService(null, 10, 'Math')).rejects.toThrow('User ID and score are required');
        await expect(updateUserStatsService('uid1', undefined, 'Math')).rejects.toThrow('User ID and score are required');
    });

    it('throws if user not found', async () => {
        User.findById.mockResolvedValue(null);
        await expect(updateUserStatsService('uid1', 50, 'Math')).rejects.toThrow('User not found');
    });

    it('increments totalScore, matchesPlayed, and pushes topic', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeUser = {
            _id: 'uid1',
            totalScore: 100,
            matchesPlayed: 5,
            topicsChosen: ['Science'],
            save: saveMock,
        };
        User.findById.mockResolvedValue(fakeUser);

        const result = await updateUserStatsService('uid1', 50, 'Math');

        expect(fakeUser.totalScore).toBe(150);
        expect(fakeUser.matchesPlayed).toBe(6);
        expect(fakeUser.topicsChosen).toContain('Math');
        expect(saveMock).toHaveBeenCalledTimes(1);
    });

    it('does not push topic when topic is falsy', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeUser = { _id: 'uid1', totalScore: 0, matchesPlayed: 0, topicsChosen: [], save: saveMock };
        User.findById.mockResolvedValue(fakeUser);

        await updateUserStatsService('uid1', 30, null);
        expect(fakeUser.topicsChosen).toHaveLength(0);
    });
});

// ─────────────────────────────────────────────
// getUserStatsService
// ─────────────────────────────────────────────
describe('getUserStatsService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws if user not found', async () => {
        User.findById.mockResolvedValue(null);
        await expect(getUserStatsService('bad_id')).rejects.toThrow('User not found');
    });

    it('returns the user when found', async () => {
        const fakeUser = { _id: 'uid1', name: 'Ali', totalScore: 200 };
        User.findById.mockResolvedValue(fakeUser);

        const result = await getUserStatsService('uid1');
        expect(result).toEqual(fakeUser);
    });
});

// ─────────────────────────────────────────────
// updateStatsByIdService
// ─────────────────────────────────────────────
describe('updateStatsByIdService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws if no valid update fields provided', async () => {
        await expect(updateStatsByIdService('uid1', { unknownField: 'x' }))
            .rejects.toThrow('No valid fields provided to update');
    });

    it('throws if user not found after update attempt', async () => {
        User.findByIdAndUpdate.mockResolvedValue(null);
        await expect(updateStatsByIdService('uid1', { totalScore: 50 }))
            .rejects.toThrow('User not found');
    });

    it('returns updated user on success', async () => {
        const updated = { _id: 'uid1', name: 'Ali', totalScore: 300 };
        User.findByIdAndUpdate.mockResolvedValue(updated);

        const result = await updateStatsByIdService('uid1', { totalScore: 300 });
        expect(result).toEqual(updated);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            'uid1',
            { $set: { totalScore: 300 } },
            { new: true, runValidators: true }
        );
    });

    it('only passes allowed fields to the DB update', async () => {
        const updated = { _id: 'uid1', name: 'Ali' };
        User.findByIdAndUpdate.mockResolvedValue(updated);

        await updateStatsByIdService('uid1', { name: 'Ali', hackerField: 'drop()' });

        const [, { $set }] = User.findByIdAndUpdate.mock.calls[0];
        expect($set).not.toHaveProperty('hackerField');
        expect($set).toHaveProperty('name', 'Ali');
    });
});

// ─────────────────────────────────────────────
// deleteUserStatsService
// ─────────────────────────────────────────────
describe('deleteUserStatsService', () => {
    afterEach(() => jest.clearAllMocks());

    it('throws if user not found', async () => {
        User.findByIdAndDelete.mockResolvedValue(null);
        await expect(deleteUserStatsService('bad_id')).rejects.toThrow('User not found');
    });

    it('returns deleted user on success', async () => {
        const deleted = { _id: 'uid1', name: 'Ali' };
        User.findByIdAndDelete.mockResolvedValue(deleted);

        const result = await deleteUserStatsService('uid1');
        expect(result).toEqual(deleted);
    });
});
