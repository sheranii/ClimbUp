const User = require('../models/User');
const updateUserService = async (userId, data) => {
    const allowedFields = ['name', 'email', 'totalScore', 'matchesPlayed', 'climbCoins', 'highestStreak', 'topicsChosen'];
    const updateData = {};
    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    });
    if (Object.keys(updateData).length === 0) {
        throw new Error("No valid fields provided to update");
    }
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
    if (!updatedUser) {
        throw new Error("User not found");
    }
    return updatedUser;
};
const getAllUsersService = async () => {
    return await User.find({}).select('-password');
};
module.exports = {
    updateUserService,
    getAllUsersService
};