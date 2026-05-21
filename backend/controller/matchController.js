const {
    createMatchHistoryService,
    getMatchHistoriesByUserService,
    getLeaderboardService,
    deleteMatchHistoryService
} = require('../services/matchServices');

const createMatchHistory = async (req, res, next) => {
    try {
        const match = await createMatchHistoryService(req.body);
        res.status(201).json({
            success: true,
            message: 'Match history logged in PostgreSQL successfully',
            match
        });
    } catch (error) {
        next(error);
    }
};

const getMatchHistoriesByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const matches = await getMatchHistoriesByUserService(userId);
        res.status(200).json({
            success: true,
            count: matches.length,
            matches
        });
    } catch (error) {
        next(error);
    }
};

const getLeaderboard = async (req, res, next) => {
    try {
        const limit = req.query.limit || 10;
        const leaderboard = await getLeaderboardService(limit);
        res.status(200).json({
            success: true,
            leaderboard
        });
    } catch (error) {
        next(error);
    }
};

const deleteMatchHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteMatchHistoryService(id);
        res.status(200).json({
            success: true,
            message: 'Match history deleted from PostgreSQL successfully',
            deletedId: id
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createMatchHistory,
    getMatchHistoriesByUser,
    getLeaderboard,
    deleteMatchHistory
};
