const User = require('../models/User');

const updateUserStatsService = async (userId, score, topic) => {
    if (!userId || score === undefined) {
        throw new Error('User ID and score are required');
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    user.totalScore += score;
    user.matchesPlayed += 1;

    if (topic) {
        user.topicsChosen.push(topic);
    }

    await user.save();
    return user;
};

const getUserStatsService = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

const updateStatsByIdService = async (userId, data) => {
    const allowedFields = ['name', 'email', 'totalScore', 'matchesPlayed', 'climbCoins', 'highestStreak', 'topicsChosen'];
    const updateData = {};

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    });

    if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields provided to update');
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return updatedUser;
};

const deleteUserStatsService = async (userId) => {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new Error('User not found');
    }

    return deletedUser;
};

module.exports = {
    updateUserStatsService,
    getUserStatsService,
    updateStatsByIdService,
    deleteUserStatsService
};
