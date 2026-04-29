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

// UPDATE USER BY ID (any field)
const updateUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const allowedFields = ['name', 'email', 'totalScore', 'matchesPlayed', 'climbCoins', 'highestStreak', 'topicsChosen'];
        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided to update' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error("UPDATE BY ID ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE USER STATS
const deleteUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            deletedUserId: userId
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateUserStats,
    updateUserById,
    getUserStats,
    deleteUserStats
};