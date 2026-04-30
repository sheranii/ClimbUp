const {
    updateUserStatsService,
    getUserStatsService,
    updateStatsByIdService,
    deleteUserStatsService
} = require('../services/statsServices');

// UPDATE STATS
const updateUserStats = async (req, res) => {
    try {
        const { userId, score, topic } = req.body;
        const user = await updateUserStatsService(userId, score, topic);

        res.status(200).json({
            message: 'Stats updated successfully',
            user: {
                id: user._id,
                name: user.name,
                totalScore: user.totalScore,
                matchesPlayed: user.matchesPlayed,
                topicsChosen: user.topicsChosen
            }
        });
    } catch (error) {
        console.error("STATS UPDATE ERROR:", error);
        res.status(error.message === 'User not found' ? 404 : 400).json({ message: error.message });
    }
};

// GET STATS
const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await getUserStatsService(userId);

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            totalScore: user.totalScore,
            matchesPlayed: user.matchesPlayed,
            topicsChosen: user.topicsChosen,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error("GET STATS ERROR:", error);
        res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
    }
};

// UPDATE USER BY ID (any field)
const updateUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedUser = await updateStatsByIdService(userId, req.body);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error("UPDATE BY ID ERROR:", error);
        res.status(error.message === 'User not found' ? 404 : 400).json({ message: error.message });
    }
};

// DELETE USER STATS
const deleteUserStats = async (req, res) => {
    try {
        const { userId } = req.params;
        await deleteUserStatsService(userId);

        res.status(200).json({
            message: 'User deleted successfully',
            deletedUserId: userId
        });
    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
    }
};

module.exports = {
    updateUserStats,
    updateUserById,
    getUserStats,
    deleteUserStats
};