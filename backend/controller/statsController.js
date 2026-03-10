const User = require('../models/user');

// @desc    Update user's game stats
// @route   POST /api/stats/update
const updateUserStats = async (req, res) => {
    try {
        const { userId, score, topic } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (score === undefined) {
            return res.status(400).json({ message: 'Score is required' });
        }

        // We allow topic to be optional

        const updatedUser = await User.updateStats(userId, score, topic);

        res.status(200).json({
            message: 'Stats updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                totalScore: updatedUser.totalScore,
                matchesPlayed: updatedUser.matchesPlayed,
                topicsChosen: updatedUser.topicsChosen
            }
        });
    } catch (error) {
        console.error("Error updating stats:", error.message);
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Server error while updating stats' });
    }
};

// @desc    Get user's game stats
// @route   GET /api/stats/:userId
const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
             return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            totalScore: user.totalScore || 0,
            matchesPlayed: user.matchesPlayed || 0,
            topicsChosen: user.topicsChosen || [],
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error("Error fetching stats:", error.message);
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
};

module.exports = {
    updateUserStats,
    getUserStats
};
