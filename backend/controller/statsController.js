const User = require('../models/User');

// UPDATE STATS
const updateUserStats = async (req, res) => {
    try {
        const { userId, score, topic } = req.body;

        if (!userId || score === undefined) {
            return res.status(400).json({ message: 'User ID and score are required' });
        }

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update stats
        user.totalScore += score;
        user.matchesPlayed += 1;

        if (topic) {
            user.topicsChosen.push(topic);
        }

        // Save updated user
        await user.save();

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
        res.status(500).json({ message: error.message });
    }
};

// GET STATS
const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

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
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateUserStats,
    getUserStats
};